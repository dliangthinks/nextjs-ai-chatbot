import { createDocumentHandler } from '@/lib/artifacts/server';

export const pdfDocumentHandler = createDocumentHandler<'pdf'>({
  kind: 'pdf',
  onCreateDocument: async ({ title, dataStream }) => {
    // Handle initial PDF upload
    let draftContent = '';

    // Process PDF content
    dataStream.writeData({
      type: 'pdf-delta',
      content: draftContent,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    // Handle PDF updates if needed
    return description;
  },
}); 