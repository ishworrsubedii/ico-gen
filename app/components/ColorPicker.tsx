import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

export default ColorPicker