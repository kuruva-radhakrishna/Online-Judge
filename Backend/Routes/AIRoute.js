require('dotenv').config();
const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_api });

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
            contents: `Assume you are a problem setter. Cover all edge cases regarding testcases. ensure the problem is well explained .Complete the problem object problem : ${JSON.stringify(problem)}. give response in json format`,
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

        console.log("Raw AI response after cleaning:", review);

        const match = review.match(/\{[\s\S]*\}/);
        if (match) {
            review = match[0];
        }

        let problemObj = null;
        try {
            const parsed = JSON.parse(review);
            problemObj = parsed.problem || parsed;
        } catch (err) {
            console.log("AI did not return valid JSON.", review);
            return res.status(500).json({ message: "AI did not return valid JSON.", raw: review });
        }

        if (!problemObj) {
            console.log("AI did not return a valid problem object.");
            return res.status(500).json({ message: "AI did not return a valid problem object.", raw: review });
        }

        res.json({ problem: problemObj });
    } catch (error) {
        res.status(500).json({ message: "Error creating AI response" });
    }
});



module.exports.AIRoute = router;