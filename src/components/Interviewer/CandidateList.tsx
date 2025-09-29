import React, { useState } from 'react';
import { Search, User, Eye } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Candidate } from '../../types';
import { formatDuration } from '../../utils/formatters';

interface CandidateListProps {
  onSelectCandidate: (candidate: Candidate) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ onSelectCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  
  const { candidates } = useAppSelector(state => state.interview);
  
  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'date':
          return (b.startTime || 0) - (a.startTime || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateTotalDuration = (candidate: Candidate) => {
    if (!candidate.answers || candidate.answers.length === 0) return 0;
    return candidate.answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Candidate Dashboard</h2>
        <p className="text-gray-600">Manage and review all interview candidates</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'name')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="score">Sort by Score</option>
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{candidates.length}</div>
          <div className="text-sm text-gray-600">Total Candidates</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {candidates.filter(c => c.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {candidates.filter(c => c.status === 'in-progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-600">
            {(() => {
              const completedCandidates = candidates.filter(c => c.finalScore);
              const avgScore = completedCandidates.length > 0
                ? Math.round(completedCandidates.reduce((sum, c) => sum + (c.finalScore || 0), 0) / completedCandidates.length)
                : 0;
              return avgScore;
            })()}
          </div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No candidates match your search' : 'No candidates yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectCandidate(candidate)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                      <p className="text-xs text-gray-400">{candidate.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${
                        candidate.finalScore ? getScoreColor(candidate.finalScore) : 'text-gray-400'
                      }`}>
                        {candidate.finalScore ? `${candidate.finalScore}/10` : '-'}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        {formatDuration(calculateTotalDuration(candidate))}
                      </div>
                      <div className="text-xs text-gray-500">Duration</div>
                    </div>
                    
                    <div className="text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        getStatusColor(candidate.status)
                      }`}>
                        {candidate.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateList;