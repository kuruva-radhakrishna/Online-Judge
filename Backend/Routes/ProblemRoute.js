const express = require('express');
const router = express.Router();
const {isLoggedIn } = require('../middleware.js');
const Problem = require('../Models/Problems.js');
const Contest = require('../Models/Contests.js');

router.get('/', isLoggedIn, async (req, res) => {
    try {
        const now = new Date();

        const activeContests = await Contest.find({
            startTime: { $lte: now },
            endTime: { $gte: now },
        });

        const activeProblems = new Set();
        for (const contest of activeContests) {
            contest.problems.forEach(problem => {
                activeProblems.add(problem.problem_id.toString());
            });
        }

        const allProblems = await Problem.find({}).lean();

        // Filter out problems that are in active contests
        const availableProblems = allProblems.filter(
            problem => !activeProblems.has(problem._id.toString())
        );

        res.json(availableProblems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/:id", async (req, res) => {

    try {
        const id = req.params.id;
        console.log(id);
        const problem = await Problem.findById(id)
        console.log(problem);
        if (!problem) {
            return res.status(500).json({ message: "The problem You are search for is not present" });
        }
        res.status(200).json(problem);
    } catch (error) {
        return res.status(500).json({ message: "Internal Serve Issue" });
    }
});


module.exports.ProblemRoute = router;