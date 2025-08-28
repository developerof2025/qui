import React, { useState, useEffect } from 'react';
import { Plus, Copy, BookOpen, Code, LogOut, Loader, Users, BarChart3, TrendingUp, Award, ArrowLeft } from 'lucide-react';
import { Quiz, QuizResultsResponse } from '../types/quiz';
import { apiService } from '../services/api';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedQuizResults, setSelectedQuizResults] = useState<QuizResultsResponse | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const categories = [
    'Mathematics',
    'Science',
    'History',
    'Geography',
    'Literature',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Economics',
    'Philosophy',
    'Art',
    'Music',
    'Languages',
    'Other'
  ];

  const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
    topic: '',
    category: categories[0],
    difficulty: 'medium',
    questions: []
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await apiService.getQuizzes();
      setQuizzes(data);
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error);
      alert(error.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuiz.topic || !newQuiz.questions || newQuiz.questions.length === 0) {
      alert('Please provide a topic and at least one question');
      return;
    }

    try {
      const quiz = await apiService.createQuiz(newQuiz as Quiz);
      setQuizzes([quiz, ...quizzes]);
      setNewQuiz({
        topic: '',
        category: categories[0],
        difficulty: 'medium',
        questions: []
      });
      setIsCreating(false);
    } catch (error: any) {
      console.error('Failed to create quiz:', error);
      alert(error.message || 'Failed to create quiz');
    }
  };

  const handleViewResults = async (quizId: string) => {
    setLoadingResults(true);
    try {
      const results = await apiService.getQuizResults(quizId);
      setSelectedQuizResults(results);
    } catch (error: any) {
      console.error('Failed to fetch quiz results:', error);
      alert(error.message || 'Failed to fetch quiz results');
    } finally {
      setLoadingResults(false);
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'text-green-600 bg-green-100';
      case 'Good': return 'text-blue-600 bg-blue-100';
      case 'Poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const generateClassAnalysis = (results: QuizResultsResponse) => {
    const totalStudents = results.results.length;
    if (totalStudents === 0) return null;

    const performanceCount = {
      excellent: results.results.filter(r => r.performance === 'Excellent').length,
      good: results.results.filter(r => r.performance === 'Good').length,
      poor: results.results.filter(r => r.performance === 'Poor').length
    };

    const averageScore = Math.round(
      results.results.reduce((sum, r) => sum + r.percentage, 0) / totalStudents
    );

    const highestScore = Math.max(...results.results.map(r => r.percentage));
    const lowestScore = Math.min(...results.results.map(r => r.percentage));

    const poorPercentage = (performanceCount.poor / totalStudents) * 100;
    const excellentPercentage = (performanceCount.excellent / totalStudents) * 100;

    let recommendations = [];
    if (poorPercentage > 30) {
      recommendations.push('Consider reviewing core concepts with the class');
      recommendations.push('Provide additional practice materials');
      recommendations.push('Schedule one-on-one sessions with struggling students');
    } else if (excellentPercentage > 70) {
      recommendations.push('Introduce more advanced topics');
      recommendations.push('Consider accelerated learning materials');
      recommendations.push('Encourage peer tutoring opportunities');
    } else {
      recommendations.push('Continue with current teaching approach');
      recommendations.push('Provide targeted support for lower performers');
      recommendations.push('Challenge high performers with bonus questions');
    }

    return {
      totalStudents,
      performanceCount,
      averageScore,
      highestScore,
      lowestScore,
      recommendations
    };
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setNewQuiz({
      ...newQuiz,
      questions: [...(newQuiz.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(newQuiz.questions || [])];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...(newQuiz.questions || [])];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = (newQuiz.questions || []).filter((_, i) => i !== index);
    setNewQuiz({
      ...newQuiz,
      questions: updatedQuestions
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Quiz Results View
  if (selectedQuizResults) {
    const analysis = generateClassAnalysis(selectedQuizResults);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setSelectedQuizResults(null)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Quiz Results</h1>
                <p className="text-gray-600">{selectedQuizResults.quiz.topic} - {selectedQuizResults.quiz.code}</p>
              </div>
            </div>

            {analysis && (
              <>
                {/* Class Performance Overview */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-blue-600" />
                    Class Performance Analysis
                  </h2>
                  
                  <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-blue-700 mb-2">{analysis.totalStudents}</div>
                      <p className="text-blue-600 font-medium">Total Students</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-green-700 mb-2">{analysis.averageScore}%</div>
                      <p className="text-green-600 font-medium">Average Score</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-purple-700 mb-2">{analysis.highestScore}%</div>
                      <p className="text-purple-600 font-medium">Highest Score</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-orange-700 mb-2">{analysis.lowestScore}%</div>
                      <p className="text-orange-600 font-medium">Lowest Score</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Performance Distribution */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Distribution</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Excellent (80%+)</span>
                          </div>
                          <span className="text-green-700 font-bold">{analysis.performanceCount.excellent}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-800">Good (50-79%)</span>
                          </div>
                          <span className="text-blue-700 font-bold">{analysis.performanceCount.good}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">Needs Improvement (0-49%)</span>
                          </div>
                          <span className="text-red-700 font-bold">{analysis.performanceCount.poor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Teaching Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Teaching Recommendations</h3>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-blue-800 text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Student Results */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <Users className="w-7 h-7 text-blue-600" />
                    Individual Student Results
                  </h2>
                  
                  {selectedQuizResults.results.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No students have completed this quiz yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-800">Student</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-800">Email</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-800">Score</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-800">Performance</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-800">Time Spent</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-800">Completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuizResults.results.map((result) => (
                            <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-800">{result.userName}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-gray-600">{result.userEmail}</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="font-bold text-lg">
                                  {result.percentage}%
                                </div>
                                <div className="text-sm text-gray-500">
                                  {result.correctAnswers}/{result.totalQuestions}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.performance)}`}>
                                  {result.performance}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-gray-600">
                                  {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : 'N/A'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <div className="text-sm text-gray-500">
                                  {new Date(result.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(result.createdAt).toLocaleTimeString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Create and manage quizzes for your students</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create Quiz
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Create Quiz Modal */}
          {isCreating && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">Create New Quiz</h2>
                  
                  <form onSubmit={handleCreateQuiz} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quiz Topic
                        </label>
                        <input
                          type="text"
                          value={newQuiz.topic || ''}
                          onChange={(e) => setNewQuiz({ ...newQuiz, topic: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter quiz topic"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={newQuiz.category || categories[0]}
                          onChange={(e) => setNewQuiz({ ...newQuiz, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={newQuiz.difficulty || 'medium'}
                        onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    {/* Questions */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Questions</h3>
                        <button
                          type="button"
                          onClick={addQuestion}
                          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Question
                        </button>
                      </div>

                      {(newQuiz.questions || []).map((question, questionIndex) => (
                        <div key={questionIndex} className="bg-gray-50 rounded-xl p-6 mb-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-medium text-gray-800">Question {questionIndex + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeQuestion(questionIndex)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Text
                              </label>
                              <textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                                placeholder="Enter your question"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Answer Options
                              </label>
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name={`correct-${questionIndex}`}
                                      checked={question.correctAnswer === optionIndex}
                                      onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                                      className="text-blue-600"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder={`Option ${optionIndex + 1}`}
                                      required
                                    />
                                  </div>
                                ))}
                              </div>
                              <p className="text-sm text-gray-500 mt-2">
                                Select the radio button next to the correct answer
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(!newQuiz.questions || newQuiz.questions.length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No questions added yet. Click "Add Question" to get started.</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Create Quiz
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Quiz List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Quizzes</h2>
            
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No quizzes created yet</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                >
                  Create Your First Quiz
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.topic}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {quiz.category}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full capitalize">
                            {quiz.difficulty}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {quiz.questions.length} Questions
                          </span>
                        </div>
                      </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-600" />
                          <span className="font-mono text-lg font-bold text-blue-700">
                            {quiz.code}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => copyToClipboard(quiz.code)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          copiedCode === quiz.code
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleViewResults(quiz._id!)}
                        disabled={loadingResults}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50"
                      >
                        {loadingResults ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <BarChart3 className="w-4 h-4" />
                        )}
                        View Results
                      </button>
                    </div>
                  </div>
                  
                  {quiz.statistics && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-700">{quiz.statistics.totalAttempts}</div>
                        <div className="text-xs text-blue-600">Attempts</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-700">{quiz.statistics.averageScore}%</div>
                        <div className="text-xs text-green-600">Avg Score</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-700">{quiz.statistics.performanceBreakdown.excellent}</div>
                        <div className="text-xs text-purple-600">Excellent</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-orange-700">{quiz.statistics.performanceBreakdown.poor}</div>
                        <div className="text-xs text-orange-600">Need Help</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};