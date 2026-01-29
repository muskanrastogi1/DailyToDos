"use client"

import { useState, useCallback, useEffect } from "react"
import { TodoItem } from "./todo-item"
import { AddTodo } from "./add-todo"
import { MagicParticles } from "./magic-particles"
import { CelebrityPicker } from "./celebrity-picker"
import { MotivationBooster } from "./motivation-booster"
import { CheckSquare, Square, Loader2, AlertCircle } from "lucide-react"
import type { CelebrityRitual } from "@/lib/celebrity-rituals"
import { createClient } from "@/lib/supabase/client"

interface Todo {
  id: string
  text: string
  completed: boolean
  timerDuration?: number
  celebrityId?: string
  createdAt?: string
}

const INITIAL_TODOS: Todo[] = []

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
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 })
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [currentCelebrity, setCurrentCelebrity] = useState<CelebrityRitual | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  const supabase = createClient()

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

        if (data && data.length > 0) {
          const loadedTodos: Todo[] = data.map((item) => ({
            id: item.id,
            text: item.text,
            completed: item.completed,
            timerDuration: item.timer_duration || undefined,
            celebrityId: item.celebrity_id || undefined,
            createdAt: item.created_at,
          }))
          setTodos(loadedTodos)
          
          // Check if there's a celebrity associated
          const celebrityTodo = data.find((t) => t.celebrity_id)
          if (celebrityTodo?.celebrity_id) {
            const { celebrities } = await import('@/lib/celebrity-rituals')
            const celeb = celebrities.find((c) => c.id === celebrityTodo.celebrity_id)
            if (celeb) setCurrentCelebrity(celeb)
          }
          
          // Count already completed todos
          const completedCount = data.filter((t) => t.completed).length
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
  const saveTodo = useCallback(async (todo: Todo, celebrityId?: string) => {
    try {
      const { error } = await supabase.from('todos').upsert({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        timer_duration: todo.timerDuration || null,
        celebrity_id: celebrityId || null,
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

  // Clear all todos for this session
  const clearAllTodos = useCallback(async () => {
    try {
      const { error } = await supabase.from('todos').delete().eq('session_id', sessionId)
      if (error) throw error
    } catch (err) {
      console.error('Error clearing todos:', err)
    }
  }, [supabase, sessionId])

  const handleComplete = useCallback(async (id: string, rect: DOMRect) => {
    const todoToComplete = todos.find(t => t.id === id)
    if (todoToComplete) {
      const updatedTodo = { ...todoToComplete, completed: true }
      await saveTodo(updatedTodo, currentCelebrity?.id)
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
    
    // Stop timer if this task had the active timer
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
  }, [activeTimerId, todos, saveTodo, currentCelebrity])

  const handleDelete = useCallback(async (id: string) => {
    await deleteTodoFromDb(id)
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    // Stop timer if deleting the task with active timer
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
  }, [activeTimerId, deleteTodoFromDb])

  const handleAdd = useCallback(async (text: string, timer?: { hours: number; minutes: number }) => {
    const timerDuration = timer 
      ? (timer.hours * 60 * 60 * 1000) + (timer.minutes * 60 * 1000)
      : undefined
    
    const newTodo: Todo = { 
      id: generateUUID(), 
      text, 
      completed: false, 
      timerDuration 
    }
    
    await saveTodo(newTodo, currentCelebrity?.id)
    
    setTodos((prev) => [...prev, newTodo])
  }, [saveTodo, currentCelebrity])

  const handleTimeUp = useCallback((id: string) => {
    // Timer expired - could add additional notification here
  }, [])

  const handleTimerStart = useCallback((id: string) => {
    // Only one timer can be active at a time
    setActiveTimerId(id)
  }, [])

  const handleTimerStop = useCallback(() => {
    setActiveTimerId(null)
  }, [])

  const handleSelectCelebrityRituals = useCallback(async (rituals: string[], celebrity: CelebrityRitual) => {
    // Clear existing todos first
    await clearAllTodos()
    
    const newTodos: Todo[] = rituals.map((ritual) => ({
      id: generateUUID(),
      text: ritual,
      completed: false,
    }))
    
    // Save all new todos to database
    for (const todo of newTodos) {
      await saveTodo(todo, celebrity.id)
    }
    
    setTodos(newTodos)
    setCurrentCelebrity(celebrity)
    setTotalCompleted(0)
    setActiveTimerId(null)
  }, [clearAllTodos, saveTodo])

  const handleClearCelebrity = useCallback(async () => {
    await clearAllTodos()
    setCurrentCelebrity(null)
    setTodos([])
    setTotalCompleted(0)
    setActiveTimerId(null)
  }, [clearAllTodos])

  const activeTodos = todos.filter((t) => !t.completed)
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
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h1 className="mt-2 text-4xl font-semibold text-foreground md:text-5xl">
                  {currentCelebrity ? `A Day as ${currentCelebrity.name}` : "To Do List"}
                </h1>
                {currentCelebrity && (
                  <p className="mt-1 text-lg italic text-muted-foreground">
                    "{currentCelebrity.quote}"
                  </p>
                )}
                {totalCompleted > 0 && (
                  <p className="mt-2 text-xl text-muted-foreground">
                    {totalCompleted} task{totalCompleted !== 1 ? 's' : ''} done today
                  </p>
                )}
                {activeTimerId && (
                  <p className="mt-1 font-mono text-sm text-primary">
                    Timer active
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <CelebrityPicker 
                  onSelectRituals={handleSelectCelebrityRituals}
                  currentCelebrity={currentCelebrity}
                  onClearCelebrity={handleClearCelebrity}
                />
                <MotivationBooster />
              </div>
            </div>
          </div>

          {/* Add Todo */}
          <div className="border-b border-ruled-line px-6 py-4 pl-16">
            <AddTodo onAdd={handleAdd} />
          </div>

          {/* Active Todos */}
          {activeTodos.length > 0 && (
            <div className="px-6 pl-16">
              <div className="flex items-center gap-2 border-b border-ruled-line py-3 text-base text-muted-foreground">
                <Square className="h-4 w-4" />
                <span>{activeTodos.length} task{activeTodos.length !== 1 ? "s" : ""} to go</span>
              </div>
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  {...todo}
                  activeTimerId={activeTimerId}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onTimeUp={handleTimeUp}
                  onTimerStart={handleTimerStart}
                  onTimerStop={handleTimerStop}
                />
              ))}
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
                    activeTimerId={activeTimerId}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
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
          {'Type "done" to complete a task • Your tasks are saved automatically • Leftover tasks carry over to the next day'}
        </p>
      </div>
    </div>
  )
}
