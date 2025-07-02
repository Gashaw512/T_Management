import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- New Constants for Retry Logic ---
const MAX_LOGIN_RETRIES = 3;    // Fewer retries for user-initiated actions
const RETRY_DELAY_MS = 1500;    // 1.5 seconds delay between retries
// --- End New Constants ---

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Added loading state for button
  const navigate = useNavigate();

  // Modified handleSubmit with retry logic and improved error handling
  const handleSubmit = async (e: React.FormEvent, attempt = 0) => {
    e.preventDefault();
    setLoading(true); // Set loading to true on form submission
    setError(null);   // Clear previous errors

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      // --- Retry Logic for 504 Gateway Timeout ---
      if (response.status === 504 && attempt < MAX_LOGIN_RETRIES) {
        console.warn(`Attempt ${attempt + 1}/${MAX_LOGIN_RETRIES}: POST /api/login 504 (Gateway Timeout). Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        setTimeout(() => handleSubmit(e, attempt + 1), RETRY_DELAY_MS);
        return; // IMPORTANT: Exit here, retry will be triggered by setTimeout
      }

      if (!response.ok) {
        // --- Enhanced Error Handling for Non-OK Responses ---
        // Read the response body as text FIRST, only once.
        const errorText = await response.text();
        let errorMessage = `Login failed. HTTP error ${response.status}: `;

        try {
          // Attempt to parse the text as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.errors?.[0] || errorData.message || 'Login failed. Please try again.';
          console.error("Login API error data:", errorData);
        } catch (jsonParseError) {
          // If parsing fails, use the raw text as the error message
          errorMessage += `Non-JSON response - ${errorText.substring(0, 200)}...`; // Truncate for readability
          console.error("Failed to parse login error response as JSON:", jsonParseError, "Raw response:", errorText);
        }
        
        throw new Error(errorMessage); // Throw to be caught by the outer catch block
      }

      // --- If response is OK (status 200) ---
      const data = await response.json(); // This will be valid JSON here if response.ok
      
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: data.user }));
      navigate('/today');

    } catch (err) {
      console.error('Error during login:', err);
      // Set the error message to display in the UI
      setError(err instanceof Error ? err.message : 'An unknown error occurred during login. Please try again.');
    } finally {
      // Only set loading to false if we're done (no more retries scheduled)
      if (attempt >= MAX_LOGIN_RETRIES || error === null) { // if max retries reached or no error (success)
          setLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-5xl font-bold text-gray-300 mb-6">
        tududi
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        {error && (
          <div className="mb-4 text-center text-red-500">
            {error}
          </div>
        )}
        <form onSubmit={(e) => handleSubmit(e)}> {/* Call handleSubmit with event */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-600 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading} // Disable button while loading or retrying
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;