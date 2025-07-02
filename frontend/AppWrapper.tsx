// AppWrapper.tsx (Handles Auth and Initial Loading)
import React, { useEffect, useState, Suspense } from "react";
import { User } from "./entities/User"; // Assuming this path
import LoadingScreen from "./components/Shared/LoadingScreen"; // New component
import ErrorScreen from "./components/Shared/ErrorScreen";     // New component
import AppRouter from "./AppRouter";                           // New component

const MAX_CURRENT_USER_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const AppWrapper: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [initialFetchError, setInitialFetchError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedPreference = localStorage.getItem("isDarkMode");
    return storedPreference !== null
      ? storedPreference === "true"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem("isDarkMode", String(newValue)); // Store as string
  };

  const fetchCurrentUser = async (attempt = 0) => {
    try {
      setIsAppLoading(true);
      setInitialFetchError(null);

      const response = await fetch("/api/current_user", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        if (response.status === 504 && attempt < MAX_CURRENT_USER_RETRIES) {
          console.warn(`Attempt ${attempt + 1}/${MAX_CURRENT_USER_RETRIES}: GET /api/current_user 504 (Gateway Timeout). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          setTimeout(() => fetchCurrentUser(attempt + 1), RETRY_DELAY_MS);
          return;
        }

        if (response.status === 401) {
          setCurrentUser(null);
          setIsAppLoading(false);
          return;
        }

        const errorText = await response.text();
        let errorMessage = `HTTP error ${response.status}: `;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += errorData.message || JSON.stringify(errorData);
        } catch (jsonParseError) {
          errorMessage += `Non-JSON response - ${errorText.substring(0, 200)}...`;
          console.error("Failed to parse error response as JSON:", jsonParseError, "Raw response:", errorText);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCurrentUser(data.user || null); // Ensure it's null if user is undefined
      setIsAppLoading(false);

    } catch (err) {
      console.error('Error fetching current user:', err);
      setCurrentUser(null);
      setInitialFetchError(`Failed to load application: ${err instanceof Error ? err.message : String(err)}. Please ensure backend is running.`);
      setIsAppLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleUserLoggedIn = (event: CustomEvent) => {
      const user = event.detail;
      setCurrentUser(user);
      setIsAppLoading(false);
    };
    window.addEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
    return () => window.removeEventListener('userLoggedIn', handleUserLoggedIn as EventListener);
  }, []);

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

  if (isAppLoading) {
    return (
      <>
        <LoadingScreen />
        {initialFetchError && (
          <ErrorScreen
            message={initialFetchError}
            onRetry={fetchCurrentUser}
          />
        )}
      </>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppRouter
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
    </Suspense>
  );
};

export default AppWrapper;