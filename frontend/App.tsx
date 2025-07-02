import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import Login from "./components/Login";
import NotFound from "./components/Shared/NotFound";
import ProjectDetails from "./components/Project/ProjectDetails";
import Projects from "./components/Projects";
import AreaDetails from "./components/Area/AreaDetails";
import Areas from "./components/Areas";
import TagDetails from "./components/Tag/TagDetails";
import Tags from "./components/Tags";
import Notes from "./components/Notes";
import NoteDetails from "./components/Note/NoteDetails";
import Calendar from "./components/Calendar";
import ProfileSettings from "./components/Profile/ProfileSettings";
import Layout from "./Layout";
import { User } from "./entities/User";
import TasksToday from "./components/Task/TasksToday";
import TaskView from "./components/Task/TaskView";
import InboxItems from "./components/Inbox/InboxItems";

const Tasks = lazy(() => import("./components/Tasks"));

const MAX_CURRENT_USER_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [initialFetchError, setInitialFetchError] = useState<string | null>(null);

  const fetchCurrentUser = async (attempt = 0) => {
    try {
      setIsAppLoading(true);
      setInitialFetchError(null);

      const response = await fetch("/api/current_user", {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        // --- Retry Logic for 504 Gateway Timeout ---
        if (response.status === 504 && attempt < MAX_CURRENT_USER_RETRIES) {
          console.warn(`Attempt ${attempt + 1}/${MAX_CURRENT_USER_RETRIES}: GET /api/current_user 504 (Gateway Timeout). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          setTimeout(() => fetchCurrentUser(attempt + 1), RETRY_DELAY_MS);
          return; // IMPORTANT: Exit here, retry will be triggered by setTimeout
        }

        // --- Handle 401 Unauthorized (expected for unauthenticated users) ---
        if (response.status === 401) {
          setCurrentUser(null);
          setIsAppLoading(false); // Finished loading (no user)
          return;
        }

        // --- Enhanced Error Handling for Non-OK Responses ---
        // Read the response body as text FIRST, only once.
        const errorText = await response.text();
        let errorMessage = `HTTP error ${response.status}: `;

        try {
          // Attempt to parse the text as JSON
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.message || JSON.stringify(errorData);
        } catch (jsonParseError) {
          // If parsing fails, use the raw text as the error message
          errorMessage += `Non-JSON response - ${errorText.substring(0, 200)}...`; // Truncate for readability
          console.error("Failed to parse error response as JSON:", jsonParseError, "Raw response:", errorText);
        }
        
        throw new Error(errorMessage);
      }

      // --- If response is OK (status 200) ---
      const data = await response.json();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
      setIsAppLoading(false); // Successfully loaded (with or without user)

    } catch (err) {
      console.error('Error fetching current user:', err);
      setCurrentUser(null);
      setInitialFetchError(`Failed to load application: ${err instanceof Error ? err.message : String(err)}. Please ensure backend is running.`);
      setIsAppLoading(false); // Finished loading (with error)
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ... (rest of your App.tsx code remains the same) ...

  // Listen for login events to update user state
  useEffect(() => {
    const handleUserLoggedIn = (event: CustomEvent) => {
      const user = event.detail;
      setCurrentUser(user);
      setIsAppLoading(false); // User just logged in, so app is no longer loading initial state
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
  }, []);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedPreference = localStorage.getItem("isDarkMode");
    return storedPreference !== null
      ? storedPreference === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem("isDarkMode", JSON.stringify(newValue));
  };

  useEffect(() => {
    const updateTheme = () => {
      document.documentElement.classList.toggle("dark", isDarkMode);
    };
    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const mediaListener = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("isDarkMode")) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", mediaListener);
    return () => mediaQuery.removeEventListener("change", mediaListener);
  }, [isDarkMode]);

  const LoadingComponent = () => (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
        Loading application... Please wait.
      </div>
    </div>
  );

  if (isAppLoading) {
    return (
      <>
        <LoadingComponent />
        {initialFetchError && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center dark:bg-gray-800">
              <p className="text-red-600 font-bold mb-4">Error:</p>
              <p className="text-gray-800 dark:text-gray-200">{initialFetchError}</p>
              <button
                onClick={() => fetchCurrentUser()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {currentUser ? (
          <>
            <Route
              element={
                <Layout
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                >
                  <Outlet />
                </Layout>
              }
            >
              <Route index element={<Navigate to="/today" replace />} />
              <Route path="/today" element={<TasksToday />} />
              <Route path="/task/:uuid" element={<TaskView />} />
              <Route
                path="/tasks"
                element={
                  <Suspense fallback={<div className="p-4">Loading Tasks...</div>}>
                    <Tasks />
                  </Suspense>
                }
              />
              <Route path="/inbox" element={<InboxItems />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/areas" element={<Areas />} />
              <Route path="/area/:id" element={<AreaDetails />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/tag/:id" element={<TagDetails />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/note/:id" element={<NoteDetails />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/profile" element={<ProfileSettings currentUser={currentUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

export default App;