// AppRouter.tsx (Handles all routing)
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout"; // Your existing Layout component
import Login from "./components/Login";
import NotFound from "./components/Shared/NotFound";

// All your specific page components
import ProjectDetails from "./components/Project/ProjectDetails";
import Projects from "./components/Projects";
import AreaDetails from "./components/Area/AreaDetails";
import Areas from "./components/Areas";
import TagDetails from "./components/Tag/TagDetails";
import Tags from "./components/Tags";
import Notes from "./components/Notes";
import NoteDetails from "./components/Note/NoteDetails";
import Calendar from "./components/Calendar";
import ProfileSettings from "./components/Profile/ProfileSettings";
import TasksToday from "./components/Task/TasksToday";
import TaskView from "./components/Task/TaskView";
import InboxItems from "./components/Inbox/InboxItems";

const Tasks = lazy(() => import("./components/Tasks"));

interface AppRouterProps {
  currentUser: any; // Use the actual User type from your entities
  setCurrentUser: React.Dispatch<React.SetStateAction<any | null>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppRouter: React.FC<AppRouterProps> = ({
  currentUser,
  setCurrentUser,
  isDarkMode,
  toggleDarkMode,
}) => {
  return (
    <Routes>
      {currentUser ? (
        <Route
          element={
            <Layout
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            >
              <Outlet /> {/* Renders the nested routes */}
            </Layout>
          }
        >
          {/* Authenticated Routes */}
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<TasksToday />} />
          <Route path="/task/:uuid" element={<TaskView />} />
          <Route
            path="/tasks"
            element={
              <Suspense fallback={<div className="p-4">Loading Tasks...</div>}>
                <Tasks />
              </Suspense>
            }
          />
          <Route path="/inbox" element={<InboxItems />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/area/:id" element={<AreaDetails />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tag/:id" element={<TagDetails />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/note/:id" element={<NoteDetails />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/profile" element={<ProfileSettings currentUser={currentUser} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      ) : (
        <>
          {/* Unauthenticated Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}
    </Routes>
  );
};

export default AppRouter;