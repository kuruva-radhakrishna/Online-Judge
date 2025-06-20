const express = require('express');
const router = express.Router();
const {isLoggedIn }= require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');


router.get('/', isLoggedIn, async (req, res) => {
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

});

router.get('/:id', isLoggedIn, async (req, res) => {
    // check if contest if past or running
    //don't provide contests for pending ones

    try {
        const now = new Date();
        const  id  = req.params.id;
        console.log(id);
        const result = await Contest.findById(id);
        if (!result) {
            return res.status(500).json({ message: "Contest not found" });
        }
        if (result.startTime >= now) {
            return res.status(400).json({ message: "The contest is not live yet" });
        }
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})

router.post('/submission/:contest_id/:problem_id', isLoggedIn, async (req, res) => {
    try {
        const { contest_id, problem_id } = req.params;
        const newSubmission = req.body.submission;
        const contest = await Contest.findById(contest_id);
        const problem = await Problem.findById(problem_id);
        if (!contest || !problem) {
            return res.status(400).json({ message: "Contest or problem doesn't exist" });
        }

        const now = new Date();

        // Contest should be active
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(403).json({ message: "Contest is not active" });
        }

        // Check if the problem exists in the contest
        const problemEntry = contest.problems.find(p =>
            p.problem_id.toString() === problem_id.toString()
        );
        if (!problemEntry) {
            return res.status(400).json({ message: "Problem is not part of this contest" });
        }

        // Attach necessary submission details
        newSubmission.user_id = req.user._id;
        newSubmission.problem_id = problem_id;
        newSubmission.contest_id = contest_id;
        newSubmission.time = now;

        const result = await Submission.create(newSubmission);
        if (!result) {
            return res.status(500).json({ message: "Unable to upload submission" });
        }

        // Update leaderboard only if the verdict is accepted
        if (newSubmission.verdict === 'Accepted') {
            console.log('accepted');
            const userIdStr = req.user._id.toString();
            const userEntry = contest.leaderBoard.find(entry => entry.user_id.toString() === userIdStr);
            console.log(userEntry);
            if (!userEntry) {
                // First time submission by user in this contest
                console.log('Pushing user');
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
                    // First time solving this problem
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
                    // Already solved — update only lastSubmission
                    console.log('Already Solved');
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

        return res.status(201).json({ message: "Submission uploaded successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/:id/leaderboard', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params.body;
        const contest = await Contest.findById(id);
        if (!contest) {
            res.status(400).json({ message: "This contest doesn't exist" });
        }

        res.status(200).json(contest.leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});


module.exports.ContestRoute = router;