import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

type CandidateWithRelations = Prisma.CandidateGetPayload<{
  include: {
    answers: {
      include: {
        question: true;
      };
    };
    questions: true;
  };
}>;

export async function createCandidate(data: {
  name: string;
  email: string;
  phone: string;
  resumeFileName: string;
  resumeText: string;
  resumeData?: string;
}) {
  const candidate = await prisma.candidate.create({
    data: {
      ...data,
      status: 'collecting-info',
      currentQuestionIndex: 0,
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
      questions: true,
    },
  });

  return transformPrismaCandidate(candidate);
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
) {
  try {
    const candidate = await prisma.candidate.update({
      where: { id },
      data,
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        questions: true,
      },
    });

    return transformPrismaCandidate(candidate);
  } catch (error: unknown) {
    // Handle unique constraint violation on email
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002' &&
        'meta' in error && error.meta && typeof error.meta === 'object' &&
        'target' in error.meta && Array.isArray(error.meta.target) &&
        error.meta.target.includes('email')) {
      console.warn('Email already exists, skipping email update for candidate:', id);
      // Remove email from data and try again
      const { email, ...dataWithoutEmail } = data;
      // Suppress unused variable warning
      void email;
      const candidate = await prisma.candidate.update({
        where: { id },
        data: dataWithoutEmail,
        include: {
          answers: {
            include: {
              question: true,
            },
          },
          questions: true,
        },
      });
      return transformPrismaCandidate(candidate);
    }
    throw error;
  }
}

export async function getCandidateById(id: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      questions: {
        orderBy: {
          questionIndex: 'asc',
        },
      },
    },
  });

  return candidate ? transformPrismaCandidate(candidate) : null;
}

export async function getAllCandidates() {
  const candidates = await prisma.candidate.findMany({
    include: {
      answers: {
        include: {
          question: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      questions: {
        orderBy: {
          questionIndex: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return candidates.map(transformPrismaCandidate);
}

export async function createQuestion(data: {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  candidateId: string;
  questionIndex: number;
}) {
  const question = await prisma.question.create({
    data,
  });

  return {
    id: question.id,
    text: question.text,
    difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
    timeLimit: question.timeLimit,
  };
}

export async function createAnswer(data: {
  answer: string;
  timeSpent: number;
  score: number;
  feedback: string;
  questionId: string;
  candidateId: string;
}) {
  const answer = await prisma.answer.create({
    data,
    include: {
      question: true,
    },
  });

  return {
    questionId: answer.questionId,
    question: answer.question.text,
    answer: answer.answer,
    difficulty: answer.question.difficulty as 'easy' | 'medium' | 'hard',
    timeLimit: answer.question.timeLimit,
    timeSpent: answer.timeSpent,
    score: answer.score || 0,
    feedback: answer.feedback || '',
  };
}

export async function getQuestionsForCandidate(candidateId: string) {
  const questions = await prisma.question.findMany({
    where: { candidateId },
    orderBy: {
      questionIndex: 'asc',
    },
  });

  return questions.map(question => ({
    id: question.id,
    text: question.text,
    difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
    timeLimit: question.timeLimit,
    questionIndex: question.questionIndex,
  }));
}

function transformPrismaCandidate(candidate: CandidateWithRelations) {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    resumeFileName: candidate.resumeFileName,
    resumeText: candidate.resumeText,
    resumeData: candidate.resumeData,
    currentQuestionIndex: candidate.currentQuestionIndex,
    answers: candidate.answers.map((answer) => ({
      questionId: answer.questionId,
      question: answer.question.text,
      answer: answer.answer,
      difficulty: answer.question.difficulty as 'easy' | 'medium' | 'hard',
      timeLimit: answer.question.timeLimit,
      timeSpent: answer.timeSpent,
      score: answer.score || 0,
      feedback: answer.feedback || '',
    })),
    finalScore: candidate.finalScore,
    summary: candidate.summary,
    status: candidate.status as 'collecting-info' | 'in-progress' | 'completed' | 'paused',
    startTime: candidate.startTime?.toISOString(),
    endTime: candidate.endTime?.toISOString(),
    currentQuestionStartTime: candidate.currentQuestionStartTime?.toISOString(),
  };
}
