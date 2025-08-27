@@ .. @@
 import React, { useState, useEffect } from 'react';
-import { Plus, Copy, BookOpen, Code, LogOut, Loader } from 'lucide-react';
-import { Quiz } from '../types/quiz';
+import { Plus, Copy, BookOpen, Code, LogOut, Loader, Users, BarChart3, TrendingUp, Eye } from 'lucide-react';
+import { Quiz, QuizResultsResponse } from '../types/quiz';
 import { apiService } from '../services/api';
@@ .. @@
   const [isCreating, setIsCreating] = useState(false);
   const [copiedCode, setCopiedCode] = useState('');
   const [loading, setLoading] = useState(true);
+  const [selectedQuizResults, setSelectedQuizResults] = useState<QuizResultsResponse | null>(null);
+  const [showResults, setShowResults] = useState(false);
+  const [loadingResults, setLoadingResults] = useState(false);
@@ .. @@
     setTimeout(() => setCopiedCode(''), 2000);
   };
+
+  const viewQuizResults = async (quizId: string) => {
+    setLoadingResults(true);
+    try {
+      const results = await apiService.getQuizResults(quizId);
+      setSelectedQuizResults(results);
+      setShowResults(true);
+    } catch (error: any) {
+      console.error('Failed to fetch quiz results:', error);
+      alert(error.message || 'Failed to fetch quiz results');
+    } finally {
+      setLoadingResults(false);
+    }
+  };
+
+  const closeResults = () => {
+    setShowResults(false);
+    setSelectedQuizResults(null);
+  };
+
+  const getPerformanceColor = (performance: string) => {
+    switch (performance) {
+      case 'Excellent': return 'text-green-600 bg-green-100';
+      case 'Good': return 'text-blue-600 bg-blue-100';
+      case 'Poor': return 'text-red-600 bg-red-100';
+      default: return 'text-gray-600 bg-gray-100';
+    }
+  };
+
+  const formatTime = (seconds: number) => {
+    const minutes = Math.floor(seconds / 60);
+    const remainingSeconds = seconds % 60;
+    return `${minutes}m ${remainingSeconds}s`;
+  };
@@ .. @@
   }

            {/* Overall Analysis for Admin */}
            {selectedQuizResults.results.length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Class Performance Analysis
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Performance Distribution</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Excellent (80%+):</span>
                        <span className="font-semibold">
                          {selectedQuizResults.results.filter(r => r.performance === 'Excellent').length} students
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Good (50-79%):</span>
                        <span className="font-semibold">
                          {selectedQuizResults.results.filter(r => r.performance === 'Good').length} students
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Poor (0-49%):</span>
                        <span className="font-semibold">
                          {selectedQuizResults.results.filter(r => r.performance === 'Poor').length} students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Score Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Highest Score:</span>
                        <span className="font-semibold text-green-600">
                          {Math.max(...selectedQuizResults.results.map(r => r.percentage))}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lowest Score:</span>
                        <span className="font-semibold text-red-600">
                          {Math.min(...selectedQuizResults.results.map(r => r.percentage))}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Score:</span>
                        <span className="font-semibold text-blue-600">
                          {Math.round(selectedQuizResults.results.reduce((sum, r) => sum + r.percentage, 0) / selectedQuizResults.results.length)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Recommendations</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {selectedQuizResults.results.filter(r => r.performance === 'Poor').length > selectedQuizResults.results.length * 0.3 ? (
                        <>
                          <p>• Review core concepts with class</p>
                          <p>• Provide additional practice materials</p>
                          <p>• Consider one-on-one support</p>
                        </>
                      ) : selectedQuizResults.results.filter(r => r.performance === 'Excellent').length > selectedQuizResults.results.length * 0.7 ? (
                        <>
                          <p>• Excellent class performance!</p>
                          <p>• Consider advanced topics</p>
                          <p>• Maintain current teaching approach</p>
                        </>
                      ) : (
                        <>
                          <p>• Good overall performance</p>
                          <p>• Focus on struggling students</p>
                          <p>• Reinforce key concepts</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
+  // Quiz Results Modal
+  if (showResults && selectedQuizResults) {
+    return (
+      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
+        <div className="container mx-auto px-4 py-8">
+          {/* Header */}
+          <div className="flex justify-between items-center mb-8">
+            <div>
+              <button
+                onClick={closeResults}
+                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
+              >
+                ← Back to Dashboard
+              </button>
+              <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Results</h1>
+              <p className="text-gray-600">{selectedQuizResults.quiz.topic} - Code: {selectedQuizResults.quiz.code}</p>
+            </div>
+            <button
+              onClick={onLogout}
+              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-red-600"
+            >
+              <LogOut className="w-5 h-5" />
+              Logout
+            </button>
+          </div>
+
+          {/* Statistics Overview */}
+          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
+            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
+              <div className="flex items-center gap-3 mb-2">
+                <Users className="w-6 h-6 text-blue-600" />
+                <span className="text-gray-600 font-medium">Total Attempts</span>
+              </div>
+              <div className="text-3xl font-bold text-gray-800">{selectedQuizResults.results.length}</div>
+            </div>
+            
+            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
+              <div className="flex items-center gap-3 mb-2">
+                <TrendingUp className="w-6 h-6 text-green-600" />
+                <span className="text-gray-600 font-medium">Average Score</span>
+              </div>
+              <div className="text-3xl font-bold text-gray-800">
+                {selectedQuizResults.results.length > 0 
+                  ? Math.round(selectedQuizResults.results.reduce((sum, r) => sum + r.percentage, 0) / selectedQuizResults.results.length)
+                  : 0}%
+              </div>
+            </div>
+            
+            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
+              <div className="flex items-center gap-3 mb-2">
+                <BarChart3 className="w-6 h-6 text-purple-600" />
+                <span className="text-gray-600 font-medium">Excellent</span>
+              </div>
+              <div className="text-3xl font-bold text-green-600">
+                {selectedQuizResults.results.filter(r => r.performance === 'Excellent').length}
+              </div>
+            </div>
+            
+            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
+              <div className="flex items-center gap-3 mb-2">
+                <BarChart3 className="w-6 h-6 text-orange-600" />
+                <span className="text-gray-600 font-medium">Need Improvement</span>
+              </div>
+              <div className="text-3xl font-bold text-red-600">
+                {selectedQuizResults.results.filter(r => r.performance === 'Poor').length}
+              </div>
+            </div>
+          </div>
+
+          {/* Results Table */}
+          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
+            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Student Results</h2>
+            
+            {selectedQuizResults.results.length === 0 ? (
+              <div className="text-center py-12">
+                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
+                <p className="text-gray-500 text-lg">No attempts yet</p>
+                <p className="text-gray-400">Students haven't taken this quiz yet</p>
+              </div>
+            ) : (
+              <div className="overflow-x-auto">
+                <table className="w-full">
+                  <thead>
+                    <tr className="border-b border-gray-200">
+                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
+                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
+                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Score</th>
+                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Performance</th>
+                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Time Spent</th>
+                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Date</th>
+                    </tr>
+                  </thead>
+                  <tbody>
+                    {selectedQuizResults.results.map((result) => (
+                      <tr key={result._id} className="border-b border-gray-100 hover:bg-gray-50/50">
+                        <td className="py-4 px-4">
+                          <div className="font-medium text-gray-800">{result.userName}</div>
+                        </td>
+                        <td className="py-4 px-4 text-gray-600">{result.userEmail}</td>
+                        <td className="py-4 px-4 text-center">
+                          <span className="font-bold text-lg text-gray-800">
+                            {result.percentage}%
+                          </span>
+                          <div className="text-sm text-gray-500">
+                            {result.correctAnswers}/{result.totalQuestions}
+                          </div>
+                        </td>
+                        <td className="py-4 px-4 text-center">
+                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(result.performance)}`}>
+                            {result.performance}
+                          </span>
+                        </td>
+                        <td className="py-4 px-4 text-center text-gray-600">
+                          {result.timeSpent > 0 ? formatTime(result.timeSpent) : 'N/A'}
+                        </td>
+                        <td className="py-4 px-4 text-center text-gray-600">
+                          {new Date(result.createdAt).toLocaleDateString()}
+                        </td>
+                      </tr>
+                    ))}
+                  </tbody>
+                </table>
+              </div>
+            )}
+          </div>
+        </div>
+      </div>
+    );
+  }
+
   return (
@@ .. @@
                   <div className="flex-1">
                     <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.topic}</h3>
                     <div className="flex flex-wrap gap-2 mb-2">
                       <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                         {quiz.category}
                       </span>
                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                         quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                         quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                       }`}>
                         {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                       </span>
                     </div>
                     <p className="text-gray-600 mb-2">{quiz.questions.length} questions</p>
+                    {quiz.statistics && (
+                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
+                        <span className="flex items-center gap-1">
+                          <Users className="w-4 h-4" />
+                          {quiz.statistics.totalAttempts} attempts
+                        </span>
+                        {quiz.statistics.totalAttempts > 0 && (
+                          <span className="flex items-center gap-1">
+                            <TrendingUp className="w-4 h-4" />
+                            {quiz.statistics.averageScore}% avg
+                          </span>
+                        )}
+                      </div>
+                    )}
                     <p className="text-sm text-gray-500">
                       Created {new Date(quiz.createdAt).toLocaleDateString()}
                     </p>
                   </div>
                   
-                  <div className="flex items-center gap-3">
+                  <div className="flex items-center gap-3 flex-wrap">
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
+                    
+                    <button
+                      onClick={() => viewQuizResults(quiz._id!)}
+                      disabled={loadingResults}
+                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 disabled:opacity-50"
+                    >
+                      {loadingResults ? (
+                        <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
+                      ) : (
+                        <Eye className="w-4 h-4" />
+                      )}
+                      View Results
+                    </button>
                   </div>
                 </div>
               ))}