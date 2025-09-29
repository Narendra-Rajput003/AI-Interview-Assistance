import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';
import { showWelcomeBackModal, loadCandidates } from './store/slices/interviewSlice';
import TabNavigation from './components/Layout/TabNavigation';
import IntervieweeTab from './components/Interviewee/IntervieweeTab';
import InterviewerTab from './components/Interviewer/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab, candidates, currentCandidateId } = useAppSelector(
    state => state.interview
  );

  useEffect(() => {
    // Load candidates from database on app start
    dispatch(loadCandidates());
  }, [dispatch]);

  useEffect(() => {
    // Check for unfinished sessions on app load
    const currentCandidate = candidates.find(c => c.id === currentCandidateId);
    if (currentCandidate) {
      if (currentCandidate.status === 'paused' &&
          currentCandidate.currentQuestionIndex < 6) {
        // Only show welcome back modal for explicitly paused interviews
        dispatch(showWelcomeBackModal(true));
      }
      // Questions are already loaded with candidates, no need for separate call
    }
  }, [candidates, currentCandidateId, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            AI-Powered Interview Assistant
          </h1>
        </div>
      </header>
      
      <TabNavigation />
      
      <main className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
      </main>
      
      <WelcomeBackModal />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;