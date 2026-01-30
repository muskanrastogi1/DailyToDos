"use client"

import { useState, useEffect } from "react"
import { motivationalStories, quickBoosts, hypeSongs, type MotivationalStory, type HypeSong } from "@/lib/motivational-stories"
import { Heart, Sparkles, ChevronRight, ChevronLeft, RefreshCw, BookOpen, Zap, Music, Play, ExternalLink, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export function MotivationBooster() {
  const [open, setOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"menu" | "story" | "boost" | "playlist">("menu")
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [currentBoost, setCurrentBoost] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [shuffledSongs, setShuffledSongs] = useState<HypeSong[]>([])

  const currentStory = motivationalStories[currentStoryIndex]

  useEffect(() => {
    // Set random boost on mount
    setCurrentBoost(quickBoosts[Math.floor(Math.random() * quickBoosts.length)])
    // Shuffle songs on mount
    setShuffledSongs([...hypeSongs].sort(() => Math.random() - 0.5))
  }, [])

  const shufflePlaylist = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setShuffledSongs([...hypeSongs].sort(() => Math.random() - 0.5))
      setIsAnimating(false)
    }, 150)
  }

  const handleNextStory = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStoryIndex((prev) => 
        prev === motivationalStories.length - 1 ? 0 : prev + 1
      )
      setIsAnimating(false)
    }, 150)
  }

  const handlePrevStory = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentStoryIndex((prev) => 
        prev === 0 ? motivationalStories.length - 1 : prev - 1
      )
      setIsAnimating(false)
    }, 150)
  }

  const handleNewBoost = () => {
    setIsAnimating(true)
    setTimeout(() => {
      let newBoost = currentBoost
      while (newBoost === currentBoost) {
        newBoost = quickBoosts[Math.floor(Math.random() * quickBoosts.length)]
      }
      setCurrentBoost(newBoost)
      setIsAnimating(false)
    }, 150)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setViewMode("menu")
    }
  }

  const handleViewStories = () => {
    setCurrentStoryIndex(Math.floor(Math.random() * motivationalStories.length))
    setViewMode("story")
  }

  const handleViewBoost = () => {
    handleNewBoost()
    setViewMode("boost")
  }

  const handleViewPlaylist = () => {
    if (shuffledSongs.length === 0) {
      setShuffledSongs([...hypeSongs].sort(() => Math.random() - 0.5))
    }
    setViewMode("playlist")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-dashed border-rose-300 text-rose-600 hover:border-rose-400 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:border-rose-700 dark:hover:bg-rose-950/50 bg-transparent"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Need a Boost?</span>
          <span className="sm:hidden">Boost</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {viewMode === "menu" && (
          <>
            <DialogHeader className="px-6 py-6 border-b border-border bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50">
                  <Heart className="h-5 w-5 text-rose-500" />
                </div>
                Feeling Down?
              </DialogTitle>
              <p className="text-base text-muted-foreground mt-2">
                Everyone has tough days. Let these stories and words lift you up.
              </p>
            </DialogHeader>
            
            <div className="p-4 space-y-3">
              <button
                onClick={handleViewStories}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-950/50 dark:hover:to-yellow-950/50 transition-all group border border-amber-200 dark:border-amber-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">
                    Inspiring Stories
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Real stories of people who turned failure into success
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
              </button>

              <button
                onClick={handleViewBoost}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/50 transition-all group border border-violet-200 dark:border-violet-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 shrink-0">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">
                    Quick Boost
                  </div>
                  <div className="text-sm text-muted-foreground">
                    A quick reminder that you've got this
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
              </button>

              <button
                onClick={handleViewPlaylist}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/50 dark:hover:to-emerald-950/50 transition-all group border border-green-200 dark:border-green-900"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 shrink-0">
                  <Music className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-lg text-foreground">
                    Hype Playlist
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Songs to get you fired up and ready to conquer
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
              </button>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <p className="text-center text-sm text-muted-foreground">
                Remember: Every successful person you admire has faced failure and doubt.
              </p>
            </div>
          </>
        )}

        {viewMode === "story" && currentStory && (
          <>
            <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("menu")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  Inspiring Stories
                </DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">
                Story {currentStoryIndex + 1} of {motivationalStories.length}
              </p>
            </DialogHeader>

            <ScrollArea className="h-[380px]">
              <div 
                className={`p-6 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {currentStory.title}
                  </h3>
                  <p className="text-base text-amber-600 dark:text-amber-400 font-medium">
                    {currentStory.person}
                  </p>
                </div>

                <p className="text-base text-foreground leading-relaxed mb-6">
                  {currentStory.story}
                </p>

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 mb-4 border border-amber-200 dark:border-amber-900">
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-2">
                    The Lesson
                  </p>
                  <p className="text-base font-medium text-foreground">
                    {currentStory.lesson}
                  </p>
                </div>

                <div className="flex items-start gap-3 text-muted-foreground italic">
                  <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-base">"{currentStory.quote}"</p>
                </div>
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevStory}
                className="gap-1 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Swipe through stories
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextStory}
                className="gap-1 bg-transparent"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {viewMode === "boost" && (
          <>
            <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("menu")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-violet-500" />
                  Quick Boost
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
              <div 
                className={`text-center transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
              >
                <div className="mb-6 flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center">
                    <Heart className="h-10 w-10 text-violet-500" />
                  </div>
                </div>
                <p className="text-2xl font-medium text-foreground leading-relaxed max-w-sm">
                  {currentBoost}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <Button
                onClick={handleNewBoost}
                className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Give Me Another
              </Button>
            </div>
          </>
        )}

        {viewMode === "playlist" && (
          <>
            <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("menu")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Music className="h-5 w-5 text-green-500" />
                  Hype Playlist
                </DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">
                {shuffledSongs.length} songs to fuel your fire
              </p>
            </DialogHeader>

            <ScrollArea className="h-[380px]">
              <div 
                className={`p-4 space-y-2 transition-opacity duration-150 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
              >
                {shuffledSongs.map((song, index) => (
                  <a
                    key={song.id}
                    href={song.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-950/30 transition-all group border border-transparent hover:border-green-200 dark:hover:border-green-900"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {index + 1}. {song.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {song.artist}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        {song.vibe}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <Button
                onClick={shufflePlaylist}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle Playlist
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
