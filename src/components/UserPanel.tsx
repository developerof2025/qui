@@ .. @@
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
@@ .. @@
      setQuizReport(null);
      setShowResults(false);
      setError('');
      setSelectedAnswer(null);
      setStartTime(Date.now());
    } catch (error: any) {
      setError(error.message || 'Quiz code not found. Please check and try again.');
@@ .. @@
  const submitQuiz = async (answers: Array<{ questionId: string; selectedAnswer: number }>) => {
    if (!currentQuiz) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
    setLoading(true);
    try {
      const report = await apiService.submitQuiz(currentQuiz._id!, answers, timeSpent);
      setQuizReport(report);
      setShowResults(true);
    } catch (error: any) {
@@ .. @@
    setShowResults(false);
    setSelectedAnswer(null);
    setStartTime(Date.now());
  };
@@ .. @@
    setSelectedAnswer(null);
    setError('');
    setStartTime(0);
  };
@@ .. @@
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

        {/* Analysis Report */}
        {quizReport.analysis && (
          <div className="bg-white/60 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Performance Analysis
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              {quizReport.analysis.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {quizReport.analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {quizReport.analysis.weaknesses.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {quizReport.analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {quizReport.analysis.recommendations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {quizReport.analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category Breakdown */}
            <div className="bg-purple-50 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Performance
              </h4>
              {quizReport.analysis.categoryBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-purple-700 font-medium">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-600 text-sm">
                      {category.correct}/{category.total}
                    </span>
                    <span className="text-purple-800 font-semibold">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">