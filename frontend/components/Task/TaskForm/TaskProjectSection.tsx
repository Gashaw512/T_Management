import React from 'react';
// Removed useTranslation import
import { Project } from '../../../entities/Project';

interface TaskProjectSectionProps {
  newProjectName: string;
  onProjectSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dropdownOpen: boolean;
  filteredProjects: Project[];
  onProjectSelection: (project: Project) => void;
  onCreateProject: () => void;
  isCreatingProject: boolean;
}

const TaskProjectSection: React.FC<TaskProjectSectionProps> = ({
  newProjectName,
  onProjectSearch,
  dropdownOpen,
  filteredProjects,
  onProjectSelection,
  onCreateProject,
  isCreatingProject
}) => {
  // Removed useTranslation hook call

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search or create a project..." // Hardcoded string
        value={newProjectName}
        onChange={onProjectSearch}
        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      />
      {dropdownOpen && newProjectName && (
        <div className="absolute mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md w-full z-50 border border-gray-200 dark:border-gray-700">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onProjectSelection(project)}
                className="block w-full text-gray-700 dark:text-gray-300 text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {project.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No matching projects {/* Hardcoded string */}
            </div>
          )}
          {newProjectName && (
            <button
              type="button"
              onClick={onCreateProject}
              disabled={isCreatingProject}
              className="block w-full text-left px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              {isCreatingProject
                ? 'Creating...' // Hardcoded string
                : '+ Create' + ` "${newProjectName}"`} {/* Hardcoded string with concatenation */}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskProjectSection;