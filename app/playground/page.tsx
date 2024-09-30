"use client"

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import {
  Square,
  Circle,
  Type,
  Eraser,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Sun,
  Moon,
  Trash2
} from 'lucide-react'
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
        <div className="text-2xl font-bold text-gray-800 dark:text-white">Playground</div>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Home</a>
            </li>
            <li><a href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">About</a>
            </li>
            <li><a href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Contact</a>
            </li>
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

const ColorPicker: React.FC<{
  color: string;
  onChange: (color: string) => void;
  label: string;
  allowTransparent?: boolean
}> = ({ color, onChange, label, allowTransparent }) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        type="color"
        value={color === 'transparent' ? '#ffffff' : color}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 p-1 rounded"
      />
      {allowTransparent && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange('transparent')}
          className={color === 'transparent' ? 'border-2 border-blue-500' : ''}
        >
          Transparent
        </Button>
      )}
    </div>
  )
}

const Toolbar: React.FC<{
  tools: { name: string; icon: React.ElementType }[];
  activeTool: string;
  onToolClick: (toolName: string) => void;
  onClearAll: () => void;
}> = ({ tools, activeTool, onToolClick, onClearAll }) => {
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
                <tool.icon className="h-4 w-4 mr-2" />
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

const SVGCanvas: React.FC<{
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
  eraserSize: number;
  elements: SVGElement[];
  onMouseDown: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseMove: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}> = ({
  activeTool,
  fillColor,
  strokeColor,
  strokeWidth,
  zoom,
  pan,
  onPanChange,
  showGrid,
  svgCode,
  onElementsChange,
  eraserSize,
  elements,
  onMouseLeave
}) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
    const canvasRef = useRef<SVGSVGElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState<string | null>(null)
    const [editingTextId, setEditingTextId] = useState<string | null>(null)

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

        onElementsChange(newElements)
      }
    }, [svgCode, fillColor, strokeColor, strokeWidth, onElementsChange])

    const getMousePosition = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const CTM = canvasRef.current!.getScreenCTM()!
      return {
        x: (event.clientX - CTM.e) / CTM.a - pan.x,
        y: (event.clientY - CTM.f) / CTM.d - pan.y,
      }
    }

    const startDrawing = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      if (activeTool === 'Move') return
      setIsDrawing(true)
      setStartPoint(getMousePosition(event as unknown as React.MouseEvent<SVGSVGElement, MouseEvent>))
    }

    const draw = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
      if (!isDrawing) return
      const currentPoint = getMousePosition(event as unknown as React.MouseEvent<SVGSVGElement, MouseEvent>)
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
          const updatedElements = elements.map(el => {
            if (el.type === 'rect' || el.type === 'circle') {
              const distance = Math.hypot(currentPoint.x - el.x, currentPoint.y - el.y)
              if (distance <= eraserSize / 2) {
                return { ...el, fill: 'transparent' }
              }
            }
            return el
          })
          onElementsChange(updatedElements)
          break
        default:
          return
      }

      if (newElement && activeTool !== 'Eraser') {
        onElementsChange([...elements, newElement])
      }
    }

    const endDrawing = () => {
      setIsDrawing(false)
    }

    const handleMouseDown = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const target = event.target as unknown as SVGElement;
      if (activeTool === 'Move') {

        if (target !== (event.currentTarget as unknown as SVGElement)) {

          const id = target.id;
          const elementToMove = elements.find(el => el.id === id);
          if (elementToMove) {
            setSelectedElementId(elementToMove.id);
            setIsDragging(true);
            setDragStart(getMousePosition(event));
          }
        } else {
          setIsDragging(true);
          setDragStart({ x: event.clientX, y: event.clientY });
        }
      } else {
        startDrawing(event as unknown as React.MouseEvent<SVGElement>); // Cast to unknown first
      }
    };

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (activeTool === 'Move' && isDragging) {
        if (selectedElementId) {
          const { x, y } = getMousePosition(event);
          const dx = x - dragStart.x;
          const dy = y - dragStart.y;
          const updatedElements = elements.map(el => {
            if (el.id === selectedElementId) {
              if (resizeHandle) {
                switch (resizeHandle) {
                  case 'nw':
                    return {
                      ...el,
                      x: el.x + dx,
                      y: el.y + dy,
                      width: (el.width || 0) - dx,
                      height: (el.height || 0) - dy
                    };
                  case 'ne':
                    return {
                      ...el,
                      y: el.y + dy,
                      width: (el.width || 0) + dx,
                      height: (el.height || 0) - dy
                    };
                  case 'sw':
                    return {
                      ...el,
                      x: el.x + dx,
                      width: (el.width || 0) - dx,
                      height: (el.height || 0) + dy
                    };
                  case 'se':
                    return {
                      ...el,
                      width: (el.width || 0) + dx,
                      height: (el.height || 0) + dy
                    };
                  default:
                    return el;
                }
              } else {
                if (el.type === 'circle') {
                  return { ...el, x: el.x + dx, y: el.y + dy };
                } else if (el.type === 'rect') {
                  return { ...el, x: el.x + dx, y: el.y + dy };
                } else if (el.type === 'text') {
                  return { ...el, x: el.x + dx, y: el.y + dy };
                }
              }
            }
            return el;
          });
          onElementsChange(updatedElements);
          setDragStart({ x, y });
        } else {
          const dx = event.clientX - dragStart.x;
          const dy = event.clientY - dragStart.y;
          onPanChange({ x: pan.x + dx / zoom, y: pan.y + dy / zoom });
          setDragStart({ x: event.clientX, y: event.clientY });
        }
      } else {
        draw(event as unknown as React.MouseEvent<SVGElement, MouseEvent>);
      }
    };


    const handleMouseUp = () => {
      if (activeTool === 'Move') {
        setSelectedElementId(null)
        setIsDragging(false)
        setResizeHandle(null)
      } else {
        endDrawing()
      }
    }

    const handleDoubleClick = (event: React.MouseEvent<SVGTextElement, MouseEvent>, id: string) => {
      const element = elements.find(el => el.id === id)
      if (element && element.type === 'text') {
        setEditingTextId(id)
      }
    }

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
      const updatedElements = elements.map(el =>
        el.id === id ? { ...el, text: event.target.value } : el
      )
      onElementsChange(updatedElements)
    }

    const handleTextBlur = () => {
      setEditingTextId(null)
    }

    const renderGrid = () => {
      if (!showGrid) return null;

      const gridSize = 10;
      const width = 800 / zoom;
      const height = 600 / zoom;

      return (
        <g>
          <defs>
            <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.1)"
                strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
              <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
              <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="rgba(0,0,0,0.2)"
                strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
        </g>
      );
    };

    const renderResizeHandles = (element: SVGElement) => {
      if ((element.type !== 'rect' && element.type !== 'circle') || selectedElementId !== element.id) return null;

      const handleSize = 8;
      let handles;

      if (element.type === 'rect') {
        handles = [
          { position: 'nw', x: element.x - handleSize / 2, y: element.y - handleSize / 2 },
          { position: 'ne', x: element.x + (element.width || 0) - handleSize / 2, y: element.y - handleSize / 2 },
          { position: 'sw', x: element.x - handleSize / 2, y: element.y + (element.height || 0) - handleSize / 2 },
          {
            position: 'se',
            x: element.x + (element.width || 0) - handleSize / 2,
            y: element.y + (element.height || 0) - handleSize / 2
          },
        ];
      } else if (element.type === 'circle') {
        handles = [
          { position: 'n', x: element.x, y: element.y - (element.radius || 0) },
          { position: 'e', x: element.x + (element.radius || 0), y: element.y },
          { position: 's', x: element.x, y: element.y + (element.radius || 0) },
          { position: 'w', x: element.x - (element.radius || 0), y: element.y },
        ];
      }

      return handles?.map((handle) => (
        <rect
          key={handle.position}
          x={handle.x - handleSize / 2}
          y={handle.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="black"
          strokeWidth="1"
          style={{ cursor: 'pointer' }}
          onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
            e.stopPropagation();
            setResizeHandle(handle.position);
            setIsDragging(true);
            setDragStart(getMousePosition(e as unknown as React.MouseEvent<SVGSVGElement, MouseEvent>));
          }}
        />
      ));
    };

    return (
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        viewBox={`${-pan.x} ${-pan.y} ${800 / zoom} ${600 / zoom}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={onMouseLeave}
        className="border-2 border-gray-300 rounded bg-white dark:bg-gray-900"
      >
        {renderGrid()}
        {elements.map((element) => {
          switch (element.type) {
            case 'rect':
              return (
                <g key={element.id}>
                  <rect
                    id={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill}
                    stroke={element.stroke}
                    strokeWidth={element.strokeWidth}
                  />
                  {renderResizeHandles(element)}
                </g>
              )
            case 'circle':
              return (
                <g key={element.id}>
                  <circle
                    id={element.id}
                    cx={element.x}
                    cy={element.y}
                    r={element.radius}
                    fill={element.fill}
                    stroke={element.stroke}
                    strokeWidth={element.strokeWidth}
                  />
                  {renderResizeHandles(element)}
                </g>
              )
            case 'text':
              return (
                <g key={element.id}>
                  {editingTextId === element.id ? (
                    <foreignObject x={element.x} y={element.y} width="200" height="30">
                      <input
                        type="text"
                        value={element.text}
                        onChange={(e) => handleTextChange(e, element.id)}
                        onBlur={handleTextBlur}
                        autoFocus
                        className="w-full h-full border-none bg-transparent outline-none"
                      />
                    </foreignObject>
                  ) : (
                    <text
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      fill={element.fill}
                      stroke={element.stroke}
                      strokeWidth={element.strokeWidth}
                      fontSize="16"
                      onDoubleClick={(e) => handleDoubleClick(e, element.id)}
                    >
                      {element.text}
                    </text>
                  )}
                </g>
              )
            default:
              return null
          }
        })}
      </svg>
    )
  }

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
  const [elements, setElements] = useState<SVGElement[]>([])
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [eraserSize, setEraserSize] = useState(20)
  const [isLoading, setIsLoading] = useState(false)
  const [prompt, setPrompt] = useState<string>('')

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName)
  }
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlPrompt = urlParams.get('prompt')
    if (urlPrompt) {
      setPrompt(urlPrompt)
      fetchSvg(urlPrompt)
    }
  }, [])

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

  const fetchSvg = async (promptText: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post<ApiResponse>('https://ico-gen-main.onrender.com/generate_icon', { prompt: promptText });
      if (response.status === 200 && response.data.status === 'success') {
        setSvgCode(response.data.data);
      } else {
        console.error('Error generating SVG:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching SVG:', error);
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (format: 'svg' | 'png' | 'jpg') => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const cleanedSvgData = svgData.replace(/<g>[\s\S]*?<\/g>/, '') // Remove grid
    const svgBlob = new Blob([cleanedSvgData], { type: 'image/svg+xml;charset=utf-8' })

    if (format === 'svg') {
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'svg-editor.svg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
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
  const handleClearAll = () => {
    setElements([])
    setSvgCode('')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        setElements(prevElements => prevElements.filter(el => el.id !== selectedElementId))
        setSelectedElementId(null)
      } else if (e.ctrlKey && e.key === '+') {
        handleZoomIn()
      } else if (e.ctrlKey && e.key === '-') {
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementId])

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])


  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
          <div className="flex w-full mb-4">
            <div className="w-64 mr-4">
              <Toolbar
                tools={tools}
                activeTool={activeTool}
                onToolClick={handleToolClick}
                onClearAll={handleClearAll}
              />
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4 mt-4">
                <ColorPicker color={fillColor} onChange={setFillColor} label="Fill" allowTransparent />
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
                {activeTool === 'Eraser' && (
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="eraser-size">Eraser Size</Label>
                    <Slider
                      id="eraser-size"
                      min={5}
                      max={50}
                      step={1}
                      value={[eraserSize]}
                      onValueChange={([value]) => setEraserSize(value)}
                    />
                    <span>{eraserSize}px</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-grow flex flex-col items-center">
              <div className="mb-4 flex justify-between items-center w-full">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="show-grid">Grid</Label>
                    <Switch
                      id="show-grid"
                      checked={showGrid}
                      onCheckedChange={setShowGrid}
                    />
                  </div>
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
              <div className="h-[550px] w-[700px] border-2 border-gray-300 rounded-lg overflow-hidden">
                <SVGCanvas
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
                  eraserSize={eraserSize}
                  elements={elements}
                  onMouseDown={() => { }}
                  onMouseMove={() => { }}
                  onMouseUp={() => { }}
                  onMouseLeave={() => { }}
                />
              </div>
              <div className="mt-4 flex justify-center space-x-4">
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
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}