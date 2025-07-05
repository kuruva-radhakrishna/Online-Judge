const User = require('../Models/user');
const Problem = require('../Models/Problems');
const Contest = require('../Models/Contests');
const { validateProblem } = require('../validators/ProblemValidation');

exports.problemsCreatedByUser = async (req, res) => {
    try {
        const allProblems = await Problem.find({});
        const problemsByUser = await Problem.find({ CreatedBy: req.user._id });
        return res.status(200).json(problemsByUser);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createProblem = async (req, res) => {
    //Create New problem
    //Check the user's role only create if the user is admin

    try {
        console.log('New Problem creation');
        const newProblem = req.body.problem;
        newProblem.CreatedBy = req.user._id;
        console.log(newProblem);
        const result = await Problem.create(newProblem);
        if (!result) {
            return res.status('500').json('Database Issue');
        }
        else {
            return res.status('200').json({ message: 'Successfully Created new Problem' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateProblem = async (req, res) => {
    //update the problem
    //Update only when the user's role is admin and the problem is created by same admin
    try {
        const id = req.params.id;
        const old_problem = await Problem.findById(id);
        if (!old_problem.CreatedBy.equals(req.user._id)) {
            return res.status(400).json({ message: "you are not authorized to update this problem" });
        }
        const result = await Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.problem });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the problem" });
        }
        res.status(200).json({ message: "Successfully updated the problem" });
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
};


exports.deleteProblem = async (req, res) => {
    // Delete the problem with the id
    //Delete the submissions made on the problem or make the problem id for submissions as null
    // Change the problem array if the problem is present in any contest make it null 

    try {
        const {id} = req.params;
        const old_problem = await Problem.findById(id);

        if (!old_problem.CreatedBy.equals(req.user._id)) {
            return res.status(400).json({ message: "you are not authorized to delete this problem" });
        }
        const result = await Problem.findByIdAndDelete(id);
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to delete the problem" });
        }
        // Delete all submissions for this problem
        await Submission.deleteMany({ problem_id: id });
        return res.status(200).json({ message: "Successfully deleted the problem and its submissions" });
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
};

exports.contestsByUser = async (req, res) => {
    try {
        const contests = await Contest.find({ createdBy: req.user._id });
        res.status(200).json(contests);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch contests created by user.' });
    }
};

exports.createContest = async (req, res) => {
    //check user is admin or not
    //create new contest

    try {
        const newContest = req.body.contest;
        const result = await Contest.create(newContest);
        if (!result) {
            return res.status(500).json({ message: "Database error. Unable to create contest" });
        }
        return res.status(200).json({ message: "Contest Created Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
};

exports.updateContest = async (req, res) => {
    try {
        const now = new Date();
        const { id } = req.params;
        const old_contest = await Contest.findById(id);
        if (!old_contest) {
            return res.status(404).json({ message: "Contest not found" });
        }
        // Only allow editing if contest has NOT started yet
        if (old_contest.startTime <= now) {
            return res.status(400).json({ message: "You cannot update this contest now" });
        }
        if (old_contest.createdBy.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "You are not authorized to update this contest" });
        }
        const result = await Contest.findByIdAndUpdate(id, { $set: req.body.contest }, { new: true });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the contest" });
        }
        return res.status(200).json({ message: "Successfully updated the contest" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Issue" });
    }
};

exports.deleteContest =  async (req, res) => {
    try {
        const { id } = req.params;
        // Only allow deletion if the contest was created by the current user
        const contest = await Contest.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found.' });
        }
        if (contest.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this contest.' });
        }
        // Delete the contest
        await Contest.findByIdAndDelete(id);
        // Set contest_id to null for all submissions belonging to this contest
        await Submission.updateMany({ contest_id: id }, { $set: { contest_id: null } });
        return res.status(200).json({ message: 'Contest deleted and related submissions updated.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete contest.' });
    }
};