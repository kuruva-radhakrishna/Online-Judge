const Contest = require('../Models/Contests');
const Problem = require('../Models/Problems');
const { validateContest } = require('../validators/contestValidation');

exports.getContests = async (req, res) => {
    //return all contests
    try {
        const contests = await Contest.find({});
        if (!contests) {
            return res.status(500).json({ message: "Issue in Database" });
        }
        return res.status(200).json(contests);
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }

};

exports.getContestById = async (req, res) => {
    // check if contest if past or running
    //don't provide contests for pending ones

    try {
        console.log('get contest');
        const now = new Date();
        const  id  = req.params.id;
        const result = await Contest.findById(id)
            .populate({
                path: 'problems.problem_id',
                select: 'problemName',
            })
            .populate({
                path: 'leaderBoard.user_id',
                select: 'firstname lastname email',
            })
            .populate({
                path: 'leaderBoard.solvedProblems.problem_id',
                select: 'problemName',
            });
        console.log(result);
        if (!result) {
            return res.status(500).json({ message: "Contest not found" });
        }
        if(req.user._id.toString !== result.createdBy.toString()){
            return res.json(result);
        }
        if (result.startTime >= now ) {
            return res.status(400).json({ message: "The contest is not live yet" });
        }
        // Sort problems by points ascending
        result.problems.sort((a, b) => a.points - b.points);
        // Sort leaderboard by points descending, then lastSubmission ascending
        result.leaderBoard.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (!a.lastSubmission) return 1;
            if (!b.lastSubmission) return -1;
            return new Date(a.lastSubmission) - new Date(b.lastSubmission);
        });
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
};

exports.contestSubmission = async (req, res) => {
    try {
        const { contest_id, problem_id } = req.params;
        const { code, language } = req.body.submission;
        // Build submission object first
        const newSubmission = {
            user_id: req.user._id,
            problem_id,
            contest_id,
            code,
            language,
            isInContest: true,
        };
        // Check contest and problem validity
        const contest = await Contest.findById(contest_id);
        const problem = await Problem.findById(problem_id);
        if (!contest || !problem) {
            return res.status(400).json({ message: "Contest or problem doesn't exist" });
        }
        const now = new Date();
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(403).json({ message: "Contest is not active" });
        }
        const problemEntry = contest.problems.find(p =>
            p.problem_id.toString() === problem_id.toString()
        );
        if (!problemEntry) {
            return res.status(400).json({ message: "Problem is not part of this contest" });
        }
        // Run code against all test cases
        const verdicts = [];
        for (const tc of problem.TestCases) {
            const result = await axios.post("http://localhost:8000/run", {
                code,
                language,
                input: tc.input,
            });
            const output = result.data.output?.output;
            if (output !== undefined) {
                if (output.trim() === tc.output.trim()) {
                    verdicts.push('Accepted');
                } else {
                    verdicts.push('Wrong Answer');
                    break;
                }
            } else {
                verdicts.push(result.data.errorType || 'Runtime Error');
                break;
            }
        }
        const n = verdicts.length;
        newSubmission.verdict = verdicts[n - 1] || 'Unknown';
        // Save submission only after all checks and verdict assignment
        const result = await Submission.create(newSubmission);
        if (!result) {
            return res.status(500).json({ message: "Unable to upload submission" });
        }
        // Update leaderboard only if the verdict is accepted
        if (newSubmission.verdict === 'Accepted') {
            const userIdStr = req.user._id.toString();
            const userEntry = contest.leaderBoard.find(entry => entry.user_id.toString() === userIdStr);
            if (!userEntry) {
                await Contest.findByIdAndUpdate(contest_id, {
                    $push: {
                        leaderBoard: {
                            user_id: req.user._id,
                            points: problemEntry.points,
                            lastSubmission: now,
                            solvedProblems: [{ problem_id: problem_id }]
                        }
                    }
                });
            } else {
                const hasSolved = userEntry.solvedProblems.some(
                    pidObj => pidObj.problem_id.toString() === problem_id.toString()
                );
                if (!hasSolved) {
                    await Contest.updateOne(
                        {
                            _id: contest_id,
                            "leaderBoard.user_id": req.user._id
                        },
                        {
                            $inc: { "leaderBoard.$.points": problemEntry.points },
                            $set: { "leaderBoard.$.lastSubmission": now },
                            $push: { "leaderBoard.$.solvedProblems": { problem_id: problem_id } }
                        }
                    );
                } else {
                    await Contest.updateOne(
                        {
                            _id: contest_id,
                            "leaderBoard.user_id": req.user._id
                        },
                        {
                            $set: { "leaderBoard.$.lastSubmission": now }
                        }
                    );
                }
            }
        }
        return res.status(200).json(verdicts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getLeaderBoard = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest.findById(id)
            .populate({
                path: 'leaderBoard.user_id',
                select: 'firstname lastname email',
            })
            .populate({
                path: 'leaderBoard.solvedProblems.problem_id',
                select: 'problemName',
            });
        if (!contest) {
            return res.status(400).json({ message: "This contest doesn't exist" });
        }
        // Sort leaderboard by points descending, then lastSubmission ascending
        const leaderboard = [...contest.leaderBoard].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (!a.lastSubmission) return 1;
            if (!b.lastSubmission) return -1;
            return new Date(a.lastSubmission) - new Date(b.lastSubmission);
        });
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
};
