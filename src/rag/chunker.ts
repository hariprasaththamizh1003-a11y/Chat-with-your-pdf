import { DocumentChunk, DocumentMeta } from '../types';

export interface ChunkOptions {
  chunkSize: number;
  chunkOverlap: number;
}

export const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  chunkSize: 600,
  chunkOverlap: 120,
};

/**
 * Splits document pages into overlapping text chunks, preserving page numbers.
 */
export function chunkDocument(
  doc: DocumentMeta,
  options: ChunkOptions = DEFAULT_CHUNK_OPTIONS
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const { chunkSize, chunkOverlap } = options;

  const pages = doc.pages && doc.pages.length > 0
    ? doc.pages
    : [{ pageNumber: 1, text: doc.rawText || '' }];

  let globalChunkIndex = 0;

  for (const page of pages) {
    const pageText = (page.text || '').trim();
    if (!pageText) continue;

    // Split text into paragraphs first, then sentences, then fallback to character window
    const pageChunks = splitTextRecursively(pageText, chunkSize, chunkOverlap);

    for (const chunkText of pageChunks) {
      if (!chunkText.trim()) continue;

      const words = chunkText.trim().split(/\s+/).length;
      const tokenEstimate = Math.ceil(words * 1.3);

      chunks.push({
        id: `${doc.id}-p${page.pageNumber}-c${globalChunkIndex}`,
        docId: doc.id,
        docTitle: doc.title,
        pageNumber: page.pageNumber,
        chunkIndex: globalChunkIndex,
        text: chunkText.trim(),
        charStart: 0,
        charEnd: chunkText.length,
        tokenEstimate,
      });

      globalChunkIndex++;
    }
  }

  return chunks;
}

/**
 * Recursive character text splitter inspired by LangChain's RecursiveCharacterTextSplitter.
 * Tries separators in order: double newline -> single newline -> period/punctuation -> space -> character.
 */
export function splitTextRecursively(
  text: string,
  chunkSize: number,
  chunkOverlap: number
): string[] {
  const separators = ['\n\n', '\n', '. ', '? ', '! ', '; ', ' '];

  function split(textToSplit: string, currentSeparators: string[]): string[] {
    if (textToSplit.length <= chunkSize) {
      return [textToSplit];
    }

    if (currentSeparators.length === 0) {
      // Force split by character slice with overlap
      const result: string[] = [];
      let start = 0;
      while (start < textToSplit.length) {
        const end = Math.min(start + chunkSize, textToSplit.length);
        result.push(textToSplit.slice(start, end));
        if (end === textToSplit.length) break;
        start += Math.max(1, chunkSize - chunkOverlap);
      }
      return result;
    }

    const separator = currentSeparators[0];
    const nextSeparators = currentSeparators.slice(1);
    const parts = textToSplit.split(separator);

    const mergedChunks: string[] = [];
    let currentChunk = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const partWithSep = currentChunk ? separator + part : part;

      if ((currentChunk + partWithSep).length <= chunkSize) {
        currentChunk += partWithSep;
      } else {
        if (currentChunk) {
          mergedChunks.push(currentChunk);
          // Apply overlap from end of currentChunk
          const overlapText = currentChunk.slice(Math.max(0, currentChunk.length - chunkOverlap));
          currentChunk = overlapText + separator + part;
        } else {
          // Single piece is larger than chunkSize, recurse with finer separators
          const subChunks = split(part, nextSeparators);
          mergedChunks.push(...subChunks);
          currentChunk = '';
        }
      }
    }

    if (currentChunk.trim()) {
      mergedChunks.push(currentChunk);
    }

    return mergedChunks;
  }

  const rawChunks = split(text, separators);
  return rawChunks.map(c => c.trim()).filter(c => c.length > 0);
}
