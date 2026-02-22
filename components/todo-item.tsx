"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { X, Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Plus, Minus, StickyNote, ChevronDown, ChevronUp, Repeat, Flame, ListChecks, AlarmClock, Ban, CirclePlay, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface Subtask {
  id: string
  text: string
  completed: boolean
}

interface CategoryDef {
  value: string
  label: string
  color: string
}

interface TodoItemProps {
  id: string
  text: string
  completed: boolean
  notes?: string
  deadline?: number
  timerDuration?: number
  priority?: number
  recurring?: string
  streak?: number
  subtasks?: Subtask[]
  category?: string
  snoozedUntil?: string
  status?: string
  categories?: CategoryDef[]
  createdAt?: string
  activeTimerId: string | null
  onComplete: (id: string, rect: DOMRect) => void
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onNotesChange: (id: string, notes: string) => void
  onPriorityChange: (id: string, newPriority: number | undefined) => void
  onSubtasksChange: (id: string, subtasks: Subtask[]) => void
  onSnooze: (id: string, until: string | undefined) => void
  onStatusChange: (id: string, status: string) => void
  onTimeUp?: (id: string) => void
  onTimerStart: (id: string) => void
  onTimerStop: () => void
}

function getDaysOld(createdAt?: string): number {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function getStaleColor(days: number): string {
  if (days >= 7) return "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400"
  if (days >= 4) return "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400"
  return "bg-muted text-muted-foreground border-border"
}

function getPriorityColor(priority: number): string {
  if (priority === 0) return "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-400"
  if (priority === 1) return "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400"
  if (priority === 2) return "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400"
  return "bg-muted text-muted-foreground border-border"
}

const MAGIC_MESSAGES = [
  "Nice work!",
  "Done!",
  "Checked off!",
  "Complete!",
  "Got it!",
  "Finished!",
  "Yes!",
  "Great!",
  "Perfect!",
  "Boom!",
]

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00"
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function TodoItem({
  id,
  text,
  completed,
  notes,
  timerDuration,
  priority,
  recurring,
  streak,
  subtasks,
  category,
  snoozedUntil,
  status,
  categories,
  createdAt,
  activeTimerId,
  onComplete,
  onDelete,
  onEdit,
  onNotesChange,
  onPriorityChange,
  onSubtasksChange,
  onSnooze,
  onStatusChange,
  onTimeUp,
  onTimerStart,
  onTimerStop
}: TodoItemProps) {
  const [inputValue, setInputValue] = useState("")
  const [showMagic, setShowMagic] = useState(false)
  const [magicMessage, setMagicMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const [showNotes, setShowNotes] = useState(!!notes)
  const [notesText, setNotesText] = useState(notes || "")
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration || 0)
  const [totalDuration, setTotalDuration] = useState<number>(timerDuration || 0)
  const [isExpired, setIsExpired] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [extendMinutes, setExtendMinutes] = useState(5)
  const [editingPriority, setEditingPriority] = useState(false)
  const [priorityInput, setPriorityInput] = useState(priority != null ? String(priority) : "")
  const [showSubtasks, setShowSubtasks] = useState(!!(subtasks && subtasks.length > 0))
  const [newSubtaskText, setNewSubtaskText] = useState("")
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const musicNodesRef = useRef<{ oscillators: OscillatorNode[], gains: GainNode[] } | null>(null)

  const isThisTimerActive = activeTimerId === id
  const hasTimer = timerDuration && timerDuration > 0

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playTick = useCallback(() => {
    if (!soundEnabled) return
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }, [soundEnabled, getAudioContext])

  const playComplete = useCallback(() => {
    if (!soundEnabled) return
    const ctx = getAudioContext()
    
    const notes = [523.25, 659.25, 783.99, 1046.50]
    
    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = freq
      oscillator.type = "sine"
      
      const startTime = ctx.currentTime + i * 0.15
      gainNode.gain.setValueAtTime(0.15, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.4)
    })
  }, [soundEnabled, getAudioContext])

  const playAlarm = useCallback(() => {
    if (!soundEnabled) return
    const ctx = getAudioContext()
    
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 880
      oscillator.type = "square"
      
      const startTime = ctx.currentTime + i * 0.3
      gainNode.gain.setValueAtTime(0.1, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.2)
    }
  }, [soundEnabled, getAudioContext])

  const startAmbientMusic = useCallback(() => {
    const ctx = getAudioContext()
    
    const frequencies = [130.81, 164.81, 196.00, 261.63]
    const oscillators: OscillatorNode[] = []
    const gains: GainNode[] = []
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      filter.type = "lowpass"
      filter.frequency.value = 800
      
      osc.connect(gain)
      gain.connect(filter)
      filter.connect(ctx.destination)
      
      osc.frequency.value = freq
      osc.type = "sine"
      
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.03 + (i * 0.005), ctx.currentTime + 2)
      
      osc.start()
      oscillators.push(osc)
      gains.push(gain)
    })
    
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.1
    lfoGain.gain.value = 5
    lfo.connect(lfoGain)
    oscillators.forEach(osc => lfoGain.connect(osc.frequency))
    lfo.start()
    oscillators.push(lfo)
    gains.push(lfoGain)
    
    musicNodesRef.current = { oscillators, gains }
  }, [getAudioContext])

  const stopAmbientMusic = useCallback(() => {
    if (musicNodesRef.current) {
      const ctx = getAudioContext()
      musicNodesRef.current.gains.forEach(gain => {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      })
      setTimeout(() => {
        musicNodesRef.current?.oscillators.forEach(osc => {
          try { osc.stop() } catch {}
        })
        musicNodesRef.current = null
      }, 600)
    }
  }, [getAudioContext])

  useEffect(() => {
    if (musicEnabled && isThisTimerActive && !isPaused && !showPrompt) {
      startAmbientMusic()
    } else {
      stopAmbientMusic()
    }
    
    return () => {
      stopAmbientMusic()
    }
  }, [musicEnabled, isThisTimerActive, isPaused, showPrompt, startAmbientMusic, stopAmbientMusic])

  useEffect(() => {
    if (timerDuration) {
      setTimeLeft(timerDuration)
      setTotalDuration(timerDuration)
      setIsExpired(false)
    }
  }, [timerDuration])

  useEffect(() => {
    if (!isThisTimerActive || isPaused || completed || timeLeft <= 0) {
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000
        
        if (newTime > 0 && newTime % 30000 === 0) {
          playTick()
        }
        
        if (newTime <= 5000 && newTime > 0) {
          playTick()
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isThisTimerActive, isPaused, completed, timeLeft, playTick])

  // Handle timer expiration separately to avoid setState during render
  useEffect(() => {
    if (timeLeft <= 0 && isThisTimerActive && !isExpired && !completed) {
      playAlarm()
      setIsExpired(true)
      setShowPrompt(true)
      onTimeUp?.(id)
      onTimerStop()
    }
  }, [timeLeft, isThisTimerActive, isExpired, completed, id, onTimeUp, onTimerStop, playAlarm])

  const handleStartTimer = () => {
    if (timeLeft <= 0 && totalDuration) {
      setTimeLeft(totalDuration)
      setIsExpired(false)
    }
    setIsPaused(false)
    setShowPrompt(false)
    onTimerStart(id)
  }

  const handlePauseTimer = () => {
    setIsPaused(true)
  }

  const handleResumeTimer = () => {
    setIsPaused(false)
  }

  const handleResetTimer = () => {
    if (totalDuration) {
      setTimeLeft(totalDuration)
      setIsExpired(false)
      setIsPaused(false)
      setShowPrompt(false)
      onTimerStop()
    }
  }

  const handleYesDone = () => {
    setShowPrompt(false)
    triggerComplete()
  }

  const handleExtendTimer = () => {
    const extraTime = extendMinutes * 60 * 1000
    setTimeLeft(extraTime)
    setTotalDuration((prev) => prev + extraTime)
    setIsExpired(false)
    setShowPrompt(false)
    onTimerStart(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.toLowerCase().trim() === "done") {
      e.preventDefault()
      triggerComplete()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const triggerComplete = () => {
    if (completed) return
    
    const rect = itemRef.current?.getBoundingClientRect()
    if (rect) {
      playComplete()
      setMagicMessage(MAGIC_MESSAGES[Math.floor(Math.random() * MAGIC_MESSAGES.length)])
      setShowMagic(true)
      onComplete(id, rect)
      setInputValue("")
      if (isThisTimerActive) {
        onTimerStop()
      }
      
      setTimeout(() => setShowMagic(false), 2000)
    }
  }

  const handleStartEditing = () => {
    if (completed) return
    setIsEditing(true)
    setEditText(text)
  }

  const handleSaveEdit = () => {
    const trimmedText = editText.trim()
    if (trimmedText && trimmedText !== text) {
      onEdit(id, trimmedText)
    }
    setIsEditing(false)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditText(text)
    }
  }

  const handleNotesChange = (value: string) => {
    setNotesText(value)
    // Debounce saving notes to avoid too many DB writes
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current)
    }
    notesTimeoutRef.current = setTimeout(() => {
      onNotesChange(id, value)
    }, 500)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current)
      }
    }
  }, [])

  const isUrgent = timeLeft > 0 && timeLeft < 60000
  const progress = hasTimer && totalDuration ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0

  return (
    <div
      ref={itemRef}
      className={cn(
        "group relative flex items-start gap-4 border-b border-ruled-line py-3 transition-all",
        completed && "opacity-60",
        isExpired && !completed && "bg-destructive/10"
      )}
    >
      {/* Priority badge */}
      {!completed && (
        <div className="mt-1 flex-shrink-0">
          {editingPriority ? (
            <div className="flex items-center gap-1">
              <span className="font-mono text-sm font-bold">P</span>
              <input
                type="number"
                min="0"
                max="99"
                value={priorityInput}
                onChange={(e) => setPriorityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    const val = parseInt(priorityInput)
                    onPriorityChange(id, isNaN(val) ? undefined : Math.max(0, Math.min(99, val)))
                    setEditingPriority(false)
                  } else if (e.key === "Escape") {
                    setEditingPriority(false)
                    setPriorityInput(priority != null ? String(priority) : "")
                  }
                }}
                onBlur={() => {
                  const val = parseInt(priorityInput)
                  onPriorityChange(id, isNaN(val) ? undefined : Math.max(0, Math.min(99, val)))
                  setEditingPriority(false)
                }}
                autoFocus
                placeholder="-"
                className="w-10 border-b-2 border-primary bg-transparent text-center font-mono text-sm text-foreground focus:outline-none"
              />
            </div>
          ) : priority != null ? (
            <button
              onClick={() => {
                setPriorityInput(String(priority))
                setEditingPriority(true)
              }}
              className={cn(
                "rounded-sm border px-1.5 py-0.5 font-mono text-base font-bold transition-colors hover:opacity-80",
                getPriorityColor(priority)
              )}
              title="Click to change priority"
            >
              P{priority}
            </button>
          ) : (
            <button
              onClick={() => {
                setPriorityInput("0")
                setEditingPriority(true)
              }}
              className="rounded-sm border border-dashed border-border px-2 py-1 font-mono text-base text-muted-foreground/50 transition-colors hover:border-foreground hover:text-foreground"
              title="Set priority"
            >
              P?
            </button>
          )}
        </div>
      )}
      {completed && priority != null && (
        <div className="mt-1 flex-shrink-0">
          <span className={cn(
            "rounded-sm border px-1.5 py-0.5 font-mono text-base font-bold opacity-60",
            getPriorityColor(priority)
          )}>
            P{priority}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        {/* Task text - editable */}
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleSaveEdit}
            autoFocus
            className="w-full border-b-2 border-primary bg-transparent text-xl leading-tight text-foreground focus:outline-none"
          />
        ) : (
          <div className="flex items-baseline gap-2">
            <span
              onClick={handleStartEditing}
              className={cn(
                "text-xl leading-tight transition-all",
                completed && "text-muted-foreground line-through decoration-2",
                isExpired && !completed && "text-destructive",
                !completed && "cursor-pointer hover:text-primary"
              )}
              title={!completed ? "Click to edit" : undefined}
            >
              {text}
            </span>
            {category && categories && (() => {
              const cat = categories.find(c => c.value === category)
              return cat ? (
                <span className={cn("inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono text-sm font-medium leading-none", cat.color)}>
                  <Tag className="h-3 w-3" />
                  {cat.label}
                </span>
              ) : null
            })()}
            {status === 'blocked' && (
              <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-mono text-sm font-medium leading-none text-red-600 dark:text-red-400">
                <Ban className="h-3 w-3" />
                blocked
              </span>
            )}
            {snoozedUntil && (
              <span className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-sm font-medium leading-none text-indigo-600 dark:text-indigo-400">
                <AlarmClock className="h-3 w-3" />
                {new Date(snoozedUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {recurring && (
              <span
                className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-sm font-medium leading-none text-primary"
                title={`Repeats ${recurring}`}
              >
                <Repeat className="h-3 w-3" />
                {recurring === "weekdays" ? "wkdays" : "daily"}
              </span>
            )}
            {recurring && streak != null && streak > 0 && (
              <span
                className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-sm border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 font-mono text-sm font-medium leading-none text-orange-600 dark:text-orange-400"
                title={`${streak}-day streak`}
              >
                <Flame className="h-3 w-3" />
                {streak}d
              </span>
            )}
            {!completed && !recurring && getDaysOld(createdAt) >= 2 && (
              <span
                className={cn(
                  "inline-flex flex-shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-sm font-medium leading-none",
                  getStaleColor(getDaysOld(createdAt))
                )}
                title={`Created ${getDaysOld(createdAt)} days ago`}
              >
                {getDaysOld(createdAt)}d old
              </span>
            )}
          </div>
        )}

        {/* Timer Up Prompt */}
        {showPrompt && !completed && (
          <div className="rounded border-2 border-primary bg-card p-4 shadow-md">
            <p className="mb-3 text-xl font-semibold text-foreground">
              Time is up! Are you done?
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleYesDone}
                className="rounded border-2 border-primary bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Yes, I'm done!
              </button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">Need more time?</span>
                <div className="flex items-center gap-1 rounded border border-border">
                  <button
                    onClick={() => setExtendMinutes(Math.max(1, extendMinutes - 5))}
                    className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                    aria-label="Decrease time"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-12 text-center font-mono text-sm">{extendMinutes}m</span>
                  <button
                    onClick={() => setExtendMinutes(Math.min(60, extendMinutes + 5))}
                    className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-muted"
                    aria-label="Increase time"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={handleExtendTimer}
                  className="rounded border border-border bg-muted px-3 py-2 font-mono text-sm transition-colors hover:bg-muted/80"
                >
                  Add Time
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer controls for tasks with timer */}
        {hasTimer && !completed && !showPrompt && (
          <div className={cn(
            "flex flex-wrap items-center gap-3 rounded border border-border p-2",
            isThisTimerActive && !isPaused && "border-primary bg-primary/5"
          )}>
            {/* Timer display */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "relative h-10 w-10 flex items-center justify-center",
              )}>
                {/* Progress ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${(progress / 100) * 113} 113`}
                    className="text-primary transition-all"
                  />
                </svg>
                <Clock className={cn(
                  "h-4 w-4",
                  isExpired ? "text-destructive" : isUrgent ? "text-destructive animate-pulse" : "text-muted-foreground"
                )} />
              </div>
              
              <div className={cn(
                "font-mono text-lg font-medium",
                isExpired 
                  ? "text-destructive" 
                  : isUrgent 
                  ? "text-destructive animate-pulse" 
                  : isThisTimerActive
                  ? "text-primary"
                  : "text-foreground"
              )}>
                {isExpired ? "Time's up!" : formatTime(timeLeft)}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-1">
              {!isThisTimerActive ? (
                <button
                  onClick={handleStartTimer}
                  disabled={isExpired}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border transition-colors hover:bg-muted disabled:opacity-50"
                  aria-label="Start timer"
                >
                  <Play className="h-4 w-4" />
                </button>
              ) : isPaused ? (
                <button
                  onClick={handleResumeTimer}
                  className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary/10 transition-colors hover:bg-primary/20"
                  aria-label="Resume timer"
                >
                  <Play className="h-4 w-4 text-primary" />
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary/10 transition-colors hover:bg-primary/20"
                  aria-label="Pause timer"
                >
                  <Pause className="h-4 w-4 text-primary" />
                </button>
              )}
              
              <button
                onClick={handleResetTimer}
                className="flex h-8 w-8 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
                aria-label="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded border transition-colors",
                  soundEnabled ? "border-primary bg-primary/10" : "border-border"
                )}
                aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded border transition-colors",
                  musicEnabled ? "border-accent bg-accent/20" : "border-border hover:bg-muted"
                )}
                aria-label={musicEnabled ? "Stop ambient music" : "Play ambient music"}
                title="Calming music"
              >
                <Music className={cn(
                  "h-4 w-4",
                  musicEnabled ? "text-accent" : "text-muted-foreground"
                )} />
              </button>
            </div>

            {/* Status indicator */}
            {isThisTimerActive && !isPaused && (
              <span className="font-mono text-sm text-primary uppercase tracking-wider">
                Running
              </span>
            )}
            {isPaused && isThisTimerActive && (
              <span className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Paused
              </span>
            )}
          </div>
        )}

        {/* Notes toggle + area */}
        {!completed && !showPrompt && (
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span>{showNotes ? "Hide notes" : notesText ? "Show notes" : "Add notes"}</span>
              {showNotes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showNotes && (
              <textarea
                value={notesText}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Add notes for this task..."
                rows={2}
                className="mt-1.5 w-full resize-none rounded border border-border bg-muted/30 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            )}
          </div>
        )}

        {/* Subtasks */}
        {!completed && !showPrompt && (
          <div>
            <button
              onClick={() => setShowSubtasks(!showSubtasks)}
              className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span>
                {showSubtasks ? "Hide subtasks" : subtasks && subtasks.length > 0
                  ? `Subtasks (${subtasks.filter(s => s.completed).length}/${subtasks.length})`
                  : "Add subtasks"}
              </span>
              {showSubtasks ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showSubtasks && (
              <div className="mt-1.5 space-y-1">
                {subtasks && subtasks.map((st) => (
                  <label key={st.id} className="flex items-center gap-2 cursor-pointer group/sub">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => {
                        const updated = subtasks.map(s =>
                          s.id === st.id ? { ...s, completed: !s.completed } : s
                        )
                        onSubtasksChange(id, updated)
                      }}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    <span className={cn(
                      "text-lg",
                      st.completed && "line-through text-muted-foreground"
                    )}>
                      {st.text}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        onSubtasksChange(id, subtasks.filter(s => s.id !== st.id))
                      }}
                      className="ml-auto opacity-0 group-hover/sub:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </label>
                ))}
                {subtasks && subtasks.length > 0 && (
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all rounded-full"
                      style={{ width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` }}
                    />
                  </div>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (newSubtaskText.trim()) {
                      const newSub: Subtask = {
                        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        text: newSubtaskText.trim(),
                        completed: false,
                      }
                      onSubtasksChange(id, [...(subtasks || []), newSub])
                      setNewSubtaskText("")
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="Add a step..."
                    className="flex-1 border-b border-dashed border-border bg-transparent py-1 text-lg text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newSubtaskText.trim()}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Snooze + Block actions */}
        {!completed && !showPrompt && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Snooze */}
            <div className="relative">
              <button
                onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                <AlarmClock className="h-3.5 w-3.5" />
                <span>{snoozedUntil ? "Snoozed" : "Snooze"}</span>
              </button>
              {showSnoozeMenu && (
                <div className="absolute left-0 top-6 z-10 rounded border border-border bg-card p-2 shadow-md space-y-1 min-w-[140px]">
                  {[
                    { label: "Tomorrow", days: 1 },
                    { label: "In 2 days", days: 2 },
                    { label: "Next week", days: 7 },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => {
                        const d = new Date()
                        d.setDate(d.getDate() + opt.days)
                        d.setHours(9, 0, 0, 0)
                        onSnooze(id, d.toISOString())
                        setShowSnoozeMenu(false)
                      }}
                      className="block w-full rounded px-2 py-1 text-left font-mono text-base text-foreground hover:bg-muted transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                  {snoozedUntil && (
                    <button
                      onClick={() => {
                        onSnooze(id, undefined)
                        setShowSnoozeMenu(false)
                      }}
                      className="block w-full rounded px-2 py-1 text-left font-mono text-base text-destructive hover:bg-muted transition-colors"
                    >
                      Remove snooze
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Block toggle */}
            <button
              onClick={() => onStatusChange(id, status === 'blocked' ? 'active' : 'blocked')}
              className={cn(
                "flex items-center gap-1.5 text-base transition-colors",
                status === 'blocked'
                  ? "text-red-600 dark:text-red-400 hover:text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {status === 'blocked' ? <CirclePlay className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              <span>{status === 'blocked' ? "Unblock" : "Mark blocked"}</span>
            </button>
          </div>
        )}

        {/* Show notes read-only for completed tasks */}
        {completed && notesText && (
          <p className="text-base italic text-muted-foreground">{notesText}</p>
        )}

        {/* Completed subtasks summary */}
        {completed && subtasks && subtasks.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {subtasks.filter(s => s.completed).length}/{subtasks.length} subtasks done
          </p>
        )}

        {/* Input field */}
        {!completed && !showPrompt && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={'type "done"'}
            className="w-full border-0 bg-transparent font-mono text-base text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(id)}
        className="mt-1 opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Delete task"
      >
        <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
      </button>

      {/* Magic celebration message */}
      {showMagic && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="whitespace-nowrap rounded bg-primary px-3 py-1 font-mono text-sm font-medium text-primary-foreground shadow">
            {magicMessage}
          </div>
        </div>
      )}
    </div>
  )
}
