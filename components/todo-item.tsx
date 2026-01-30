"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Check, X, Clock, Play, Pause, RotateCcw, Volume2, VolumeX, Music, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoItemProps {
  id: string
  text: string
  completed: boolean
  deadline?: number
  timerDuration?: number
  activeTimerId: string | null
  onComplete: (id: string, rect: DOMRect) => void
  onDelete: (id: string) => void
  onEdit: (id: string, newText: string) => void
  onTimeUp?: (id: string) => void
  onTimerStart: (id: string) => void
  onTimerStop: () => void
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
  timerDuration,
  activeTimerId,
  onComplete, 
  onDelete,
  onEdit,
  onTimeUp,
  onTimerStart,
  onTimerStop
}: TodoItemProps) {
  const [inputValue, setInputValue] = useState("")
  const [showMagic, setShowMagic] = useState(false)
  const [magicMessage, setMagicMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration || 0)
  const [totalDuration, setTotalDuration] = useState<number>(timerDuration || 0)
  const [isExpired, setIsExpired] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [extendMinutes, setExtendMinutes] = useState(5)
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
    const value = e.target.value
    setInputValue(value)
    
    if (value.toLowerCase().trim() === "done") {
      triggerComplete()
    }
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
            className="w-full border-b-2 border-primary bg-transparent text-2xl leading-tight text-foreground focus:outline-none"
          />
        ) : (
          <span
            onClick={handleStartEditing}
            className={cn(
              "text-2xl leading-tight transition-all",
              completed && "text-muted-foreground line-through decoration-2",
              isExpired && !completed && "text-destructive",
              !completed && "cursor-pointer hover:text-primary"
            )}
            title={!completed ? "Click to edit" : undefined}
          >
            {text}
          </span>
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
              <span className="font-mono text-xs text-primary uppercase tracking-wider">
                Running
              </span>
            )}
            {isPaused && isThisTimerActive && (
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Paused
              </span>
            )}
          </div>
        )}

        {/* Input field */}
        {!completed && !showPrompt && (
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={'type "done"'}
            className="w-full border-0 bg-transparent font-mono text-sm text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none"
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
