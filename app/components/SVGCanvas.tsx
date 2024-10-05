import React, { useState, useRef, useEffect } from 'react'

export type CanvasSVGElement = {
    id: string;
    type: 'rect' | 'circle' | 'text' | 'path';
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
    onElementsChange: (elements: CanvasSVGElement[]) => void;
    eraserSize: number;
    elements: CanvasSVGElement[];
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
    elements
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
              const cleanedSvgCode = svgCode.replace(/```svg|```/g, '');
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(cleanedSvgCode, 'image/svg+xml');
              const svgElement = svgDoc.documentElement;
              const newElements: CanvasSVGElement[] = [];
          
              Array.from(svgElement.children).forEach((child, index) => {
                if (child instanceof SVGElement) {
                  const elementProps: { [key: string]: string } = {};
                  Array.from(child.attributes).forEach(attr => {
                    elementProps[attr.name] = attr.value;
                  });
                  newElements.push({
                    id: `generated-${index}`,
                    type: child.tagName.toLowerCase() as 'rect' | 'circle' | 'text' | 'path',
                    x: parseFloat(elementProps.x || elementProps.cx || '0'),
                    y: parseFloat(elementProps.y || elementProps.cy || '0'),
                    width: parseFloat(elementProps.width || '0'),
                    height: parseFloat(elementProps.height || '0'),
                    radius: parseFloat(elementProps.r || '0'),
                    fill: elementProps.fill || fillColor,
                    stroke: elementProps.stroke || strokeColor,
                    strokeWidth: parseFloat(elementProps['stroke-width'] || strokeWidth.toString()),
                    text: child.tagName.toLowerCase() === 'path' ? elementProps.d : child.textContent || undefined,
                  });
                }
              });
          
              if (JSON.stringify(newElements) !== JSON.stringify(elements)) {
                onElementsChange(newElements);
              }
            }
          }, [svgCode, fillColor, strokeColor, strokeWidth, onElementsChange, elements]);

        const getMousePosition = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
            const CTM = canvasRef.current!.getScreenCTM()!;
            return {
                x: (event.clientX - CTM.e) / CTM.a - pan.x,
                y: (event.clientY - CTM.f) / CTM.d - pan.y,
            };
        }

        const startDrawing = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
            if (activeTool === 'Move') return;
            setIsDrawing(true);
            setStartPoint(getMousePosition(event as unknown as React.MouseEvent<SVGSVGElement, MouseEvent>));
        }
        const draw = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
            if (!isDrawing) return
            const currentPoint = getMousePosition(event as unknown as React.MouseEvent<SVGSVGElement, MouseEvent>)
            let newElement: CanvasSVGElement | null = null

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

            const gridSize = 100; // Adjust grid size to fit 5x5
            const width = 100; // Total width for 5x5 grid
            const height = 500; // Total height for 5x5 grid

            return (
                <g>
                    <defs>
                        <pattern id="smallGrid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
                            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
                        </pattern>
                        <pattern id="grid" width={gridSize * 5} height={gridSize * 5} patternUnits="userSpaceOnUse">
                            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#smallGrid)" />
                            <path d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width={width} height={height} fill="url(#grid)" />
                </g>
            );
        };

        const renderResizeHandles = (element: CanvasSVGElement) => {
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
              className="border-2 border-gray-300 rounded bg-white dark:bg-gray-900"
            >
              {renderGrid()}
              <g transform={`translate(${400 / zoom}, ${300 / zoom}) scale(${1.4 * zoom})`}> {/* Adjust translation and scale */}
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
                      );
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
                      );
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
                      );
                    case 'path':
                      return (
                        <g key={element.id}>
                          <path
                            id={element.id}
                            d={element.text} // Assuming 'text' holds the 'd' attribute for paths
                            fill={element.fill}
                            stroke={element.stroke}
                            strokeWidth={element.strokeWidth}
                          />
                        </g>
                      );
                    default:
                      return null;
                  }
                })}
              </g>
            </svg>
          );
    }

export default SVGCanvas