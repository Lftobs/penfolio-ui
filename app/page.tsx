'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Plus, Flame } from 'lucide-react'
import { format } from 'date-fns'
import { getMoodColor, sampleNotes, useNotes } from './hooks/useNotes'

export default function Home() {
  const { notes, isLoading } = useNotes()
  const [searchQuery, setSearchQuery] = useState('')
  const streak = 7
  console.log('Notes:', notes)

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <main className="pt-32 px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded mb-8"></div>
            <div className="h-16 bg-zinc-200 dark:bg-zinc-700 rounded mb-16"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-32 px-6 pb-24">
      {/* Streak Counter */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-3 text-zinc-600 dark:text-zinc-300">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="text-lg">{streak} day streak!</span>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="relative">
          <input
            type="text"
            placeholder="Search through your thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-shadow text-lg dark:text-white"
          />
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      {/* Featured Notes Grid */}
      <div className="max-w-6xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleNotes.slice(0, 6).map((note) => (
            <Link
              href={`/note/${note.id}`}
              key={note.id}
              className="group relative rounded-3xl shadow-sm overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 aspect-[4/5] bg-white dark:bg-zinc-800"
            >
              <div className={`absolute inset-x-0 top-0 h-2 ${note.color}`}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/10 group-hover:to-white/20 transition-opacity dark:from-black/0 dark:via-black/0 dark:to-black/40"></div>
              <div className="p-8 h-full flex flex-col">
                <h2 className="text-3xl font-light mb-3 dark:text-white">{note.title}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                  {note.content.replace(/<[^>]*>/g, '').slice(0, 100)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Notes List */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-medium mb-8 px-4 dark:text-white">Recent Notes</h2>
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Link
              href={`/note/${note.id}`}
              key={note.id}
              className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className={`w-1 h-16 ${getMoodColor(note.mood_tag)} rounded-full`}></div>
                <div>
                  <h3 className="text-xl mb-1 group-hover:text-zinc-800 dark:group-hover:text-blue-300 dark:text-white transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500">{format(note.date_added, 'PPpp')}</p>
                </div>
              </div>
              <ChevronRight className="text-zinc-300 group-hover:text-zinc-800 dark:group-hover:text-white transition-colors w-5 h-5" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Link
        href="/create"
        className="fixed bottom-8 right-8 w-16 h-16 bg-black dark:bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 group"
      >
        <Plus className="w-8 h-8 text-white dark:text-black group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
      </Link>
    </main>
  )
}