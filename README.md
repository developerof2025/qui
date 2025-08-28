# Interactive Quiz Platform

A full-stack quiz platform built with React, Node.js, Express, and MongoDB. Features AI-powered quiz generation using Google's Gemini AI.

## Features

- 🎯 **Role-based Authentication** - Admin and User roles
- 🤖 **AI Quiz Generation** - Powered by Google Gemini AI
- 📊 **Detailed Analytics** - Performance tracking and insights
- 🎨 **Modern UI** - Built with React and Tailwind CSS
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Secure** - JWT authentication and password hashing

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js/Express backend API
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-platform
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` if needed:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

## Usage

1. **Admin Features:**
   - Create AI-generated quizzes
   - Manage quiz codes
   - View student performance analytics
   - Generate detailed reports

2. **User Features:**
   - Join quizzes using codes
   - Take interactive quizzes
   - View performance analysis
   - Get personalized recommendations

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/role` - Update user role
- `GET /api/auth/me` - Get current user

### Quiz Management
- `POST /api/quiz/create` - Create new quiz (Admin)
- `GET /api/quiz/admin/quizzes` - Get admin's quizzes
- `GET /api/quiz/admin/quiz/:id/results` - Get quiz results
- `GET /api/quiz/join/:code` - Join quiz by code
- `POST /api/quiz/submit/:id` - Submit quiz answers

## Technologies Used

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI
- bcryptjs

## Performance Grading

- **Excellent**: 80-100%
- **Good**: 50-79%
- **Poor**: 0-49%

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.