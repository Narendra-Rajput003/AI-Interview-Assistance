import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { showWelcomeBackModal, resumeInterview, resetCurrentInterview } from '../store/slices/interviewSlice';

const WelcomeBackModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showWelcomeBack, candidates, currentCandidateId } = useAppSelector(
    state => state.interview
  );
  
  const currentCandidate = candidates.find(c => c.id === currentCandidateId);

  if (!showWelcomeBack || !currentCandidate) return null;

  const handleResume = async () => {
    dispatch(showWelcomeBackModal(false));

    // Questions are already loaded with candidates, just resume
    dispatch(resumeInterview());
  };

  const handleStartNew = () => {
    dispatch(showWelcomeBackModal(false));
    dispatch(resetCurrentInterview());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">
            You have an unfinished interview session for {currentCandidate.name}.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Progress:</span>
              <div className="font-medium">
                {currentCandidate.answers.length}/6 questions
              </div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="font-medium capitalize">
                {currentCandidate.status.replace('-', ' ')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleResume}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume Interview
          </button>
          
          <button
            onClick={handleStartNew}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;