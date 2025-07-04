import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PencilSquareIcon,
  TrashIcon,
  Squares2X2Icon,
  FolderIcon,
  PlusCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/solid';
import ConfirmDialog from './Shared/ConfirmDialog';
import AreaModal from './Area/AreaModal';
import { useStore } from '../store/useStore';
import { fetchAreas, createArea, updateArea, deleteArea } from '../utils/areasService';
import { Area } from '../entities/Area';
import { useModalEvents } from '../hooks/useModalEvents';

const Areas: React.FC = () => {
  const { areas, setAreas, setLoading, setError, isLoading, isError } = useStore((state) => state.areasStore);

  const [isAreaModalOpen, setIsAreaModalOpen] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [hoveredAreaId, setHoveredAreaId] = useState<number | null>(null);

  useModalEvents(isAreaModalOpen);

  useEffect(() => {
    const loadAreas = async () => {
      setLoading(true); // Set loading state in the store
      try {
        const areasData = await fetchAreas();
        setAreas(areasData); // Update areas in the store
      } catch (error) {
        console.error('Error fetching areas:', error);
        setError(true); // Set error state in the store
      } finally {
        setLoading(false); // Clear loading state in the store
      }
    };

    loadAreas();
  }, []); // <--- **CHANGE THIS TO AN EMPTY ARRAY**
           // Zustand's setters (setAreas, setLoading, setError) are stable and do not need to be dependencies.
           // This ensures loadAreas() runs only once when the component mounts.


  const handleSaveArea = async (areaData: Partial<Area>) => {
    setLoading(true);
    try {
      if (areaData.id) {
        await updateArea(areaData.id, {
          name: areaData.name,
          description: areaData.description,
        });
      } else {
        await createArea({
          name: areaData.name,
          description: areaData.description,
        });
      }
      // Re-fetch all areas to ensure the list is up-to-date after C/U/D
      const updatedAreas = await fetchAreas();
      setAreas(updatedAreas);
    } catch (error) {
      console.error('Error saving area:', error);
      setError(true);
    } finally {
      setLoading(false);
      setIsAreaModalOpen(false);
      setSelectedArea(null);
    }
  };

  const handleEditArea = (area: Area) => {
    setSelectedArea(area);
    setIsAreaModalOpen(true);
  };

  const handleCreateArea = () => {
    setSelectedArea(null);
    setIsAreaModalOpen(true);
  };

  const openConfirmDialog = (area: Area) => {
    setAreaToDelete(area);
    setIsConfirmDialogOpen(true);
  };

  const handleDeleteArea = async () => {
    if (!areaToDelete) return;

    setLoading(true);
    try {
      await deleteArea(areaToDelete.id!);
      // Re-fetch all areas to ensure the list is up-to-date after C/U/D
      const updatedAreas = await fetchAreas();
      setAreas(updatedAreas);
      setIsConfirmDialogOpen(false);
      setAreaToDelete(null);
    } catch (error) {
      console.error('Error deleting area:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
    setAreaToDelete(null);
  };

  // Conditionally render loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          Loading areas...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-red-500 text-lg">
          Error loading areas. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 lg:px-2">
      <div className="w-full max-w-5xl">
        {/* Areas Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <FolderIcon className="h-6 w-6 mr-2 text-gray-900 dark:text-white" />
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">
              My Areas
            </h2>
          </div>
          <button
            onClick={handleCreateArea}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Add New Area
          </button>
        </div>

        {/* View Mode */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-md focus:outline-none ${
              viewMode === "cards"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            aria-label="View as cards"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md focus:outline-none ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            aria-label="View as list"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
        </div>

        {/* Areas List */}
        {areas.length === 0 ? (
          <p className="text-gray-700 dark:text-gray-300">
            No areas found.
          </p>
        ) : (
          <ul
            className={`${
              viewMode === "cards"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
            }`}
          >
            {areas.map((area) => (
              <li
                key={area.id}
                className={`bg-white dark:bg-gray-900 shadow rounded-lg p-4 flex justify-between items-center transition-all duration-200 ${
                  viewMode === "list"
                    ? "py-3 px-4"
                    : "flex-col items-start text-center"
                }`}
                onMouseEnter={() => setHoveredAreaId(area.id || null)}
                onMouseLeave={() => setHoveredAreaId(null)}
              >
                {/* Area Content */}
                <div className={`flex-grow overflow-hidden ${viewMode === "list" ? "pr-4" : "w-full"}`}>
                  <Link
                    to={`/projects?area_id=${area.id}`}
                    className={`text-md font-semibold text-gray-900 dark:text-gray-100 hover:underline block ${
                      viewMode === "cards" ? "mb-2" : ""
                    }`}
                  >
                    {area.name}
                  </Link>
                  {area.description && (
                    <p className={`text-xs text-gray-600 dark:text-gray-400 mt-1 ${viewMode === "list" ? "truncate" : ""}`}>
                      {area.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex space-x-2 ${
                    viewMode === "cards" ? "mt-4 w-full justify-center" : "items-center"
                  }`}
                >
                  <button
                    onClick={() => handleEditArea(area)}
                    className={`text-gray-500 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none transition-opacity ${
                      viewMode === "list"
                        ? hoveredAreaId === area.id
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-100"
                    }`}
                    aria-label={`Edit area ${area.name}`}
                    title={`Edit area ${area.name}`}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openConfirmDialog(area)}
                    className={`text-gray-500 hover:text-red-700 dark:hover:text-red-300 focus:outline-none transition-opacity ${
                      viewMode === "list"
                        ? hoveredAreaId === area.id
                          ? "opacity-100"
                          : "opacity-0"
                        : "opacity-100"
                    }`}
                    aria-label={`Delete area ${area.name}`}
                    title={`Delete area ${area.name}`}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* AreaModal */}
        {isAreaModalOpen && (
          <AreaModal
            isOpen={isAreaModalOpen}
            onClose={() => {
              setIsAreaModalOpen(false);
              setSelectedArea(null); // Reset selected area on close
            }}
            onSave={handleSaveArea}
            area={selectedArea}
          />
        )}

        {/* ConfirmDialog */}
        {isConfirmDialogOpen && areaToDelete && (
          <ConfirmDialog
            title="Confirm Deletion"
            message={`Are you sure you want to delete the area "${areaToDelete.name}"? This action cannot be undone.`}
            onConfirm={handleDeleteArea}
            onCancel={closeConfirmDialog}
          />
        )}
      </div>
    </div>
  );
};

export default Areas;