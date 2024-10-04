import React from 'react'
import { Button } from "@/components/ui/button"
import { Sun, Moon } from 'lucide-react'

const Header: React.FC<{ isDarkMode: boolean; toggleTheme: () => void }> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800 dark:text-white">Playground</div>
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

export default Header