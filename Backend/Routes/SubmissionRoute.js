const express = require('express');
const router = express.Router();
const Submission = require('../Models/Submissions.js');
const {isLoggedIn } = require('../middleware.js');

router.get('/', isLoggedIn, async (req, res) => {
    //return all submissions of User

    try {
        const submissionsByUser = await Submission.find({ user_id: req.user._id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})

router.get('/:id', isLoggedIn, async (req, res) => {
    //return submissions made by the current user on the specific problem
    try {
        const id = req.params.id;
        console.log(id);
        const submissionsByUser = await Submission.find({ user_id: req.user._id, problem_id: id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})
router.get('/all/:id', isLoggedIn, async (req, res) => {
    //return submissions made by every one on this problem

    try {
        const id = req.params.id;
        console.log(id);
        const submissionsByUser = await Submission.find({ problem_id: id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})

router.post('/:id', isLoggedIn, async (req, res) => {

    //Assuming I constructed the whole submission
    try {
        const newSubmission = req.body.submission;
        newSubmission.problem_id = req.params.id;
        newSubmission.user_id = req.user._id;
        console.log(newSubmission);
        const result = await Submission.create(newSubmission);
        if (!result) {
            return res.status(500).json({ message: "unable to upload submission" });
        }
        return res.status(200).json({ message: "Successfully uploaded the submission" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
});


module.exports.SubmissionRoute = router;