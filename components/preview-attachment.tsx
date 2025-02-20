'use client';

import { Attachment } from 'ai';
import { Skeleton } from './ui/skeleton';

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
}

export function PreviewAttachment({
  attachment,
  isUploading,
}: PreviewAttachmentProps) {
  if (isUploading) {
    return (
      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
        <Skeleton className="h-full w-full" />
        <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
          <p className="text-xs truncate text-center">{attachment.name}</p>
        </div>
      </div>
    );
  }

  const isImage = attachment.contentType?.startsWith('image/');
  const isPDF = attachment.contentType === 'application/pdf';

  return (
    <div className="relative w-24 h-24 rounded-lg overflow-hidden border dark:border-zinc-700">
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={attachment.url}
          alt={attachment.name}
          className="h-full w-full object-cover"
        />
      ) : isPDF ? (
        <div className="flex flex-col items-center justify-center h-full w-full bg-muted px-3 py-2">
          <span className="text-xs font-medium text-center">PDF</span>
          <span className="text-xs text-muted-foreground text-center mt-1">{attachment.name}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full bg-muted">
          <span className="text-xs text-center p-2">File</span>
        </div>
      )}
      {!isPDF && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/80 p-1">
          <p className="text-xs truncate text-center">{attachment.name}</p>
        </div>
      )}
    </div>
  );
}
