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

app.get('/problems', isLoggedIn, async (req, res) => {
    try {
        const now = new Date();

        const activeContests = await Contest.find({
            startTime: { $lte: now },
            endTime: { $gte: now },
        });

        const activeProblems = new Set();
        for (const contest of activeContests) {
            contest.problems.forEach(problem => {
                activeProblems.add(problem.problem_id.toString());
            });
        }

        const allProblems = await Problem.find({}).lean();

        // Filter out problems that are in active contests
        const availableProblems = allProblems.filter(
            problem => !activeProblems.has(problem._id.toString())
        );

        res.json(availableProblems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get('/admin/problems/', isLoggedIn, isAdmin, async (req, res) => {
    try {
        console.log(req.user);
        console.log("Logged-in user ID:", req.user._id.toString());

        const allProblems = await Problem.find({});
        console.log(allProblems);
        const problemsByUser = await Problem.find({ CreatedBy: req.user._id });
        return res.status(200).json(problemsByUser);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
})


app.post('/admin/problems/new', isLoggedIn, isAdmin, async (req, res) => {
    //Create New problem
    //Check the user's role only create if the user is admin

    try {
        const newProblem = req.body.problem;
        newProblem.CreatedBy = req.user._id;
        const result = await Problem.create(newProblem);
        if (!result) {
            return res.status('500').json('Database Issue');
        }
        else {
            return res.status('200').json({ message: 'Successfully Created new Problem' });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/problems/:id", async (req, res) => {

    try {
        const id = req.params.id;
        console.log(id);
        const problem = await Problem.findById(id)
        console.log(problem);
        if (!problem) {
            return res.status(500).json({ message: "The problem You are search for is not present" });
        }
        res.status(200).json(problem);
    } catch (error) {
        return res.status(500).json({ message: "Internal Serve Issue" });
    }
});

app.patch('/admin/problems/:id/update', isLoggedIn, isAdmin, async (req, res) => {
    //update the problem
    //Update only when the user's role is admin and the problem is created by same admin
    try {
        const id = req.params.id;
        const old_problem = await Problem.findById(id);
        if (old_problem.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this problem" });
        }
        const result = Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.problem });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the problem" });
        }
        res.status(200).json({ message: "Successfully update the problem " });
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

app.delete('/admin/problems/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Delete the problem with the id
    //Delete the submissions made on the problem or make the problem id for submissions as null
    // Change the problem array if the problem is present in any contest make it null 

    try {
        const id = req.params.id;

        const old_problem = await Problem.findById(id);

        console.log(old_problem.CreatedBy);
        console.log(req.user._id);
        if (old_problem.CreatedBy.equals(req.user._id)) {
            const result = await Problem.findByIdAndDelete(id);
            if (!result) {
                return res.status(500).json({ message: "Database Issue. Unable to update the problem" });
            }
            return res.status(200).json({ message: "Successfully update the problem " });
        }

        return res.status(400).json({ message: "you are not authorized to update this problem" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

app.get('/submissions', isLoggedIn, async (req, res) => {
    //return all submissions of User

    try {
        const submissionsByUser = await Submission.find({ user_id: req.user._id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})

app.get('/submissions/:id', isLoggedIn, async (req, res) => {
    //return submissions made by the current user on the specific problem
    try {
        const id = req.params.id;
        console.log(id);
        const submissionsByUser = await Submission.find({ user_id: req.user._id, problem_id: id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})
app.get('/submissions/all/:id', isLoggedIn, async (req, res) => {
    //return submissions made by every one on this problem

    try {
        const id = req.params.id;
        console.log(id);
        const submissionsByUser = await Submission.find({ problem_id: id });
        if (!submissionsByUser) {
            return res.status(500).json({ message: "Database Issue" });
        }
        return res.json(submissionsByUser);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})
app.post('/submissions/:id', isLoggedIn, async (req, res) => {

    //Assuming I constructed the whole submission
    try {
        const newSubmission = req.body.submission;
        newSubmission.problem_id = req.params.id;
        newSubmission.user_id = req.user._id;
        console.log(newSubmission);
        const result = await Submission.create(newSubmission);
        if (!result) {
            return res.status(500).json({ message: "unable to upload submission" });
        }
        return res.status(200).json({ message: "Successfully uploaded the submission" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
});

app.get('/contests', isLoggedIn, async (req, res) => {
    //return all contests
    try {
        const contests = await Contest.find({});
        if (!contests) {
            return res.status(500).json({ message: "Issue in Database" });
        }
        return res.status(200).json(contests);
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }

});

app.post('/admin/contest/new', isLoggedIn, isAdmin, async (req, res) => {
    //check user is admin or not
    //create new contest

    try {
        console.log(req.body.contest);
        const newContest = req.body.contest;
        console.log(newContest);
        const result = await Contest.create(newContest);
        if (!result) {
            return res.status(500).json({ message: "Database error. Unable to create contest" });
        }
        return res.status(200).json({ message: "Contest Created Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

app.get('/contest/:id', isLoggedIn, async (req, res) => {
    // check if contest if past or running
    //don't provide contests for pending ones

    try {
        const now = new Date();
        const { id } = req.params.id;
        const result = await Contest.findById(id);
        if (!result) {
            return res.status(500).json({ message: "Database error. Unable to create contest" });
        }
        if (result.startTime >= now) {
            return res.status(400).json({ message: "The contest is not live yet" });
        }
        return res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
})

app.patch('/admin/contest/:id/update', isLoggedIn, isAdmin, async (req, res) => {
    // check if the contest is pending
    // update only pending contests

    try {
        const now = new Date()
        const { id } = req.params.body;
        const old_contest = await Contest.findById(id);
        if (old_contest.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this contest" });
        }
        const result = await Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.contest });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the contest" });
        }

        if (old_contest.startTime >= now) {
            return res.status(400).json({ message: "you are cannot update this contest now" });
        }
        return res.status(200).json({ message: "Successfully update the contest " });
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
})

app.delete('/admin/contests/:id', isLoggedIn, isAdmin, async (req, res) => {
    // Delete the contest
    //check if there are submissions for this contest and update them to null

    try {
        const { id } = req.params.body;
        const contest = await Contest.findById(id);
        const now = new Date();
        if (old_problem.createdBy.toString() != req.user_id.toString()) {
            return res.status(400).json({ message: "you are not authorized to update this contest" });
        }
        if (contest.startTime >= now) {
            return res.status(400).json({ message: "you are cannot delete this contest now" });
        }
        const result = Problem.findByIdAndUpdate({ _id: id }, { $set: req.body.problem });
        if (!result) {
            return res.status(500).json({ message: "Database Issue. Unable to update the contest" });
        }
        return res.status(200).json({ message: "Successfully update the contest " });
    } catch (error) {
        return res.status(500).json({ message: "Internal Sever Issue" });
    }
})

app.get('/contest/:id/leaderboard', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params.body;
        const contest = await Contest.findById(id);
        if (!contest) {
            res.status(400).json({ message: "This contest doesn't exist" });
        }

        res.status(200).json(contest.leaderboard);
    } catch (error) {
        res.status(500).json({ message: "Internal Sever Issue" });
    }
});

app.post('/contest/submission/:contest_id/:problem_id', isLoggedIn, async (req, res) => {
    try {
        const { contest_id, problem_id } = req.params;
        const newSubmission = req.body.submission;
        const contest = await Contest.findById(contest_id);
        const problem = await Problem.findById(problem_id);
        if (!contest || !problem) {
            return res.status(400).json({ message: "Contest or problem doesn't exist" });
        }

        const now = new Date();

        // Contest should be active
        if (now < contest.startTime || now > contest.endTime) {
            return res.status(403).json({ message: "Contest is not active" });
        }

        // Check if the problem exists in the contest
        const problemEntry = contest.problems.find(p =>
            p.problem_id.toString() === problem_id.toString()
        );
        if (!problemEntry) {
            return res.status(400).json({ message: "Problem is not part of this contest" });
        }

        // Attach necessary submission details
        newSubmission.user_id = req.user._id;
        newSubmission.problem_id = problem_id;
        newSubmission.contest_id = contest_id;
        newSubmission.time = now;

        const result = await Submission.create(newSubmission);
        if (!result) {
            return res.status(500).json({ message: "Unable to upload submission" });
        }

        // Update leaderboard only if the verdict is accepted
        if (newSubmission.verdict === 'Accepted') {
            console.log('accepted');
            const userIdStr = req.user._id.toString();
            const userEntry = contest.leaderBoard.find(entry => entry.user_id.toString() === userIdStr);
            console.log(userEntry);
            if (!userEntry) {
                // First time submission by user in this contest
                console.log('Pushing user');
                await Contest.findByIdAndUpdate(contest_id, {
                    $push: {
                        leaderBoard: {
                            user_id: req.user._id,
                            points: problemEntry.points,
                            lastSubmission: now,
                            solvedProblems: [{ problem_id: problem_id }]
                        }
                    }
                });
            } else {
                const hasSolved = userEntry.solvedProblems.some(
                    pidObj => pidObj.problem_id.toString() === problem_id.toString()
                    );

                if (!hasSolved) {
                    // First time solving this problem
                    await Contest.updateOne(
                        {
                            _id: contest_id,
                            "leaderBoard.user_id": req.user._id
                        },
                        {
                            $inc: { "leaderBoard.$.points": problemEntry.points },
                            $set: { "leaderBoard.$.lastSubmission": now },
                            $push: { "leaderBoard.$.solvedProblems": { problem_id: problem_id } }
                        }
                    );
                } else {
                    // Already solved — update only lastSubmission
                    console.log('Already Solved');
                    await Contest.updateOne(
                        {
                            _id: contest_id,
                            "leaderBoard.user_id": req.user._id
                        },
                        {
                            $set: { "leaderBoard.$.lastSubmission": now }
                        }
                    );
                }
            }
        }

        return res.status(201).json({ message: "Submission uploaded successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



// Register route
app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, email, password, role } = req.body;
        const newUser = new User({ firstname, lastname, email, role });

        const existinguser = await User.findOne({ email });

        if (existinguser) {
            return res.status('400').json({ "message": `user with the email ${email} already exists` });
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

app.post('/login', (req, res, next) => {
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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});

