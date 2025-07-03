require("dotenv").config();

const express = require("express");
const app = express();
const { connection } = require("./Database/Connection.js");

const port = process.env.PORT;

const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const session = require("express-session");

const User = require("./Models/user.js");
const { UserRoute } = require("./Routes/UserRoute.js");
const { ProblemRoute } = require("./Routes/ProblemRoute.js");
const { SubmissionRoute } = require("./Routes/SubmissionRoute.js");
const { ContestRoute } = require("./Routes/ContestRoute.js");
const { AdminRoute } = require("./Routes/AdminRoute.js");

const cors = require("cors");
const { AIRoute } = require("./Routes/AIRoute.js");

app.use(cors({
  origin: 'http://localhost:5173', // ✅ must match your frontend
  credentials: true                // ✅ allow cookies (sessions)
}));

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

passport.use(
    new LocalStrategy({ usernameField: "email" }, User.authenticate())
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//JSON  parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "yourSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: "lax", // or 'none' if you're using different ports or domains
            secure: false, // set to true in production with HTTPS
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", UserRoute); // Handles /register, /login, /auth/check, etc.

app.use('/ai',AIRoute);

app.use("/problems", ProblemRoute);

app.use("/submissions", SubmissionRoute);

app.use("/contests", ContestRoute);

app.use("/admin", AdminRoute);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
