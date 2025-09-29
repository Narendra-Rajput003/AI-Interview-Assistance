import React from 'react';
import { Users, MessageCircle } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setActiveTab } from '../../store/slices/interviewSlice';

const TabNavigation: React.FC = () => {
  const activeTab = useAppSelector((state) => state.interview.activeTab);
  const dispatch = useAppDispatch();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex space-x-8">
          <button
            onClick={() => dispatch(setActiveTab('interviewee'))}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'interviewee'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Interviewee
          </button>
          
          <button
            onClick={() => dispatch(setActiveTab('interviewer'))}
            className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'interviewer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Interviewer Dashboard
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;