// frontend/components/Profile/ProfileSettings.tsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { User } from '../../entities/User';
import { Task } from '../../entities/Task'; // Assuming Task interface is defined
import { Project } from '../../entities/Project'; // Assuming Project interface is defined
import { fetchTasks } from '../../utils/tasksService'; // Assuming you have a service for tasks
import { fetchProjects } from '../../utils/projectsService'; // Assuming you have a service for projects
import { useToast } from '../Shared/ToastContext'; // Assuming useToast is correctly set up

// Lazily load ProductivityAssistant for performance benefits
const ProductivityAssistant = lazy(() => import('../Productivity/ProductivityAssistant'));


interface ProfileSettingsProps {
  currentUser: User | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, isDarkMode, toggleDarkMode }) => {
  const { showErrorToast } = useToast();

  // State for tasks and projects data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingData(true);
      setDataError(null); // Clear previous errors

      try {
        // Fetch tasks
        const fetchedTasks = await fetchTasks();
        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []); // Defensive check

        // Fetch projects
        const fetchedProjects = await fetchProjects();
        setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []); // Defensive check

      } catch (error) {
        console.error('Failed to load productivity data:', error);
        setDataError('Failed to load your tasks and projects. Please try again.');
        showErrorToast('Failed to load productivity data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (currentUser) { // Only fetch data if a user is logged in
      loadUserData();
    } else {
      // If no current user, clear data and stop loading
      setTasks([]);
      setProjects([]);
      setIsLoadingData(false);
      setDataError(null); // No error if no user is expected to have data
    }

  }, [currentUser, showErrorToast]); // Re-run if currentUser changes or toast context changes

  // --- Render Method ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        Profile Settings
      </h1>

      {/* User Information Section */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Account Details</h2>
        {currentUser ? (
          <div className="space-y-3">
            <p className="text-lg">
              <strong className="font-medium">Username:</strong> {currentUser.username}
            </p>
            <p className="text-lg">
              <strong className="font-medium">Email:</strong> {currentUser.email}
            </p>
            {/* Add more user details as needed, e.g., created_at, last_login */}
            {currentUser.created_at && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since: {new Date(currentUser.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <p className="text-red-600 dark:text-red-400 font-medium">
            You are not logged in. Please log in to view your profile details.
          </p>
        )}
      </section>

      {/* Application Settings Section (Dark Mode) */}
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
        {/* Add more app-level settings here, e.g., notifications, language (if i18n is re-added) */}
      </section>

      {/* Productivity Insights Section */}
      <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Productivity Insights</h2>
        {isLoadingData ? (
          <div className="flex justify-center items-center h-24">
            <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
          </div>
        ) : dataError ? (
          <div className="text-red-600 dark:text-red-400 text-center p-4 border border-red-300 dark:border-red-700 rounded-md">
            <p className="font-medium">Error loading data:</p>
            <p>{dataError}</p>
          </div>
        ) : (
          // Use Suspense to handle lazy loading of ProductivityAssistant
          <Suspense fallback={
            <div className="flex justify-center items-center h-24">
              <p className="text-gray-600 dark:text-gray-400">Loading Productivity Assistant...</p>
            </div>
          }>
            <ProductivityAssistant tasks={tasks} projects={projects} />
          </Suspense>
        )}
        {!currentUser && !isLoadingData && !dataError && (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
            Log in to see your personalized productivity insights.
          </p>
        )}
      </section>
    </div>
  );
};

export default ProfileSettings;