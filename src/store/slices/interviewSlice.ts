import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Answer, InterviewState } from '../../types';
import { generateQuestion, calculateScore, generateFinalSummary } from '../../services/geminiService';
import {
  createCandidate as dbCreateCandidate,
  updateCandidate as dbUpdateCandidate,
  getAllCandidates,
  createQuestion as dbCreateQuestion,
  createAnswer as dbCreateAnswer
} from '../../services/databaseService';
import { extractResumeText } from '../../services/resumeService';

const initialState: InterviewState = {
  candidates: [],
  currentCandidateId: null,
  activeTab: 'interviewee',
  questions: [],
  isGeneratingQuestion: false,
  showWelcomeBack: false,
  timeLeft: 0,
};

export const loadCandidates = createAsyncThunk(
  'interview/loadCandidates',
  async () => {
    return await getAllCandidates();
  }
);


export const createCandidateInDB = createAsyncThunk(
  'interview/createCandidateInDB',
  async (data: {
    name: string;
    email: string;
    phone: string;
    resumeFileName: string;
    resumeText: string;
    resumeData?: string;
  }) => {

    const result = await dbCreateCandidate(data);

    return result;
  }
);

export const uploadResume = createAsyncThunk(
  'interview/uploadResume',
  async (file: File) => {
    const text = await extractResumeText(file);

    // Convert file to base64 for storage
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return { fileName: file.name, text, data: base64Data };
  }
);

export const generateNextQuestion = createAsyncThunk(
  'interview/generateNextQuestion',
  async (_, { getState, dispatch }) => {
    const state = getState() as { interview: InterviewState };
    const candidate = state.interview.candidates.find(
      c => c.id === state.interview.currentCandidateId
    );

    if (!candidate) throw new Error('No active candidate');

    const questionIndex = candidate.currentQuestionIndex;
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    let timeLimit = 20;

    if (questionIndex < 2) {
      difficulty = 'easy';
      timeLimit = 20;
    } else if (questionIndex < 4) {
      difficulty = 'medium';
      timeLimit = 60;
    } else {
      difficulty = 'hard';
      timeLimit = 120;
    }

    // Generate question using AI - pass previous questions to avoid repetition
    const previousQuestions = state.interview.questions.map(q => q.text);
    const questionText = await generateQuestion(difficulty, candidate.resumeText, previousQuestions);

    // Create temporary ID for immediate UI update
    const tempId = `temp-${Date.now()}-${questionIndex}`;

    // Return question immediately for instant UI update
    const questionData = {
      id: tempId,
      text: questionText,
      difficulty,
      timeLimit,
    };

    // Save to database asynchronously (don't block UI)
    dbCreateQuestion({
      text: questionText,
      difficulty,
      timeLimit,
      candidateId: candidate.id,
      questionIndex: questionIndex,
    }).then(savedQuestion => {
      dispatch(updateQuestionId({ tempId, realId: savedQuestion.id }));
    }).catch(error => {
      console.error('Failed to save question to database:', error);
    });

    return questionData;
  }
);

