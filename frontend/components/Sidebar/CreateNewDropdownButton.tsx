import React, { useState } from 'react';
import {
  PlusCircleIcon,
  ChevronDownIcon,
  ClipboardIcon,
  FolderIcon,
  BookOpenIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
// Removed useTranslation import
// import { useTranslation } from 'react-i18next';
import { Note } from '../../entities/Note';
import { Area } from '../../entities/Area';

interface CreateNewDropdownButtonProps {
  openTaskModal: (type?: 'simplified' | 'full') => void;
  openProjectModal: () => void;
  openNoteModal: (note: Note | null) => void;
  openAreaModal: (area: Area | null) => void;
}

const CreateNewDropdownButton: React.FC<CreateNewDropdownButtonProps> = ({
  openTaskModal,
  openProjectModal,
  openNoteModal,
  openAreaModal,
}) => {
  // Removed useTranslation hook call
  // const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownSelect = (type: string) => {
    switch (type) {
      case 'Task':
        openTaskModal('full');
        break;
      case 'Project':
        openProjectModal();
        break;
      case 'Note':
        openNoteModal(null);
        break;
      case 'Area':
        openAreaModal(null);
        break;
      default:
        break;
    }
    setIsDropdownOpen(false);
  };

  const dropdownItems = [
    { label: 'Task', icon: <ClipboardIcon className="h-5 w-5 mr-2" /> }, // Removed translationKey
    { label: 'Project', icon: <FolderIcon className="h-5 w-5 mr-2" /> }, // Removed translationKey
    { label: 'Note', icon: <BookOpenIcon className="h-5 w-5 mr-2" /> }, // Removed translationKey
    { label: 'Area', icon: <Squares2X2Icon className="h-5 w-5 mr-2" /> }, // Removed translationKey
  ];

  return (
    <div className="mb-8 px-4">
      <div className="relative">
        <button
          type="button"
          className="flex justify-between items-center w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
          onClick={toggleDropdown}
        >
          <span className="flex items-center">
            <PlusCircleIcon
              className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            />
            Create New {/* Hardcoded string */}
          </span>
          <ChevronDownIcon
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute left-0 right-0 mt-2 w-full">
            <div className="rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <ul
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                {dropdownItems.map(({ label, icon }) => ( // Destructured to exclude translationKey
                  <li
                    key={label}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => handleDropdownSelect(label)}
                    role="menuitem"
                  >
                    {icon}
                    {label} {/* Using label directly instead of t(translationKey, label) */}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewDropdownButton;