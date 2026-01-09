/**
 * Image Generator Component
 * UI for generating images using Pollinations AI
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Download,
    Copy,
    RefreshCw,
    Settings,
    X,
    Sparkles,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateImage, downloadImage, IMAGE_MODELS } from '@/lib/pollinations-api';
import type { GeneratedImage, ImageModel, ImageGenerationOptions } from '@/types/image';

interface ImageGeneratorProps {
    onImageGenerated?: (image: GeneratedImage) => void;
    isOpen: boolean;
    onClose: () => void;
}

export function ImageGenerator({ onImageGenerated, isOpen, onClose }: ImageGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced options
    const [selectedModel, setSelectedModel] = useState<ImageModel>('flux');
    const [width, setWidth] = useState(1024);
    const [height, setHeight] = useState(1024);
    const [seed, setSeed] = useState<number | undefined>(undefined);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const options: ImageGenerationOptions = {
                model: selectedModel,
                width,
                height,
                seed: seed || undefined,
                nologo: true,
                enhance: true
            };

            const image = await generateImage(prompt, options);
            setGeneratedImage(image);

            // Notify parent component
            if (onImageGenerated) {
                onImageGenerated(image);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate image');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedImage) return;

        try {
            const filename = `gnexus-${Date.now()}.png`;
            await downloadImage(generatedImage.url, filename);
        } catch (err) {
            setError('Failed to download image');
        }
    };

    const handleCopy = async () => {
        if (!generatedImage) return;

        try {
            await navigator.clipboard.writeText(generatedImage.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy URL');
        }
    };

    const handleRegenerate = () => {
        if (prompt) {
            handleGenerate();
        }
    };

    const presetSizes = [
        { label: 'Square', width: 1024, height: 1024 },
        { label: 'Portrait', width: 768, height: 1024 },
        { label: 'Landscape', width: 1024, height: 768 },
        { label: 'Wide', width: 1536, height: 768 },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-200">AI Image Generator</h2>
                                    <p className="text-sm text-gray-500">Powered by Pollinations AI</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {/* Prompt Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Describe your image
                                </label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., A futuristic city at sunset with flying cars and neon lights..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none h-24"
                                    disabled={loading}
                                />
                            </div>

                            {/* Advanced Options */}
                            <div className="mb-6">
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                                </button>

                                <AnimatePresence>
                                    {showAdvanced && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 space-y-4 overflow-hidden"
                                        >
                                            {/* Model Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Model
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {(Object.keys(IMAGE_MODELS) as ImageModel[]).map((model) => (
                                                        <button
                                                            key={model}
                                                            onClick={() => setSelectedModel(model)}
                                                            className={`p-3 rounded-lg border text-left transition-all ${selectedModel === model
                                                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="font-medium text-sm">{IMAGE_MODELS[model].name}</div>
                                                            <div className="text-xs opacity-60 mt-0.5">
                                                                {IMAGE_MODELS[model].description}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Size Presets */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Size Presets
                                                </label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {presetSizes.map((preset) => (
                                                        <button
                                                            key={preset.label}
                                                            onClick={() => {
                                                                setWidth(preset.width);
                                                                setHeight(preset.height);
                                                            }}
                                                            className={`p-2 rounded-lg border text-center transition-all ${width === preset.width && height === preset.height
                                                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <div className="text-xs font-medium">{preset.label}</div>
                                                            <div className="text-xs opacity-60">{preset.width}×{preset.height}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Custom Dimensions */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Width
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={width}
                                                        onChange={(e) => setWidth(Number(e.target.value))}
                                                        min={256}
                                                        max={2048}
                                                        step={64}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Height
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={height}
                                                        onChange={(e) => setHeight(Number(e.target.value))}
                                                        min={256}
                                                        max={2048}
                                                        step={64}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-purple-500/50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Seed */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Seed (Optional - for reproducible results)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={seed || ''}
                                                    onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                                                    placeholder="Random"
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Generated Image */}
                            {generatedImage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6"
                                >
                                    <div className="relative group rounded-lg overflow-hidden border border-white/10">
                                        <img
                                            src={generatedImage.url}
                                            alt={generatedImage.prompt}
                                            className="w-full h-auto"
                                            loading="lazy"
                                        />

                                        {/* Image Actions */}
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                onClick={handleDownload}
                                                className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleCopy}
                                                className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleRegenerate}
                                                className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Image Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-xs text-gray-300 line-clamp-2">{generatedImage.prompt}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {generatedImage.options.width}×{generatedImage.options.height} • {IMAGE_MODELS[generatedImage.options.model || 'flux'].name}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim()}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <RefreshCw className="w-5 h-5 mr-2" />
                                        </motion.div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-5 h-5 mr-2" />
                                        Generate Image
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
