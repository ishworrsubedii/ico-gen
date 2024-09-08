'use client'
import {useState, useEffect} from 'react'
import Header from './header'
import Footer from './footer'
import HeroSection from './hero-section'
import HowItWorksSection from './how-it-works'
import UpcomingFeaturesSection from './upcoming-features'
import CallToActionSection from './call-to-action'

export function Layout() {
    const [isDarkMode, setIsDarkMode] = useState(false)

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
            <div className="bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
                <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme}/>
                <main className="container mx-auto px-4 py-12">
                    <HeroSection/>
                    <HowItWorksSection/>
                    <br></br>
                    <UpcomingFeaturesSection/>
                    <br></br>
                    <CallToActionSection/>
                    <br></br>
                    
                </main>
                <Footer/>
            </div>
        </div>
    )
}