// frontend/components/Profile/ProfileSettings.tsx
import React from 'react';
import { User } from '../../entities/User';

// Import all necessary components
import ProfileDetailsCard from './ProfileDetailsCard';
import AppSettingsCard from './AppSettingsCard';
import ProductivityInsightsSection from './ProductivityInsightsSection';
import ChangePasswordForm from './ChangePasswordForm';

interface ProfileSettingsProps {
  currentUser: User | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onUserUpdate: (updatedUser: User) => void;
  // This onLogout prop should come from App.tsx and be passed down
  onLogout: () => void; // Add onLogout to the interface
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  currentUser,
  isDarkMode,
  toggleDarkMode,
  onUserUpdate,
  onLogout // Destructure the onLogout prop
}) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        Profile Settings
      </h1>

      <ProfileDetailsCard currentUser={currentUser} onUserUpdate={onUserUpdate} />
      <AppSettingsCard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <ProductivityInsightsSection isAuthenticated={!!currentUser} />

      {/* Render the ChangePasswordForm */}
      <ChangePasswordForm
        currentUser={currentUser}
        onLogout={onLogout} // Pass the onLogout handler to the form
      />
    </div>
  );
};

export default ProfileSettings;