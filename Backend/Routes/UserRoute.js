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
        const registeredUser = await User.register(newUser, password);

        req.logIn(registeredUser, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Login failed after registration' });
            }

            res.json({ message: 'User registered !', userId: registeredUser._id });
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
            res.json({ message: `Welcome back ${user.firstname + " " + user.lastname} ` });
        })
    })(req, res, next);
});


module.exports.UserRoute = router;