require('dotenv').config();
const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_api });
const AIController = require('../Controller/AIController');

router.post('/review', async (req, res) => {
    try {
        const { code } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze and provide a crisp review of the code
                        Code: ${code}`,
        });
        res.json({ review: response.text });

    } catch (error) {
        res.status(500).json({ message: "Server Issue" });
    }
});

// Assuming 'ai' is already initialized with your Google Generative AI client
// e.g., const { GoogleGenerativeAI } = require('@google/generative-ai');
// const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/createProblem', async (req, res) => {
    try {
        const { problem } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Assume you are a problem setter. 
        Cover all edge cases regarding testcases. Ensure the problem is well explained.
        For all sample inputs and test cases, if the input includes an array, print the array elements on a single line, space-separated, after the array size. For example:
        6
        1 2 3 4 6 7
        13
        Do not print each array element on a separate line. Use the exact input format as described in the problem statement.
        Complete the problem object: ${JSON.stringify(problem)}. 
        Give response in json format.`,
        });
        let review = response.text || '';
        review = review.trim();
        if (review.startsWith('```json')) {
            review = review.slice(7);
        } else if (review.startsWith('```')) {
            review = review.slice(3);
        }
        if (review.endsWith('```')) {
            review = review.slice(0, -3);
        }
        review = review.trim();


        const match = review.match(/\{[\s\S]*\}/);
        if (match) {
            review = match[0];
        }

        let problemObj = null;
        try {
            const parsed = JSON.parse(review);
            problemObj = parsed.problem || parsed;
        } catch (err) {
            return res.status(500).json({ message: "AI did not return valid JSON.", raw: review });
        }

        if (!problemObj) {
            return res.status(500).json({ message: "AI did not return a valid problem object.", raw: review });
        }

        res.json({ problem: problemObj });
    } catch (error) {
        res.status(500).json({ message: "Error creating AI response" });
    }
});

router.post('/debug', async (req, res) => {
    try {
        const { code } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a code debugging assistant. Analyze the following code and provide a crisp, actionable debug summary in 4-5 sentences. Focus on possible bugs, logical errors, edge cases, or improvements. Do NOT explain the whole problem or restate the problem statement. Only give feedback on the code itself.

User Code:
${code}
`,
        });
        res.json({ debug: response.text });
    } catch (error) {
        res.status(500).json({ message: "Server Issue" });
    }
});

router.post('/contest-description', async (req, res) => {
    try {
        const { contestTitle, problems } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert contest setter. Given the contest title and a list of problem IDs or names, generate a concise, engaging contest description for participants. Do not list the problems, but describe the contest's theme, challenge, and what participants can expect.\n\nContest Title: ${contestTitle}\nProblems: ${problems.join(', ')}`,
        });
        res.json({ description: response.text });
    } catch (error) {
        res.status(500).json({ message: "AI contest description generation failed" });
    }
});

router.post('/generate-problem', AIController.generateProblem);
router.post('/suggest-test-cases', AIController.suggestTestCases);

module.exports = router;