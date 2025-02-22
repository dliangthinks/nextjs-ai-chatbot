import { LoaderIcon } from './icons';
import cn from 'classnames';
import { useState } from 'react';

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({
  title,
  content,
  status,
  isInline,
}: ImageEditorProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      className={cn('flex flex-row items-center justify-center w-full', {
        'h-[calc(100dvh-60px)]': !isInline,
        'h-[200px]': isInline,
      })}
    >
      {status === 'streaming' ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin">
            <LoaderIcon />
          </div>
          <div>Generating Image with DALL-E...</div>
        </div>
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <picture className="flex items-center justify-center">
          <img
            className={cn('object-contain max-w-[1024px] max-h-[1024px]', {
              'p-0 md:p-20': !isInline,
            })}
            src={`data:image/png;base64,${content}`}
            alt={title}
            onError={() => setError('Failed to load image')}
          />
        </picture>
      )}
    </div>
  );
}
