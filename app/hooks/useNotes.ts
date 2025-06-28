'use client'

// file: hooks/useNotes.ts

import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';
import { getServerCookie } from '../actions/cookieAction';


// The Note interface remains the same, but now the backend is the source of truth.
export interface Note {
  id: number;
  title: string;
  content: string;
  mood_tag: 'MERRY' | 'GLOOMY' | 'COVERT';
  date_added: string; // Assuming the backend provides a formatted date string
}

export interface DemoNote {
  id: number;
  title: string;
  content: string;
  color: string
}

type MoodTag = Note['mood_tag'];

export const MOOD_COLOR_MAP: Record<MoodTag, string> = {
  MERRY: 'bg-[#FF6B6B]',  // Cheerful Red/Pink
  GLOOMY: 'bg-[#4ECDC4]', // Calm Teal/Blue
  COVERT: 'bg-[#FFD93D]', // Mysterious Yellow/Gold
};

/**
 * A helper function to safely get the color for a given mood.
 * It provides a default color if the mood is somehow invalid.
 * @param mood - The mood tag from the note.
 * @returns A Tailwind CSS color class string.
 */
export const getMoodColor = (mood: MoodTag): string => {
  return MOOD_COLOR_MAP[mood] || 'bg-gray-400'; // Fallback color
};

// Define the type for a new note, which won't have an id or date yet.
type NewNote = Omit<Note, 'id' | 'date'>;

export const sampleNotes: DemoNote[] = [
  {
    id: 1,
    title: 'Merry',
    content: 'Thoughts on a bright day filled with sunshine and possibilities. The world seems more vibrant when we approach it with joy.',
    color: 'bg-[#FF6B6B]'
  },
  {
    id: 2,
    title: 'Gloomy',
    content: 'Reflections in the rain, watching droplets cascade down the window. Sometimes the gray days bring the most profound insights.', // Using the enum value directly
    color: 'bg-[#4ECDC4]'
  },
  {
    id: 3,
    title: 'Covert',
    content: 'Secret midnight musings when the world is quiet and thoughts flow freely. These are the moments of pure creativity.',
    color: 'bg-[#FFD93D]'
  }
]

export function useNotes() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true); // To track initial data loading
  const [error, setError] = useState<string | null>(null);
  

  const fetchAccessToken = async (name: string) => {
      // Fetch the access token from cookies or server-side
      const token = await getServerCookie(name);
      if (token) {
        return token;
      } else {
        return undefined
      }
    }
    

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = await fetchAccessToken('accessToken');
      const response = await fetch(`${BASE_URL}/api/journals/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include any necessary authentication headers here
          'Authorization': `Bearer ${accessToken}`,
          'Access-Control-Allow-Origin': '*' // Example if using JWT
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notes from the server.');
      }
      const data = await response.json();
      console.log('Fetched notes:', data); // Debugging log
      setNotes(data.data.items || []); 
    } catch (err: any) {
      setError(err.message);
      setNotes([]); // Clear notes on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // --- CRUD Operations ---

  const saveNote = async (note: NewNote) => {
    try {
      const accessToken = await fetchAccessToken('accessToken');
      console.log('Saving note with access token:', accessToken); // Debugging log
      const response = await fetch(`${BASE_URL}/api/journals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' ,  'Authorization': `Bearer ${accessToken}`},
        body: JSON.stringify(note),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note.');
      }

      const newNote: Note = (await response.json()).data;
      
      // Add the new note to the top of the list in the UI
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      return newNote;

    } catch (err: any) {
      setError(err.message);
      // We return null or re-throw the error to let the caller know it failed
      throw err;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      const accessToken = await fetchAccessToken('accessToken');
      const response = await fetch(`${BASE_URL}/api/journals/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note.');
      }
      
      // Update UI by removing the deleted note
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

    } catch (err: any) {
        setError(err.message);
        throw err;
    }
  };

  const updateNote = async (id: number, updates: Partial<Omit<Note, 'id' | 'date'>>) => {
     try {
      const accessToken = await fetchAccessToken('accessToken');
      const response = await fetch(`${BASE_URL}/api/journals/${id}`, {
        method: 'PUT', // or 'PATCH'
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update note.');
      }

      const updatedNote: Note = (await response.json()).data;
      
      // Update the specific note in the UI
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? updatedNote : note))
      );
      return updatedNote;

    } catch (err: any) {
        setError(err.message);
        throw err;
    }
  };

  // The 'mounted' state is replaced by more descriptive 'isLoading' and 'error' states
  return {
    notes,
    saveNote,
    deleteNote,
    updateNote,
    isLoading,
    error,
    refetch: fetchNotes, // Expose a function to manually refetch data
  };
}