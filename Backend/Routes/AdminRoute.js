const express = require('express');
const router = express.Router();
const {isLoggedIn ,isAdmin}= require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');

router.get('/problems/', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log(req.user);
        console.log("Logged-in user ID:", req.user._id.toString());

        const allProblems = await Problem.find({});
        console.log(allProblems);
        const problemsByUser = await Problem.find({ CreatedBy: req.user._id });
        return res.status(200).json(problemsByUser);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.post('/problems/new', isLoggedIn, isAdmin, async (req, res) => {
    //Create New problem
    //Check the user's role only create if the user is admin

    try {
        const newProblem = req.body.problem;
        newProblem.CreatedBy = req.user._id;
        const result = await Problem.create(newProblem);
        if (!result) {
            return res.status('500').json('Database Issue');
        }
        else {
            return res.status('200').json({ message: 'Successfully Created new Problem' });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.patch('/problems/:id/update', isLoggedIn, isAdmin, async (req, res) => {
    //update the problem
    //Update only when the user's role is admin and the problem is created by same admin
    try {
        const id = req.params.id;
        const old_problem = await Problem.findById(id);
        if (old_problem.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this problem" });
        }
        const result = Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.problem });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the problem" });
        }
        res.status(200).json({ message: "Successfully update the problem " });
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

router.delete('/problems/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Delete the problem with the id
    //Delete the submissions made on the problem or make the problem id for submissions as null
    // Change the problem array if the problem is present in any contest make it null 

    try {
        const id = req.params.id;

        const old_problem = await Problem.findById(id);

        console.log(old_problem.CreatedBy);
        console.log(req.user._id);
        if (old_problem.CreatedBy.equals(req.user._id)) {
            const result = await Problem.findByIdAndDelete(id);
            if (!result) {
                return res.status(500).json({ message: "Database Issue. Unable to update the problem" });
            }
            return res.status(200).json({ message: "Successfully update the problem " });
        }

        return res.status(400).json({ message: "you are not authorized to update this problem" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});


router.post('/contest/new', isLoggedIn, isAdmin, async (req, res) => {
    //check user is admin or not
    //create new contest

    try {
        console.log(req.body.contest);
        const newContest = req.body.contest;
        console.log(newContest);
        const result = await Contest.create(newContest);
        if (!result) {
            return res.status(500).json({ message: "Database error. Unable to create contest" });
        }
        return res.status(200).json({ message: "Contest Created Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

router.patch('/contest/:id/update', isLoggedIn, isAdmin, async (req, res) => {
    // check if the contest is pending
    // update only pending contests

    try {
        const now = new Date()
        const { id } = req.params.body;
        const old_contest = await Contest.findById(id);
        if (old_contest.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this contest" });
        }
        const result = await Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.contest });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the contest" });
        }

        if (old_contest.startTime >= now) {
            return res.status(400).json({ message: "you are cannot update this contest now" });
        }
        return res.status(200).json({ message: "Successfully update the contest " });
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
})

router.delete('/contests/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Delete the contest
    //check if there are submissions for this contest and update them to null

    try {
        const { id } = req.params.body;
        const contest = await Contest.findById(id);
        const now = new Date();
        if (old_problem.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this contest" });
        }
        if (contest.startTime >= now) {
            return res.status(400).json({ message: "you are cannot delete this contest now" });
        }
        const result = Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.problem });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the contest" });
        }
        return res.status(200).json({ message: "Successfully update the contest " });
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
})



module.exports.AdminRoute = router;