/**
 * PDF Viewer Component
 */

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
    url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex-1 overflow-auto p-6">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                >
                    <Page
                        pageNumber={pageNumber}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>

            {numPages > 1 && (
                <div className="flex items-center gap-4 px-6 py-4 border-t border-white/10 bg-white/5">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                        disabled={pageNumber <= 1}
                        className="text-gray-400"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm text-gray-400">
                        Page {pageNumber} of {numPages}
                    </span>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                        disabled={pageNumber >= numPages}
                        className="text-gray-400"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
