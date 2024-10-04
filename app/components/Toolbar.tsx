import React from 'react'
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trash2 } from 'lucide-react'

const tools = [
  { name: 'Rectangle', icon: 'Square' },
  { name: 'Circle', icon: 'Circle' },
  { name: 'Text', icon: 'Type' },
  { name: 'Eraser', icon: 'Eraser' },
  { name: 'Move', icon: 'Move' },
]

const Toolbar: React.FC<{
  activeTool: string;
  onToolClick: (toolName: string) => void;
  onClearAll: () => void;
}> = ({ activeTool, onToolClick, onClearAll }) => {
  return (
    <div className="flex flex-col space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <TooltipProvider>
        {tools.map((tool) => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.name ? "default" : "outline"}
                size="sm"
                onClick={() => onToolClick(tool.name)}
                className="w-full justify-start"
              >
                <span className="ml-2">{tool.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
      <Button
        variant="destructive"
        size="sm"
        onClick={onClearAll}
        className="w-full justify-start mt-4"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        <span className="ml-2">Clear All</span>
      </Button>
    </div>
  )
}

export default Toolbar