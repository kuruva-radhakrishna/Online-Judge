// Contest validation logic
function validateContest(contest) {
    if (!contest.contestTitle || contest.contestTitle.trim().length < 5) return 'Contest title must be at least 5 characters.';
    if (!contest.startTime || !contest.endTime) return 'Start and end time are required.';
    if (new Date(contest.endTime) <= new Date(contest.startTime)) return 'End time must be after start time.';
    if (!contest.description || contest.description.trim().length < 10) return 'Description must be at least 10 characters.';
    if (!contest.problems || !Array.isArray(contest.problems) || contest.problems.length === 0) return 'At least one problem is required for the contest.';
    return '';
}

module.exports = { validateContest }; 