const Problem = require('../Models/Problems');
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.Gemini_api });

exports.generateProblem = async (req, res) => {
    try {
        // Example: expects req.body.prompt
        const { prompt } = req.body;
        // Placeholder for AI logic
        // const aiResult = await someAILibrary.generateProblem(prompt);
        // For now, just echo prompt
        res.json({ message: 'AI generated problem', prompt });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate problem' });
    }
};

exports.reviewCode = async (req, res) => {
    try {
        const { code, problemId } = req.body;
        const prob = await Problem.findById(problemId);

        const prompt = `
            You are a senior software engineer reviewing code submitted for a coding problem.

            ---
            Problem Description:
            ${prob.description}

            Submitted Code:
            ${code}

            Review Instructions:
            1. Identify logical correctness and whether it solves the problem.
            2. Point out potential edge cases it might fail.
            3. Comment on code readability and structure.
            4. Evaluate performance (time/space complexity).
            5. Suggest improvements (best practices, optimizations, naming, etc.).
            6. Mention if the code is good enough to be accepted or needs fixes.

            Respond in this format:
            - Summary (2-3 lines)
            - Issues Found (if any)
            - Suggestions
            - Overall Verdict (Accept / Needs Fixes)
            -Your review will be displayed using react markdown reply accordingly`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        res.json({ review: response.text });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Issue" });
    }
};


exports.createProblemAI = async (req, res) => {
    try {
        const { problem } = req.body;
        const allowedTopics = [
            "array", "string", "hash table", "dynamic programming", "math", "sorting", "greedy", "tree", "graph", "binary search", "recursion", "backtracking", "stack", "queue", "heap", "linked list", "sliding window", "two pointers", "bit manipulation", "number theory", "geometry", "database", "shell", "javascript", "concurrency", "depth-first search", "breadth-first search", "trie", "segment tree", "disjoint set", "topological sort", "shortest path", "minimum spanning tree", "game theory", "probability", "combinatorics", "implementation", "simulation", "other"
        ];
        const allowedDifficulties = ["easy", "medium", "hard"];
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Assume you are a problem setter.\nCover all edge cases regarding testcases. Ensure the problem is well explained.\nFor all sample inputs and test cases, if the input includes an array, print the array elements on a single line, space-separated, after the array size. For example:\n6\n1 2 3 4 6 7\n13\nDo not print each array element on a separate line. Use the exact input format as described in the problem statement.\nWhen setting the 'topics' field, only use topics from this list: ${allowedTopics.join(", ")}.\nFor the 'difficulty' field, only use one of: ${allowedDifficulties.join(", ")}.\nDo NOT use 'difficult' as a difficulty.\nComplete the problem object: ${JSON.stringify(problem)}. \nGive response in json format.`,
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
};

exports.debugCode = async (req, res) => {
    try {
        const { code } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a senior software engineer assisting in debugging user-submitted code.
            Instructions:
            - Identify and explain any bugs, logical errors, or edge case failures.
            - Point out any common runtime or syntax issues.
            - Suggest fixes or improvements if necessary.
            - Avoid restating the problem statement or describing what the code is trying to do unless needed to explain a bug.
            - Keep your response concise (4-6 sentences max) and focused only on debugging.

            User Code:
            ${code}`
        });
        res.json({ debug: response.text });
    } catch (error) {
        res.status(500).json({ message: "Server Issue" });
    }
};

exports.generateContestDescription = async (req, res) => {
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
};

exports.chat = async (req, res) => {
    try {
        const { message, chatHistory } = req.body;

        // Build context from chat history
        let context = "You are an expert programming assistant for an online coding judge platform. You help users with:\n\n";
        context += "• Code review and debugging\n";
        context += "• Algorithm explanations and problem-solving approaches\n";
        context += "• Best practices and coding standards\n";
        context += "• General programming questions\n";
        context += "• Data structures and algorithms\n";
        context += "• Competitive programming tips\n\n";
        context += "Provide clear, concise, and helpful responses. Use markdown formatting for code blocks and emphasis. Be concise. Limit your response to a few sentences unless code is requested.\n\n";

        // Add chat history for context
        if (chatHistory && chatHistory.length > 0) {
            context += "Previous conversation:\n";
            chatHistory.forEach((msg, index) => {
                if (index < 10) { // Limit to last 10 messages for context
                    context += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
                }
            });
            context += "\n";
        }

        context += `User: ${message}\n\nAssistant:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: context,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 400,
            }
        });

        res.json({ response: response.text });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: "AI chat failed. Please try again." });
    }
}; 