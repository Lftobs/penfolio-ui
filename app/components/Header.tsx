'use client'

import Link from 'next/link'
import { PenLine, Menu, Sun, Moon, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
// Correctly import your server actions
import { getServerCookie, logout } from '../actions/cookieAction'

// Define the User interface for type safety
interface User {
  id: string
  username: string
  email: string
}

export default function Header(): JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  // --- State Management ---
  // Initialize user as null. We'll fetch the actual user in an effect.
  const [user, setUser] = useState<User | null>(null)
  // Add a loading state to prevent a "flash" of the wrong UI
  const [isLoading, setIsLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // --- Data Fetching on Component Mount ---
  useEffect(() => {
    // Define an async function inside the effect to fetch user data
    const loadUser = async () => {
      try {
        const userCookie = await getServerCookie('user'); // Await the Server Action
        
        if (userCookie) {
          // If a user cookie exists, parse it and update the state
          setUser(JSON.parse(userCookie) as User);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Ensure user is null if there's an error
        setUser(null);
      } finally {
        // Stop loading once the check is complete
        setIsLoading(false);
      }
    };

    loadUser();
  }, []); // The empty dependency array [] ensures this runs only once on mount

  // --- Event Handlers ---
  const handleSignOut = async () => {
    try {
      await logout(); // Call the server action to delete the cookie
      setUser(null);   // Immediately update the UI by setting user to null
      setShowUserMenu(false); // Hide the user menu
      // Use router.push to navigate and trigger a re-render of the page
      router.push('/auth/signin');
      router.refresh(); // Refresh server components on the new page
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <PenLine className="w-7 h-7 dark:text-white" strokeWidth={1.5} />
          <h1 className="text-3xl font-serif tracking-tight dark:text-white">
            Pen<span className="font-mono text-zinc-400 dark:text-zinc-500">/</span>Folio
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-full transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
            ) : (
              <Moon className="w-6 h-6 text-zinc-700" strokeWidth={1.5} />
            )}
          </button>
          
          {/* --- DYNAMIC AUTH SECTION --- */}
          {isLoading ? (
            // Show a simple placeholder while checking for the user
            <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            // --- USER IS LOGGED IN ---
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <User className="w-6 h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
                <span className="text-sm text-zinc-700 dark:text-zinc-200 hidden sm:block">
                  {user.username}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.username}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // --- USER IS LOGGED OUT ---
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
          
          <button className="p-2 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-full transition-colors">
            <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
}