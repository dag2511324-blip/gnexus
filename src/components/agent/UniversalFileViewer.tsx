import { useState } from 'react';
import { X, Download, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { HTMLViewer } from './viewers/HTMLViewer';
// import { ExcelViewer } from './viewers/ExcelViewer';
// import { PPTViewer } from './viewers/PPTViewer';
// import { ImageViewer } from './viewers/ImageViewer';
import { Button } from '@/components/ui/button';

export interface ViewerFile {
    name: string;
    type: string;
    url?: string;
    content?: string;
}

interface UniversalFileViewerProps {
    file: ViewerFile;
    onClose: () => void;
}

export function UniversalFileViewer({ file, onClose }: UniversalFileViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const getFileType = () => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'html' || ext === 'htm') return 'html';
        if (ext === 'pdf') return 'pdf';
        if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'excel';
        if (ext === 'pptx' || ext === 'ppt') return 'ppt';
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) return 'image';
        return 'text';
    };

    const fileType = getFileType();

    const handleDownload = () => {
        if (file.url) {
            const a = document.createElement('a');
            a.href = file.url;
            a.download = file.name;
            a.click();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        ${isFullscreen ? 'w-full h-full' : 'w-[90vw] h-[90vh] max-w-7xl mx-auto mt-[5vh]'}
                        bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden
                        flex flex-col shadow-2xl
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white truncate">
                                {file.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {fileType.toUpperCase()} Document
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleDownload}
                                className="text-gray-400 hover:text-white"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-gray-400 hover:text-white"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Viewer Content */}
                    <div className="flex-1 overflow-auto bg-white/5 p-6">
                        {fileType === 'html' && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <p className="mb-2">HTML Preview</p>
                                    <Button onClick={handleDownload} variant="outline">
                                        Download HTML
                                    </Button>
                                </div>
                            </div>
                        )}
                        {fileType === 'pdf' && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <p className="mb-2">PDF Viewer</p>
                                    <Button onClick={handleDownload} variant="outline">
                                        Download PDF
                                    </Button>
                                </div>
                            </div>
                        )}
                        {fileType === 'excel' && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <p className="mb-2">Excel Spreadsheet</p>
                                    <Button onClick={handleDownload} variant="outline">
                                        Download Excel
                                    </Button>
                                </div>
                            </div>
                        )}
                        {fileType === 'ppt' && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <p className="mb-2">PowerPoint Presentation</p>
                                    <Button onClick={handleDownload} variant="outline">
                                        Download PowerPoint
                                    </Button>
                                </div>
                            </div>
                        )}
                        {fileType === 'image' && file.url && (
                            <div className="flex items-center justify-center h-full p-6">
                                <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        {fileType === 'text' && (
                            <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                {file.content || 'No content available'}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
