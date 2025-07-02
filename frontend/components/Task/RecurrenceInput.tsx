import React, { useState } from 'react';
import { RecurrenceType } from '../../entities/Task';
// Removed useTranslation import
// import { useTranslation } from 'react-i18next';

interface RecurrenceInputProps {
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  recurrenceEndDate?: string;
  recurrenceWeekday?: number;
  recurrenceMonthDay?: number;
  recurrenceWeekOfMonth?: number;
  completionBased: boolean;
  onChange: (field: string, value: any) => void;
  disabled?: boolean;
  isChildTask?: boolean;
  parentTaskLoading?: boolean;
  onEditParent?: () => void;
  onParentRecurrenceChange?: (field: string, value: any) => void;
}

const RecurrenceInput: React.FC<RecurrenceInputProps> = ({
  recurrenceType,
  recurrenceInterval,
  recurrenceEndDate,
  recurrenceWeekday,
  recurrenceMonthDay,
  recurrenceWeekOfMonth,
  completionBased,
  onChange,
  disabled = false,
  isChildTask = false,
  parentTaskLoading = false,
  onEditParent,
  onParentRecurrenceChange,
}) => {
  // Removed useTranslation hook call
  // const { t } = useTranslation();
  const [editingParentRecurrence, setEditingParentRecurrence] = useState(false);

  const weekdays = [
    { value: 0, label: 'Sunday' }, // Hardcoded string
    { value: 1, label: 'Monday' }, // Hardcoded string
    { value: 2, label: 'Tuesday' }, // Hardcoded string
    { value: 3, label: 'Wednesday' }, // Hardcoded string
    { value: 4, label: 'Thursday' }, // Hardcoded string
    { value: 5, label: 'Friday' }, // Hardcoded string
    { value: 6, label: 'Saturday' }, // Hardcoded string
  ];

  const weekOfMonthOptions = [
    { value: 1, label: 'First' }, // Hardcoded string
    { value: 2, label: 'Second' }, // Hardcoded string
    { value: 3, label: 'Third' }, // Hardcoded string
    { value: 4, label: 'Fourth' }, // Hardcoded string
    { value: 5, label: 'Last' }, // Hardcoded string
  ];

  const renderRecurrenceTypeSelect = (customOnChange?: (field: string, value: any) => void, isDisabled?: boolean) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Repeat {/* Hardcoded string */}
      </label>
      <select
        value={recurrenceType}
        onChange={(e) => (customOnChange || onChange)('recurrence_type', e.target.value as RecurrenceType)}
        className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        disabled={isDisabled}
      >
        <option value="none">No repeat</option> {/* Hardcoded string */}
        <option value="daily">Daily</option> {/* Hardcoded string */}
        <option value="weekly">Weekly</option> {/* Hardcoded string */}
        <option value="monthly">Monthly</option> {/* Hardcoded string */}
        <option value="monthly_weekday">Monthly on weekday</option> {/* Hardcoded string */}
        <option value="monthly_last_day">Monthly on last day</option> {/* Hardcoded string */}
      </select>
    </div>
  );

  const renderIntervalInput = (customOnChange?: (field: string, value: any) => void, isDisabled?: boolean) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Every {/* Hardcoded string */}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="1"
          max="999"
          value={recurrenceInterval || 1}
          onChange={(e) => (customOnChange || onChange)('recurrence_interval', parseInt(e.target.value))}
          className="block w-20 border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          disabled={isDisabled}
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {recurrenceType === 'daily' && 'days'} {/* Hardcoded string */}
          {recurrenceType === 'weekly' && 'weeks'} {/* Hardcoded string */}
          {(recurrenceType === 'monthly' || recurrenceType === 'monthly_weekday' || recurrenceType === 'monthly_last_day') && 'months'} {/* Hardcoded string */}
        </span>
      </div>
    </div>
  );

  const renderWeekdaySelect = (customOnChange?: (field: string, value: any) => void, isDisabled?: boolean) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        On day {/* Hardcoded string */}
      </label>
      <select
        value={recurrenceWeekday !== undefined ? recurrenceWeekday : ''}
        onChange={(e) => (customOnChange || onChange)('recurrence_weekday', e.target.value ? parseInt(e.target.value) : null)}
        className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        disabled={isDisabled}
      >
        <option value="">Any day</option> {/* Hardcoded string */}
        {weekdays.map((day) => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderMonthDayInput = (customOnChange?: (field: string, value: any) => void, isDisabled?: boolean) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        Day of month {/* Hardcoded string */}
      </label>
      <input
        type="number"
        min="1"
        max="31"
        value={recurrenceMonthDay || ''}
        onChange={(e) => (customOnChange || onChange)('recurrence_month_day', e.target.value ? parseInt(e.target.value) : null)}
        placeholder="Leave empty for current day" // Hardcoded string
        className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        disabled={isDisabled}
      />
    </div>
  );

  const renderMonthlyWeekdayInputs = () => (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Week of month {/* Hardcoded string */}
        </label>
        <select
          value={recurrenceWeekOfMonth || 1}
          onChange={(e) => onChange('recurrence_week_of_month', parseInt(e.target.value))}
          className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {weekOfMonthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Weekday {/* Hardcoded string */}
        </label>
        <select
          value={recurrenceWeekday || 1}
          onChange={(e) => onChange('recurrence_weekday', parseInt(e.target.value))}
          className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        >
          {weekdays.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderEndDateInput = (customOnChange?: (field: string, value: any) => void, isDisabled?: boolean) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
        End date (optional) {/* Hardcoded string */}
      </label>
      <input
        type="date"
        value={recurrenceEndDate || ''}
        onChange={(e) => (customOnChange || onChange)('recurrence_end_date', e.target.value || null)}
        className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        disabled={isDisabled}
      />
    </div>
  );

  const renderCompletionBasedToggle = () => (
    <div className="mb-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={completionBased}
          onChange={(e) => onChange('completion_based', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Repeat after completion {/* Hardcoded string */}
        </span>
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        If checked, the next task will be created based on completion date instead of due date {/* Hardcoded string */}
      </p>
    </div>
  );

  // Show message for child tasks
  if (isChildTask && parentTaskLoading) {
    return (
      <div className="pb-3 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Recurrence Settings {/* Hardcoded string */}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading parent task recurrence settings...
        </div>
      </div>
    );
  }

  if (isChildTask) {
    return (
      <div className="pb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          Recurrence Settings {/* Hardcoded string */}
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Recurring Task Instance</strong>
            <p className="mt-1">
              This task was generated from a recurring task. The recurrence settings shown below are inherited from the original task and cannot be edited here.
            </p>
            {onParentRecurrenceChange && (
              <button
                type="button"
                onClick={() => setEditingParentRecurrence(!editingParentRecurrence)}
                className={`mt-2 inline-flex items-center px-3 py-1 border text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  editingParentRecurrence
                    ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-800/50'
                    : 'border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 bg-white dark:bg-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-800/50'
                }`}
              >
                {editingParentRecurrence ? 'Cancel Edit' : 'Edit Parent Recurrence'}
              </button>
            )}
          </div>
        </div>
        <div className={editingParentRecurrence ? '' : 'opacity-60 pointer-events-none'}>
          {editingParentRecurrence && (
            <div className="mb-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ You are editing the parent task's recurrence settings. Changes will affect all future instances of this recurring task.
              </div>
            </div>
          )}
          {recurrenceType === 'none' ? renderRecurrenceTypeSelect(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence) : (
            <>
              {renderRecurrenceTypeSelect(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence)}
              {renderIntervalInput(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence)}
              {(recurrenceType === 'weekly' || recurrenceType === 'monthly_weekday') && renderWeekdaySelect(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence)}
              {recurrenceType === 'monthly' && renderMonthDayInput(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence)}
              {recurrenceType === 'monthly_weekday' && renderMonthlyWeekdayInputs()}
              {renderEndDateInput(editingParentRecurrence ? onParentRecurrenceChange : undefined, !editingParentRecurrence)}
              {renderCompletionBasedToggle()}
            </>
          )}
        </div>
      </div>
    );
  }

  if (recurrenceType === 'none') {
    return (
      <div className="pb-3">
        {renderRecurrenceTypeSelect()}
      </div>
    );
  }

  return (
    <div className="pb-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
        Recurrence Settings {/* Hardcoded string */}
      </h3>

      {/* Main recurrence settings in one row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Repeat {/* Hardcoded string */}
          </label>
          <select
            value={recurrenceType}
            onChange={(e) => onChange('recurrence_type', e.target.value as RecurrenceType)}
            className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            disabled={disabled}
          >
            <option value="none">No repeat</option> {/* Hardcoded string */}
            <option value="daily">Daily</option> {/* Hardcoded string */}
            <option value="weekly">Weekly</option> {/* Hardcoded string */}
            <option value="monthly">Monthly</option> {/* Hardcoded string */}
            <option value="monthly_weekday">Monthly on weekday</option> {/* Hardcoded string */}
            <option value="monthly_last_day">Monthly on last day</option> {/* Hardcoded string */}
          </select>
        </div>

        {(recurrenceType === 'daily' || recurrenceType === 'weekly' || recurrenceType === 'monthly' || recurrenceType === 'monthly_weekday' || recurrenceType === 'monthly_last_day') && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every {/* Hardcoded string */}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="999"
                value={recurrenceInterval || 1}
                onChange={(e) => onChange('recurrence_interval', parseInt(e.target.value))}
                className="block w-20 border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                disabled={disabled}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {recurrenceType === 'daily' && 'days'} {/* Hardcoded string */}
                {recurrenceType === 'weekly' && 'weeks'} {/* Hardcoded string */}
                {(recurrenceType === 'monthly' || recurrenceType === 'monthly_weekday' || recurrenceType === 'monthly_last_day') && 'months'} {/* Hardcoded string */}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            End date (optional) {/* Hardcoded string */}
          </label>
          <input
            type="date"
            value={recurrenceEndDate || ''}
            onChange={(e) => onChange('recurrence_end_date', e.target.value || null)}
            className="block w-full border border-gray-300 dark:border-gray-900 rounded-md focus:outline-none shadow-sm px-2 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Additional settings for specific recurrence types */}
      {recurrenceType === 'weekly' && renderWeekdaySelect()}

      {recurrenceType === 'monthly' && renderMonthDayInput()}

      {recurrenceType === 'monthly_weekday' && renderMonthlyWeekdayInputs()}

      {renderCompletionBasedToggle()}
    </div>
  );
};

export default RecurrenceInput;