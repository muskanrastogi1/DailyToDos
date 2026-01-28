"use client"

import { useState, useCallback } from "react"
import { TodoItem } from "./todo-item"
import { AddTodo } from "./add-todo"
import { MagicParticles } from "./magic-particles"
import { CelebrityPicker } from "./celebrity-picker"
import { CheckSquare, Square } from "lucide-react"
import type { CelebrityRitual } from "@/lib/celebrity-rituals"

interface Todo {
  id: string
  text: string
  completed: boolean
  timerDuration?: number
}

const INITIAL_TODOS: Todo[] = [
  { id: "1", text: "Complete the morning workout", completed: false },
  { id: "2", text: "Review project proposal", completed: false },
  { id: "3", text: "Call mom", completed: false },
]

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(INITIAL_TODOS)
  const [particleTrigger, setParticleTrigger] = useState(0)
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 })
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null)
  const [currentCelebrity, setCurrentCelebrity] = useState<CelebrityRitual | null>(null)

  const handleComplete = useCallback((id: string, rect: DOMRect) => {
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
  }, [activeTimerId])

  const handleDelete = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    // Stop timer if deleting the task with active timer
    if (activeTimerId === id) {
      setActiveTimerId(null)
    }
  }, [activeTimerId])

  const handleAdd = useCallback((text: string, timer?: { hours: number; minutes: number }) => {
    const timerDuration = timer 
      ? (timer.hours * 60 * 60 * 1000) + (timer.minutes * 60 * 1000)
      : undefined
    
    setTodos((prev) => [
      ...prev,
      { id: Date.now().toString(), text, completed: false, timerDuration },
    ])
  }, [])

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

  const handleSelectCelebrityRituals = useCallback((rituals: string[], celebrity: CelebrityRitual) => {
    const newTodos: Todo[] = rituals.map((ritual, index) => ({
      id: `celeb-${Date.now()}-${index}`,
      text: ritual,
      completed: false,
    }))
    setTodos(newTodos)
    setCurrentCelebrity(celebrity)
    setTotalCompleted(0)
    setActiveTimerId(null)
  }, [])

  const handleClearCelebrity = useCallback(() => {
    setCurrentCelebrity(null)
    setTodos(INITIAL_TODOS)
    setTotalCompleted(0)
    setActiveTimerId(null)
  }, [])

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
              <CelebrityPicker 
                onSelectRituals={handleSelectCelebrityRituals}
                currentCelebrity={currentCelebrity}
                onClearCelebrity={handleClearCelebrity}
              />
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

          {/* Empty State */}
          {todos.length === 0 && (
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
          {'Type "done" to complete a task • Click the clock to add a timer • Only one timer runs at a time'}
        </p>
      </div>
    </div>
  )
}
