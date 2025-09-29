-- Create candidates table
CREATE TABLE IF NOT EXISTS "candidates" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "phone" TEXT NOT NULL,
    "resumeFileName" TEXT NOT NULL,
    "resumeText" TEXT NOT NULL,
    "resumeData" TEXT,
    "currentQuestionIndex" INTEGER DEFAULT 0,
    "finalScore" REAL,
    "summary" TEXT,
    "status" TEXT DEFAULT 'collecting-info',
    "startTime" TIMESTAMP,
    "endTime" TIMESTAMP,
    "currentQuestionStartTime" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE IF NOT EXISTS "questions" (
    "id" TEXT PRIMARY KEY,
    "text" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "candidateId" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE
);

-- Create answers table
CREATE TABLE IF NOT EXISTS "answers" (
    "id" TEXT PRIMARY KEY,
    "answer" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "score" REAL,
    "feedback" TEXT,
    "questionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE,
    FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE
);