"use client"

import { useState } from "react"
import { celebrities, type CelebrityRitual } from "@/lib/celebrity-rituals"
import { Sparkles, User, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CelebrityPickerProps {
  onSelectRituals: (rituals: string[], celebrity: CelebrityRitual) => void
  currentCelebrity?: CelebrityRitual | null
  onClearCelebrity?: () => void
}

export function CelebrityPicker({ 
  onSelectRituals, 
  currentCelebrity,
  onClearCelebrity 
}: CelebrityPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedCelebrity, setSelectedCelebrity] = useState<CelebrityRitual | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "detail">("list")

  const handleSelectCelebrity = (celebrity: CelebrityRitual) => {
    setSelectedCelebrity(celebrity)
    setViewMode("detail")
  }

  const handleConfirm = () => {
    if (selectedCelebrity) {
      onSelectRituals(selectedCelebrity.rituals, selectedCelebrity)
      setOpen(false)
      setViewMode("list")
      setSelectedCelebrity(null)
    }
  }

  const handleBack = () => {
    setViewMode("list")
    setSelectedCelebrity(null)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setViewMode("list")
      setSelectedCelebrity(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentCelebrity && (
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
          <span className="font-medium text-primary">
            Living like {currentCelebrity.name}
          </span>
          <button
            onClick={onClearCelebrity}
            className="text-primary/60 hover:text-primary transition-colors"
            aria-label="Clear celebrity selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-dashed hover:border-primary hover:bg-primary/5 bg-transparent"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Live Like a Legend</span>
            <span className="sm:hidden">Legends</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {viewMode === "list" ? (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  Live Like a Legend
                </>
              ) : (
                <>
                  <button
                    onClick={handleBack}
                    className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                  {selectedCelebrity?.name}
                </>
              )}
            </DialogTitle>
            {viewMode === "list" && (
              <p className="text-base text-muted-foreground mt-1">
                Choose a legendary figure and adopt their daily rituals
              </p>
            )}
          </DialogHeader>

          {viewMode === "list" ? (
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {celebrities.map((celebrity) => (
                  <button
                    key={celebrity.id}
                    onClick={() => handleSelectCelebrity(celebrity)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {celebrity.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {celebrity.profession}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          ) : selectedCelebrity ? (
            <div className="flex flex-col">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <p className="text-base italic text-muted-foreground">
                  "{selectedCelebrity.quote}"
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedCelebrity.profession}
                </p>
              </div>
              
              <ScrollArea className="h-[280px]">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    Daily Rituals
                  </h4>
                  <ol className="space-y-2">
                    {selectedCelebrity.rituals.map((ritual, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-foreground pt-0.5">{ritual}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </ScrollArea>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Live This Day
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
