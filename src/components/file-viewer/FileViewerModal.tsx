import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { FileEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface FileViewerModalProps {
  file: FileEntry;
  getBlob: (blobKey: string) => Promise<ArrayBuffer | undefined>;
  onClose: () => void;
}

export default function FileViewerModal({ file, getBlob, onClose }: FileViewerModalProps) {
  const [pdfData, setPdfData] = useState<{ data: ArrayBuffer } | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getBlob(file.blobKey);
        if (cancelled) return;
        if (!data) {
          setError('File data not found');
          setLoading(false);
          return;
        }
        setPdfData({ data: data.slice(0) });
      } catch {
        if (!cancelled) setError('Failed to load file');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file.blobKey, getBlob]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrentPage((p) => Math.max(1, p - 1));
      if (e.key === 'ArrowRight') setCurrentPage((p) => Math.min(numPages, p + 1));
    },
    [onClose, numPages]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const fitWidth = () => setScale(1.0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
    >
      {/* Toolbar */}
      <div className="glass-strong flex h-12 items-center justify-between px-4 text-foreground">
        <span className="text-sm font-medium truncate max-w-xs">
          {file.name}.{file.extension}
        </span>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomOut} title="Zoom out">
            <ZoomOut size={16} />
          </Button>
          <span className="min-w-[4rem] text-center text-xs text-muted">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={zoomIn} title="Zoom in">
            <ZoomIn size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fitWidth} title="Fit width">
            <Maximize2 size={16} />
          </Button>

          <Separator orientation="vertical" className="mx-2 h-5" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="min-w-[5rem] text-center text-xs text-muted">
            {currentPage} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
          >
            <ChevronRight size={16} />
          </Button>

          <Separator orientation="vertical" className="mx-2 h-5" />

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} title="Close">
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center">
            <p className="text-muted">{error}</p>
          </div>
        )}

        {pdfData && (
          <Document
            file={pdfData}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            onLoadError={() => setError('Failed to render PDF')}
            loading={null}
          >
            <Page
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
              className="shadow-2xl rounded-lg overflow-hidden"
            />
          </Document>
        )}
      </div>
    </motion.div>
  );
}
