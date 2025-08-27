@@ .. @@
   const [showResults, setShowResults] = useState(false);
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);
+  const [startTime, setStartTime] = useState<number>(0);
@@ .. @@
       setQuizReport(null);
       setShowResults(false);
       setError('');
       setSelectedAnswer(null);
+      setStartTime(Date.now());
     } catch (error: any) {
       setError(error.message || 'Quiz code not found. Please check and try again.');
@@ .. @@
   const submitQuiz = async (answers: Array<{ questionId: string; selectedAnswer: number }>) => {
     if (!currentQuiz) return;

+    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
     setLoading(true);
     try {
-      const report = await apiService.submitQuiz(currentQuiz._id!, answers);
+      const report = await apiService.submitQuiz(currentQuiz._id!, answers, timeSpent);
       setQuizReport(report);
       setShowResults(true);
     } catch (error: any) {
@@ .. @@
     setShowResults(false);
     setSelectedAnswer(null);
+    setStartTime(Date.now());
   };
@@ .. @@
     setSelectedAnswer(null);
     setError('');
+    setStartTime(0);
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
+
+          {quizReport.timeSpent && quizReport.timeSpent > 0 && (
+            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center mb-8">
+              <div className="text-2xl font-bold text-purple-700 mb-2">
+                {Math.floor(quizReport.timeSpent / 60)}m {quizReport.timeSpent % 60}s
+              </div>
+              <p className="text-purple-600 font-medium">Time Spent</p>
+            </div>
+          )}