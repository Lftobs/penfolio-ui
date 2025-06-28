'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Save, ArrowLeft, ImagePlus } from 'lucide-react'
// Adjust the import path based on your project structure
import { useNotes, getMoodColor, Note } from '../hooks/useNotes'

// A constant for our mood data. This keeps data separate from display.
const MOODS: { name: string; value: Note['mood_tag'] }[] = [
  { name: 'Merry', value: 'MERRY' },
  { name: 'Gloomy', value: 'GLOOMY' },
  { name: 'Covert', value: 'COVERT' },
]

export default function CreateNote() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- Mode Detection ---
  // Check for an 'edit' parameter in the URL.
  const editId = searchParams.get('edit') ? parseInt(searchParams.get('edit')!, 10) : null
  const isEditMode = editId !== null

  // --- Hooks and State ---
  const { notes, saveNote, updateNote, isLoading } = useNotes()
  
  // Find the specific note to edit from the notes list
  const noteToEdit = isEditMode ? notes.filter(Boolean).find(n => n.id === editId) : undefined

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<Note['mood_tag']>(MOODS[0].value)
  const [isSaving, setIsSaving] = useState(false)
  
  // State for the rich text editor
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- Effect to Populate Form for Editing ---
  // This runs when the component loads or when note data becomes available.
  useEffect(() => {
    if (isEditMode) {
      if (!noteToEdit) {
        // If in edit mode but note is not found, do nothing (handled in render)
        return
      }
      setTitle(noteToEdit.title)
      setContent(noteToEdit.content)
      setSelectedMood(noteToEdit.mood_tag)

      // Directly set the HTML for the contentEditable div
      if (editorRef.current) {
        editorRef.current.innerHTML = noteToEdit.content
      }
    }
  }, [isEditMode, noteToEdit])

  // --- Event Handlers ---
  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result && editorRef.current) {
          const img = document.createElement('img')
          img.src = e.target.result as string
          img.className = 'max-w-full rounded-lg my-4'
          editorRef.current.appendChild(img)
          setContent(editorRef.current.innerHTML)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title for your note.')
      return
    }
    setIsSaving(true)

    const noteData = {
      title: title.trim(),
      content: content || '<p>Empty note</p>', // Use paragraph tags for consistency
      mood_tag: selectedMood,
      date_added: new Date().toISOString(), // Add the required date_added property
    }

    try {
      if (isEditMode && editId) {
        // --- UPDATE LOGIC ---
        console.log("Updating note with ID:", editId, noteData)
        await updateNote(editId, noteData)
        router.push(`/note/${editId}`) // Go back to the detail page
      } else {
        // --- CREATE LOGIC ---
       await saveNote(noteData)
        router.push('/') // Go to the home page
      }
    } catch (error) {
      console.error("Failed to save the note:", error)
      alert("An error occurred while saving. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }
  
  // If we are in edit mode but the note hasn't loaded yet, show a loader.
  if (isEditMode && isLoading) {
    return <div className="pt-32 px-6 text-center">Loading note data...</div>
  }
  
  // If we are in edit mode but the note wasn't found after loading.
  if(isEditMode && !isLoading && !noteToEdit) {
    return <div className="pt-32 px-6 text-center">Note with ID {editId} not found.</div>
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
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : isEditMode ? 'Update Note' : 'Save Note'}</span>
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 shadow-sm">
          
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-light mb-6 bg-transparent focus:outline-none dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />

          <div className="flex gap-3 mb-8">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                title={mood.name}
                className={`w-8 h-8 rounded-full transition-all ${getMoodColor(mood.value)} ${
                  selectedMood === mood.value ? 'ring-2 ring-offset-2 ring-zinc-500 dark:ring-offset-zinc-800' : 'ring-0'
                }`}
              />
            ))}
          </div>

          <div className="relative">
            <label
              className="absolute right-4 top-4 cursor-pointer hover:opacity-75 transition-opacity z-10"
              htmlFor="image-upload"
            >
              <ImagePlus className="w-6 h-6 text-zinc-400" />
              <input
                ref={fileInputRef}
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
            </label>

            <div
              ref={editorRef}
              className={`min-h-[200px] p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 transition-all prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 ${
                isDragging ? 'bg-zinc-100 dark:bg-zinc-700' : 'bg-transparent'
              }`}
              contentEditable
              onInput={handleContentChange}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              suppressContentEditableWarning={true}
            >
              {/* The content is set via useEffect for edit mode. For create mode, the div is empty. */}
            </div>

            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-lg pointer-events-none">
                <p className="text-lg text-zinc-600 dark:text-zinc-300">Drop image here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}