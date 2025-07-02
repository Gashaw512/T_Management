// frontend/components/Profile/ProfileDetailsCard.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../entities/User'; // Ensure User interface is imported
import { useToast } from '../Shared/ToastContext';
import { updateUser } from '../../utils/userService'; // Adjust the import path as necessary

// Heroicons for edit/save/cancel
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProfileDetailsCardProps {
  currentUser: User | null;
  onUserUpdate: (updatedUser: User) => void; // Callback to notify parent of user update
}

const ProfileDetailsCard: React.FC<ProfileDetailsCardProps> = ({ currentUser, onUserUpdate }) => {
  const { showSuccessToast, showErrorToast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUsername, setEditedUsername] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize edited states when currentUser changes or component mounts
  useEffect(() => {
    if (currentUser) {
      setEditedUsername(currentUser.username || '');
      setEditedEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleEditClick = (): void => {
    setIsEditing(true);
  };

  const handleCancelClick = (): void => {
    setIsEditing(false);
    // Reset edited fields to current user's data
    if (currentUser) {
      setEditedUsername(currentUser.username || '');
      setEditedEmail(currentUser.email || '');
    }
  };

  const handleSaveClick = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault(); // Prevent default form submission

    if (!currentUser || !currentUser.id) {
      showErrorToast('User not found. Cannot save changes.');
      return;
    }

    // Basic client-side validation
    if (!editedUsername.trim()) {
      showErrorToast('Username cannot be empty.');
      return;
    }
    if (!editedEmail.trim() || !/\S+@\S+\.\S+/.test(editedEmail)) {
      showErrorToast('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUserData: Partial<User> = {
        username: editedUsername,
        email: editedEmail,
        // Add other editable fields here if needed
      };

      const updatedUser: User = await updateUser(currentUser.id, updatedUserData);
      showSuccessToast('Profile updated successfully!');
      setIsEditing(false);

      // Notify parent component (App.tsx) to refresh its currentUser state
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showErrorToast(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Account Details</h2>
        {!isEditing && currentUser && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 rounded-md bg-blue-500 text-white flex items-center hover:bg-blue-600 transition-colors duration-200"
            aria-label="Edit profile"
          >
            <PencilIcon className="h-5 w-5 mr-2" /> Edit
          </button>
        )}
      </div>

      {currentUser ? (
        <form onSubmit={handleSaveClick}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username:</label>
              {isEditing ? (
                <input
                  type="text"
                  id="username"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  value={editedUsername}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedUsername(e.target.value)}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">{currentUser.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  value={editedEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedEmail(e.target.value)}
                  disabled={isLoading}
                />
              ) : (
                <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">{currentUser.email}</p>
              )}
            </div>

            {currentUser.created_at && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Member since: {new Date(currentUser.created_at).toLocaleDateString()}
              </p>
            )}

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <XMarkIcon className="h-5 w-5 mr-2 inline-block" /> Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-green-600 text-white flex items-center hover:bg-green-700 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CheckIcon className="h-5 w-5 mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="text-red-600 dark:text-red-400 font-medium">
          User data is not available.
        </p>
      )}
    </section>
  );
};

export default ProfileDetailsCard;