const User = require('../Models/user');
const Problem = require('../Models/Problems');
const Contest = require('../Models/Contests');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        res.json(problems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

exports.deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        await Problem.findByIdAndDelete(id);
        res.json({ message: 'Problem deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete problem' });
    }
};

exports.getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find();
        res.json(contests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch contests' });
    }
};

exports.deleteContest = async (req, res) => {
    try {
        const { id } = req.params;
        await Contest.findByIdAndDelete(id);
        res.json({ message: 'Contest deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete contest' });
    }
}; 