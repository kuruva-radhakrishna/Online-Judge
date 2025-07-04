const express = require('express');
const router = express.Router();
const Submission = require('../Models/Submissions.js');
const Problem = require('../Models/Problems.js');
const {isLoggedIn } = require('../middleware.js');
const axios = require('axios');

router.get('/', isLoggedIn, async (req, res) => {
    //return all submissions of User

    try {
        const submissionsByUser = await Submission.find({ user_id: req.user._id }).populate('problem_id');
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
        console.log('Submissions');
        console.log(id);
        const submissionsByUser = await Submission.find({ user_id: req.user._id, problem_id: id });
        console.log("submissions by user",submissionsByUser);
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
    try {
        console.log('creating new submission');
        const { problem_id, code, language } = req.body;
        const newSubmission = {
            problem_id,
            code,
            language,
            user_id: req.user._id,
        };

        const verdicts = [];

        const problem = await Problem.findById(problem_id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

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
                console.log(result);
                verdicts.push(result.data.errorType || 'Runtime Error');
                break;
            }
        }

        const n = verdicts.length;
        newSubmission.verdict = verdicts[n - 1] || 'Unknown';

        const submissionResult = await Submission.create(newSubmission);

        if (submissionResult) {
            console.log('Created Submission');
            return res.status(200).json(verdicts);
        } else {
            return res.status(500).json({ message: "Issue in creating submission" });
        }

    } catch (error) {
        console.error('Error while creating submission:', error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/single/:id', async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports.SubmissionRouter = router;