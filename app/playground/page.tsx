"use client"

import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import Header from '../components/Header'
import Toolbar from '../components/Toolbar'
import ColorPicker from '../components/ColorPicker'
import SVGCanvas from '../components/SVGCanvas'
import DownloadMenu from '../components/DownloadMenu'
import ThemeToggle from '../components/ThemeToggle'
import GenerateSVG from '../components/GenerateSVG'

type ApiResponse = {
  status: string;
  data: string;
};

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
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('https://ico-gen-main.onrender.com/generate_icon', { prompt: promptText });
      if (response.data.status === "success") {
        const rawSvg = response.data.data;
        const cleanedSvg = rawSvg.replace(/<title>.*?<\/title>|<desc>.*?<\/desc>|<\?xml.*?\?>|<!DOCTYPE.*?>|<!--.*?-->|<path d="M0 0h24v24H0z" fill="none"\/>/g, '').trim();
        setSvgCode(cleanedSvg);
        setSelectedElementId(null);
        // setIsDrawing(false);
      } else {
        console.error('Error generating SVG:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching SVG:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = (format: 'svg' | 'png' | 'jpg') => {
    console.log('Downloading SVG'); // Add this line
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const cleanedSvgData = svgData.replace(/<g>[\s\S]*?<\/g>/, ''); // Remove grid
    const svgBlob = new Blob([cleanedSvgData], { type: 'image/svg+xml;charset=utf-8' });
    console.log('Downloading SVG:', cleanedSvgData); // Add this line
    const link = document.createElement('a');
    if (format === 'svg') {
      const url = URL.createObjectURL(svgBlob);
      link.href = url;
      link.download = 'svg-editor.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 min-h-screen">
        <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
          <div className="flex w-full mb-4">
            <div className="w-64 mr-4">
              <Toolbar
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
                <DownloadMenu handleDownload={handleDownload} />
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
                />
              </div>
              <div className="mt-4 flex justify-center space-x-4">
                <ThemeToggle handleZoomIn={handleZoomIn} handleZoomOut={handleZoomOut} handleReset={handleReset} />
              </div>
              <GenerateSVG prompt={prompt} setPrompt={setPrompt} fetchSvg={fetchSvg} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