export const submitAnswer = createAsyncThunk(
  'interview/submitAnswer',
  async (answer: string, { getState }) => {
    const state = getState() as { interview: InterviewState };
    const candidate = state.interview.candidates.find(
      c => c.id === state.interview.currentCandidateId
    );

    if (!candidate) throw new Error('No active candidate');

    const currentQuestion = state.interview.questions[candidate.currentQuestionIndex];
    const timeSpent = candidate.currentQuestionStartTime
      ? Math.floor((Date.now() - candidate.currentQuestionStartTime) / 1000)
      : currentQuestion.timeLimit;

    const { score, feedback } = await calculateScore(currentQuestion.text, answer, currentQuestion.difficulty);

    // Save answer to database (background - don't await)
    dbCreateAnswer({
      answer,
      timeSpent,
      score,
      feedback,
      questionId: currentQuestion.id,
      candidateId: candidate.id,
    }).catch(error => {
      console.error('Failed to save answer to database:', error);
    });

    const answerObj: Answer = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      answer,
      difficulty: currentQuestion.difficulty,
      timeLimit: currentQuestion.timeLimit,
      timeSpent,
      score,
      feedback,
    };

    // Check if this is the last question
    if (candidate.currentQuestionIndex === 5) {
      // Calculate final score and generate summary
      const allAnswers = [...candidate.answers, answerObj];
      const finalScore = Math.round(
        allAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / allAnswers.length
      );

      // Generate AI summary
      const summary = await generateFinalSummary(
        candidate.name,
        allAnswers.map(a => ({
          question: a.question,
          answer: a.answer,
          score: a.score || 0,
          difficulty: a.difficulty,
        })),
        finalScore
      );

      // Update candidate in database
      await dbUpdateCandidate(candidate.id, {
        finalScore,
        summary,
        status: 'completed',
        endTime: new Date(),
      });

      return {
        answer: answerObj,
        isLastQuestion: true,
        finalScore,
        summary,
      };
    } else {
      // Return new index immediately for instant UI update
      const newQuestionIndex = candidate.currentQuestionIndex + 1;

      // Update candidate in database (background)
      dbUpdateCandidate(candidate.id, {
        currentQuestionIndex: newQuestionIndex,
        currentQuestionStartTime: new Date(),
      }).catch(error => console.error('Failed to update candidate:', error));

      return {
        answer: answerObj,
        isLastQuestion: false,
        newQuestionIndex
      };
    }
  }
);

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload;
    },
    setCurrentQuestionStartTime: (state) => {
      const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
      if (candidate) {
        candidate.currentQuestionStartTime = Date.now();
      }
    },
    pauseInterview: (state) => {
      const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
      if (candidate) {
        candidate.status = 'paused';
      }
    },
    resumeInterview: (state) => {
      const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
      if (candidate) {
        candidate.status = 'in-progress';
        candidate.currentQuestionStartTime = Date.now();
      }
    },
    completeInterview: (state, action: PayloadAction<{ finalScore: number; summary: string }>) => {
      const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
      if (candidate) {
        candidate.status = 'completed';
        candidate.endTime = Date.now();
        candidate.finalScore = action.payload.finalScore;
        candidate.summary = action.payload.summary;
      }
    },
    setCurrentCandidate: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
    },
    showWelcomeBackModal: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
    resetCurrentInterview: (state) => {
      state.currentCandidateId = null;
      state.questions = [];
      state.timeLeft = 0;
    },
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },
    updateCandidateStatus: (state, action: PayloadAction<{ id: string; status: string; startTime?: number; currentQuestionStartTime?: number }>) => {
      const candidate = state.candidates.find(c => c.id === action.payload.id);
      if (candidate) {
        candidate.status = action.payload.status as 'collecting-info' | 'in-progress' | 'completed' | 'paused';
        if (action.payload.startTime) {
          candidate.startTime = action.payload.startTime;
        }
        if (action.payload.currentQuestionStartTime) {
          candidate.currentQuestionStartTime = action.payload.currentQuestionStartTime;
        }
      }
    },
    updateQuestionId: (state, action: PayloadAction<{ tempId: string; realId: string }>) => {
      const question = state.questions.find(q => q.id === action.payload.tempId);
      if (question) {
        question.id = action.payload.realId;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCandidates.fulfilled, (state, action) => {
        state.candidates = action.payload;
      })
      .addCase(createCandidateInDB.fulfilled, (state, action) => {
        state.candidates.push(action.payload);
        state.currentCandidateId = action.payload.id;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
        if (candidate) {
          candidate.resumeFileName = action.payload.fileName;
          candidate.resumeText = action.payload.text;
          candidate.resumeData = action.payload.data;
        }
      })
      .addCase(generateNextQuestion.pending, (state) => {
        state.isGeneratingQuestion = true;
      })
      .addCase(generateNextQuestion.fulfilled, (state, action) => {
        state.isGeneratingQuestion = false;
        state.questions.push(action.payload);
        // Reset timer for new question
        state.timeLeft = action.payload.timeLimit;
      })
      .addCase(generateNextQuestion.rejected, (state) => {
        state.isGeneratingQuestion = false;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        const candidate = state.candidates.find(c => c.id === state.currentCandidateId);
        if (candidate) {
          candidate.answers.push(action.payload.answer);

          if (action.payload.isLastQuestion) {
            candidate.status = 'completed';
            candidate.endTime = Date.now();
            candidate.finalScore = action.payload.finalScore;
            candidate.summary = action.payload.summary;
          } else {
            // Use the newQuestionIndex from the action result
            if (action.payload.newQuestionIndex !== undefined) {
              candidate.currentQuestionIndex = action.payload.newQuestionIndex;
            } else {
              candidate.currentQuestionIndex++;
            }
            candidate.currentQuestionStartTime = Date.now();
          }
        }
      });
  },
});

export const {
  setActiveTab,
  setCurrentQuestionStartTime,
  pauseInterview,
  resumeInterview,
  completeInterview,
  setCurrentCandidate,
  showWelcomeBackModal,
  resetCurrentInterview,
  setTimeLeft,
  updateCandidateStatus,
  updateQuestionId,
} = interviewSlice.actions;

export default interviewSlice.reducer;