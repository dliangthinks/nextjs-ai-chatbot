'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { artifactDefinitions, ArtifactKind } from './artifact';
import { Suggestion } from '@/lib/db/schema';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind'
    | 'visibility'
    | 'status';
  content: string | Suggestion | boolean;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  // Reset artifact state when component mounts or id changes
  useEffect(() => {
    setArtifact(initialArtifactData);
    lastProcessedIndex.current = -1;
  }, [id, setArtifact]);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    try {
      (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
        const artifactDefinition = artifactDefinitions.find(
          (artifactDefinition) => artifactDefinition.kind === artifact.kind,
        );

        if (artifactDefinition?.onStreamPart) {
          artifactDefinition.onStreamPart({
            streamPart: delta,
            setArtifact,
            setMetadata,
          });
        }

        setArtifact((draftArtifact) => {
          if (!draftArtifact) {
            return { ...initialArtifactData, status: 'streaming' };
          }

          switch (delta.type) {
            case 'clear':
              return {
                ...initialArtifactData,
                status: 'streaming',
              };

            case 'id':
              return {
                ...draftArtifact,
                documentId: delta.content as string,
                status: 'streaming',
              };

            case 'title':
              return {
                ...draftArtifact,
                title: delta.content as string,
                status: 'streaming',
              };

            case 'kind':
              return {
                ...draftArtifact,
                kind: delta.content as ArtifactKind,
                status: 'streaming',
              };

            case 'visibility':
              return {
                ...draftArtifact,
                isVisible: delta.content as boolean,
              };

            case 'status':
              return {
                ...draftArtifact,
                status: delta.content as 'streaming' | 'idle',
              };

            case 'finish':
              return {
                ...draftArtifact,
                status: 'idle',
              };

            default:
              return draftArtifact;
          }
        });
      });
    } catch (error) {
      console.error('[DataStreamHandler] Error processing stream:', error);
      // Reset to initial state on error
      setArtifact(initialArtifactData);
    }
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
}
