// Problem validation logic
const ALLOWED_TOPICS = [
    "array",
    "string",
    "hash table",
    "dynamic programming",
    "math",
    "sorting",
    "greedy",
    "tree",
    "graph",
    "binary search",
    "recursion",
    "backtracking",
    "stack",
    "queue",
    "heap",
    "linked list",
    "sliding window",
    "two pointers",
    "bit manipulation",
    "number theory",
    "geometry",
    "database",
    "shell",
    "javascript",
    "concurrency",
    "depth-first search",
    "breadth-first search",
    "trie",
    "segment tree",
    "disjoint set",
    "topological sort",
    "shortest path",
    "minimum spanning tree",
    "game theory",
    "probability",
    "combinatorics",
    "implementation",
    "simulation",
    "other"
];
const ALLOWED_DIFFICULTY = ["easy", "medium", "hard"];

function validateProblem(problem) {
    if (!problem.problemName || problem.problemName.trim().length < 5) return 'Problem name must be at least 5 characters.';
    if (!problem.problemDescription || problem.problemDescription.trim().length < 15) return 'Description must be at least 15 characters.';
    if (!problem.Constraints || !Array.isArray(problem.Constraints) || problem.Constraints.length === 0) return 'At least one constraint is required.';
    if (!problem.topics || !Array.isArray(problem.topics) || problem.topics.length === 0) return 'At least one topic is required.';
    for (const topic of problem.topics) {
        if (!ALLOWED_TOPICS.includes(topic)) return `Invalid topic: ${topic}.`;
    }
    if (!ALLOWED_DIFFICULTY.includes(problem.difficulty)) return 'Difficulty must be easy, medium, or hard.';
    if (!problem.TestCases || !Array.isArray(problem.TestCases) || problem.TestCases.length === 0) return 'At least one test case is required.';
    for (let i = 0; i < problem.TestCases.length; ++i) {
        if (!problem.TestCases[i].input || !problem.TestCases[i].input.trim() || !problem.TestCases[i].output || !problem.TestCases[i].output.trim()) return `Test case ${i+1} must have both input and output.`;
    }
    return '';
}

module.exports = { validateProblem }; 