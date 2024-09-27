"use client"

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import axios from 'axios'
import { Square, Circle, Type, Eraser, Move, ZoomIn, ZoomOut, RotateCcw, Download, Sun, Moon, Palette } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SVGElement {
  id: string;
  type: 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
}

interface ApiResponse {
  status: string;
  data: string;
}

const tools = [
  { name: 'Rectangle', icon: Square },
  { name: 'Circle', icon: Circle },
  { name: 'Text', icon: Type },
  { name: 'Eraser', icon: Eraser },
  { name: 'Move', icon: Move },
]

const Header: React.FC<{ isDarkMode: boolean; toggleTheme: () => void }> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">Advanced SVG Editor</div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Home</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">About</a></li>
            <li><a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Contact</a></li>
          </ul>
        </nav>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {isDarkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}

const ColorPicker: React.FC<{ color: string; onChange: (color: string) => void; label: string }> = ({ color, onChange, label }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 p-1 rounded"
      />
    </div>
  )
}

const Toolbar: React.FC<{
  tools: { name: string; icon: React.ElementType }[];
  activeTool: string;
  onToolClick: (toolName: string) => void;
}> = ({ tools, activeTool, onToolClick }) => {
  return (
    <div className="flex flex-col space-y-2">
      <TooltipProvider>
        {tools.map((tool) => (
          <Tooltip key={tool.name}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.name ? "default" : "outline"}
                size="icon"
                onClick={() => onToolClick(tool.name)}
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
  )
}

interface SVGCanvasProps {
  activeTool: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  showGrid: boolean;
  svgCode: string;
  onElementsChange: (elements: SVGElement[]) => void;
}

const SVGCanvas = forwardRef<SVGSVGElement, SVGCanvasProps>(
  ({ activeTool, fillColor, strokeColor, strokeWidth, zoom, pan, onPanChange, showGrid, svgCode, onElementsChange }, ref) => {
    const [elements, setElements] = useState<SVGElement[]>([])
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const canvasRef = useRef<SVGSVGElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    useEffect(() => {
      if (canvasRef.current && typeof ref === 'function') {
        ref(canvasRef.current)
      } else if (canvasRef.current && ref && 'current' in ref) {
        ref.current = canvasRef.current
      }
    }, [ref])

    useEffect(() => {
      if (svgCode) {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgCode, 'image/svg+xml')
        const svgElement = svgDoc.documentElement
        const newElements: SVGElement[] = []
        
        Array.from(svgElement.children).forEach((child, index) => {
          if (child instanceof SVGElement) {
            const elementProps: { [key: string]: string } = {}
            Array.from(child.attributes).forEach(attr => {
              elementProps[attr.name] = attr.value
            })
            newElements.push({
              id: `generated-${index}`,
              type: child.tagName.toLowerCase() as 'rect' | 'circle' | 'text',
              x: parseFloat(elementProps.x || elementProps.cx || '0'),
              y: parseFloat(elementProps.y || elementProps.cy || '0'),
              width: parseFloat(elementProps.width || '0'),
              height: parseFloat(elementProps.height || '0'),
              radius: parseFloat(elementProps.r || '0'),
              fill: elementProps.fill || fillColor,
              stroke: elementProps.stroke || strokeColor,
              strokeWidth: parseFloat(elementProps['stroke-width'] || strokeWidth.toString()),
              text: child.textContent || undefined,
            })
          }
        })
        
        setElements(newElements)
        onElementsChange(newElements)
      }
    }, [svgCode, fillColor, strokeColor, strokeWidth, onElementsChange])

    const getMousePosition = (event: React.MouseEvent<SVGSVGElement>) => {
      const CTM = canvasRef.current!.getScreenCTM()!
      return {
        x: (event.clientX - CTM.e) / CTM.a - pan.x,
        y: (event.clientY - CTM.f) / CTM.d - pan.y,
      }
    }

    const startDrawing = (event: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === 'Move') return
      setIsDrawing(true)
      setStartPoint(getMousePosition(event))
    }

    const draw = (event: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing) return
      const currentPoint = getMousePosition(event)
      let newElement: SVGElement | null = null

      switch (activeTool) {
        case 'Rectangle':
          newElement = {
            id: Date.now().toString(),
            type: 'rect',
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(currentPoint.x - startPoint.x),
            height: Math.abs(currentPoint.y - startPoint.y),
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          }
          break
        case 'Circle':
          const radius = Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y)
          newElement = {
            id: Date.now().toString(),
            type: 'circle',
            x: startPoint.x,
            y: startPoint.y,
            radius: radius,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
          }
          break
        case 'Text':
          newElement = {
            id: Date.now().toString(),
            type: 'text',
            x: startPoint.x,
            y: startPoint.y,
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            text: 'Double-click to edit',
          }
          break
        case 'Eraser':
          const elementToRemove = elements.find(el => 
            (el.type === 'rect' && 
              currentPoint.x >= el.x && currentPoint.x <= el.x + (el.width || 0) &&
              currentPoint.y >= el.y && currentPoint.y <= el.y + (el.height || 0)) ||
            (el.type === 'circle' &&
              Math.hypot(currentPoint.x - el.x, currentPoint.y - el.y) <= (el.radius || 0)) ||
            (el.type === 'text' &&
              Math.abs(currentPoint.x - el.x) < 20 && Math.abs(currentPoint.y - el.y) < 20)
          )
          if (elementToRemove) {
            const updatedElements = elements.filter(el => el.id !== elementToRemove.id)
            setElements(updatedElements)
            onElementsChange(updatedElements)
          }
          break
        default:
          return
      }

      if (newElement && activeTool !== 'Eraser') {
        const updatedElements = [...elements, newElement]
        setElements(updatedElements)
        onElementsChange(updatedElements)
      }
    }

    const endDrawing = () => {
      setIsDrawing(false)
    }

    const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === 'Move') {
        const target = event.target as SVGElement
        if (target !== event.currentTarget) {
          const id = target.id
          setSelectedElement(id)
          setIsDragging(true)
          setDragStart(getMousePosition(event))
        } else {
          setIsDragging(true)
          setDragStart({ x: event.clientX, y: event.clientY })
        }
      } else {
        startDrawing(event)
      }
    }

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
      if (activeTool === 'Move' && isDragging) {
        if (selectedElement) {
          const { x, y } = getMousePosition(event)
          const updatedElements = elements.map(el => 
            el.id === selectedElement ? { ...el, x, y } : el
          )
          setElements(updatedElements)
          onElementsChange(updatedElements)
        } else {
          const dx = event.clientX - dragStart.x
          const dy = event.clientY - dragStart.y
          onPanChange({ x: pan.x + dx / zoom, y: pan.y + dy / zoom })
          setDragStart({ x: event.clientX, y: event.clientY })
        }
      } else {
        draw(event)
      }
    }

    const handleMouseUp = () => {
      if (activeTool === 'Move') {
        setSelectedElement(null)
        setIsDragging(false)
      } else {
        endDrawing()
      }
    }

    const renderGrid = () => {
      if (!showGrid) return null;

      const gridSize = 20;
      const width = 2000 / zoom;
      const height = 2000 / zoom;

      return (
        <g>
          <defs>
            <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
            </pattern>
            <pattern id="grid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
              <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)"/>
              <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
        </g>
      );
    };

    return (
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={`${-pan.x} ${-pan.y} ${2000 / zoom} ${2000 / zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border border-gray-300 rounded bg-white dark:bg-gray-900"
      >
        {renderGrid()}
        {elements.map((element) => {
          switch (element.type) {
            case 'rect':
              return (
                <rect
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  fill={element.fill}
                  stroke={element.stroke}
                  strokeWidth={element.strokeWidth}
                />
              )
            case 'circle':
              return (
                <circle
                  key={element.id}
                  id={element.id}
                  cx={element.x}
                  cy={element.y}
                  r={element.radius}
                  fill={element.fill}
                  stroke={element.stroke}
                  strokeWidth={element.strokeWidth}
                />
              )
            case 'text':
              return (
                <text
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  fill={element.fill}
                  stroke={element.stroke}
                  strokeWidth={element.strokeWidth}
                  fontSize="16"
                >
                  {element.text}
                </text>
              )
            default:
              return null
          }
        })}
      </svg>
    )
  }
)

SVGCanvas.displayName = 'SVGCanvas'

export default function AdvancedSVGEditor() {
  const [activeTool, setActiveTool] = useState('Rectangle')
  const [fillColor, setFillColor] = useState('#000000')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [svgCode, setSvgCode] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [elements, setElements] = useState<SVGElement[]>([])
  const svgRef = useRef<SVGSVGElement>(null)

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName)
  }

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.1))
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const fetchSvg = async (prompt: string) => {
    try {
      const response = await axios.post<ApiResponse>('http://0.0.0.0:8000/generate_icon', { prompt });
      if (response.status === 200 && response.data.status === 'success') {
        setSvgCode(response.data.data);
      } else {
        console.error('Error generating SVG:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching SVG:', error);
    }
  }

  const handleDownload = (format: 'svg' | 'png' | 'jpg') => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const cleanedSvgData = svgData.replace(/<g>.*?<\/g>/s, '') // Remove grid
    const svgBlob = new Blob([cleanedSvgData], {type: 'image/svg+xml;charset=utf-8'})

    if (format === 'svg') {
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'svg-editor.svg'
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
            link.download = `svg-editor.${format}`
            link.click()
            URL.revokeObjectURL(url)
          }
        }, `image/${format}`)
      }
      img.src = URL.createObjectURL(svgBlob)
    }
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const changeGeneratedSvgColor = () => {
    const updatedElements = elements.map(el => ({
      ...el,
      fill: fillColor,
      stroke: strokeColor,
    }))
    setElements(updatedElements)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        // Implement delete functionality for selected element
      } else if (e.ctrlKey && e.key === '+') {
        handleZoomIn()
      } else if (e.ctrlKey && e.key === '-') {
        handleZoomOut()
      }
      // Add more keyboard shortcuts as needed
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex h-screen">
          <div className="flex flex-col space-y-4 mr-4">
            <Toolbar 
              tools={tools} 
              activeTool={activeTool} 
              onToolClick={handleToolClick}
            />
            <ColorPicker color={fillColor} onChange={setFillColor} label="Fill" />
            <ColorPicker color={strokeColor} onChange={setStrokeColor} label="Stroke" />
            <div className="flex items-center space-x-2">
              <Label htmlFor="stroke-width">Stroke Width</Label>
              <Slider
                id="stroke-width"
                min={1}
                max={10}
                step={1}
                value={[strokeWidth]}
                onValueChange={([value]) => setStrokeWidth(value)}
              />
              <span>{strokeWidth}px</span>
            </div>
          </div>
          <div className="flex-grow">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="show-grid">Grid</Label>
                  <Switch
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={setShowGrid}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset View</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
            </div>
            <SVGCanvas
              ref={svgRef}
              activeTool={activeTool}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={strokeWidth}
              zoom={zoom}
              pan={pan}
              onPanChange={setPan}
              showGrid={showGrid}
              svgCode={svgCode}
              onElementsChange={setElements}
            />
            <div className="mt-4 space-y-2">
              <Button 
                className="w-full" 
                onClick={changeGeneratedSvgColor}
              >
                <Palette className="mr-2 h-4 w-4" />
                Change Generated SVG Color
              </Button>
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
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}