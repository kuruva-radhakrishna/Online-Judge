require('dotenv').config();

const express = require('express');
const app = express();
const { connection } = require('./Database/Connection.js');

const port = process.env.PORT;

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const session = require('express-session');

const User = require("./Models/user.js");
const Problem = require('./Models/Problems.js');
const Contest = require('./Models/Contests.js');
const Submission = require('./Models/Submissions.js');
const { isLoggedIn, isAdmin } = require('./middleware.js');
const { problems } = require('./data.js');
const { UserRoute } = require('./Routes/UserRoute.js');
const { ProblemRoute } = require('./Routes/ProblemRoute.js');
const { SubmissionRoute } = require('./Routes/SubmissionRoute.js');
const { ContestRoute } = require('./Routes/ContestRoute.js');
const { AdminRoute } = require('./Routes/AdminRoute.js');


// const data = async function (){
//     try {
//         for(const p of problems){
//             await Problem.create(p);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// };

// data();

connection();

passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//JSON  parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/problems',ProblemRoute);

app.use('/submissions',SubmissionRoute);

app.use('/contests',ContestRoute);

app.use('/admin',AdminRoute);

app.use('/',UserRoute);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});

