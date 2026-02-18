"use client"

import { useState, useCallback, useEffect } from "react"
import { useTheme } from "next-themes"
import { TodoItem } from "./todo-item"
import { AddTodo } from "./add-todo"
import { MagicParticles } from "./magic-particles"
import { MotivationBooster } from "./motivation-booster"
import { CheckSquare, Square, Loader2, AlertCircle, Sun, Moon, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Subtask {
  id: string
  text: string
  completed: boolean
}

interface Todo {
  id: string
  text: string
  completed: boolean
  notes?: string
  timerDuration?: number
  priority?: number
  recurring?: string // "daily" | "weekdays"
  streak?: number
  subtasks?: Subtask[]
  category?: string
  snoozedUntil?: string
  status?: string // "active" | "blocked"
  createdAt?: string
}

const CATEGORIES = [
  { value: "work", label: "Work", color: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400" },
  { value: "school", label: "School", color: "bg-purple-500/15 text-purple-600 border-purple-500/30 dark:text-purple-400" },
  { value: "personal", label: "Personal", color: "bg-green-500/15 text-green-600 border-green-500/30 dark:text-green-400" },
  { value: "health", label: "Health", color: "bg-pink-500/15 text-pink-600 border-pink-500/30 dark:text-pink-400" },
  { value: "job-hunt", label: "Job Hunt", color: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30 dark:text-cyan-400" },
]

// Generate a proper UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Get or create a session ID for anonymous users
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('todo_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('todo_session_id', sessionId)
  }
  return sessionId
}

export function TodoList() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 })
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [capDismissed, setCapDismissed] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => setMounted(true), [])

  const supabase = createClient()

  // Helper to check if a date is today
  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Load todos from Supabase on mount
  useEffect(() => {
    const id = getSessionId()
    setSessionId(id)
    
    async function loadTodos() {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('session_id', id)
          .order('created_at', { ascending: true })

        if (error) throw error

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = (data || []) as any[]
        if (items.length > 0) {
          // Filter out completed tasks from previous days
          const todosToKeep = items.filter((item) => {
            if (!item.completed) return true
            if (item.completed_at && isToday(item.completed_at)) return true
            if (!item.completed_at && item.created_at && isToday(item.created_at)) return true
            return false
          })

          // Delete old completed tasks from database
          const todosToDelete = items.filter((item) => {
            if (!item.completed) return false
            if (item.completed_at && isToday(item.completed_at)) return false
            if (!item.completed_at && item.created_at && isToday(item.created_at)) return false
            return true
          })

          if (todosToDelete.length > 0) {
            const idsToDelete = todosToDelete.map((t) => t.id)
            await supabase.from('todos').delete().in('id', idsToDelete)
          }

          // Respawn recurring tasks that were completed on previous days
          const recurringToRespawn = todosToDelete.filter((item) => item.recurring)
          const respawnedTodos: Todo[] = []
          for (const old of recurringToRespawn) {
            if (old.recurring === 'weekdays') {
              const dayOfWeek = new Date().getDay()
              if (dayOfWeek === 0 || dayOfWeek === 6) continue // skip weekends
            }
            const newTodo: Todo = {
              id: generateUUID(),
              text: old.text,
              completed: false,
              notes: old.notes || undefined,
              timerDuration: old.timer_duration || undefined,
              priority: old.priority != null ? old.priority : undefined,
              recurring: old.recurring,
              streak: (old.streak || 0) + 1,
            }
            respawnedTodos.push(newTodo)
          }

          const loadedTodos: Todo[] = todosToKeep.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
            notes: item.notes || undefined,
            timerDuration: item.timer_duration || undefined,
            priority: item.priority != null ? item.priority : undefined,
            recurring: item.recurring || undefined,
            streak: item.streak || 0,
            subtasks: item.subtasks ? JSON.parse(item.subtasks) : undefined,
            category: item.category || undefined,
            snoozedUntil: item.snoozed_until || undefined,
            status: item.status || 'active',
            createdAt: item.created_at,
          }))
          // Save respawned recurring tasks to DB
          for (const todo of respawnedTodos) {
            await supabase.from('todos').upsert({
              id: todo.id,
              text: todo.text,
              completed: false,
              completed_at: null,
              notes: todo.notes || null,
              timer_duration: todo.timerDuration || null,
              priority: todo.priority != null ? todo.priority : null,
              recurring: todo.recurring || null,
              streak: todo.streak || 0,
              session_id: id,
            })
          }

          setTodos([...loadedTodos, ...respawnedTodos])

          const completedCount = todosToKeep.filter((t) => t.completed).length
          setTotalCompleted(completedCount)
        }
      } catch (err) {
        console.error('Error loading todos:', err)
        setError('Failed to load your tasks. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTodos()
  }, [supabase])

  // Save todo to Supabase
  const saveTodo = useCallback(async (todo: Todo) => {
    try {
      const { error } = await supabase.from('todos').upsert({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        completed_at: todo.completed ? new Date().toISOString() : null,
        notes: todo.notes || null,
        timer_duration: todo.timerDuration || null,
        priority: todo.priority != null ? todo.priority : null,
        recurring: todo.recurring || null,
        streak: todo.streak || 0,
        subtasks: todo.subtasks ? JSON.stringify(todo.subtasks) : null,
        category: todo.category || null,
        snoozed_until: todo.snoozedUntil || null,
        status: todo.status || 'active',
        session_id: sessionId,
      })
      if (error) throw error
    } catch (err) {
      console.error('Error saving todo:', err)
    }
  }, [supabase, sessionId])

  // Delete todo from Supabase
  const deleteTodoFromDb = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.error('Error deleting todo:', err)
    }
  }, [supabase])

  const handleComplete = useCallback(async (id: string, rect: DOMRect) => {
    const todoToComplete = todos.find(t => t.id === id)
    if (todoToComplete) {
      const updatedTodo = { ...todoToComplete, completed: true }
      await saveTodo(updatedTodo)
    }
    
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: true } : todo
      )
    )
    setParticleOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
    setParticleTrigger((prev) => prev + 1)
    setTotalCompleted((prev) => prev + 1)
    
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
  }, [activeTimerId, todos, saveTodo])

  const handleDelete = useCallback(async (id: string) => {
    await deleteTodoFromDb(id)
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
  }, [activeTimerId, deleteTodoFromDb])

  const handleNotesChange = useCallback(async (id: string, newNotes: string) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (todoToUpdate) {
      const updatedTodo = { ...todoToUpdate, notes: newNotes }
      await saveTodo(updatedTodo)
    }
    
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, notes: newNotes } : todo
      )
    )
  }, [todos, saveTodo])

  const handleEdit = useCallback(async (id: string, newText: string) => {
    const todoToEdit = todos.find(t => t.id === id)
    if (todoToEdit) {
      const updatedTodo = { ...todoToEdit, text: newText }
      await saveTodo(updatedTodo)
    }
    
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    )
  }, [todos, saveTodo])

  const handleAdd = useCallback(async (text: string, timer?: { hours: number; minutes: number }, priority?: number, recurring?: string, category?: string) => {
    const timerDuration = timer
      ? (timer.hours * 60 * 60 * 1000) + (timer.minutes * 60 * 1000)
      : undefined

    const newTodo: Todo = {
      id: generateUUID(),
      text,
      completed: false,
      timerDuration,
      priority,
      recurring,
      streak: 0,
      category,
      status: 'active',
    }

    await saveTodo(newTodo)

    setTodos((prev) => [...prev, newTodo])
  }, [saveTodo])

  const handleSubtasksChange = useCallback(async (id: string, subtasks: Subtask[]) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (todoToUpdate) {
      const updatedTodo = { ...todoToUpdate, subtasks }
      await saveTodo(updatedTodo)
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, subtasks } : todo
      )
    )
  }, [todos, saveTodo])

  const handleSnooze = useCallback(async (id: string, until: string | undefined) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (todoToUpdate) {
      const updatedTodo = { ...todoToUpdate, snoozedUntil: until }
      await saveTodo(updatedTodo)
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, snoozedUntil: until } : todo
      )
    )
  }, [todos, saveTodo])

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (todoToUpdate) {
      const updatedTodo = { ...todoToUpdate, status: newStatus }
      await saveTodo(updatedTodo)
    }
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, status: newStatus } : todo
      )
    )
  }, [todos, saveTodo])

  const handlePriorityChange = useCallback(async (id: string, newPriority: number | undefined) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (todoToUpdate) {
      const updatedTodo = { ...todoToUpdate, priority: newPriority }
      await saveTodo(updatedTodo)
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, priority: newPriority } : todo
      )
    )
  }, [todos, saveTodo])

  const handleTimeUp = useCallback((_id: string) => {
    // Timer expired
  }, [])

  const handleTimerStart = useCallback((id: string) => {
    setActiveTimerId(id)
  }, [])

  const handleTimerStop = useCallback(() => {
    setActiveTimerId(null)
  }, [])

  const now = new Date()
  const isSnoozed = (t: Todo) => t.snoozedUntil && new Date(t.snoozedUntil) > now

  const activeTodos = todos
    .filter((t) => !t.completed && !isSnoozed(t) && t.status !== 'blocked')
    .sort((a, b) => {
      const aPri = a.priority != null ? a.priority : Infinity
      const bPri = b.priority != null ? b.priority : Infinity
      if (aPri !== bPri) return aPri - bPri
      return 0
    })
  const blockedTodos = todos.filter((t) => !t.completed && t.status === 'blocked' && !isSnoozed(t))
  const snoozedTodos = todos.filter((t) => !t.completed && isSnoozed(t))
  const completedTodos = todos.filter((t) => t.completed)

  return (
    <div className="min-h-screen bg-background">
      <MagicParticles
        trigger={particleTrigger}
        originX={particleOrigin.x}
        originY={particleOrigin.y}
      />

      {/* Notepad container */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Notepad paper */}
        <div className="relative rounded border-2 border-border bg-card shadow-md">
          {/* Red margin line */}
          <div className="absolute top-0 bottom-0 left-12 w-px bg-margin-line" />
          
          {/* Spiral binding holes */}
          <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around py-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-3 w-3 rounded-full border-2 border-border bg-background" />
            ))}
          </div>

          {/* Header */}
          <div className="border-b border-ruled-line px-6 py-6 pl-16">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-4xl">
                  To Do List
                </h1>
                {totalCompleted > 0 && (
                  <p className="mt-2 text-xl text-muted-foreground">
                    {totalCompleted} task{totalCompleted !== 1 ? 's' : ''} done today
                  </p>
                )}
                {activeTimerId && (
                  <p className="mt-1 font-mono text-base text-primary">
                    Timer active
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeTodos.length > 0 && (
                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded border px-3 font-mono text-sm transition-colors",
                      focusMode
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    )}
                    title={focusMode ? "Exit focus mode" : "Focus on one task at a time"}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {focusMode ? "Exit Focus" : "Focus"}
                  </button>
                )}
                <MotivationBooster />
                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="flex h-9 w-9 items-center justify-center rounded border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    aria-label="Toggle dark mode"
                  >
                    {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Add Todo */}
          <div className="border-b border-ruled-line px-6 py-4 pl-16">
            <AddTodo onAdd={handleAdd} />
          </div>

          {/* Focus Mode */}
          {focusMode && activeTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-primary">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Focus: Task 1 of {activeTodos.length}</span>
              </div>
              <div className="py-2">
                <TodoItem
                  key={activeTodos[0].id}
                  {...activeTodos[0]}
                  categories={CATEGORIES}
                  activeTimerId={activeTimerId}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onNotesChange={handleNotesChange}
                  onPriorityChange={handlePriorityChange}
                  onSubtasksChange={handleSubtasksChange}
                  onSnooze={handleSnooze}
                  onStatusChange={handleStatusChange}
                  onTimeUp={handleTimeUp}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
                />
              </div>
              {activeTodos.length > 1 && (
                <p className="border-t border-ruled-line py-3 text-center font-mono text-base text-muted-foreground">
                  {activeTodos.length - 1} more task{activeTodos.length - 1 !== 1 ? "s" : ""} waiting
                </p>
              )}
            </div>
          )}

          {/* Active Todos */}
          {!focusMode && activeTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-muted-foreground">
                <Square className="h-4 w-4" />
                <span>{activeTodos.length} task{activeTodos.length !== 1 ? "s" : ""} to go</span>
              </div>
              {activeTodos.length > 5 && !capDismissed && (
                <div className="flex items-center justify-between border-b border-ruled-line bg-amber-500/10 px-3 py-2">
                  <p className="font-mono text-base text-amber-700 dark:text-amber-400">
                    You have {activeTodos.length} tasks. Most people complete ~5 focused tasks per day.
                  </p>
                  <button
                    onClick={() => setCapDismissed(true)}
                    className="ml-3 flex-shrink-0 font-mono text-base text-amber-700/60 hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-400"
                    aria-label="Dismiss"
                  >
                    Got it
                  </button>
                </div>
              )}
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  {...todo}
                  categories={CATEGORIES}
                  activeTimerId={activeTimerId}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onNotesChange={handleNotesChange}
                  onPriorityChange={handlePriorityChange}
                  onSubtasksChange={handleSubtasksChange}
                  onSnooze={handleSnooze}
                  onStatusChange={handleStatusChange}
                  onTimeUp={handleTimeUp}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
                />
              ))}
            </div>
          )}

          {/* Blocked Todos */}
          {blockedTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Blocked ({blockedTodos.length})</span>
              </div>
              <div className="opacity-70">
                {blockedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    {...todo}
                    categories={CATEGORIES}
                    activeTimerId={activeTimerId}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onNotesChange={handleNotesChange}
                    onPriorityChange={handlePriorityChange}
                    onSubtasksChange={handleSubtasksChange}
                    onSnooze={handleSnooze}
                    onStatusChange={handleStatusChange}
                    onTimerStart={handleTimerStart}
                    onTimerStop={handleTimerStop}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Snoozed Todos */}
          {snoozedTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-muted-foreground">
                <Moon className="h-4 w-4" />
                <span>Snoozed ({snoozedTodos.length})</span>
              </div>
              <div className="opacity-60">
                {snoozedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    {...todo}
                    categories={CATEGORIES}
                    activeTimerId={activeTimerId}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onNotesChange={handleNotesChange}
                    onPriorityChange={handlePriorityChange}
                    onSubtasksChange={handleSubtasksChange}
                    onSnooze={handleSnooze}
                    onStatusChange={handleStatusChange}
                    onTimerStart={handleTimerStart}
                    onTimerStop={handleTimerStop}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Todos */}
          {completedTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-muted-foreground">
                <CheckSquare className="h-4 w-4" />
                <span>Done ({completedTodos.length})</span>
              </div>
              <div className="opacity-50">
                {completedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    {...todo}
                    categories={CATEGORIES}
                    activeTimerId={activeTimerId}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onNotesChange={handleNotesChange}
                    onPriorityChange={handlePriorityChange}
                    onSubtasksChange={handleSubtasksChange}
                    onSnooze={handleSnooze}
                    onStatusChange={handleStatusChange}
                    onTimerStart={handleTimerStart}
                    onTimerStop={handleTimerStop}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-12 pl-16 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground animate-spin" />
              <h3 className="text-2xl">Loading your tasks...</h3>
              <p className="text-lg text-muted-foreground">Checking for leftover tasks from yesterday</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="px-6 py-12 pl-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h3 className="text-2xl text-destructive">Oops!</h3>
              <p className="text-lg text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && todos.length === 0 && (
            <div className="px-6 py-12 pl-16 text-center">
              <Square className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-2xl">Nothing here yet</h3>
              <p className="text-lg text-muted-foreground">Write your first task above</p>
            </div>
          )}

          {/* Bottom padding with ruled lines */}
          <div className="px-6 pl-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 border-b border-ruled-line" />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <p className="mt-6 text-center text-base text-muted-foreground">
          {'Type "done" + Enter to complete • Click task to edit • Add notes to any task • Saves automatically'}
        </p>
      </div>
    </div>
  )
}
