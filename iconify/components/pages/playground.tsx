'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function Playground() {
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState('')
  const [svgCode, setSvgCode] = useState('')
  const [fileFormat, setFileFormat] = useState('svg')

  useEffect(() => {
    const initialPrompt = searchParams.get('prompt')
    if (initialPrompt) {
      setPrompt(initialPrompt)
    }
  }, [searchParams])

  const handleGenerate = () => {
    // Simulating API call
    setSvgCode(`<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`)
  }

  const handleSave = () => {
    // Implement save functionality based on selected file format
    console.log(`Saving as ${fileFormat}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Icon Playground</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Icon Prompt</Label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
        <div className="space-y-4">
          <Label>SVG Preview</Label>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg aspect-square flex items-center justify-center" dangerouslySetInnerHTML={{ __html: svgCode }} />
          <Textarea
            value={svgCode}
            readOnly
            className="w-full h-40"
          />
          <div className="flex space-x-4">
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline">Edit</Button>
          </div>
        </div>
      </div>
    </div>
  )
}