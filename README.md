# AI-Powered Interview Assistant

A comprehensive React application that serves as an AI-powered interview assistant with real-time question generation, candidate management, and detailed analytics.

## 🚀 Features

### Interviewee Experience
- **Resume Upload**: Support for PDF and DOCX files with automatic text extraction
- **Smart Information Collection**: Automatically extracts name, email, and phone from resume
- **AI-Generated Questions**: Dynamic question generation using Google's Gemini AI
- **Timed Interview Flow**: 6 questions with progressive difficulty (Easy: 20s, Medium: 60s, Hard: 120s)
- **Real-time Chat Interface**: Professional chat experience with typing indicators and progress tracking
- **Pause/Resume Functionality**: Complete session management with welcome back modal

### Interviewer Dashboard
- **Candidate Management**: Complete list of all candidates with search and sort functionality
- **Detailed Analytics**: View complete interview history, scores, and AI-generated summaries
- **Performance Metrics**: Real-time statistics and performance indicators
- **Professional UI**: Clean, responsive design optimized for desktop and mobile

### Technical Features
- **Database Persistence**: PostgreSQL with Prisma ORM for reliable data storage
- **AI Integration**: Google Gemini API for question generation and answer evaluation
- **State Management**: Redux Toolkit with persistence for seamless user experience
- **Real-time Updates**: Synchronized data across all components
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit, Redux Persist
- **Database**: PostgreSQL with Prisma ORM
- **AI Service**: Google Gemini API
- **File Processing**: PDF.js for PDF text extraction
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Interviewee/     # Candidate-facing components
│   ├── Interviewer/     # Dashboard components
│   └── Layout/          # Shared layout components
├── services/            # External service integrations
│   ├── geminiService.ts # AI question generation
│   ├── databaseService.ts # Database operations
│   └── resumeService.ts # Resume text extraction
├── store/               # Redux store configuration
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── lib/                 # Utility libraries
```

## 🔧 Configuration

### Database Schema
The application uses Prisma with PostgreSQL. Key models:
- **Candidate**: Stores candidate information and interview progress
- **Question**: AI-generated questions with difficulty levels
- **Answer**: Candidate responses with scores and feedback

### AI Integration
- Uses Google Gemini Pro for question generation
- Implements intelligent scoring based on answer quality
- Generates comprehensive interview summaries

## 📱 Usage

### For Candidates (Interviewee Tab)
1. Upload your resume (PDF or DOCX)
2. Complete any missing information
3. Answer 6 AI-generated questions within time limits
4. Receive immediate feedback and final score

### For Interviewers (Dashboard Tab)
1. View all candidates sorted by performance
2. Search and filter candidates
3. Review detailed interview transcripts
4. Access AI-generated performance summaries

## 🎯 Key Features Implemented

- ✅ Resume upload with PDF/DOCX text extraction
- ✅ Automatic candidate information extraction
- ✅ AI-powered question generation with Gemini API
- ✅ Timed interview flow with progressive difficulty
- ✅ Real-time scoring and feedback
- ✅ Complete data persistence with PostgreSQL
- ✅ Pause/resume functionality with welcome back modal
- ✅ Comprehensive interviewer dashboard
- ✅ Search and sort functionality
- ✅ Responsive design for all devices
- ✅ Professional UI with smooth animations

## 🔒 Security & Privacy

- Secure API key management through environment variables
- Database connection encryption
- Input validation and sanitization
- Error handling without exposing sensitive information

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service. Ensure environment variables are properly configured in your deployment environment.

## 📊 Performance

- Optimized bundle size with code splitting
- Efficient state management with Redux Toolkit
- Database query optimization with Prisma
- Responsive design for optimal mobile experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the GitHub repository.