import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loadCandidates } from '../../store/slices/interviewSlice';
import { Candidate } from '../../types';
import CandidateList from './CandidateList';
import CandidateDetail from './CandidateDetail';

const InterviewerTab: React.FC = () => {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load candidates from database when interviewer tab is accessed
    dispatch(loadCandidates());
  }, [dispatch]);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleBack = () => {
    setSelectedCandidate(null);
  };

  return (
    <div className="h-full p-6">
      {selectedCandidate ? (
        <CandidateDetail candidate={selectedCandidate} onBack={handleBack} />
      ) : (
        <CandidateList onSelectCandidate={handleSelectCandidate} />
      )}
    </div>
  );
};

export default InterviewerTab;