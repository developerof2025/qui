import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Trophy, X, CheckCircle, XCircle, LogOut, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { Quiz, QuizReport } from '../types/quiz';
import { apiService } from '../services/api';

interface QuizPlayerProps {
  onBack: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ onBack }) => {
  const [quizCode, setQuizCode] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: string; selectedAnswer: number }>>([]);
  const [quizReport, setQuizReport] = useState<QuizReport | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const loadQuiz = async () => {
    if (!quizCode.trim()) {
      setError('Please enter a quiz code');
      return;
    }

    setLoading(true);
    try {
      const quiz = await apiService.getQuizByCode(quizCode.trim());
      setCurrentQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setQuizReport(null);
      setShowResults(false);
      setError('');
      setSelectedAnswer(null);
      setStartTime(Date.now());
    } catch (error: any) {
      setError(error.message || 'Quiz code not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = currentQuiz!.questions[currentQuestionIndex];
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === currentQuestion._id);
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = { questionId: currentQuestion._id!, selectedAnswer };
    } else {
      newAnswers.push({ questionId: currentQuestion._id!, selectedAnswer });
    }
    
    setAnswers(newAnswers);

    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Check if we have an answer for the next question
      const nextQuestion = currentQuiz!.questions[currentQuestionIndex + 1];
      const existingAnswer = newAnswers.find(a => a.questionId === nextQuestion._id);
      setSelectedAnswer(existingAnswer ? existingAnswer.selectedAnswer : null);
    } else {
      // Last question, submit quiz
      submitQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load the previous answer
      const prevQuestion = currentQuiz!.questions[currentQuestionIndex - 1];
      const existingAnswer = answers.find(a => a.questionId === prevQuestion._id);
      setSelectedAnswer(existingAnswer ? existingAnswer.selectedAnswer : null);
    }
  };

  const submitQuiz = async (answers: Array<{ questionId: string; selectedAnswer: number }>) => {
    if (!currentQuiz) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    setLoading(true);
    try {
      const report = await apiService.submitQuiz(currentQuiz._id!, answers, timeSpent);
      setQuizReport(report);
      setShowResults(true);
    } catch (error: any) {
      setError(error.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizReport(null);
    setShowResults(false);
    setSelectedAnswer(null);
    setStartTime(Date.now());
  };

  const backToQuizSelection = () => {
    setCurrentQuiz(null);
    setQuizCode('');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizReport(null);
    setShowResults(false);
    setSelectedAnswer(null);
    setError('');
    setStartTime(0);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance.toLowerCase()) {
      case 'excellent':
        return 'bg-gradient-to-r from-green-50 to-green-100 text-green-700';
      case 'good':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700';
      case 'average':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700';
      case 'poor':
        return 'bg-gradient-to-r from-red-50 to-red-100 text-red-700';
      default:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700';
    }
  };

  if (showResults && quizReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
              <p className="text-gray-600">Here are your results</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  {quizReport.score}%
                </div>
                <p className="text-blue-600 font-medium">Final Score</p>
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

            {quizReport.timeSpent && quizReport.timeSpent > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center mb-8">
                <div className="text-2xl font-bold text-purple-700 mb-2">
                  {Math.floor(quizReport.timeSpent / 60)}m {quizReport.timeSpent % 60}s
                </div>
                <p className="text-purple-600 font-medium">Time Spent</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Question Breakdown
              </h3>
              <div className="space-y-3">
                {quizReport.questionResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium text-gray-700">Question {index + 1}</span>
                    <div className="flex items-center">
                      {result.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${result.correct ? 'text-green-600' : 'text-red-600'}`}>
                        {result.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={restartQuiz}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake Quiz
              </button>
              <button
                onClick={backToQuizSelection}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Try Another Quiz
              </button>
              <button
                onClick={onBack}
                className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
              >
                <X className="w-5 h-5 mr-2" />
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
                <button
                  onClick={backToQuizSelection}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Content */}
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={selectedAnswer === null || loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedAnswer === null || loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Submitting...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
                      <ArrowRight className="w-5 h-5 ml-2" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Quiz</h1>
            <p className="text-gray-600">Enter the quiz code to get started</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="quizCode" className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Code
              </label>
              <input
                type="text"
                id="quizCode"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                placeholder="Enter quiz code"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={loadQuiz}
              disabled={loading || !quizCode.trim()}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                loading || !quizCode.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading Quiz...
                </div>
              ) : (
                'Start Quiz'
              )}
            </button>

            <button
              onClick={onBack}
              className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};