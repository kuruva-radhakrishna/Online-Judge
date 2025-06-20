const { default: mongoose } = require("mongoose");

const ContestSchema = mongoose.Schema({
    contestTitle : {
        type : String,
        required : true,
        unique : true
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    problems : {
        type : [
            {
                problem_id : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'Problem',
                },
                points : {
                    type : Number,
                    default : 4,
                }
            }
        ],
        validate : {
            validator: function (value) {
            return value.length >= 3;
            },
            message: 'A contest must have at least 3 problems.'
        },
    },
    
    startTime : {
        type : Date,
        required : true,
    },
    endTime : {
        type : Date,
        required : true,
        validate: {
            validator: function (value) {
            return value > this.startTime;
            },
            message: 'End time must be after start time.'
        }
    },
    leaderBoard : [
        {
            user_id : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User',
            },
            points : {
                type : Number,
                default : 0,
            },
            solvedProblems : [{
                problem_id : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : 'Problem',
                },
            }],
            lastSubmission : {
                type : Date,
            }
        }
    ],
    Discussions : [
        {
            user : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'User',
            },
            comment : {
                type : String,
                required : true,
            },
            likes : {
                type : Number,
                default : 0,
            },
            dislikes : {
                type : Number,
                default : 0
            }
        }
    ],
});


module.exports = mongoose.model("Contest",ContestSchema);