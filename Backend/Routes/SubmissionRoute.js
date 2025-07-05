const express = require('express');
const router = express.Router();
const Submission = require('../Models/Submissions.js');
const Problem = require('../Models/Problems.js');
const {isLoggedIn } = require('../middleware.js');
const axios = require('axios');
const SubmissionController = require('../Controller/SubmissionController');

// router.get('/', isLoggedIn, SubmissionController.getSubmissionsByUser);
// router.get('/:id', isLoggedIn, SubmissionController.getSubmissionsByProblem);
// router.get('/all/:id', isLoggedIn, SubmissionController.getSubmissionsByProblem);
// router.post('/:id', isLoggedIn, SubmissionController.createSubmission);
// router.get('/single/:id', SubmissionController.getSubmissionById);



router.get('/', isLoggedIn, SubmissionController.allSubmissionsByUser);



router.get('/:id', isLoggedIn, SubmissionController.problemSubmissionsByUSer)


router.post('/:id', isLoggedIn, SubmissionController.createSubmission);

router.get('/single/:id', SubmissionController.getSubmission);

module.exports.SubmissionRouter = router;