const express = require('express');
const router = express.Router();
const UserController = require('../Controller/UserController');
const { isLoggedIn } = require('../middleware');

// Register route
router.post('/register', UserController.register);

router.post('/login', UserController.login);

// Check authentication status
router.get('/check-auth', UserController.checkAuth);

// Logout route
router.post('/logout', UserController.logout);

// Get current user's profile with attended contests (by leaderboard presence)
router.get('/profile', isLoggedIn, UserController.getProfile);

module.exports = router;