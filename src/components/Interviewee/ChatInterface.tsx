import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Clock, Pause, Play } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { generateNextQuestion, submitAnswer, pauseInterview, resumeInterview, setCurrentQuestionStartTime, setTimeLeft } from '../../store/slices/interviewSlice';
import Timer from './Timer';

const ChatInterface: React.FC = () => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeLeftRef = useRef<number>(0);

  const dispatch = useAppDispatch();
  const { candidates, currentCandidateId, questions, isGeneratingQuestion, timeLeft } = useAppSelector(
    state => state.interview
  );
  
  const currentCandidate = candidates.find(c => c.id === currentCandidateId);
  const currentQuestion = currentCandidate ? questions[currentCandidate.currentQuestionIndex] : null;
  const isPaused = currentCandidate?.status === 'paused';
  const isCompleted = currentCandidate?.status === 'completed';

  // Calculate elapsed time for current question
  const elapsedTime = currentCandidate && currentQuestion && currentCandidate.currentQuestionStartTime
    ? Math.floor((Date.now() - currentCandidate.currentQuestionStartTime) / 1000)
    : 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questions, currentCandidate?.answers]);

  const handleTimeUp = useCallback(async () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const result = await dispatch(submitAnswer(currentAnswer || 'No answer provided (time expired)')).unwrap();
    setCurrentAnswer('');

    if (!result.isLastQuestion) {
      dispatch(generateNextQuestion());
    }
  }, [dispatch, currentAnswer]);

  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const newTimeLeft = Math.max(0, timeLeftRef.current - 1);
      timeLeftRef.current = newTimeLeft;
      dispatch(setTimeLeft(newTimeLeft));

      if (newTimeLeft <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }, [dispatch, handleTimeUp]);

  useEffect(() => {
    if (currentCandidate && currentCandidate.status === 'in-progress' && currentQuestion && !isPaused) {
      // Only reset timer if it's a new question (different question ID)
      if (!timerRef.current) {
        timeLeftRef.current = currentQuestion.timeLimit;
        dispatch(setTimeLeft(currentQuestion.timeLimit));
        // Timer will start when user begins typing
      }
    } else {
      // Stop timer when paused or no question
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentQuestion?.id, isPaused, currentCandidate?.status, currentCandidate, currentQuestion, dispatch]);

  // Sync ref with Redux state
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);


  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    // Stop timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const result = await dispatch(submitAnswer(currentAnswer)).unwrap();
    setCurrentAnswer('');

    if (!result.isLastQuestion) {
      dispatch(generateNextQuestion());
    }
  };

  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    dispatch(pauseInterview());
  };

  const handleResume = () => {
    dispatch(resumeInterview());
    dispatch(setCurrentQuestionStartTime());

    // Resume timer immediately
    startTimer();
  };

  if (!currentCandidate) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No active interview session</p>
      </div>
    );
  }

  const allMessages: Array<{
    type: 'question' | 'answer';
    content: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
    score?: number;
    timeSpent?: number;
  }> = [];

  // Add answered questions
  currentCandidate.answers.forEach((answer, index) => {
    allMessages.push({
      type: 'question',
      content: `Question ${index + 1}: ${answer.question}`,
      difficulty: answer.difficulty,
      timeLimit: answer.timeLimit,
    });
    allMessages.push({
      type: 'answer',
      content: answer.answer,
      score: answer.score,
      timeSpent: answer.timeSpent,
    });
  });

  // Add current question if exists
  if (currentQuestion && !isCompleted) {
    allMessages.push({
      type: 'question',
      content: `Question ${currentCandidate.currentQuestionIndex + 1}: ${currentQuestion.text}`,
      difficulty: currentQuestion.difficulty,
      timeLimit: currentQuestion.timeLimit,
    });
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Interview Session - {currentCandidate.name}
            </h2>
            <p className="text-sm text-gray-500">
              Question {currentCandidate.currentQuestionIndex + 1} of 6
            </p>
          </div>
          
          {currentQuestion && !isCompleted && (
            <div className="flex items-center space-x-4">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion.timeLimit}
                isPaused={isPaused}
                elapsedTime={elapsedTime}
              />
              
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl p-4 rounded-lg ${
              message.type === 'question' 
                ? 'bg-blue-100 border-l-4 border-blue-500' 
                : 'bg-white border border-gray-200'
            }`}>
              {message.type === 'question' && (
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    message.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    message.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {message.difficulty?.toUpperCase()}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {message.timeLimit}s
                  </span>
                </div>
              )}
              
              <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
              
              {message.type === 'answer' && message.score && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    Score: {message.score}/10 | Time: {message.timeSpent}s
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isGeneratingQuestion && (
          <div className="flex justify-start">
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-gray-700">Generating next question...</span>
              </div>
            </div>
          </div>
        )}
        
        {isCompleted && (
          <div className="flex justify-center">
            <div className="bg-green-100 border border-green-300 p-6 rounded-lg text-center max-w-md">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Interview Completed!
              </h3>
              <p className="text-green-700 mb-3">{currentCandidate.summary}</p>
              <div className="text-2xl font-bold text-green-800">
                Final Score: {currentCandidate.finalScore}/10
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {currentQuestion && !isCompleted && !isPaused && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={currentAnswer}
              onChange={(e) => {
                setCurrentAnswer(e.target.value);
                // Start timer when user begins typing, if not already started
                if (e.target.value.length === 1 && !timerRef.current && currentQuestion && !isPaused && currentCandidate?.status === 'in-progress') {
                  startTimer();
                }
              }}
              placeholder="Type your answer here..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              rows={3}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!currentAnswer.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      {isPaused && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-4 text-center">
          <p className="text-yellow-800">Interview is paused. Click Resume to continue.</p>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
