import { DocumentChunk, RetrievalResult } from '../types';

export const COMMON_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some',
  'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you'
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

export function computeTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

export class InMemoryVectorStore {
  private chunks: DocumentChunk[] = [];
  private vocab: Map<string, number> = new Map(); // token -> featureIndex
  private idf: Map<string, number> = new Map(); // token -> IDF weight
  private chunkVectors: { chunk: DocumentChunk; vector: Map<number, number>; norm: number }[] = [];

  constructor() {}

  /**
   * Builds the vector index from a list of chunks using TF-IDF.
   */
  public buildIndex(chunks: DocumentChunk[]): void {
    this.chunks = chunks;
    this.vocab.clear();
    this.idf.clear();
    this.chunkVectors = [];

    const totalDocs = chunks.length;
    if (totalDocs === 0) return;

    // 1. Compute document frequency (DF) for all terms
    const docFrequency = new Map<string, number>();
    const chunkTokensList: string[][] = [];

    let vocabIndex = 0;
    for (const chunk of chunks) {
      const tokens = tokenize(chunk.text);
      chunkTokensList.push(tokens);

      const uniqueTokensInDoc = new Set(tokens);
      for (const token of uniqueTokensInDoc) {
        if (!this.vocab.has(token)) {
          this.vocab.set(token, vocabIndex++);
        }
        docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
      }
    }

    // 2. Compute smooth IDF: log((N + 1) / (DF + 1)) + 1
    for (const [token, df] of docFrequency.entries()) {
      const isStopword = COMMON_STOPWORDS.has(token);
      const baseIdf = Math.log((totalDocs + 1) / (df + 1)) + 1;
      // Slight downweighting for stopwords, boost for informative technical terms
      const weight = isStopword ? baseIdf * 0.35 : baseIdf * 1.25;
      this.idf.set(token, weight);
    }

    // 3. Vectorize each chunk and calculate L2 norm
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const tokens = chunkTokensList[i];
      const tf = computeTermFrequencies(tokens);
      const vector = new Map<number, number>();

      let sumSquares = 0;
      for (const [token, count] of tf.entries()) {
        const featureIdx = this.vocab.get(token);
        const idfVal = this.idf.get(token) || 1;
        if (featureIdx !== undefined) {
          // Sublinear TF scaling: 1 + ln(count)
          const tfWeight = 1 + Math.log(count);
          const score = tfWeight * idfVal;
          vector.set(featureIdx, score);
          sumSquares += score * score;
        }
      }

      const norm = Math.sqrt(sumSquares) || 1;
      this.chunkVectors.push({ chunk, vector, norm });
    }
  }

  /**
   * Vectorizes a query string using the trained vocabulary and IDF weights.
   */
  public vectorizeQuery(query: string): { vector: Map<number, number>; norm: number; queryTokens: string[] } {
    const tokens = tokenize(query);
    const tf = computeTermFrequencies(tokens);
    const vector = new Map<number, number>();

    let sumSquares = 0;
    for (const [token, count] of tf.entries()) {
      const featureIdx = this.vocab.get(token);
      const idfVal = this.idf.get(token) || 1;
      if (featureIdx !== undefined) {
        const tfWeight = 1 + Math.log(count);
        // Bonus for direct exact query terms
        const score = tfWeight * idfVal;
        vector.set(featureIdx, score);
        sumSquares += score * score;
      }
    }

    const norm = Math.sqrt(sumSquares) || 1;
    return { vector, norm, queryTokens: tokens };
  }

  /**
   * Computes cosine similarity between two sparse vectors: (u . v) / (||u|| * ||v||)
   */
  public cosineSimilarity(
    v1: Map<number, number>,
    norm1: number,
    v2: Map<number, number>,
    norm2: number
  ): number {
    if (norm1 === 0 || norm2 === 0) return 0;

    let dotProduct = 0;
    // Iterate over smaller vector for performance
    const [smaller, larger] = v1.size <= v2.size ? [v1, v2] : [v2, v1];

    for (const [idx, val1] of smaller.entries()) {
      const val2 = larger.get(idx);
      if (val2 !== undefined) {
        dotProduct += val1 * val2;
      }
    }

    const similarity = dotProduct / (norm1 * norm2);
    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * Search vector index for top-k nearest chunks to query.
   */
  public search(
    query: string,
    topK: number = 4,
    similarityThreshold: number = 0.05
  ): RetrievalResult[] {
    if (this.chunkVectors.length === 0) return [];

    const { vector: qVec, norm: qNorm, queryTokens } = this.vectorizeQuery(query);
    if (qVec.size === 0) {
      // Query contains none of the indexed vocabulary terms; return empty or first top chunk with 0 score
      return [];
    }

    const queryTokenSet = new Set(queryTokens.filter(t => !COMMON_STOPWORDS.has(t)));

    const scored: RetrievalResult[] = [];

    for (const item of this.chunkVectors) {
      const sim = this.cosineSimilarity(qVec, qNorm, item.vector, item.norm);

      if (sim >= similarityThreshold) {
        // Find matched non-stopword terms
        const chunkTokens = tokenize(item.chunk.text);
        const matched = Array.from(new Set(chunkTokens.filter(t => queryTokenSet.has(t))));

        scored.push({
          chunk: item.chunk,
          score: Math.round(sim * 1000) / 1000,
          matchedTerms: matched,
        });
      }
    }

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
  }

  public getChunkCount(): number {
    return this.chunks.length;
  }

  public getVocabSize(): number {
    return this.vocab.size;
  }

  public getChunks(): DocumentChunk[] {
    return this.chunks;
  }
}
