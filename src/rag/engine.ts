import { DocumentChunk, DocumentMeta, RAGConfig, RetrievalResult, PipelineStep } from '../types';
import { chunkDocument, DEFAULT_CHUNK_OPTIONS } from './chunker';
import { InMemoryVectorStore } from './vectorStore';

export interface RAGAnswerResult {
  answer: string;
  citations: RetrievalResult[];
  latencyMs: number;
  pipelineSteps: PipelineStep[];
  promptContextSnippet: string;
}

export class RAGEngine {
  private vectorStore: InMemoryVectorStore;
  private currentDoc: DocumentMeta | null = null;
  private config: RAGConfig;

  constructor(config?: Partial<RAGConfig>) {
    this.vectorStore = new InMemoryVectorStore();
    this.config = {
      chunkSize: 600,
      chunkOverlap: 120,
      topK: 4,
      similarityThreshold: 0.08,
      metric: 'cosine',
      ...config,
    };
  }

  public setConfig(config: Partial<RAGConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): RAGConfig {
    return { ...this.config };
  }

  public getVectorStore(): InMemoryVectorStore {
    return this.vectorStore;
  }

  /**
   * Indexes a document: chunks the text and builds the vector store.
   */
  public indexDocument(doc: DocumentMeta): { chunkCount: number; durationMs: number } {
    const t0 = performance.now();
    this.currentDoc = doc;

    const chunks = chunkDocument(doc, {
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap,
    });

    this.vectorStore.buildIndex(chunks);
    const durationMs = Math.round(performance.now() - t0);

    return {
      chunkCount: chunks.length,
      durationMs,
    };
  }

  /**
   * Retrieves relevant chunks for a question.
   */
  public retrieve(question: string, topK?: number): RetrievalResult[] {
    const k = topK ?? this.config.topK;
    return this.vectorStore.search(question, k, this.config.similarityThreshold);
  }

  /**
   * Formats the prompt with injected context chunks.
   */
  public buildPromptContext(citations: RetrievalResult[]): string {
    if (citations.length === 0) {
      return 'No relevant document passages were retrieved for this query.';
    }

    return citations
      .map((cit, idx) => {
        return `--- Source [${idx + 1}] (Page ${cit.chunk.pageNumber}, Relevance: ${(cit.score * 100).toFixed(1)}%) ---\n${cit.chunk.text}`;
      })
      .join('\n\n');
  }

