const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware.js');
const ProblemController = require('../Controller/ProblemController');

router.get('/all', isLoggedIn, ProblemController.getAllProblems);
router.get('/', isLoggedIn, ProblemController.getAvailableProblems);
router.get('/:id', ProblemController.getProblemById);
router.get('/:id/discussions', ProblemController.getProblemDiscussions);
router.post('/:id/discussions', isLoggedIn, ProblemController.addProblemDiscussion);

module.exports = router;