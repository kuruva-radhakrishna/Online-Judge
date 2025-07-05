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

exports.suggestTestCases = async (req, res) => {
    try {
        const { description } = req.body;
        // Placeholder for AI logic
        // const testCases = await someAILibrary.suggestTestCases(description);
        res.json({ message: 'AI suggested test cases', description });
    } catch (err) {
        res.status(500).json({ error: 'Failed to suggest test cases' });
    }
};

exports.reviewCode = async (req, res) => {
    try {
        const { code } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze and provide a crisp review of the code\nCode: ${code}`,
        });
        res.json({ review: response.text });
    } catch (error) {
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
            contents: `You are a code debugging assistant. Analyze the following code and provide a crisp, actionable debug summary in 4-5 sentences. Focus on possible bugs, logical errors, edge cases, or improvements. Do NOT explain the whole problem or restate the problem statement. Only give feedback on the code itself.\n\nUser Code:\n${code}\n`,
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