'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'; 
import { ArrowLeft, Edit2, Trash2, Twitter } from 'lucide-react'
import { getMoodColor, useNotes } from '../../hooks/useNotes'

export default function NoteDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { notes, deleteNote, isLoading } = useNotes()
  const noteId = parseInt(params.id)
  const note = notes.find(n => n && n.id === noteId)

  const handleTwitterShare = () => {
    if (!note) return
    const tweetText = `${note.title}\n\n${note.content.replace(/<[^>]*>/g, '').slice(0, 240)}...`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank')
  }

  const handleDelete = () => {
    if (!note) return
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id)
      router.push('/')
    }
  }

  if (isLoading) {
    return (
      <main className="pt-32 px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded mb-8"></div>
            <div className="h-96 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!note) {
    return (
      <main className="pt-32 px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-light mb-4 dark:text-white">Note not found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Go back home
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-32 px-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleTwitterShare}
              className="flex items-center gap-2 px-4 py-2 text-[#1DA1F2] hover:text-[#1a8cd8] transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span>Share on Twitter</span>
            </button>
             <Link
              href={`/create?edit=${note.id}`} // Pass note ID as a query param
              className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Edit2 className="w-5 h-5" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <article className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm">
          <div className={`w-full h-2 ${getMoodColor(note.mood_tag)} rounded-full mb-8`} />
          
          <h1 className="text-4xl font-light mb-4 dark:text-white">{note.title}</h1>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-8">{note.date_added}</p>
          
          <div 
            className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </article>
      </div>
    </main>
  )
}