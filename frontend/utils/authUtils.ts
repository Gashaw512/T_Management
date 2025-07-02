import { getPostHeaders, handleAuthResponse } from './http'; 

/**
 * Calls the backend API to change a user's password.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The new password.
 * @returns {Promise<void>} A promise that resolves if the password change is successful.
 * @throws {Error} If the API call fails or the passwords don't meet requirements/match current.
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: getPostHeaders(), // Use getPostHeaders for POST request with body
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include',
    });

    // Handle authentication and other errors centrally
    await handleAuthResponse(response, 'Failed to change password.');

    // No data expected back on success, just a 200 OK handled by handleAuthResponse
  } catch (error: any) {
    console.error('Error in changePassword service:', error);
    throw error;
  }
};