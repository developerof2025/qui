const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async updateRole(role: 'admin' | 'user') {
    return this.request('/auth/role', {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Quiz methods
  async createQuiz(quizData: {
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    numberOfQuestions: number;
  }) {
    return this.request('/quiz/create', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getAdminQuizzes() {
    return this.request('/quiz/admin/quizzes');
  }

  async joinQuiz(code: string) {
    return this.request(`/quiz/join/${code}`);
  }

  async submitQuiz(quizId: string, answers: Array<{ questionId: string; selectedAnswer: number }>) {
    return this.request(`/quiz/submit/${quizId}`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  logout() {
    this.clearToken();
  }
}

export const apiService = new ApiService();