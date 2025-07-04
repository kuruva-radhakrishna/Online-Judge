const mongoose = require('mongoose');

const ProblemDiscussionSchema = new mongoose.Schema({
  problem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problems',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProblemDiscussion', ProblemDiscussionSchema); 