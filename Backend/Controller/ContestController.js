const Contest = require('../Models/Contests');
const Problem = require('../Models/Problems');
const { validateContest } = require('../validators/contestValidation');

exports.createContest = async (req, res) => {
    try {
        const { contestTitle, startTime, endTime, description, problems } = req.body;
        const err = validateContest({ contestTitle, startTime, endTime, description, problems });
        if (err) {
            return res.status(400).json({ message: err });
        }
        const contest = new Contest({ contestTitle, startTime, endTime, description, problems });
        await contest.save();
        res.status(201).json({ message: 'Contest created successfully', contest });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create contest' });
    }
};

exports.getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find().sort({ startTime: -1 });
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
};

exports.getContestById = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contest' });
    }
};

exports.getContestProblems = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('problems');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json(contest.problems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contest problems' });
    }
};

exports.getContestLeaderboard = async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id).populate('leaderBoard.user_id', 'firstname lastname email');
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        res.json(contest.leaderBoard);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

exports.addToLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, score, time, penalty } = req.body;
        const contest = await Contest.findById(id);
        if (!contest) return res.status(404).json({ error: 'Contest not found' });
        const existing = contest.leaderBoard.find(e => e.user_id.toString() === user_id);
        if (existing) {
            existing.score = score;
            existing.time = time;
            existing.penalty = penalty;
        } else {
            contest.leaderBoard.push({ user_id, score, time, penalty });
        }
        await contest.save();
        res.json({ message: 'Leaderboard updated', leaderBoard: contest.leaderBoard });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update leaderboard' });
    }
}; 