import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
  totalTime: number;
  isPaused: boolean;
  elapsedTime?: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, totalTime, isPaused, elapsedTime }) => {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  const isUrgent = timeLeft <= 10;
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const elapsed = elapsedTime || (totalTime - timeLeft);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {isUrgent ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : (
          <Clock className="w-5 h-5 text-gray-500" />
        )}

        <div className="flex flex-col items-center">
          <span className={`font-mono text-lg font-semibold ${
            isPaused ? 'text-yellow-600' :
            isUrgent ? 'text-red-600' :
            isWarning ? 'text-yellow-600' :
            'text-gray-700'
          }`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-gray-500">
            Elapsed: {formatTime(elapsed)}
          </span>
        </div>
      </div>
      
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isPaused ? 'bg-yellow-500' :
            isUrgent ? 'bg-red-500' :
            isWarning ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isPaused && (
        <span className="text-sm text-yellow-600 font-medium">PAUSED</span>
      )}
    </div>
  );
};

export default Timer;