import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  createCandidateInDB,
  generateNextQuestion,
  loadCandidates,
  uploadResume,
  updateCandidateStatus
} from '../../store/slices/interviewSlice';
import { updateCandidate } from '../../services/databaseService';
import { extractCandidateInfo } from '../../services/resumeService';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';

const IntervieweeTab: React.FC = () => {
  const [uploadError, setUploadError] = useState<string>('');
  const [isProcessingResume, setIsProcessingResume] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  
  const { candidates, currentCandidateId, isGeneratingQuestion } = useAppSelector(state => state.interview);
  const currentCandidate = candidates.find(c => c.id === currentCandidateId);

  useEffect(() => {
    // Load candidates from database on component mount
    dispatch(loadCandidates());
  }, [dispatch]);

  const handleResumeUpload = async (file: File) => {
    setUploadError('');
    setIsProcessingResume(true);

    try {
      // More robust file type checking
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      const allowedExtensions = ['.pdf', '.docx', '.doc'];

      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

      if (!isValidType) {
        setUploadError('Please upload a PDF or DOCX file');
        setIsProcessingResume(false);
        return;
      }

      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        setIsProcessingResume(false);
        return;
      }

      // Extract text from resume
      const resumeText = await dispatch(uploadResume(file)).unwrap();

      // Extract candidate information from resume using AI
      let extractedInfo;
      try {
        extractedInfo = await extractCandidateInfo(resumeText.text);
      } catch (error) {
        console.warn('AI extraction failed, using fallback values:', error);
        extractedInfo = {};
      }

    
      // Use extracted info with fallbacks for missing data
      const candidateData = {
        name: extractedInfo.name || 'Candidate',
        email: extractedInfo.email || `candidate${Date.now()}@example.com`,
        phone: extractedInfo.phone || 'Not provided',
        resumeFileName: file.name,
        resumeText: resumeText.text,
        resumeData: resumeText.data,
      };

  
      const newCandidate = await dispatch(createCandidateInDB(candidateData)).unwrap();

      // Immediately start the interview
      try {
        // Update candidate status to in-progress in Redux
        dispatch(updateCandidateStatus({
          id: newCandidate.id,
          status: 'in-progress',
          startTime: Date.now(),
          currentQuestionStartTime: Date.now(),
        }));

        // Also update in database
        await updateCandidate(newCandidate.id, {
          status: 'in-progress',
          startTime: new Date(),
          currentQuestionStartTime: new Date(),
        });

        // Generate first question
        dispatch(generateNextQuestion());
        setIsProcessingResume(false);
      } catch (error) {
        console.error('Error starting interview:', error);
        setIsProcessingResume(false);
        setUploadError('Failed to start interview. Please try again.');
      }

    } catch (error) {
      console.error('Resume upload error:', error);
      setUploadError('Failed to process resume. Please try again.');
      setIsProcessingResume(false);
    }
  };

    
  // Determine what to show
  if (!currentCandidate || !currentCandidate.resumeFileName) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome to AI Interview Assistant
          </h1>
          <p className="text-gray-600 text-center">
            Upload your resume to get started with the technical interview
          </p>
        </div>

        {isProcessingResume ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-center">
              Processing your resume and extracting information...
            </p>
            <p className="text-sm text-gray-500 text-center">
              This may take a few moments
            </p>
          </div>
        ) : (
          <ResumeUpload onUpload={handleResumeUpload} error={uploadError} />
        )}
      </div>
    );
  }

  // Show loading when generating the first question
  if (isGeneratingQuestion && (!currentCandidate?.answers || currentCandidate.answers.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Preparing Your Interview
          </h1>
          <p className="text-gray-600 text-center">
            Generating your first question...
          </p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 text-center">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
};

export default IntervieweeTab;
