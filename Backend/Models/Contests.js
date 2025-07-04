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
    description: {
        type: String,
        default: '',
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

function getTimeLeft(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = mongoose.model("Contest",ContestSchema);