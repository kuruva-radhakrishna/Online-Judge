// Problem validation logic
function validateProblem(problem) {
    if (!problem.problemName || problem.problemName.trim().length < 5) return 'Problem name must be at least 5 characters.';
    if (!problem.problemDescription || problem.problemDescription.trim().length < 15) return 'Description must be at least 15 characters.';
    if (!problem.Constraints || !Array.isArray(problem.Constraints) || problem.Constraints.length === 0) return 'At least one constraint is required.';
    if (!problem.topics || !Array.isArray(problem.topics) || problem.topics.length === 0) return 'At least one topic is required.';
    if (!['easy','medium','difficult'].includes(problem.difficulty)) return 'Difficulty must be selected.';
    if (!problem.TestCases || !Array.isArray(problem.TestCases) || problem.TestCases.length === 0) return 'At least one test case is required.';
    for (let i = 0; i < problem.TestCases.length; ++i) {
        if (!problem.TestCases[i].input || !problem.TestCases[i].input.trim() || !problem.TestCases[i].output || !problem.TestCases[i].output.trim()) return `Test case ${i+1} must have both input and output.`;
    }
    return '';
}

module.exports = { validateProblem }; 