import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkDocument, splitTextRecursively } from './chunker';
import { InMemoryVectorStore, tokenize, computeTermFrequencies } from './vectorStore';
import { RAGEngine } from './engine';
import { DocumentMeta } from '../types';

const SAMPLE_DOC: DocumentMeta = {
  id: 'test-paper-1',
  title: 'Attention Is All You Need',
  filename: 'research_paper.pdf',
  sizeBytes: 2400000,
  sizeFormatted: '2.4 MB',
  pageCount: 3,
  category: 'research',
  description: 'The seminal Transformer paper introducing self-attention mechanisms.',
  uploadedAt: '2026-11-04',
  pages: [
    {
      pageNumber: 1,
      text: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    },
    {
      pageNumber: 2,
      text: 'An attention function can be described as mapping a query and a set of key-value pairs to an output. The Transformer computes self-attention across multiple heads: Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. Multi-head attention consists of eight parallel attention layers in our standard model.',
    },
    {
      pageNumber: 3,
      text: 'On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4, outperforming the best existing models including ensembles by more than 2.0 BLEU. The Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution.',
    },
  ],
};

test('splitTextRecursively splits text into bounded chunks with overlap', () => {
  const text = 'Sentence one is here. Sentence two is here. Sentence three is here. Sentence four is here.';
  const chunks = splitTextRecursively(text, 40, 10);
  assert.ok(chunks.length >= 2, 'Should create multiple chunks for 40 char limit');
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 50, `Chunk length ${chunk.length} should be reasonably bounded`);
  }
});

test('chunkDocument preserves page numbers and produces metadata', () => {
  const chunks = chunkDocument(SAMPLE_DOC, { chunkSize: 200, chunkOverlap: 40 });
  assert.ok(chunks.length >= 3, 'Should produce at least 3 chunks across 3 pages');

  const pageNumbers = chunks.map(c => c.pageNumber);
  assert.ok(pageNumbers.includes(1), 'Has page 1');
  assert.ok(pageNumbers.includes(2), 'Has page 2');
  assert.ok(pageNumbers.includes(3), 'Has page 3');

  // Verify first chunk has proper id and docId
  assert.equal(chunks[0].docId, 'test-paper-1');
  assert.ok(chunks[0].tokenEstimate > 0);
});

test('InMemoryVectorStore builds index and computes cosine similarity correctly', () => {
  const store = new InMemoryVectorStore();
  const chunks = chunkDocument(SAMPLE_DOC, { chunkSize: 300, chunkOverlap: 50 });
  store.buildIndex(chunks);

  assert.equal(store.getChunkCount(), chunks.length);
  assert.ok(store.getVocabSize() > 10, 'Vocabulary should have indexed tokens');

  // Query for multi-head attention
  const results = store.search('Multi-Head Attention layers and queries', 3, 0.01);
  assert.ok(results.length > 0, 'Should find at least 1 matching chunk');
  assert.ok(results[0].score > 0 && results[0].score <= 1.0, 'Score is bounded between 0 and 1');
  assert.equal(results[0].chunk.pageNumber, 2, 'Multi-Head Attention is on Page 2');
  assert.ok(results[0].matchedTerms.includes('attention') || results[0].matchedTerms.includes('multi'));
});

test('InMemoryVectorStore retrieves BLEU score chunk on Page 3 for translation query', () => {
  const store = new InMemoryVectorStore();
  const chunks = chunkDocument(SAMPLE_DOC, { chunkSize: 300, chunkOverlap: 50 });
  store.buildIndex(chunks);

  const results = store.search('WMT English to German BLEU score translation', 2, 0.05);
  assert.ok(results.length > 0);
  assert.equal(results[0].chunk.pageNumber, 3, 'BLEU score is on Page 3');
});

test('RAGEngine indexes document and executes query with structured citations', async () => {
  const engine = new RAGEngine({ topK: 3, similarityThreshold: 0.05 });
  const indexRes = engine.indexDocument(SAMPLE_DOC);

  assert.ok(indexRes.chunkCount >= 3);
  assert.ok(indexRes.durationMs >= 0);

  const res = await engine.query('What are the key findings in this paper?');
  assert.ok(res.answer.length > 0, 'Answer must not be empty');
  assert.ok(res.citations.length > 0, 'Must have citations');
  assert.ok(res.latencyMs >= 0);
  assert.equal(res.pipelineSteps.length, 3, 'Must have all 3 pipeline steps');
  assert.match(res.answer, /key findings|Transformer/i);
});
