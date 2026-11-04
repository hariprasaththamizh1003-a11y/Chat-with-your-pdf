import { DocumentMeta } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  // Use cloudflare cdn or inline worker for pdfjs in browser
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parses an uploaded File object (PDF or Text) into a DocumentMeta structure.
 */
export async function parseUploadedFile(file: File): Promise<DocumentMeta> {
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const fileBytes = file.size;
  const formattedSize = formatBytes(fileBytes);
  const docId = `custom-doc-${Date.now()}`;

  if (isPdf) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pages: { pageNumber: number; text: string }[] = [];
      let fullText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // @ts-expect-error item has str property
          .map(item => item.str || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        pages.push({
          pageNumber: pageNum,
          text: pageText || `[Page ${pageNum} contained no readable text or was an image scan]`,
        });
        fullText += `\n--- Page ${pageNum} ---\n` + pageText;
      }

      return {
        id: docId,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        filename: file.name,
        sizeBytes: fileBytes,
        sizeFormatted: formattedSize,
        pageCount: numPages,
        category: 'custom',
        description: `User-uploaded PDF document (${numPages} pages).`,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawText: fullText,
        pages,
      };
    } catch (err) {
      console.warn('PDF parsing error with pdfjs, falling back to text read:', err);
      // Fallback
      const text = await file.text();
      return createTextDocMeta(docId, file.name, fileBytes, formattedSize, text);
    }
  } else {
    const text = await file.text();
    return createTextDocMeta(docId, file.name, fileBytes, formattedSize, text);
  }
}

function createTextDocMeta(
  id: string,
  filename: string,
  sizeBytes: number,
  sizeFormatted: string,
  text: string
): DocumentMeta {
  // Approximate page breaks every 3000 chars
  const pageSize = 2500;
  const pages: { pageNumber: number; text: string }[] = [];
  let pNum = 1;
  for (let i = 0; i < text.length; i += pageSize) {
    pages.push({
      pageNumber: pNum++,
      text: text.slice(i, i + pageSize),
    });
  }

  return {
    id,
    title: filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    filename,
    sizeBytes,
    sizeFormatted,
    pageCount: Math.max(1, pages.length),
    category: 'custom',
    description: `User-uploaded document (${filename}).`,
    uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rawText: text,
    pages: pages.length > 0 ? pages : [{ pageNumber: 1, text }],
  };
}
