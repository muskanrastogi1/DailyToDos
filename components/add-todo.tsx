"use client"

import React from "react"
import { useState } from "react"
import { Plus, Clock } from "lucide-react"

interface AddTodoProps {
  onAdd: (text: string, timer?: { hours: number; minutes: number }) => void
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState("")
  const [showTimer, setShowTimer] = useState(false)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      const timer = showTimer && (hours > 0 || minutes > 0) 
        ? { hours, minutes } 
        : undefined
      onAdd(text.trim(), timer)
      setText("")
      setShowTimer(false)
      setHours(0)
      setMinutes(30)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a new task..."
          className="flex-1 border-0 border-b-2 border-dashed border-border bg-transparent py-2 text-2xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowTimer(!showTimer)}
          className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
            showTimer 
              ? "border-primary bg-primary text-primary-foreground" 
              : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
          title="Add timer"
        >
          <Clock className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-10 w-10 items-center justify-center border-2 border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>

      {showTimer && (
        <div className="flex items-center gap-4 pl-1">
          <span className="font-mono text-sm text-muted-foreground">Time limit:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-14 border-2 border-border bg-transparent px-2 py-1 font-mono text-lg text-foreground focus:border-primary focus:outline-none"
            />
            <span className="font-mono text-sm text-muted-foreground">hrs</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-14 border-2 border-border bg-transparent px-2 py-1 font-mono text-lg text-foreground focus:border-primary focus:outline-none"
            />
            <span className="font-mono text-sm text-muted-foreground">mins</span>
          </div>
        </div>
      )}
    </form>
  )
}
