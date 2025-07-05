const express = require('express');
const router = express.Router();
const {isLoggedIn ,isAdmin}= require('../middleware.js');
const Contest = require('../Models/Contests.js');
const Problem = require('../Models/Problems.js');
const Submission = require('../Models/Submissions.js');
const AdminController = require('../Controller/AdminController');
const { validateProblem } = require('../validators/ProblemValidation');

router.get('/problems/', isLoggedIn, isAdmin, AdminController.problemsCreatedByUser);

router.post('/problems/new', isLoggedIn, isAdmin, AdminController.createProblem);

router.patch('/problems/:id/update', isLoggedIn, isAdmin, AdminController.updateProblem);

router.delete('/problems/:id', isLoggedIn, isAdmin, AdminController.deleteProblem);

// Route to get contests created by the current admin user
router.get('/contests/created-by-me', isLoggedIn, isAdmin, AdminController.contestsByUser);


router.post('/contest/new', isLoggedIn, isAdmin, AdminController.createContest);

router.patch('/contest/:id/update', isLoggedIn, isAdmin, AdminController.updateContest)

router.delete('/contests/:id', isLoggedIn, isAdmin,AdminController.deleteContest);

module.exports = router;