/**
 * Image Viewer Component
 */

import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
    url: string;
    name: string;
}

export function ImageViewer({ url, name }: ImageViewerProps) {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center h-full p-6">
            {/* Controls */}
            <div className="mb-4 flex items-center gap-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(z => Math.max(25, z - 25))}
                    className="text-gray-400"
                >
                    <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-400 w-16 text-center">
                    {zoom}%
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setZoom(z => Math.min(200, z + 25))}
                    className="text-gray-400"
                >
                    <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="text-gray-400"
                >
                    <RotateCw className="w-4 h-4" />
                </Button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-auto">
                <img
                    src={url}
                    alt={name}
                    style={{
                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        transition: 'transform 0.3s ease',
                    }}
                    className="max-w-full max-h-full object-contain"
                />
            </div>
        </div>
    );
}
