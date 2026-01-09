/**
 * Onboarding Tour
 * Interactive tutorial for new users
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: 'service-cards',
        title: 'Welcome to Agent Neo Elite! 👋',
        description: 'Select a service to start. Each service uses 5 specialized AI models working together.',
        position: 'bottom',
    },
    {
        target: 'workspace-switcher',
        title: 'Switch Workspaces',
        description: 'Toggle between Node Flow, Thought Graph, and Planning Tree modes.',
        position: 'bottom',
    },
    {
        target: 'file-explorer',
        title: 'File Explorer',
        description: 'Browse files and click to preview code. Press Ctrl+B to toggle.',
        position: 'right',
    },
    {
        target: 'command-palette',
        title: 'Command Palette',
        description: 'Press Ctrl+Shift+P for quick access to all features!',
        position: 'bottom',
    },
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const step = TOUR_STEPS[currentStep];

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            setIsActive(false);
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    if (!isActive) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-[#1a1a1a] rounded-xl border border-white/20 p-6 max-w-md shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {step.title}
                            </h3>
                            <div className="text-xs text-gray-500">
                                Step {currentStep + 1} of {TOUR_STEPS.length}
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsActive(false);
                                onComplete();
                            }}
                            className="text-gray-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <p className="text-gray-300 mb-6">
                        {step.description}
                    </p>

                    {/* Progress */}
                    <div className="flex gap-1 mb-6">
                        {TOUR_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${i === currentStep ? 'bg-orange-500' :
                                        i < currentStep ? 'bg-orange-500/50' :
                                            'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="text-gray-400"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleNext}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
