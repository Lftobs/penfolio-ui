'use client'
import { useContext } from 'react';
import Link from 'next/link'
import { PenLine, Menu, Sun, Moon, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { getServerCookie, logout } from '../actions/cookieAction'
import { AuthContext } from './context/Auth';
import { useAuth } from '../hooks/useAuth';




export default function Header(): JSX.Element {
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false)
  console.log(user, 'user')

  // --- Event Handlers ---
  const handleSignOut = async () => {
    try {
      logout()
      setShowUserMenu(false);
      router.push('/auth/signin');
      router.refresh();
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
          
          { user != null ? (
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
