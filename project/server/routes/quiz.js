const express = require('express');
const Quiz = require('../models/Quiz');
const { auth, adminAuth } = require('../middleware/auth');
const GeminiService = require('../services/geminiService');

const router = express.Router();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Generate quiz code
const generateQuizCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create quiz (Admin only)
router.post('/create', adminAuth, async (req, res) => {
  try {
    const { topic, difficulty, category, numberOfQuestions } = req.body;

    // Generate quiz using Gemini AI
    const quizData = await geminiService.generateQuiz({
      topic,
      difficulty,
      category,
      numberOfQuestions
    });

    // Create quiz in database
    const quiz = new Quiz({
      code: generateQuizCode(),
      topic,
      difficulty,
      category,
      questions: quizData.questions,
      createdBy: req.user._id
    });

    await quiz.save();

    res.status(201).json(quiz);
  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
});

// Get admin's quizzes
router.get('/admin/quizzes', adminAuth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .select('-questions.explanation') // Don't send explanations to admin list
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get admin quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Join quiz by code (User only)
router.get('/join/:code', auth, async (req, res) => {
  try {
    const { code } = req.params;
    
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can join quizzes' });
    }

    const quiz = await Quiz.findOne({ code: code.toUpperCase() })
      .select('-questions.correctAnswer -questions.explanation'); // Don't send answers to users initially

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Join quiz error:', error);
    res.status(500).json({ message: 'Failed to join quiz' });
  }
});

// Submit quiz answers and get results
router.post('/submit/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }
    
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can submit quiz answers' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate results
    const results = [];
    let correctCount = 0;

    quiz.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;
      
      results.push({
        questionId: question.id,
        question: question.question,
        options: question.options,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    // Generate performance report
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    let performance;
    
    if (percentage >= 80) {
      performance = 'Excellent';
    } else if (percentage >= 50) {
      performance = 'Good';
    } else {
      performance = 'Poor';
    }

    const report = {
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      percentage,
      performance,
      completedAt: new Date(),
      results
    };

    res.json(report);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

module.exports = router;