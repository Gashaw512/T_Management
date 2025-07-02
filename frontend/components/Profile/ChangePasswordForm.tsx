// frontend/components/Profile/ChangePasswordForm.tsx
import React, { useState } from 'react';
import { useToast } from '../Shared/ToastContext';
import { changePassword } from '../../utils/authUtils'; 
import { User } from '../../entities/User'; 

// Optional: For icon if you like
import { KeyIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ChangePasswordFormProps {
  currentUser: User | null; // Needed if you want to conditionally show this component
  // onPasswordChangeSuccess?: () => void; // Optional: A callback for external actions (e.g., redirect to login)
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ currentUser /*, onPasswordChangeSuccess */ }) => {
  const { showSuccessToast, showErrorToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!currentUser) {
      showErrorToast('You must be logged in to change your password.');
      return;
    }

    // --- Client-side Validation ---
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showErrorToast('All password fields are required.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showErrorToast('New password and confirmation do not match.');
      return;
    }

    // Basic password strength (example: min 8 characters)
    if (newPassword.length < 8) {
      showErrorToast('New password must be at least 8 characters long.');
      return;
    }

    // You can add more complex regex-based strength checks here:
    // e.g., if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(newPassword)) { ... }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccessToast('Password changed successfully! Please log in with your new password.');

      // --- Security Best Practice ---
      // After a password change, it's highly recommended to invalidate the current session
      // and force the user to log in again with their new password.
      // This is usually handled by the backend by destroying the session token on success.
      // On the frontend, you'd then redirect them to the login page.

      // If you have a logout function in your App.tsx, you might call it here:
      // if (onPasswordChangeSuccess) {
      //   onPasswordChangeSuccess();
      // } else {
      //   // Fallback: Manually clear session and redirect
      //   localStorage.removeItem('userToken'); // Or whatever your token storage is
      //   window.location.href = '/login'; // Redirect
      // }
      // For simplicity here, we'll just clear the form, but strongly consider logging out.

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

    } catch (error: any) {
      console.error('Error changing password:', error);
      showErrorToast(error.message || 'Failed to change password. Please check your current password and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Change Password</h2>
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password:
            </label>
            <input
              type="password"
              id="currentPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              value={currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password:
            </label>
            <input
              type="password"
              id="newPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password:
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              value={confirmNewPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmNewPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <KeyIcon className="h-5 w-5 mr-2" />
              )}
              Change Password
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          Log in to change your password.
        </p>
      )}
    </section>
  );
};

export default ChangePasswordForm;