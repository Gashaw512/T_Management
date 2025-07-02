import { Note } from "../entities/Note";
import { handleAuthResponse, getDefaultHeaders, getPostHeaders } from "./http";

export const fetchNotes = async (): Promise<Note[]> => {
  const response = await fetch("/api/notes", {
    credentials: 'include',
    headers: getDefaultHeaders(),
  });

  // Use the response returned from handleAuthResponse
  const handledResponse = await handleAuthResponse(response, 'Failed to fetch notes.');

  return await handledResponse.json(); // Call .json() on the handled response
};

export const createNote = async (noteData: Note): Promise<Note> => {
  // Removed the outer try...catch as handleAuthResponse will throw errors,
  // and the calling component should handle them.
  const response = await fetch('/api/note', {
    method: 'POST',
    credentials: 'include',
    headers: getPostHeaders(),
    body: JSON.stringify(noteData),
  });

  // Use the response returned from handleAuthResponse
  const handledResponse = await handleAuthResponse(response, 'Failed to create note.');
  return await handledResponse.json(); // Call .json() on the handled response
};

export const updateNote = async (noteId: number, noteData: Note): Promise<Note> => {
  const response = await fetch(`/api/note/${noteId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getPostHeaders(),
    body: JSON.stringify(noteData),
  });

  // Use the response returned from handleAuthResponse
  const handledResponse = await handleAuthResponse(response, 'Failed to update note.');
  return await handledResponse.json(); // Call .json() on the handled response
};

export const deleteNote = async (noteId: number): Promise<void> => {
  const response = await fetch(`/api/note/${noteId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getDefaultHeaders(),
  });

  // No return value needed, just ensure the response was handled successfully
  await handleAuthResponse(response, 'Failed to delete note.');
};