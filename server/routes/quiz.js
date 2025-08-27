const express = require('express');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const { auth, adminAuth } = require('../middleware/auth');
const GeminiService = require('../services/geminiService');

// Get admin's quizzes
router.get('/admin/quizzes', adminAuth, async (req, res) => {
  try {
    // Get quizzes with completion statistics
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .select('-questions.explanation')
      .sort({ createdAt: -1 });

    // Get completion statistics for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const results = await QuizResult.find({ quizId: quiz._id });
        const totalAttempts = results.length;
        const averageScore = totalAttempts > 0 
          ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / totalAttempts)
          : 0;
        
        const performanceBreakdown = {
          excellent: results.filter(r => r.performance === 'Excellent').length,
          good: results.filter(r => r.performance === 'Good').length,
          poor: results.filter(r => r.performance === 'Poor').length
        };

        return {
          ...quiz.toObject(),
          statistics: {
            totalAttempts,
            averageScore,
            performanceBreakdown
          }
        };
      })
    );

    res.json(quizzesWithStats);
  } catch (error) {
    console.error('Get admin quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
});

// Get detailed quiz results for admin
router.get('/admin/quiz/:quizId/results', adminAuth, async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Verify quiz belongs to admin
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: req.user._id });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const results = await QuizResult.find({ quizId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      quiz: {
        _id: quiz._id,
        topic: quiz.topic,
        code: quiz.code,
        difficulty: quiz.difficulty,
        category: quiz.category
      },
      results
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz results' });
  }
});

// Join quiz by code (User only)

// Submit quiz answers and get results
router.post('/submit/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeSpent } = req.body; // Array of { questionId, selectedAnswer }
    
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only users can submit quiz answers' });
    }

    // Calculate results
    const results = [];
    let correctCount = 0;
    const processedAnswers = [];

    quiz.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctCount++;
      
      processedAnswers.push({
        questionId: question.id,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
        isCorrect
      });
      
      results.push({
        questionId: question.id,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer ? userAnswer.selectedAnswer : -1,
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

    // Save quiz result to database
    const quizResult = new QuizResult({
      quizId: quiz._id,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      answers: processedAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      percentage,
      performance,
      timeSpent: timeSpent || 0
    });

    await quizResult.save();

    const report = {
      resultId: quizResult._id,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      percentage,
      performance,
      completedAt: new Date(),
      timeSpent: timeSpent || 0,
      results
    };

    res.json(report);
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

module.exports = router;