// frontend/components/Profile/AppSettingsCard.tsx
import React from 'react';

interface AppSettingsCardProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppSettingsCard: React.FC<AppSettingsCardProps> = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">App Preferences</h2>
      <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
        <button
          onClick={toggleDarkMode}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label={isDarkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
        >
          {isDarkMode ? 'Disable' : 'Enable'}
        </button>
      </div>
      {/* Add more app-level settings here if needed */}
    </section>
  );
};

export default AppSettingsCard;