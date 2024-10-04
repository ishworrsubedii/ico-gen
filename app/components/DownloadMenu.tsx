import React from 'react'
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DownloadMenu: React.FC<{ handleDownload: (format: 'svg' | 'png' | 'jpg') => void }> = ({ handleDownload }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleDownload('svg')}>
          Download as SVG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('png')}>
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('jpg')}>
          Download as JPG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DownloadMenu