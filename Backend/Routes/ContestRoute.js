const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin }= require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');
const axios = require('axios');
const ContestController = require('../Controller/ContestController');

router.get('/', isLoggedIn, ContestController.getContests);

router.get('/:id', isLoggedIn, ContestController.getContestById)

router.post('/submission/:contest_id/:problem_id', isLoggedIn, ContestController.contestSubmission);

router.get('/:id/leaderboard', isLoggedIn, ContestController.getLeaderBoard);

module.exports = router;