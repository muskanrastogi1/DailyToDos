"use client"

import React from "react"
import { useState } from "react"
import { Plus, Clock, Flag, Repeat, Tag } from "lucide-react"

const ADD_CATEGORIES = [
  { value: "work", label: "Work" },
  { value: "school", label: "School" },
  { value: "personal", label: "Personal" },
  { value: "health", label: "Health" },
  { value: "job-hunt", label: "Job Hunt" },
]

interface AddTodoProps {
  onAdd: (text: string, timer?: { hours: number; minutes: number }, priority?: number, recurring?: string, category?: string) => void
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState("")
  const [showTimer, setShowTimer] = useState(false)
  const [showPriority, setShowPriority] = useState(false)
  const [showRecurring, setShowRecurring] = useState(false)
  const [showCategory, setShowCategory] = useState(false)
  const [recurringType, setRecurringType] = useState<string>("daily")
  const [categoryValue, setCategoryValue] = useState<string>("")
  const [priorityValue, setPriorityValue] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(30)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      const timer = showTimer && (hours > 0 || minutes > 0)
        ? { hours, minutes }
        : undefined
      const priority = showPriority ? priorityValue : undefined
      const recurring = showRecurring ? recurringType : undefined
      const category = showCategory && categoryValue ? categoryValue : undefined
      onAdd(text.trim(), timer, priority, recurring, category)
      setText("")
      setShowTimer(false)
      setShowPriority(false)
      setShowRecurring(false)
      setShowCategory(false)
      setPriorityValue(0)
      setRecurringType("daily")
      setCategoryValue("")
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
          className="flex-1 border-0 border-b-2 border-dashed border-border bg-transparent py-2 text-xl text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
        />
        <div className="group relative">
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            Priority
          </span>
          <button
            type="button"
            onClick={() => setShowPriority(!showPriority)}
            className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
              showPriority
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <Flag className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="group relative">
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            Category
          </span>
          <button
            type="button"
            onClick={() => setShowCategory(!showCategory)}
            className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
              showCategory
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="group relative">
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            Recurring
          </span>
          <button
            type="button"
            onClick={() => setShowRecurring(!showRecurring)}
            className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
              showRecurring
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="group relative">
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            Timer
          </span>
          <button
            type="button"
            onClick={() => setShowTimer(!showTimer)}
            className={`flex h-10 w-10 items-center justify-center border-2 transition-colors ${
              showTimer
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40 text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="group relative">
          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-xs text-background opacity-0 transition-opacity group-hover:opacity-100">
            Add task
          </span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex h-10 w-10 items-center justify-center border-2 border-foreground text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {showPriority && (
        <div className="flex items-center gap-4 pl-1">
          <span className="font-mono text-base text-muted-foreground">Priority:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-foreground">P</span>
            <input
              type="number"
              min="0"
              max="99"
              value={priorityValue}
              onChange={(e) => setPriorityValue(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
              className="w-14 border-2 border-border bg-transparent px-2 py-1 font-mono text-lg text-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <span className="font-mono text-sm text-muted-foreground">(0 = highest urgency)</span>
        </div>
      )}

      {showCategory && (
        <div className="flex items-center gap-3 pl-1 flex-wrap">
          <span className="font-mono text-base text-muted-foreground">Category:</span>
          {ADD_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategoryValue(categoryValue === cat.value ? "" : cat.value)}
              className={`rounded border px-3 py-1.5 font-mono text-base transition-colors ${
                categoryValue === cat.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {showRecurring && (
        <div className="flex items-center gap-4 pl-1">
          <span className="font-mono text-base text-muted-foreground">Repeat:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRecurringType("daily")}
              className={`rounded border px-3 py-1.5 font-mono text-base transition-colors ${
                recurringType === "daily"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setRecurringType("weekdays")}
              className={`rounded border px-3 py-1.5 font-mono text-base transition-colors ${
                recurringType === "weekdays"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              Weekdays
            </button>
          </div>
        </div>
      )}

      {showTimer && (
        <div className="flex items-center gap-4 pl-1">
          <span className="font-mono text-base text-muted-foreground">Time limit:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
              className="w-14 border-2 border-border bg-transparent px-2 py-1 font-mono text-lg text-foreground focus:border-primary focus:outline-none"
            />
            <span className="font-mono text-base text-muted-foreground">hrs</span>
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
            <span className="font-mono text-base text-muted-foreground">mins</span>
          </div>
        </div>
      )}
    </form>
  )
}
