// components/Shared/LoadingScreen.tsx (New component)
import React from 'react';

const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
    <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
      Loading application... Please wait.
    </div>
  </div>
);

export default LoadingScreen;