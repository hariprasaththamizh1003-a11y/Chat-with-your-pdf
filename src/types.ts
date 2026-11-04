export interface DocumentMeta {
  id: string;
  title: string;
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  pageCount: number;
  category: 'research' | 'engineering' | 'business' | 'science' | 'custom';
  description: string;
  uploadedAt: string;
  rawText?: string;
  pages?: { pageNumber: number; text: string }[];
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  charStart: number;
  charEnd: number;
  tokenEstimate: number;
  embedding?: number[];
}

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number; // 0.0 to 1.0 (cosine similarity)
  matchedTerms: string[];
}

export interface RAGConfig {
  chunkSize: number; // e.g. 500 characters
  chunkOverlap: number; // e.g. 100 characters
  topK: number; // e.g. 3 or 4
  similarityThreshold: number; // e.g. 0.15
  metric: 'cosine' | 'dot_product';
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
  durationMs: number;
  details: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: RetrievalResult[];
  latencyMs?: number;
  pipelineSteps?: PipelineStep[];
  promptContextSnippet?: string;
}
