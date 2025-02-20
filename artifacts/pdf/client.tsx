import { Artifact } from '@/components/create-artifact';
import { PDFViewer } from '@/components/pdf-viewer';

export const pdfArtifact = new Artifact<'pdf'>({
  kind: 'pdf',
  description: 'PDF document viewer',
  content: PDFViewer,
  onStreamPart: () => {},
  actions: [],
  toolbar: [],
}); 