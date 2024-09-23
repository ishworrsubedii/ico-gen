
'use client'

import {useState, useEffect} from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'
import HeroSection from '@/components/hero-section'
import HowItWorksSection from '@/components/how-it-works'
import UpcomingFeaturesSection from '@/components/upcoming-features'
import CallToActionSection from '@/components/call-to-action'


export default function HomepageLayout() {
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

