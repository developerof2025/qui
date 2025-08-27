const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateQuiz(request) {
    const prompt = `
      Generate a ${request.difficulty} level quiz about "${request.topic}" with ${request.numberOfQuestions} multiple-choice questions.
      The quiz should be in the category: ${request.category}.
      
      For each question, provide:
      1. The question text
      2. 4 options (A, B, C, D)
      3. The correct answer (0, 1, 2, or 3 - representing array index)
      4. A brief explanation
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Quiz Title",
        "description": "Quiz Description",
        "questions": [
          {
            "id": "unique_id",
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": 0,
            "explanation": "Brief explanation"
          }
        ]
      }
      
      Make sure the correctAnswer is a number (0-3) representing the index of the correct option.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response - handle markdown code blocks
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }
      
      // Clean up any other markdown artifacts
      jsonText = jsonText.trim();
      
      const quizData = JSON.parse(jsonText);
      
      // Ensure each question has a unique ID
      quizData.questions = quizData.questions.map((q, index) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${index}`
      }));
      
      return quizData;
    } catch (error) {
      console.error('Error generating quiz with Gemini:', error);
      throw new Error('Failed to generate quiz');
    }
  }
}

module.exports = GeminiService;