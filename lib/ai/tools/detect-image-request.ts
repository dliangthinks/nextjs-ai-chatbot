import { generateUUID } from '@/lib/utils';
import { DataStreamWriter, Tool } from 'ai';
import { Session } from 'next-auth';
import { z } from 'zod';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';

const DetectImageRequestSchema = z.object({
  shouldGenerateImage: z.boolean().describe('Whether to generate an image'),
  imagePrompt: z.string().optional().describe('The refined prompt for image generation')
});

type DetectImageRequestProps = {
  session: Session;
  dataStream: DataStreamWriter;
};

export function detectImageRequest({ session, dataStream }: DetectImageRequestProps): Tool {
  return {
    description: 'Detects if user message requests image generation',
    parameters: DetectImageRequestSchema,
    execute: async (args: z.infer<typeof DetectImageRequestSchema>) => {
      const { shouldGenerateImage, imagePrompt } = args;
      
      console.log('[detectImageRequest] Tool called with:', { shouldGenerateImage, imagePrompt });
      
      // Early return with empty string if not generating
      if (!shouldGenerateImage || !imagePrompt) {
        return '';
      }

      // Reset artifact state first
      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      try {
        const id = generateUUID();
        
        // Initialize document and make artifact visible immediately
        dataStream.writeData({
          type: 'kind',
          content: 'image',
        });

        dataStream.writeData({
          type: 'id',
          content: id,
        });

        dataStream.writeData({
          type: 'title',
          content: imagePrompt,
        });

        // Set status to streaming and make visible
        dataStream.writeData({
          type: 'status',
          content: 'streaming',
        });

        dataStream.writeData({
          type: 'visibility',
          content: true,
        });

        const documentHandler = documentHandlersByArtifactKind.find(
          handler => handler.kind === 'image'
        );

        if (!documentHandler) {
          throw new Error('No document handler found for kind: image');
        }

        await documentHandler.onCreateDocument({
          id,
          title: imagePrompt,
          dataStream,
          session,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        // Return the image prompt instead of empty string
        return `image generated: ${imagePrompt}`;
      } catch (error) {
        console.error('[detectImageRequest] Error:', error);
        
        // Clean up UI state on error
        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        dataStream.writeData({
          type: 'status',
          content: 'idle',
        });

        dataStream.writeData({
          type: 'visibility',
          content: false,
        });

        // Let the error propagate to be handled by the AI model
        throw error;
      }
    }
  };
} 