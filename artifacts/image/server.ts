import { myProvider } from '@/lib/ai/models';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    console.log('[imageDocumentHandler] Starting DALL-E image generation for:', { title });

    try {
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel('dalle'),
        prompt: title,
        n: 1,
        size: "1024x1024",
      });

      if (!image || !image.base64) {
        throw new Error('No image data received from DALL-E');
      }

      console.log('[imageDocumentHandler] DALL-E image generated');
      console.log('[imageDocumentHandler] Sending image to stream');
      
      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });
      console.log('[imageDocumentHandler] Image sent to stream');

      // Return the base64 image data to be stored in the database
      return image.base64;
    } catch (error) {
      console.error('[imageDocumentHandler] Error in onCreateDocument:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (error.message.includes('content policy')) {
          throw new Error('The image request was rejected due to content policy. Please try a different prompt.');
        }
        throw new Error(error.message);
      }
      
      throw new Error('Failed to generate image. Please try again.');
    }
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    console.log('[imageDocumentHandler] Updating with DALL-E:', { description });
    try {
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel('dalle'),
        prompt: description,
        n: 1,
        size: "1024x1024",
      });

      if (!image || !image.base64) {
        throw new Error('No image data received from DALL-E');
      }

      dataStream.writeData({
        type: 'image-delta',
        content: image.base64,
      });

      // Return the base64 image data to be stored in the database
      return image.base64;
    } catch (error) {
      console.error('[imageDocumentHandler] Error in onUpdateDocument:', error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (error.message.includes('content policy')) {
          throw new Error('The image request was rejected due to content policy. Please try a different prompt.');
        }
        throw new Error(error.message);
      }
      
      throw new Error('Failed to update image. Please try again.');
    }
  },
});
