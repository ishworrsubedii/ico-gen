"use client"
import { useState, useRef, useEffect } from 'react'
import axios, { AxiosResponse } from 'axios'
import { Download, Clipboard, Check, Square, Circle, Type, Eraser, Paintbrush, Edit3, Palette } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ApiResponse {
  status: string;
  data: string;
}

const tools = [
  { name: 'Rectangle', icon: Square },
  { name: 'Circle', icon: Circle },
  { name: 'Text', icon: Type },
  { name: 'Eraser', icon: Eraser },
  { name: 'Brush', icon: Paintbrush },
  { name: 'Pencil', icon: Edit3 },
  { name: 'Fill', icon: Palette },
]

export default function SVGPlayground() {
  const [svgCode, setSvgCode] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [color, setColor] = useState<string>('#000000')
  const [copied, setCopied] = useState<boolean>(false)
  const [activeTool, setActiveTool] = useState<string>('Rectangle')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (svgRef.current && svgCode) {
      svgRef.current.innerHTML = preprocessSvg(svgCode)
    }
  }, [svgCode])

  const preprocessSvg = (svg: string) => {
    // Remove unnecessary elements and attributes
    return svg
      .replace(/<\?xml.*?\?>/, '')
      .replace(/<\!DOCTYPE.*?>/, '')
      .replace(/<!--.*?-->/g, '')
      .replace(/id=".*?"/g, '')
      .replace(/class=".*?"/g, '')
      .replace(/style=".*?"/g, '')
      .trim()
  }

  const fetchSvg = async (prompt: string) => {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post('http://0.0.0.0:8000/generate_icon', { prompt });
      if (response.status === 200 && response.data.status === 'success') {
        setSvgCode(response.data.data);
      } else {
        console.error('Error generating SVG:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching SVG:', error);
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName)
    // Implement tool functionality here
  }

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return

    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    const cursorPoint = point.matrixTransform(svg.getScreenCTM()?.inverse())

    let newElement
    switch (activeTool) {
      case 'Rectangle':
        newElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        newElement.setAttribute('x', cursorPoint.x.toString())
        newElement.setAttribute('y', cursorPoint.y.toString())
        newElement.setAttribute('width', '50')
        newElement.setAttribute('height', '50')
        break
      case 'Circle':
        newElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        newElement.setAttribute('cx', cursorPoint.x.toString())
        newElement.setAttribute('cy', cursorPoint.y.toString())
        newElement.setAttribute('r', '25')
        break
      case 'Text':
        newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        newElement.setAttribute('x', cursorPoint.x.toString())
        newElement.setAttribute('y', cursorPoint.y.toString())
        newElement.textContent = 'Text'
        break
      // Implement other tools here
      default:
        return
    }

    newElement.setAttribute('fill', color)
    svg.appendChild(newElement)
    setSvgCode(svg.outerHTML)
  }

  const handleDownload = (format: 'svg' | 'png' | 'jpg') => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'})

    if (format === 'svg') {
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'playground.svg'
      link.click()
      URL.revokeObjectURL(url)
    } else {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `playground.${format}`
            link.click()
            URL.revokeObjectURL(url)
          }
        }, `image/${format}`)
      }
      img.src = URL.createObjectURL(svgBlob)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(svgCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Playground</h1>
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <Label>SVG Preview</Label>
          <div 
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg aspect-square flex items-center justify-center"
          >
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              onClick={handleSvgClick}
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label>Editing Tools</Label>
          <div className="grid grid-cols-4 gap-2">
            <TooltipProvider>
              {tools.map((tool) => (
                <Tooltip key={tool.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={activeTool === tool.name ? "default" : "outline"}
                      size="icon"
                      onClick={() => handleToolClick(tool.name)}
                    >
                      <tool.icon className="h-4 w-4" />
                      <span className="sr-only">{tool.name}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tool.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="space-y-4 mb-8">
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="color"
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-12 h-12 p-1 rounded"
            />
            <Input
              type="text"
              value={color}
              onChange={handleColorChange}
              className="flex-grow"
            />
          </div>
        </div>
        <div className="flex space-x-2">
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
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Clipboard className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy SVG'}
          </Button>
        </div>
      </div>
      <div className="space-y-2 mb-20">
        <Label htmlFor="prompt">Generate SVG</Label>
        <Textarea
          id="prompt"
          placeholder="Enter a prompt to generate an SVG..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button 
          className="w-full max-w-md mx-auto block" 
          onClick={() => fetchSvg(prompt)}
        >
          Generate
        </Button>
      </div>
    </div>
  )
}