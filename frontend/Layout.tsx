import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon } from '@heroicons/react/24/outline';
import { useToast } from "./components/Shared/ToastContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./styles/tailwind.css";
import ProjectModal from "./components/Project/ProjectModal";
import NoteModal from "./components/Note/NoteModal";
import AreaModal from "./components/Area/AreaModal";
import TagModal from "./components/Tag/TagModal";
import SimplifiedTaskModal from "./components/Task/SimplifiedTaskModal";
import TaskModal from "./components/Task/TaskModal";
import { Note } from "./entities/Note";
import { Area } from "./entities/Area";
import { Tag } from "./entities/Tag";
import { Project } from "./entities/Project";
import { Task } from "./entities/Task";
import { User } from "./entities/User";
import { useStore } from "./store/useStore";
import { fetchNotes, createNote, updateNote } from "./utils/notesService";
import { fetchAreas, createArea, updateArea } from "./utils/areasService";
import { fetchTags, createTag, updateTag } from "./utils/tagsService";
import { fetchProjects, createProject, updateProject } from "./utils/projectsService";
import { createTask, updateTask } from "./utils/tasksService";
import { isAuthError } from "./utils/http";

interface LayoutProps {
  currentUser: User;
  isDarkMode: boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  toggleDarkMode: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  currentUser,
  setCurrentUser,
  isDarkMode,
  toggleDarkMode,
  children,
}) => {
  const { showSuccessToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [globalModalCount, setGlobalModalCount] = useState(0);

  // Modal open/close states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  // Modal specific data
  const [taskModalType, setTaskModalType] = useState<'simplified' | 'full'>('simplified');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [newTask, setNewTask] = useState<Task | null>(null); // This seems unused if you're passing a task prop to TaskModal. Consider if it's still needed.

  const {
    notesStore: {
      notes,
      setNotes,
      setLoading: setNotesLoading,
      setError: setNotesError,
      isLoading: isNotesLoading,
      isError: isNotesError,
    },
    areasStore: {
      areas,
      setAreas,
      setLoading: setAreasLoading,
      setError: setAreasError,
      isLoading: isAreasLoading,
      isError: isAreasError,
    },
    tasksStore: {
      setLoading: setTasksLoading, // You might need tasks, setTasks if you're not always re-fetching
      setError: setTasksError,
      isLoading: isTasksLoading,
      isError: isTasksError,
    },
    projectsStore: {
      projects,
      setProjects,
      setLoading: setProjectsLoading,
      setError: setProjectsError,
      isLoading: isProjectsLoading,
      isError: isProjectsError,
    },
    tagsStore: {
      tags,
      setTags,
      setLoading: setTagsLoading,
      setError: setTagsError,
      isLoading: isTagsLoading,
      isError: isTagsError,
    },
  } = useStore();

  // --- Global Modal Event Listener ---
  // This listener allows child components to dispatch 'modalOpen'/'modalClose' events
  // to help Layout keep track of how many modals are open, useful for floating button logic.
  useEffect(() => {
    const handleModalOpen = () => {
      setGlobalModalCount(prev => prev + 1);
    };

    const handleModalClose = () => {
      setGlobalModalCount(prev => Math.max(0, prev - 1));
    };

    window.addEventListener('modalOpen', handleModalOpen);
    window.addEventListener('modalClose', handleModalClose);

    return () => {
      window.removeEventListener('modalOpen', handleModalOpen);
      window.removeEventListener('modalClose', handleModalClose);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

  // --- Sidebar Open/Close on Resize ---
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Memoized Data Loading Functions (Crucial for initial fetches) ---
  // Zustand setters are stable, so they are safe dependencies.
  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const notesData = await fetchNotes();
      setNotes(notesData);
    } catch (error) {
      console.error("Error fetching notes:", error);
      setNotesError(true);
    } finally {
      setNotesLoading(false);
    }
  }, [setNotes, setNotesLoading, setNotesError]);

  const loadAreas = useCallback(async () => {
    setAreasLoading(true);
    try {
      const areasData = await fetchAreas();
      setAreas(areasData);
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreasError(true);
    } finally {
      setAreasLoading(false);
    }
  }, [setAreas, setAreasLoading, setAreasError]);

  const loadTags = useCallback(async () => {
    setTagsLoading(true);
    try {
      const tagsData = await fetchTags();
      setTags(tagsData);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsError(true);
    } finally {
      setTagsLoading(false);
    }
  }, [setTags, setTagsLoading, setTagsError]);

  // Initial Data Load on Mount
  useEffect(() => {
    loadNotes();
    loadAreas();
    loadTags();
  }, [loadNotes, loadAreas, loadTags]); // Dependencies are the memoized loading functions.

  // --- Memoized Modal Control Functions ---
  // These functions manage the local state for modal visibility and selected items.
  // They are memoized because they are passed down as props to Sidebar.
  const memoizedOpenTaskModal = useCallback((type: 'simplified' | 'full' = 'simplified') => {
    setIsTaskModalOpen(true);
    setTaskModalType(type);
  }, []); // Dependencies: setIsTaskModalOpen, setTaskModalType (assuming they are stable, which state setters are)

  const memoizedCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setNewTask(null); // Reset new task state on close
  }, []); // Dependencies: setIsTaskModalOpen, setNewTask

  const memoizedOpenProjectModal = useCallback(() => {
    setIsProjectModalOpen(true);
  }, []); // Dependencies: setIsProjectModalOpen

  const memoizedCloseProjectModal = useCallback(() => {
    setIsProjectModalOpen(false);
  }, []); // Dependencies: setIsProjectModalOpen

  const memoizedOpenNoteModal = useCallback((note: Note | null = null) => {
    setSelectedNote(note);
    setIsNoteModalOpen(true);
  }, []); // Dependencies: setSelectedNote, setIsNoteModalOpen

  const memoizedCloseNoteModal = useCallback(() => {
    setIsNoteModalOpen(false);
    setSelectedNote(null);
  }, []); // Dependencies: setIsNoteModalOpen, setSelectedNote

  const memoizedOpenAreaModal = useCallback((area: Area | null = null) => {
    setSelectedArea(area);
    setIsAreaModalOpen(true);
  }, []); // Dependencies: setSelectedArea, setIsAreaModalOpen

  const memoizedCloseAreaModal = useCallback(() => {
    setIsAreaModalOpen(false);
    setSelectedArea(null);
  }, []); // Dependencies: setIsAreaModalOpen, setSelectedArea

  const memoizedOpenTagModal = useCallback((tag: Tag | null = null) => {
    setSelectedTag(tag);
    setIsTagModalOpen(true);
  }, []); // Dependencies: setSelectedTag, setIsTagModalOpen

  const memoizedCloseTagModal = useCallback(() => {
    setIsTagModalOpen(false);
    setSelectedTag(null);
  }, []); // Dependencies: setIsTagModalOpen, setSelectedTag

  // --- Memoized Data Manipulation Functions (CRUD operations) ---
  // These functions typically trigger a re-fetch of data after successful operations.
  // Memoize them if they are passed as props to child components (e.g., modals).

  const handleSaveNote = useCallback(async (noteData: Note) => {
    try {
      if (noteData.id) {
        await updateNote(noteData.id, noteData);
      } else {
        await createNote(noteData);
      }
      loadNotes(); // Call the memoized loadNotes
      memoizedCloseNoteModal();
    } catch (error: any) {
      console.error("Error saving note:", error);
      if (isAuthError(error)) {
        // Handle auth error (e.g., redirect to login)
        setCurrentUser(null); // Assuming this is part of your auth error handling
        return;
      }
      memoizedCloseNoteModal(); // Close even on non-auth error
      // Potentially show an error toast here
    }
  }, [loadNotes, memoizedCloseNoteModal, setCurrentUser]); // Add setCurrentUser as dependency

  const handleSaveTask = useCallback(async (taskData: Task) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
        const taskLink = (
          <span>
            Task <a href="/tasks" className="text-green-200 underline hover:text-green-100">{taskData.name}</a> updated successfully!
          </span>
        );
        showSuccessToast(taskLink);
      } else {
        const createdTask = await createTask(taskData);
        const taskLink = (
          <span>
            Task <a href="/tasks" className="text-green-200 underline hover:text-green-100">{createdTask.name}</a> created successfully!
          </span>
        );
        showSuccessToast(taskLink);
      }
      // You might want to refresh tasks here if you have a tasksStore and loadTasks function
      // loadTasks();
      memoizedCloseTaskModal();
    } catch (error: any) {
      console.error("Error saving task:", error);
      if (isAuthError(error)) {
        setCurrentUser(null);
        return;
      }
      memoizedCloseTaskModal();
      throw error; // Re-throw to propagate if needed by modal
    }
  }, [memoizedCloseTaskModal, showSuccessToast, setCurrentUser]);

  const handleCreateProject = useCallback(async (name: string): Promise<Project> => {
    try {
      const newProject = await createProject({
        name,
        active: true,
      });
      return newProject;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error; // Re-throw so modal can handle
    }
  }, []);

  const handleSaveProject = useCallback(async (projectData: Project) => {
    try {
      if (projectData.id) {
        await updateProject(projectData.id, projectData);
      } else {
        await createProject(projectData);
      }
      // You don't have a memoized loadProjects, so re-fetching directly
      const projectsData = await fetchProjects();
      setProjects(projectsData); // Update Zustand store
      memoizedCloseProjectModal();
    } catch (error: any) {
      console.error("Error saving project:", error);
      if (isAuthError(error)) {
        setCurrentUser(null);
        return;
      }
      memoizedCloseProjectModal();
    }
  }, [setProjects, memoizedCloseProjectModal, setCurrentUser]);


  const handleSaveArea = useCallback(async (areaData: Partial<Area>) => {
    try {
      if (areaData.id) {
        await updateArea(areaData.id, areaData);
      } else {
        await createArea(areaData);
      }
      loadAreas(); // Call the memoized loadAreas
      memoizedCloseAreaModal();
    } catch (error: any) {
      console.error("Error saving area:", error);
      if (isAuthError(error)) {
        setCurrentUser(null);
        return;
      }
      memoizedCloseAreaModal();
    }
  }, [loadAreas, memoizedCloseAreaModal, setCurrentUser]);

  const handleSaveTag = useCallback(async (tagData: Tag) => {
    try {
      if (tagData.id) {
        await updateTag(tagData.id, tagData);
      } else {
        await createTag(tagData);
      }
      loadTags(); // Call the memoized loadTags
      memoizedCloseTagModal();
    } catch (error: any) {
      console.error("Error saving tag:", error);
      if (isAuthError(error)) {
        setCurrentUser(null);
        return;
      }
      memoizedCloseTagModal();
    }
  }, [loadTags, memoizedCloseTagModal, setCurrentUser]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setCurrentUser(null);
      } else {
        console.error('Logout failed:', await response.json());
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [setCurrentUser]); // setCurrentUser is a prop, so include it if it's not stable. React's useState setters are stable.

  // --- Computed States for UI ---
  const mainContentMarginLeft = isSidebarOpen ? "ml-72" : "ml-0";

  const isLoading =
    isNotesLoading ||
    isAreasLoading ||
    isTasksLoading || // If tasks are not loaded in Layout's useEffect, this might be perpetually true. Consider how tasks are managed.
    isProjectsLoading ||
    isTagsLoading;
  const isError =
    isNotesError ||
    isAreasError ||
    isTasksError ||
    isProjectsError ||
    isTagsError;

  // --- Conditional Rendering for Loading/Error States ---
  // It's generally better to wrap the entire application in a single div
  // for consistent styling and to avoid remounts of Navbar/Sidebar.
  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          handleLogout={handleLogout} // Pass memoized logout
        />
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openTaskModal={memoizedOpenTaskModal} // Use memoized versions
          openProjectModal={memoizedOpenProjectModal}
          openNoteModal={memoizedOpenNoteModal}
          openAreaModal={memoizedOpenAreaModal}
          openTagModal={memoizedOpenTagModal}
          notes={notes}
          areas={areas}
          tags={tags}
        />
        <div
          className={`flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
          style={{ paddingTop: '4rem' }} // Add padding to account for fixed Navbar height
        >
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Loading application data...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
        <Navbar
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          handleLogout={handleLogout}
        />
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentUser={currentUser}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          openTaskModal={memoizedOpenTaskModal}
          openProjectModal={memoizedOpenProjectModal}
          openNoteModal={memoizedOpenNoteModal}
          openAreaModal={memoizedOpenAreaModal}
          openTagModal={memoizedOpenTagModal}
          notes={notes}
          areas={areas}
          tags={tags}
        />
        <div
          className={`flex-1 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
          style={{ paddingTop: '4rem' }}
        >
          <div className="text-xl text-red-500">Something went wrong while loading initial data. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? "dark" : ""}`}>
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        openTaskModal={memoizedOpenTaskModal} // Pass memoized functions
        openProjectModal={memoizedOpenProjectModal}
        openNoteModal={memoizedOpenNoteModal}
        openAreaModal={memoizedOpenAreaModal}
        openTagModal={memoizedOpenTagModal}
        notes={notes}
        areas={areas}
        tags={tags}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMarginLeft}`}
        style={{ paddingTop: '4rem' }} // Account for fixed Navbar height
      >
        <div className="flex flex-col bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
          <div className="flex-grow py-6 px-2 md:px-6">
            <div className="w-full max-w-5xl mx-auto">{children}</div> {/* This is your Outlet content */}
          </div>
        </div>
      </div>

      {/* Floating Plus Button (Quick Capture) */}
      {!isTaskModalOpen && !isProjectModalOpen && !isNoteModalOpen && !isAreaModalOpen && !isTagModalOpen && globalModalCount === 0 && (
        <button
          onClick={() => memoizedOpenTaskModal('simplified')} // Use memoized function
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg focus:outline-none transform transition-transform duration-200 hover:scale-110 z-50"
          aria-label="Quick Capture"
          title="Quick Capture"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      )}

      {/* Modals - Render conditionally to avoid unnecessary mounting/unmounting */}
      {isTaskModalOpen && (
        taskModalType === 'simplified' ? (
          <SimplifiedTaskModal
            isOpen={isTaskModalOpen}
            onClose={memoizedCloseTaskModal}
            onSave={handleSaveTask}
          />
        ) : (
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={memoizedCloseTaskModal}
            task={{
              name: newTask?.name || "", // Use newTask state, or default. Consider a proper 'selectedTask' state for full modal edits.
              status: newTask?.status || "not_started",
              // ... other default task properties
            }}
            onSave={handleSaveTask}
            onDelete={async () => { /* Add actual delete logic here */ }} // This should ideally be a memoized function too
            projects={projects}
            onCreateProject={handleCreateProject}
          />
        )
      )}

      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={memoizedCloseProjectModal}
          onSave={handleSaveProject}
          areas={areas}
        />
      )}

      {isNoteModalOpen && (
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={memoizedCloseNoteModal}
          onSave={handleSaveNote}
          note={selectedNote}
        />
      )}

      {isAreaModalOpen && (
        <AreaModal
          isOpen={isAreaModalOpen}
          onClose={memoizedCloseAreaModal}
          onSave={handleSaveArea}
          area={selectedArea}
        />
      )}

      {isTagModalOpen && (
        <TagModal
          isOpen={isTagModalOpen}
          onClose={memoizedCloseTagModal}
          onSave={handleSaveTag}
          tag={selectedTag}
        />
      )}
    </div>
  );
};

export default Layout;