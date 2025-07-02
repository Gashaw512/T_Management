import { useState, useEffect } from 'react';
import { Task } from '../entities/Task';
import { Project } from '../entities/Project';
import { fetchTasks } from '../utils/tasksService';
import { fetchProjects } from '../utils/projectsService';
import { useToast } from '../components/Shared/ToastContext'; 

interface ProductivityData {
  tasks: Task[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void; 
}

/**
 * Custom hook to fetch and manage productivity tasks and projects data.
 * @param {boolean} shouldFetch - Controls whether the data fetching should be initiated.
 * @returns {ProductivityData} An object containing tasks, projects, loading state, error, and a refetch function.
 */
export const useProductivityData = (shouldFetch: boolean): ProductivityData => {
  const { showErrorToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // To manually trigger refetch

  useEffect(() => {
    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [fetchedTasks, fetchedProjects] = await Promise.all([
          fetchTasks(),
          fetchProjects()
        ]);

        setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
        setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
      } catch (err) {
        console.error('Failed to load productivity data:', err);
        setError('Failed to load your tasks and projects. Please check your connection and try again.');
        showErrorToast('Failed to load productivity data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [shouldFetch, refetchTrigger, showErrorToast]); // Dependencies for the effect

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { tasks, projects, isLoading, error, refetch };
};