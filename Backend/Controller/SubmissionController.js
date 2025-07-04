const Submission = require('../Models/Submissions');
const Problem = require('../Models/Problems');
const axios = require('axios');

// Create a new submission and judge it
exports.createSubmission = async (req, res) => {
    try {
        const { problem_id, code, language } = req.body;
        const user_id = req.user && req.user._id ? req.user._id : req.body.user_id;
        if (!problem_id || !code || !language || !user_id) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        const newSubmission = {
            problem_id,
            code,
            language,
            user_id,
        };
        const verdicts = [];
        const problem = await Problem.findById(problem_id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        for (const tc of problem.TestCases) {
            const result = await axios.post('http://localhost:8000/run', {
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
        const submissionResult = await Submission.create(newSubmission);
        if (submissionResult) {
            return res.status(200).json(verdicts);
        } else {
            return res.status(500).json({ message: 'Issue in creating submission' });
        }
    } catch (error) {
        console.error('Error while creating submission:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all submissions for a problem
exports.getSubmissionsByProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        const submissions = await Submission.find({ problem_id: problemId }).populate('user_id', 'firstname lastname email');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

// Get all submissions by a user
exports.getSubmissionsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const submissions = await Submission.find({ user_id: userId }).populate('problem_id', 'title');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

// Get all submissions for a contest
exports.getSubmissionsByContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const submissions = await Submission.find({ contest_id: contestId }).populate('user_id', 'firstname lastname email').populate('problem_id', 'title');
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contest submissions' });
    }
};

// Get a single submission by ID
exports.getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id).populate('user_id', 'firstname lastname email').populate('problem_id', 'title');
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
}; 