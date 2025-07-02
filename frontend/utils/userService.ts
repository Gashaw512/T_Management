import { User } from '../entities/User';
import { getPostHeaders, handleAuthResponse } from './http'; // Import from your new http.ts file

/**
 * Updates user information on the backend.
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<User>} userData - An object containing the fields to update.
 * @returns {Promise<User>} A promise that resolves with the updated user data.
 * @throws {Error} If the API call fails or returns an error.
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: getPostHeaders(), // Use getPostHeaders for PUT request with body
      body: JSON.stringify(userData),
      credentials: 'include',
    });

    // Handle authentication and other errors centrally
    const handledResponse = await handleAuthResponse(response, 'Failed to update user profile.');

    const data = await handledResponse.json();
    return data.user as User;
  } catch (error: any) {
    console.error('Error in updateUser service:', error);
    throw error;
  }
};