const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    selectedAnswer: {
      type: Number,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }],
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  performance: {
    type: String,
    enum: ['Poor', 'Good', 'Excellent'],
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
quizResultSchema.index({ quizId: 1, userId: 1 });
quizResultSchema.index({ quizId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);