import React, { useEffect } from 'react';
import { Location } from 'react-router-dom';
// Removed useTranslation import
// import { useTranslation } from 'react-i18next';
import {
  CalendarDaysIcon,
  CalendarIcon,
  // ArrowRightCircleIcon, // This icon was imported but not used, so it's removed for cleaner code
  InboxIcon,
  // CheckCircleIcon, // This icon was imported but not used, so it's removed for cleaner code
  ListBulletIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
import { useStore } from '../../store/useStore';
import { loadInboxItemsToStore } from '../../utils/inboxService';

interface SidebarNavProps {
  handleNavClick: (path: string, title: string, icon: JSX.Element) => void;
  location: Location;
  isDarkMode: boolean;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ handleNavClick, location }) => {
  // Removed useTranslation hook call
  // const { t } = useTranslation();
  const store = useStore();

  // Get inbox items count for badge
  const inboxItemsCount = store.inboxStore.inboxItems.length;

  // Load inbox items when component mounts to ensure badge shows correct count
  useEffect(() => {
    loadInboxItemsToStore().catch(console.error);
  }, []);

  const navLinks = [
    { path: '/inbox', title: 'Inbox', icon: <InboxIcon className="h-5 w-5" /> }, // Hardcoded string
    { path: '/today', title: 'Today', icon: <CalendarDaysIcon className="h-5 w-5" />, query: 'type=today' }, // Hardcoded string
    { path: '/tasks?type=upcoming', title: 'Upcoming', icon: <ClockIcon className="h-5 w-5" />, query: 'type=upcoming' }, // Hardcoded string
    { path: '/tasks', title: 'All Tasks', icon: <ListBulletIcon className="h-5 w-5" /> }, // Hardcoded string
    { path: '/calendar', title: 'Calendar', icon: <CalendarIcon className="h-5 w-5" /> }, // Hardcoded string
  ];

  const isActive = (path: string, query?: string) => {
    // Handle special case for paths without query parameters
    if (path === '/inbox' || path === '/today' || path === '/calendar') {
      const isPathMatch = location.pathname === path;
      return isPathMatch
        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        : 'text-gray-700 dark:text-gray-300';
    }

    // Regular case for /tasks with query params
    const isPathMatch = location.pathname === '/tasks';
    const isQueryMatch = query ? location.search.includes(query) : location.search === '';
    return isPathMatch && isQueryMatch
      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
      : 'text-gray-700 dark:text-gray-300';
  };

  return (
    <ul className="flex flex-col space-y-1">
      {navLinks.map((link) => (
        <React.Fragment key={link.path}>
          <li>
            <button
              onClick={() => handleNavClick(link.path, link.title, link.icon)}
              className={`w-full text-left px-4 py-1 flex items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${isActive(
                link.path,
                link.query
              )}`}
            >
              <div className="flex items-center">
                {link.icon}
                <span className="ml-2">{link.title}</span>
              </div>
              {link.path === '/inbox' && inboxItemsCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                  {inboxItemsCount > 99 ? '99+' : inboxItemsCount}
                </span>
              )}
            </button>
          </li>
          {link.path === '/inbox' && (
            <li className="py-1" />
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default SidebarNav;