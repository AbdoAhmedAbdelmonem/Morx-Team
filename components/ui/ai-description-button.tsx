"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIDescriptionButtonProps {
  context: {
    type: 'team' | 'project' | 'task'
    name: string
    userName?: string
    teamName?: string
    purpose?: string
    subject?: string
    additionalContext?: string
  }
  onGenerated: (description: string) => void
  disabled?: boolean
  className?: string
}

export function AIDescriptionButton({ 
  context, 
  onGenerated, 
  disabled = false,
  className 
}: AIDescriptionButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (disabled || isGenerating) return
    
    setIsGenerating(true)
    
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      })
      
      const result = await res.json()
      
      if (result.success && result.data?.description) {
        onGenerated(result.data.description)
      } else {
        console.error('Failed to generate description:', result.error)
      }
    } catch (error) {
      console.error('Error generating description:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={disabled || isGenerating || !context.name?.trim()}
      className={cn(
        "gap-1.5 text-xs h-7 px-2",
        "bg-gradient-to-r from-purple-500/10 to-blue-500/10",
        "hover:from-purple-500/20 hover:to-blue-500/20",
        "border-purple-500/30 hover:border-purple-500/50",
        "text-purple-700 dark:text-purple-300",
        "transition-all duration-200",
        className
      )}
    >
      {isGenerating ? (
        <>
          <Loader2 className="size-3 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="size-3" />
          <span>Fill with AI</span>
        </>
      )}
    </Button>
  )
}
