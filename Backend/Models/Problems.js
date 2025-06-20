require('dotenv').config();
const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    problemName : {
        type : String,
        required : true,
        unique : true,
    },
    CreatedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'User',
        required : true,
    },
    CreatedAt : {
        type : Date,
        default : Date.now
    },
    problemDescription : {
        type : String,
        required : true,
    },
    Constraints : [
        {
            type : String
        }
    ],
    TestCases : [
        {
            input : {
                type : String,
            },
            output : {
                type : String,
            },
            isPublic : {
                type : Boolean,
                default : true,
            }
        }
    ],
    difficulty : {
        type : String ,
        enum : ["easy","medium","difficult"],
        default : "medium"
    },
    topics : [
        {
            type : String,
        }
    ],
    hints : [
        {
            type : String
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
    likes : {
        type : Number,
        default : 0,
    },
    dislikes : {
        type : Number,
        default : 0
    }
});


module.exports = mongoose.model("Problem",ProblemSchema);