import React from 'react';
import { ArrowLeft, User, Mail, Phone, Clock, Star, FileText } from 'lucide-react';
import { Candidate } from '../../types';
import { formatDuration } from '../../utils/formatters';
import ResumePreview from '../ResumePreview';

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
}

const CandidateDetail: React.FC<CandidateDetailProps> = ({ candidate, onBack }) => {
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDuration = candidate.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{candidate.name}'s Details</h2>
          <p className="text-gray-600">Complete interview overview and performance</p>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {candidate.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {candidate.phone}
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {candidate.resumeFileName}
                </div>
              </div>
            </div>
          </div>
          
          {candidate.finalScore && (
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(candidate.finalScore)}`}>
                {candidate.finalScore}/10
              </div>
              <div className="text-sm text-gray-500">Final Score</div>
            </div>
          )}
        </div>
        
        {/* Interview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {candidate.status.replace('-', ' ')}
            </div>
            <div className="text-sm text-gray-500">Status</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {candidate.answers.length}/6
            </div>
            <div className="text-sm text-gray-500">Questions Answered</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {formatTime(candidate.startTime).split(',')[0]}
            </div>
            <div className="text-sm text-gray-500">Started</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">
              {totalDuration > 0 ? formatDuration(totalDuration) : '-'}
            </div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      {candidate.resumeData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Preview</h3>
          <ResumePreview resumeData={candidate.resumeData} className="max-w-full" />
        </div>
      )}

      {/* AI Summary */}
      {candidate.summary && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">AI Assessment Summary</h3>
          <p className="text-blue-800">{candidate.summary}</p>
        </div>
      )}

      {/* Questions and Answers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Interview Conversation</h3>
        
        {candidate.answers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions answered yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {candidate.answers.map((answer, index) => (
              <div key={`${answer.questionId}-${index}`} className="border-l-4 border-blue-500 pl-4">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Question {index + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        getDifficultyColor(answer.difficulty)
                      }`}>
                        {answer.difficulty.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {answer.timeLimit}s limit
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded">{answer.question}</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">Answer</h5>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        Time: {formatDuration(answer.timeSpent)}
                      </span>
                      {answer.score && (
                        <span className={`text-sm font-medium ${getScoreColor(answer.score)}`}>
                          <Star className="w-4 h-4 inline mr-1" />
                          {answer.score}/10
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                    {answer.answer}
                  </p>
                </div>
                
                {answer.feedback && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">{answer.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetail;