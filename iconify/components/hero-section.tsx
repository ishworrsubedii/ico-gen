'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';

export default function HeroSection() {
    const [prompt, setPrompt] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!prompt.trim()) {
            console.error('Prompt is empty. Please enter a description.');
            return;
        }
        router.push(`/playground?prompt=${encodeURIComponent(prompt)}`);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-24 pb-20">
            <motion.div
                className="absolute inset-0 bg-grid-primary/5 bg-[size:30px_30px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            />
            <div className="container relative z-10 mx-auto px-4">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
                        AI-Powered <span className="text-primary">Icon Generation</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Create unique, custom icons in seconds with our advanced AI technology. Simply describe your
                        idea, and watch it come to life.
                    </p>
                </motion.div>
                <motion.form
                    onSubmit={handleSubmit}
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex-grow relative">
                            <Sparkles
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                placeholder="Describe your icon idea..."
                                value={prompt}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
                                className="w-full pl-10 py-6 text-lg"
                            />
                        </div>
                        <Button type="submit" size="lg" className="w-full sm:w-auto">
                            Generate <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </motion.form>
            </div>
        </section>
    );
}