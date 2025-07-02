// frontend/utils/http.ts

export const getDefaultHeaders = (): Record<string, string> => {
  return {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': window.location.origin,
  };
};

export const getPostHeaders = (): Record<string, string> => {
  return {
    ...getDefaultHeaders(),
    'Content-Type': 'application/json',
  };
};

let isRedirecting = false; // State to prevent multiple redirects

export const handleAuthResponse = async (response: Response, errorMessage: string): Promise<Response> => {
  if (!response.ok) {
    if (response.status === 401) {
      // Prevent redirect loop if already on login page or already redirecting
      if (window.location.pathname !== '/login' && !isRedirecting) {
        isRedirecting = true;
        // Small delay to ensure current event loop finishes before redirect
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
      throw new Error('Authentication required'); // Throw specific error for 401
    }
    // For other non-OK responses, parse error message from body if available
    let detailedErrorMessage = errorMessage;
    try {
      const errorData = await response.json();
      detailedErrorMessage = errorData.message || errorMessage; // Use backend message if provided
    } catch (parseError) {
      // If response isn't JSON, use generic message
      console.warn("API error response was not JSON:", response.status, response.statusText);
    }
    throw new Error(detailedErrorMessage); // Throw error for other status codes
  }
  return response;
};

export const isAuthError = (error: any): boolean => {
  return error?.message && error.message.includes('Authentication required');
};