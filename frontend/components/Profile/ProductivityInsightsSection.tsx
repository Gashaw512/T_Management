import React, { Suspense, lazy } from 'react';
import { useProductivityData } from '../../hooks/useProductivityData'; 


const ProductivityAssistant = lazy(() => import('../Productivity/ProductivityAssistant')); 

interface ProductivityInsightsSectionProps {
  isAuthenticated: boolean; // To determine if we should even try to fetch/display insights
}

const ProductivityInsightsSection: React.FC<ProductivityInsightsSectionProps> = ({ isAuthenticated }) => {
  const { tasks, projects, isLoading, error } = useProductivityData(isAuthenticated);

  return (
    <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Productivity Insights</h2>
      {!isAuthenticated ? (
        <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
          Log in to see your personalized productivity insights.
        </p>
      ) : isLoading ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-400 text-center p-4 border border-red-300 dark:border-red-700 rounded-md">
          <p className="font-medium">Error loading data:</p>
          <p>{error}</p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="flex justify-center items-center h-24">
            <p className="text-gray-600 dark:text-gray-400">Loading Productivity Assistant...</p>
          </div>
        }>
          <ProductivityAssistant tasks={tasks} projects={projects} />
        </Suspense>
      )}
    </section>
  );
};

export default ProductivityInsightsSection;