import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
// Removed i18next import
// import { useTranslation } from 'react-i18next'; // Removed
import { WeeklyCompletion } from '../../entities/Metrics';

interface WeeklyCompletionChartProps {
  data: WeeklyCompletion[];
}

const WeeklyCompletionChart: React.FC<WeeklyCompletionChartProps> = ({ data }) => {
  // Removed useTranslation hook call
  // const { t } = useTranslation(); // Removed

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.dayName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {/* Replaced t() calls with conditional string */}
            {data.count} {data.count === 1 ? 'task completed' : 'tasks completed'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        {/* Replaced t() call with hardcoded string */}
        Weekly Completions
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis
              dataKey="dayName"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: 'currentColor',
                className: 'text-gray-600 dark:text-gray-400'
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: 'currentColor',
                className: 'text-gray-600 dark:text-gray-400'
              }}
              allowDecimals={false}
              width={25}
              domain={[0, 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#3b82f6"
              radius={[2, 2, 0, 0]}
              minPointSize={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyCompletionChart;