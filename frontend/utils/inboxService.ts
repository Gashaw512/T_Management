import { InboxItem } from "../entities/InboxItem";
import { useStore } from "../store/useStore";
import { handleAuthResponse, getDefaultHeaders, getPostHeaders } from "./http";

// API functions

/**
 * Fetches all inbox items from the API.
 * @returns {Promise<InboxItem[]>} A promise that resolves with an array of InboxItem objects.
 */
export const fetchInboxItems = async (): Promise<InboxItem[]> => {
  const response = await fetch('/api/inbox', {
    credentials: 'include',
    headers: getDefaultHeaders(), // <<< USE getDefaultHeaders() for GET requests
  });

  const handledResponse = await handleAuthResponse(response, 'Failed to fetch inbox items.');

  const result = await handledResponse.json(); // Use handledResponse here

  if (!Array.isArray(result)) {
    throw new Error('Resulting inbox items are not an array.');
  }

  return result;
};

/**
 * Creates a new inbox item via the API.
 * @param {string} content - The content of the inbox item.
 * @param {string} [source] - Optional source of the inbox item (e.g., 'telegram').
 * @returns {Promise<InboxItem>} A promise that resolves with the newly created InboxItem.
 */
export const createInboxItem = async (content: string, source?: string): Promise<InboxItem> => {
  const response = await fetch('/api/inbox', {
    method: 'POST',
    credentials: 'include',
    headers: getPostHeaders(), // <<< USE getPostHeaders() for POST requests with body
    body: JSON.stringify(source ? { content, source } : { content }),
  });

  const handledResponse = await handleAuthResponse(response, 'Failed to create inbox item.');
  return await handledResponse.json(); // Use handledResponse here
};

/**
 * Updates an existing inbox item via the API.
 * @param {number} itemId - The ID of the inbox item to update.
 * @param {string} content - The new content for the inbox item.
 * @returns {Promise<InboxItem>} A promise that resolves with the updated InboxItem.
 */
export const updateInboxItem = async (itemId: number, content: string): Promise<InboxItem> => {
  const response = await fetch(`/api/inbox/${itemId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getPostHeaders(), // <<< USE getPostHeaders() for PATCH requests with body
    body: JSON.stringify({ content }),
  });

  const handledResponse = await handleAuthResponse(response, 'Failed to update inbox item.');
  return await handledResponse.json(); // Use handledResponse here
};

/**
 * Marks an inbox item as processed via the API.
 * @param {number} itemId - The ID of the inbox item to process.
 * @returns {Promise<InboxItem>} A promise that resolves with the processed InboxItem.
 */
export const processInboxItem = async (itemId: number): Promise<InboxItem> => {
  const response = await fetch(`/api/inbox/${itemId}/process`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getDefaultHeaders(), // <<< USE getDefaultHeaders() for PATCH without body, or if backend expects only Accept header
  });

  const handledResponse = await handleAuthResponse(response, 'Failed to process inbox item.');
  return await handledResponse.json(); // Use handledResponse here
};

/**
 * Deletes an inbox item via the API.
 * @param {number} itemId - The ID of the inbox item to delete.
 * @returns {Promise<void>} A promise that resolves when the item is successfully deleted.
 */
export const deleteInboxItem = async (itemId: number): Promise<void> => {
  const response = await fetch(`/api/inbox/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getDefaultHeaders(), // <<< USE getDefaultHeaders() for DELETE requests
  });

  await handleAuthResponse(response, 'Failed to delete inbox item.');
  // No return data expected for DELETE success
};

// Track last check time to detect new items
let lastCheckTimestamp = Date.now();

// Store-aware functions

/**
 * Loads inbox items from the API and updates the Zustand store.
 * Dispatches a custom event 'inboxItemsUpdated' if new Telegram items are detected.
 * @returns {Promise<void>}
 */
