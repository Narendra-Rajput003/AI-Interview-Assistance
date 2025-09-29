import { Candidate, Answer, Question } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export async function createCandidate(data: {
  name: string;
  email: string;
  phone: string;
  resumeFileName: string;
  resumeText: string;
  resumeData?: string;
}): Promise<Candidate> {
  const response = await fetch(`${API_BASE_URL}/candidates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create candidate');
  }

  return response.json();
}

export async function updateCandidate(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    currentQuestionIndex: number;
    finalScore: number;
    summary: string;
    status: string;
    startTime: Date;
    endTime: Date;
    currentQuestionStartTime: Date;
  }>
): Promise<Candidate> {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update candidate');
  }

  return response.json();
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch candidate');
  }

  return response.json();
}

export async function getAllCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE_URL}/candidates`);

  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }

  return response.json();
}

export async function createQuestion(data: {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  candidateId: string;
  questionIndex: number;
}): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create question');
  }

  return response.json();
}

export async function createAnswer(data: {
  answer: string;
  timeSpent: number;
  score: number;
  feedback: string;
  questionId: string;
  candidateId: string;
}): Promise<Answer> {
  const response = await fetch(`${API_BASE_URL}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create answer');
  }

  return response.json();
}
