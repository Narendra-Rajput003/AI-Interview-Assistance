export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFileName: string;
  resumeText: string;
  resumeData?: string; // Base64 encoded PDF data
  currentQuestionIndex: number;
  answers: Answer[];
  finalScore?: number;
  summary?: string;
  status: 'collecting-info' | 'in-progress' | 'completed' | 'paused';
  startTime?: number;
  endTime?: number;
  currentQuestionStartTime?: number;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  timeSpent: number;
  score?: number;
  feedback?: string;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

export interface InterviewState {
  candidates: Candidate[];
  currentCandidateId: string | null;
  activeTab: 'interviewee' | 'interviewer';
  questions: Question[];
  isGeneratingQuestion: boolean;
  showWelcomeBack: boolean;
  timeLeft: number;
}