export const loadInboxItemsToStore = async (): Promise<void> => {
  const inboxStore = useStore.getState().inboxStore;
  // Only show loading for initial load
  if (inboxStore.inboxItems.length === 0) {
    inboxStore.setLoading(true);
  }

  try {
    const items = await fetchInboxItems();

    // Check for new items since last check
    const currentItemIds = new Set(inboxStore.inboxItems.map(item => item.id));
    const currentTime = Date.now();

    // New telegram items
    const newTelegramItems = items.filter(item =>
      item.id &&
      !currentItemIds.has(item.id) &&
      item.source === 'telegram'
    );

    // Only show notifications if we have detected changes and existing items
    if (inboxStore.inboxItems.length > 0 && newTelegramItems.length > 0) {
      // Get some minimal info about the items for the notification
      const notificationData = {
        count: newTelegramItems.length,
        firstItemContent: newTelegramItems[0].content.substring(0, 30) +
                         (newTelegramItems[0].content.length > 30 ? '...' : '')
      };

      // Dispatch a custom event with the notification data
      window.dispatchEvent(new CustomEvent('inboxItemsUpdated', {
        detail: notificationData
      }));
    }

    // Update state and timestamp
    inboxStore.setInboxItems(items);
    inboxStore.setError(false);
    lastCheckTimestamp = currentTime;
  } catch (error) {
    console.error('Failed to load inbox items:', error);
    inboxStore.setError(true);
  } finally {
    inboxStore.setLoading(false);
  }
};

/**
 * Creates a new inbox item via API and adds it to the Zustand store.
 * @param {string} content - The content of the inbox item.
 * @param {string} [source] - Optional source of the inbox item.
 * @returns {Promise<InboxItem>} A promise that resolves with the created InboxItem.
 */
export const createInboxItemWithStore = async (content: string, source?: string): Promise<InboxItem> => {
  const inboxStore = useStore.getState().inboxStore;

  try {
    const newItem = await createInboxItem(content, source);
    inboxStore.addInboxItem(newItem);
    return newItem;
  } catch (error) {
    console.error('Failed to create inbox item:', error);
    throw error;
  }
};

/**
 * Updates an inbox item via API and updates it in the Zustand store.
 * @param {number} itemId - The ID of the inbox item.
 * @param {string} content - The new content.
 * @returns {Promise<InboxItem>} A promise that resolves with the updated InboxItem.
 */
export const updateInboxItemWithStore = async (itemId: number, content: string): Promise<InboxItem> => {
  const inboxStore = useStore.getState().inboxStore;

  try {
    const updatedItem = await updateInboxItem(itemId, content);
    inboxStore.updateInboxItem(updatedItem);
    return updatedItem;
  } catch (error) {
    console.error('Failed to update inbox item:', error);
    throw error;
  }
};

/**
 * Processes an inbox item via API and removes it from the Zustand store.
 * @param {number} itemId - The ID of the inbox item to process.
 * @returns {Promise<InboxItem>} A promise that resolves with the processed InboxItem.
 */
export const processInboxItemWithStore = async (itemId: number): Promise<InboxItem> => {
  const inboxStore = useStore.getState().inboxStore;

  try {
    const processedItem = await processInboxItem(itemId);
    inboxStore.removeInboxItem(itemId); // Item is "processed" so it should be removed from inbox view
    return processedItem;
  } catch (error) {
    console.error('Failed to process inbox item:', error);
    throw error;
  }
};

/**
 * Deletes an inbox item via API and removes it from the Zustand store.
 * @param {number} itemId - The ID of the inbox item to delete.
 * @returns {Promise<void>}
 */
export const deleteInboxItemWithStore = async (itemId: number): Promise<void> => {
  const inboxStore = useStore.getState().inboxStore;

  try {
    await deleteInboxItem(itemId);
    inboxStore.removeInboxItem(itemId);
  } catch (error) {
    console.error('Failed to delete inbox item:', error);
    throw error;
  }
};