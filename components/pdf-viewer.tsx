'use client';

interface PDFViewerProps {
  content: string;
  title: string;
}

export function PDFViewer({ content }: PDFViewerProps) {
  return (
    <div className="w-full h-full">
      <iframe
        src={content}
        className="w-full h-full border-0"
        title="PDF Viewer"
      />
    </div>
  );
} 