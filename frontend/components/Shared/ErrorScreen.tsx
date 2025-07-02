// components/Shared/ErrorScreen.tsx (New component)
import React from 'react';

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, onRetry }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center dark:bg-gray-800">
      <p className="text-red-600 font-bold mb-4">Error:</p>
      <p className="text-gray-800 dark:text-gray-200">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  </div>
);

export default ErrorScreen;