@@ .. @@
   async getAdminQuizzes() {
     return this.request('/quiz/admin/quizzes');
   }
+
+  async getQuizResults(quizId: string) {
+    return this.request(`/quiz/admin/quiz/${quizId}/results`);
+  }
@@ .. @@
-  async submitQuiz(quizId: string, answers: Array<{ questionId: string; selectedAnswer: number }>) {
+  async submitQuiz(quizId: string, answers: Array<{ questionId: string; selectedAnswer: number }>, timeSpent?: number) {
     return this.request(`/quiz/submit/${quizId}`, {
       method: 'POST',
-      body: JSON.stringify({ answers }),
+      body: JSON.stringify({ answers, timeSpent }),
     });
   }