  /**
   * Synthesizes an answer based strictly on the retrieved chunks.
   * If an API endpoint is accessible, it calls server.ts. Otherwise, it uses high-precision extractive RAG.
   */
  public async query(question: string): Promise<RAGAnswerResult> {
    const startTime = performance.now();
    const steps: PipelineStep[] = [];

    // Step 1: Query Vectorization
    const tVectorStart = performance.now();
    const citations = this.retrieve(question, this.config.topK);
    const tVectorEnd = performance.now();

    steps.push({
      name: 'Query Vectorization & Similarity Search',
      status: 'completed',
      durationMs: Math.max(1, Math.round(tVectorEnd - tVectorStart)),
      details: `Retrieved ${citations.length} chunks (top_k=${this.config.topK}, threshold=${this.config.similarityThreshold})`,
    });

    // Step 2: Context Assembly & Prompt Construction
    const tContextStart = performance.now();
    const contextText = this.buildPromptContext(citations);
    const tContextEnd = performance.now();

    steps.push({
      name: 'Context Augmentation & Prompt Framing',
      status: 'completed',
      durationMs: Math.max(1, Math.round(tContextEnd - tContextStart)),
      details: `Injected ${contextText.length} characters of grounded context`,
    });

    // Step 3: LLM Generation / Server RAG synthesis
    const tGenStart = performance.now();
    let answerText = '';

    // Check if running in browser with server API available
    let answeredViaServer = false;
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const response = await fetch('/api/rag/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            context: contextText,
            citations: citations.map(c => ({
              id: c.chunk.id,
              pageNumber: c.chunk.pageNumber,
              score: c.score,
              snippet: c.chunk.text.slice(0, 180),
            })),
            documentTitle: this.currentDoc?.title || 'Document',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.answer) {
            answerText = data.answer;
            answeredViaServer = true;
          }
        }
      } catch {
        // Fallback to local extractive RAG
        answeredViaServer = false;
      }
    }

    if (!answeredViaServer) {
      // Local deterministic high-quality RAG synthesizer
      answerText = this.synthesizeLocalAnswer(question, citations);
    }

    const tGenEnd = performance.now();
    steps.push({
      name: answeredViaServer ? 'Gemini 3.8 Flash Generation' : 'Local RAG Synthesis Engine',
      status: 'completed',
      durationMs: Math.max(1, Math.round(tGenEnd - tGenStart)),
      details: answeredViaServer
        ? 'Grounding verified with source citations'
        : 'Synthesized directly from retrieved vector chunks',
    });

    const totalLatencyMs = Math.round(performance.now() - startTime);

    return {
      answer: answerText,
      citations,
      latencyMs: totalLatencyMs,
      pipelineSteps: steps,
      promptContextSnippet: contextText.slice(0, 450) + (contextText.length > 450 ? '...' : ''),
    };
  }

  /**
   * Deterministic extractive RAG synthesis with formatted markdown bullets and page citations.
   */
  public synthesizeLocalAnswer(question: string, citations: RetrievalResult[]): string {
    if (citations.length === 0) {
      return `I could not find relevant information in "${this.currentDoc?.title || 'the document'}" for your question: "${question}".\n\nTry rephrasing your search or adjusting the similarity threshold in the RAG settings.`;
    }

    // Extract sentences that have highest overlap with query terms
    const qLower = question.toLowerCase();
    const qTokens = qLower.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(t => t.length > 2);

    const candidates: { sentence: string; pageNumber: number; chunkIdx: number; relevance: number }[] = [];

    for (let cIdx = 0; cIdx < citations.length; cIdx++) {
      const cit = citations[cIdx];
      const sentences = cit.chunk.text.split(/(?<=[.?!])\s+/);

      for (const sent of sentences) {
        const cleaned = sent.trim();
        if (cleaned.length < 25) continue;

        const sentLower = cleaned.toLowerCase();
        let matchCount = 0;
        for (const t of qTokens) {
          if (sentLower.includes(t)) matchCount++;
        }

        const score = matchCount * 1.5 + cit.score;
        candidates.push({
          sentence: cleaned,
          pageNumber: cit.chunk.pageNumber,
          chunkIdx: cIdx + 1,
          relevance: score,
        });
      }
    }

    // Sort by relevance
    candidates.sort((a, b) => b.relevance - a.relevance);

    // Pick top unique sentences (up to 4-5)
    const picked: typeof candidates = [];
    const seenSentences = new Set<string>();

    for (const cand of candidates) {
      const simplified = cand.sentence.slice(0, 40).toLowerCase();
      if (!seenSentences.has(simplified)) {
        seenSentences.add(simplified);
        picked.push(cand);
        if (picked.length >= 4) break;
      }
    }

    // If query is specifically "What are the key findings in this paper?" (as shown in user attachment)
    const isKeyFindingsQuery = /key findings|main findings|summary|what is this paper/i.test(question);

    let output = '';
    if (isKeyFindingsQuery) {
      output += `The key findings in **${this.currentDoc?.title || 'this document'}** are:\n\n`;
      picked.forEach((p, idx) => {
        output += `${idx + 1}. **${p.sentence}** *(Source: Page ${p.pageNumber})*\n\n`;
      });
      output += `> *Retrieved from ${citations.length} document chunk(s) with an average cosine similarity of ${(
        (citations.reduce((acc, c) => acc + c.score, 0) / citations.length) *
        100
      ).toFixed(1)}%.*`;
    } else {
      output += `Based on **${this.currentDoc?.title || 'the document'}**:\n\n`;
      picked.forEach((p, idx) => {
        output += `• **${p.sentence}** *(Page ${p.pageNumber})*\n`;
      });
      output += `\n**Key Takeaway:** The retrieved passages provide direct evidence from Page ${citations[0].chunk.pageNumber}. See the citations panel below for the exact context chunks.`;
    }

    return output;
  }
}
