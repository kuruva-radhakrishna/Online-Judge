const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../Models/user.js');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;
        const newUser = new User({ firstname, lastname, email, role });

        const existinguser = await User.findOne({ email });

        if (existinguser) {
            return res.status(400).json({ "message": `user with the email ${email} already exists` });
        }
        const user = await User.register(newUser, password);

        req.logIn(user, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Login failed after registration' });
            }

            const { password, ...userSafe } = user.toObject ? user.toObject() : user;
            res.json({ message: `Welcome back ${user.firstname + " " + user.lastname} `, user: userSafe });
        });

    } catch (err) {
        console.log(`Registration failed: ${err}`);
        res.status(500).json({ error: 'Registration failed' })
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ error: 'Server Error' })
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login Failed' })
            }
            // Remove sensitive info before sending user object
            const { password, ...userSafe } = user.toObject ? user.toObject() : user;
            res.json({ message: `Welcome back ${user.firstname + " " + user.lastname} `, user: userSafe });
        })
    })(req, res, next);
});

// Check authentication status
router.get('/auth/check', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        // Remove sensitive info before sending user object
        const { password, ...userSafe } = req.user.toObject ? req.user.toObject() : req.user;
        res.json({ user: userSafe });
    } else {
        res.status(401).json({ user: null });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return res.status(500).json({ error: 'Logout failed' }); }
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // default session cookie name
            res.json({ message: 'Logged out successfully' });
        });
    });
});

module.exports.UserRoute = router;