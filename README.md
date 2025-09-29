# AI-Powered Interview Assistant

A full-stack web application that serves as an AI-powered interview assistant with real-time question generation, candidate management, and detailed analytics. Built with React frontend and Node.js/Express backend.

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

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit with Redux Persist
- **Build Tool**: Vite
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Development**: tsx for hot reloading

### External Services
- **AI Service**: Google Gemini API
- **File Processing**: PDF.js for PDF text extraction, Mammoth for DOCX

## 📋 Prerequisites

- **Node.js 18+**
- **PostgreSQL database** (local or cloud instance)
- **Google Gemini API key** (from Google AI Studio)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-interview-assistant
```

### 2. Install dependencies

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
cd server
npm install
cd ..
```

### 3. Set up environment variables

Create a `.env` file in the root directory:
```env
# Frontend environment variables
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Database connection (used by both frontend and backend)
DATABASE_URL=your_postgresql_connection_string
```

### 4. Set up the database

**Option A: Using Prisma migrations (recommended)**
```bash
# Generate Prisma client
npx prisma generate

# Create and push database schema
npx prisma db push
```

**Option B: Using SQL files (alternative)**
```bash
# Create tables manually
npx prisma db execute --file create-tables.sql

# Add resume data column if needed
npx prisma db execute --file add-resume-data-column.sql
```

### 5. Start the development servers

**Start both frontend and backend simultaneously:**
```bash
npm run dev:full
```

**Or start them separately:**

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🏗️ Project Structure

```
├── prisma/               # Database schema and migrations
│   └── schema.prisma    # Prisma database schema
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes/          # API routes
│   ├── services/        # Backend services
│   └── lib/             # Backend utilities
├── src/                 # Frontend React application
│   ├── components/      # React components
│   │   ├── Interviewee/ # Candidate-facing components
│   │   ├── Interviewer/ # Dashboard components
│   │   └── Layout/      # Shared layout components
│   ├── services/        # Frontend service integrations
│   │   ├── geminiService.ts     # AI question generation
│   │   ├── databaseService.ts   # Database operations
│   │   └── resumeService.ts     # Resume text extraction
│   ├── store/           # Redux store configuration
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Frontend utilities
├── public/              # Static assets
├── *.sql                # Database setup scripts
├── package.json         # Frontend dependencies and scripts
├── server/package.json  # Backend dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required: Google Gemini API key for AI question generation
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Required: PostgreSQL database connection string
DATABASE_URL=postgresql://username:password@localhost:5432/interview_db

# Optional: Backend server port (defaults to 3001)
PORT=3001
```

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **Candidate**: Stores candidate information, resume data, and interview progress
- **Question**: AI-generated questions with difficulty levels and time limits
- **Answer**: Candidate responses with scores, feedback, and timing data

### API Endpoints

The backend provides RESTful API endpoints under `/api/`:
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates` - Get all candidates
- `POST /api/questions` - Generate questions for candidate
- `POST /api/answers` - Submit answers and get scoring

### AI Integration

- **Service**: Google Gemini Pro API
- **Features**: Intelligent question generation, answer evaluation, and interview summaries
- **Configuration**: API key required in environment variables

## 📜 Available Scripts

### Frontend Scripts (Root Directory)
```bash
npm run dev              # Start Vite development server
npm run dev:server       # Start backend server only
npm run dev:full         # Start both frontend and backend concurrently
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
```

### Backend Scripts (server/ Directory)
```bash
cd server
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
```

### Database Scripts
```bash
npx prisma generate       # Generate Prisma client
npx prisma db push        # Push schema changes to database
npx prisma studio         # Open Prisma Studio (database GUI)
npx prisma db execute --file create-tables.sql    # Execute SQL file
```

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

### Frontend Features
- ✅ Resume upload with PDF/DOCX text extraction
- ✅ Automatic candidate information extraction
- ✅ AI-powered question generation with Gemini API
- ✅ Timed interview flow with progressive difficulty
- ✅ Real-time scoring and feedback
- ✅ Pause/resume functionality with welcome back modal
- ✅ Comprehensive interviewer dashboard
- ✅ Search and sort functionality
- ✅ Responsive design for all devices
- ✅ Professional UI with smooth animations

### Backend Features
- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Prisma ORM
- ✅ Secure data persistence and retrieval
- ✅ CORS-enabled API for frontend communication
- ✅ TypeScript for type safety

### Full-Stack Integration
- ✅ Concurrent development servers
- ✅ Environment-based configuration
- ✅ Database migrations and seeding
- ✅ Production-ready build processes

## 🔒 Security & Privacy

### Frontend Security
- Secure API key management through environment variables
- Input validation and sanitization
- Error handling without exposing sensitive information

### Backend Security
- CORS configuration for cross-origin requests
- Express.js security best practices
- Request size limits (10MB for file uploads)
- TypeScript for type safety and reduced runtime errors

### Database Security
- PostgreSQL connection encryption
- Prisma ORM for SQL injection prevention
- Secure database credentials via environment variables
- Database migrations for schema changes

### API Security
- RESTful API design principles
- Proper error responses without data leakage
- File upload validation and size limits

## 🚀 Deployment

### Frontend Deployment
The React frontend can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **GitHub Pages**
- **AWS S3 + CloudFront**

### Backend Deployment
The Express backend can be deployed to:
- **Railway**
- **Render**
- **Heroku**
- **AWS EC2** or **Elastic Beanstalk**
- **Google Cloud Run**

### Environment Setup
Ensure all environment variables are configured in your deployment platform:
- `VITE_GEMINI_API_KEY`
- `DATABASE_URL`
- `PORT` (optional, defaults to 3001)

### Database
- Use a cloud PostgreSQL service (Supabase, Railway, PlanetScale, etc.)
- Update `DATABASE_URL` in environment variables
- Run database migrations on deployment

### Build Commands
```bash
# Frontend build
npm run build

# Backend build (if needed)
cd server && npm run build
```

## 📊 Performance

### Frontend Performance
- Optimized bundle size with Vite code splitting
- Efficient state management with Redux Toolkit
- Responsive design for optimal mobile experience
- Fast development server with hot module replacement

### Backend Performance
- Express.js with optimized middleware stack
- TypeScript compilation for better performance
- Database query optimization with Prisma ORM
- Concurrent server processes for development

### Database Performance
- PostgreSQL with indexed queries
- Prisma client optimization
- Connection pooling for production deployments
- Efficient data serialization

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