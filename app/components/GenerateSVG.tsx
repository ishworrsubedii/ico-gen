import React from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const GenerateSVG: React.FC<{
  prompt: string;
  setPrompt: (prompt: string) => void;
  fetchSvg: (prompt: string) => void;
  isLoading: boolean;
}> = ({ prompt, setPrompt, fetchSvg, isLoading }) => {
  return (
    <div className="w-full flex items-center justify-center space-x-1">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <Label htmlFor="prompt">Generate SVG</Label>
          <Textarea
            id="prompt"
            placeholder="Enter a prompt to generate an SVG..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full"
          />
          <Button
            className="w-full"
            onClick={() => fetchSvg(prompt)}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default GenerateSVG