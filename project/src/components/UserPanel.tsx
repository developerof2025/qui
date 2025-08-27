import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Trophy, X, CheckCircle, XCircle, LogOut, Award, TrendingUp } from 'lucide-react';
import { Quiz, QuizReport } from '../types/quiz';
import { apiService } from '../services/api';

interface UserPanelProps {
  onLogout: () => void;
  userName: string;
}

export function UserPanel({ onLogout, userName }: UserPanelProps) {
  const [quizCode, setQuizCode] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<Array<{ questionId: string; selectedAnswer: number }>>([]);
  const [quizReport, setQuizReport] = useState<QuizReport | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinQuiz = async () => {
    if (quizCode.length !== 6) {
      setError('Please enter a valid 6-digit quiz code');
      return;
    }

    setLoading(true);
    try {
      const quiz = await apiService.joinQuiz(quizCode);
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizReport(null);
      setShowResults(false);
      setError('');
      setSelectedAnswer(null);
    } catch (error: any) {
      setError(error.message || 'Quiz code not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      // Submit quiz
      submitQuiz(updatedAnswers);
    }
  };

  const submitQuiz = async (answers: Array<{ questionId: string; selectedAnswer: number }>) => {
    if (!currentQuiz) return;

    setLoading(true);
    try {
      const report = await apiService.submitQuiz(currentQuiz._id!, answers);
      setQuizReport(report);
      setShowResults(true);
    } catch (error: any) {
      alert(error.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizReport(null);
    setShowResults(false);
    setSelectedAnswer(null);
  };

  const handleBackToStart = () => {
    setCurrentQuiz(null);
    setQuizCode('');
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizReport(null);
    setShowResults(false);
    setSelectedAnswer(null);
    setError('');
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'Excellent': return <Award className="w-8 h-8" />;
      case 'Good': return <TrendingUp className="w-8 h-8" />;
      case 'Poor': return <Trophy className="w-8 h-8" />;
      default: return <Trophy className="w-8 h-8" />;
    }
  };

  // Quiz Code Entry Screen
  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">User Dashboard</h1>
              <p className="text-gray-600">Welcome {userName}! Enter your quiz code to get started</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold text-gray-800">{userName}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-red-600"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Join Quiz</h2>
                <p className="text-gray-600">Enter the quiz code provided by your instructor</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Code
                  </label>
                  <input
                    type="text"
                    value={quizCode}
                    onChange={(e) => {
                      setQuizCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white/50 text-center text-lg font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleJoinQuiz}
                  disabled={quizCode.length !== 6 || loading}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    quizCode.length === 6 && !loading
                      ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:-translate-y-1'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Join Quiz
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && quizReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${getPerformanceColor(quizReport.performance)}`}>
                  {getPerformanceIcon(quizReport.performance)}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
                <p className="text-gray-600">Here are your results for {currentQuiz.topic}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {quizReport.percentage}%
                  </div>
                  <p className="text-blue-600 font-medium">Score</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {quizReport.correctAnswers}
                  </div>
                  <p className="text-green-600 font-medium">Correct Answers</p>
                </div>
                
                <div className={`rounded-xl p-6 text-center ${getPerformanceColor(quizReport.performance)}`}>
                  <div className="text-3xl font-bold mb-2">
                    {quizReport.performance}
                  </div>
                  <p className="font-medium">Performance</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Question Review</h3>
                {quizReport.results.map((result, index) => (
                  <div
                    key={result.questionId}
                    className={`p-4 rounded-xl border-2 ${
                      result.isCorrect
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">
                          {index + 1}. {result.question}
                        </p>
                        <p className={`text-sm mb-1 ${
                          result.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          Your answer: {result.options[result.selectedAnswer]}
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-700 mb-2">
                            Correct answer: {result.options[result.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 italic">
                          {result.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRetakeQuiz}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <RotateCcw className="w-5 h-5" />
                  Retake Quiz
                </button>
                <button
                  onClick={handleBackToStart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                  New Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Question Screen
  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{currentQuiz.topic} Quiz</h1>
              <p className="text-gray-600">
                Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <button
              onClick={handleBackToStart}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/60 rounded-full h-3 mb-8">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`
              }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white/50 border-gray-200 text-gray-800 hover:bg-purple-50 hover:border-purple-200'
                  } cursor-pointer hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {selectedAnswer === index && (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBackToStart}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Exit Quiz
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null || loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedAnswer !== null && !loading
                    ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}