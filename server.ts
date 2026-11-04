import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(aiClient),
    model: 'gemini-3.8-flash',
    uptime: process.uptime(),
  });
});

// RAG synthesis endpoint
app.post('/api/rag/chat', async (req, res) => {
  try {
    const { question, context, documentTitle } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        message: 'No server-side Gemini API key configured. Using local deterministic RAG engine.',
      });
    }

    const systemPrompt = `You are a high-precision document question-answering assistant implementing Retrieval-Augmented Generation (RAG).
You are answering questions based EXCLUSIVELY on the provided retrieved context passages from "${documentTitle || 'the document'}".
Rules:
1. Base your answer strictly on the facts in the Context. Do not invent facts or draw upon unverified outside information.
2. If the user asks for key findings, format them as clean, numbered points highlighting the primary insights.
3. Cite the source page number for each key point (e.g., "(Source: Page 2)").
4. Keep the tone objective, analytical, concise, and helpful.
5. If the context does not contain enough information to answer, state clearly that the document does not contain that information.`;

    const userPrompt = `Context Passages:\n${context}\n\nQuestion: ${question}\n\nProvide a well-structured answer with page citations.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    });

    const answer = response.text || '';
    return res.json({
      answer,
      model: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini RAG synthesis error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to synthesize answer',
      fallback: true,
    });
  }
});

// Mount Vite or static assets
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`DocuChat RAG Server listening on port ${PORT}`);
  });
}

startServer();
