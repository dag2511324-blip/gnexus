import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  FileCode,
  File,
  Presentation,
  Table,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  src: string;
  type: 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'md';
  title?: string;
  className?: string;
  onClose?: () => void;
}

const TYPE_ICONS = {
  pdf: FileText,
  docx: FileText,
  pptx: Presentation,
  xlsx: Table,
  txt: File,
  md: FileCode,
};

const TYPE_COLORS = {
  pdf: 'text-red-500 bg-red-500/10',
  docx: 'text-blue-500 bg-blue-500/10',
  pptx: 'text-orange-500 bg-orange-500/10',
  xlsx: 'text-green-500 bg-green-500/10',
  txt: 'text-gray-500 bg-gray-500/10',
  md: 'text-purple-500 bg-purple-500/10',
};

export function DocumentViewer({
  src,
  type,
  title = 'Document',
  className,
  onClose,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // Would be dynamic for real PDFs
  const [isFullscreen, setIsFullscreen] = useState(false);

  const Icon = TYPE_ICONS[type];
  const colorClass = TYPE_COLORS[type];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title;
    link.click();
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'rounded-xl overflow-hidden bg-card border border-border',
        isFullscreen && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground uppercase">{type} Document</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Document preview area */}
      <div
        className="flex items-center justify-center bg-muted/30 overflow-auto"
        style={{ height: isFullscreen ? 'calc(100vh - 8rem)' : '400px' }}
      >
        {type === 'pdf' ? (
          <iframe
            src={`${src}#zoom=${zoom}`}
            className="w-full h-full border-0"
            title={title}
          />
        ) : (
          <div className="text-center p-8">
            <div className={cn('h-20 w-20 rounded-2xl mx-auto mb-4 flex items-center justify-center', colorClass)}>
              <Icon className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {type.toUpperCase()} preview is not available in the browser.
            </p>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        )}
      </div>

      {/* Footer - Pagination */}
      {type === 'pdf' && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-secondary/30 border-t border-border">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
