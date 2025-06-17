require('dotenv').config();

const express = require('express');
const app = express();
const {connection} = require('./Database/Connection.js');

const port = process.env.PORT;

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const session = require('express-session');

const User = require("./Models/user.js"); 

connection();

passport.use(new LocalStrategy({usernameField:'email'}, User.authenticate()));
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());

//JSON  parser
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(session({ 
    secret: process.env.secret,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false} 
}));

app.use(passport.initialize()); 
app.use(passport.session());

// Register route
app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const newUser = new User({ firstname, lastname, email });

        const existinguser = await User.findOne({email});

        if(existinguser) {
            return res.status('400').json({"message" : `user with the email ${email} already exists`});
        }
        const registeredUser = await User.register(newUser, password);
        
        req.logIn(registeredUser, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error:'Login failed after registration' });
            }

            res.json({ message:'User registered !', userId: registeredUser._id });  
        });

    } catch (err) {
        console.log(`Registration failed: ${err}`);
        res.status(500).json({error:'Registration failed'})
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({error:'Server Error'})
        }
        if (!user) {
            return res.status(401).json({error:'Invalid credentials'})
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({error:'Login Failed'})
            }
            res.json({message:`Welcome back ${user.firstname + " " + user.lastname} `});
        })
    })(req, res, next);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
}); 

