import {useState} from 'react'
import {motion} from 'framer-motion'
import {Sun, Moon, Menu, X} from 'lucide-react'
import {Button} from "@/components/ui/button"
import {Switch} from "@/components/ui/switch"

interface HeaderProps {
    isDarkMode: boolean
    toggleTheme: () => void
}

export default function Header({isDarkMode, toggleTheme}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="sticky top-0 bg-white dark:bg-black shadow-md z-50">
            <div className="container mx-auto px-4 py-4">
                <nav className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Ico-Gen</h1>
                    <div className="hidden md:flex space-x-4 items-center">
                        <Button variant="ghost">Features</Button>
                        <Button variant="ghost">Pricing</Button>
                        <Button variant="ghost">About</Button>
                        <Switch
                            checked={isDarkMode}
                            onCheckedChange={toggleTheme}
                            className="ml-4"
                        />
                        {isDarkMode ? <Moon className="h-4 w-4 ml-2"/> : <Sun className="h-4 w-4 ml-2"/>}
                    </div>
                    <Button variant="ghost" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X/> : <Menu/>}
                    </Button>
                </nav>
            </div>
            {isMenuOpen && (
                <motion.div
                    className="md:hidden bg-white dark:bg-black py-4"
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                >
                    <div className="container mx-auto px-4 flex flex-col space-y-2">
                        <Button variant="ghost">Features</Button>
                        <Button variant="ghost">Pricing</Button>
                        <Button variant="ghost">About</Button>
                        <div className="flex items-center justify-between">
                            <span>Theme</span>
                            <Switch
                                checked={isDarkMode}
                                onCheckedChange={toggleTheme}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </header>
    )
}