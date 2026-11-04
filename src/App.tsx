import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StaxBackground } from './components/StaxBackground';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ChatView } from './components/ChatView';
import { PipelineInspector } from './components/PipelineInspector';
import { DocumentViewer } from './components/DocumentViewer';
import { PythonCodeModal } from './components/PythonCodeModal';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { RAGEngine } from './rag/engine';
import { ChatMessage, DocumentChunk, DocumentMeta, RAGConfig } from './types';

export default function App() {
  const [documents, setDocuments] = useState<DocumentMeta[]>(SAMPLE_DOCUMENTS);
  const [activeDoc, setActiveDoc] = useState<DocumentMeta>(SAMPLE_DOCUMENTS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'pipeline' | 'chunks' | 'code'>('overview');
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [ragConfig, setRagConfig] = useState<RAGConfig>({
    chunkSize: 600,
    chunkOverlap: 120,
    topK: 4,
    similarityThreshold: 0.06,
    metric: 'cosine',
  });

  const engineRef = useRef<RAGEngine>(new RAGEngine(ragConfig));

  // Initial message thread matching user reference
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-initial-user',
      role: 'user',
      content: 'What are the key findings in this paper?',
      timestamp: '12:22 AM',
    },
    {
      id: 'msg-initial-assistant',
      role: 'assistant',
      content: `The key findings in **Attention Is All You Need (research_paper.pdf)** are:

1. **Elimination of Recurrence and Convolutions:** The Transformer is the first sequence transduction model based entirely on self-attention mechanisms to compute representations of input and output, dispensing with recurrent neural networks (RNNs/LSTMs) and convolutions entirely. *(Source: Page 1, Page 9)*

2. **State-of-the-Art Machine Translation:** On the WMT 2014 English-to-German task, the Transformer establishes a new state-of-the-art BLEU score of **28.4**, outperforming previous best models and ensembles by more than 2.0 BLEU. On English-to-French, it reaches **41.8 BLEU**. *(Source: Page 1, Page 8)*

3. **Massive Training Speedup & Parallelization:** By removing sequential recurrent steps, the architecture connects all input positions with O(1) sequential operations, allowing full parallelization during training. The base model trains in as little as 12 hours on 8 P100 GPUs. *(Source: Page 2, Page 7)*

4. **Multi-Head Self-Attention:** Instead of a single attention function, the model linearly projects queries, keys, and values into 8 parallel attention heads (d_k = d_v = 64), enabling it to jointly attend to information from different representation subspaces. *(Source: Page 5)*`,
      timestamp: '12:23 AM',
      latencyMs: 142,
      citations: [
        {
          chunk: {
            id: 'doc-transformer-paper-p1-c0',
            docId: 'doc-transformer-paper',
            docTitle: 'Attention Is All You Need',
            pageNumber: 1,
            chunkIndex: 0,
            text: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task...',
            charStart: 0,
            charEnd: 480,
            tokenEstimate: 78,
          },
          score: 0.942,
          matchedTerms: ['findings', 'paper', 'attention', 'transformer', 'bleu'],
        },
        {
          chunk: {
            id: 'doc-transformer-paper-p5-c4',
            docId: 'doc-transformer-paper',
            docTitle: 'Attention Is All You Need',
            pageNumber: 5,
            chunkIndex: 4,
            text: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model / h = 64.',
            charStart: 0,
            charEnd: 320,
            tokenEstimate: 58,
          },
          score: 0.887,
          matchedTerms: ['findings', 'attention', 'multi', 'head'],
        },
        {
          chunk: {
            id: 'doc-transformer-paper-p8-c7',
            docId: 'doc-transformer-paper',
            docTitle: 'Attention Is All You Need',
            pageNumber: 8,
            chunkIndex: 7,
            text: 'On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models (including ensembles) by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4.',
            charStart: 0,
            charEnd: 280,
            tokenEstimate: 46,
          },
          score: 0.854,
          matchedTerms: ['findings', 'translation', 'bleu', 'model'],
        },
      ],
      promptContextSnippet: `--- Source [1] (Page 1, Relevance: 94.2%) ---
We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...`,
    },
  ]);

  // Index document whenever activeDoc or config changes
  useEffect(() => {
    setIsIndexing(true);
    engineRef.current.setConfig(ragConfig);
    const { chunkCount } = engineRef.current.indexDocument(activeDoc);
    setChunks(engineRef.current.getVectorStore().getChunks());
    setIsIndexing(false);
  }, [activeDoc, ragConfig.chunkSize, ragConfig.chunkOverlap]);

  const handleSelectDoc = (doc: DocumentMeta) => {
    setActiveDoc(doc);
    setMessages([]);
  };

  const handleAddDoc = (newDoc: DocumentMeta) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleUpdateConfig = (newConfig: Partial<RAGConfig>) => {
    setRagConfig(prev => {
      const updated = { ...prev, ...newConfig };
      engineRef.current.setConfig(updated);
      return updated;
    });
  };

  const handleReindex = () => {
    setIsIndexing(true);
    engineRef.current.setConfig(ragConfig);
    const { chunkCount } = engineRef.current.indexDocument(activeDoc);
    setChunks(engineRef.current.getVectorStore().getChunks());
    setIsIndexing(false);
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await engineRef.current.query(text);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: result.citations,
        latencyMs: result.latencyMs,
        pipelineSteps: result.pipelineSteps,
        promptContextSnippet: result.promptContextSnippet,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const fallbackMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: `Encountered an issue processing your query against ${activeDoc.filename}. Please verify RAG hyperparameters in the sidebar and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleResetSession = () => {
    setActiveDoc(SAMPLE_DOCUMENTS[0]);
    setMessages([]);
    setActiveTab('overview');
  };

  const handleGoToChat = (initialQuery?: string) => {
    setActiveTab('chat');
    if (initialQuery) {
      setTimeout(() => {
        handleSendMessage(initialQuery);
      }, 50);
    }
  };

  const latestAssistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i];
      }
    }
    return null;
  }, [messages]);

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-[#0a0b16] font-sans text-slate-100 flex items-center justify-center p-0 md:p-6 lg:p-8">
      {/* Background Animated Neon Light Ribbons */}
      <StaxBackground />

      {/* Main Framed Dashboard Container matching STAX Reference Image */}
      <div className="relative z-10 w-full max-w-[1440px] h-screen md:h-[92vh] max-h-[960px] bg-[#0c0e1e]/90 backdrop-blur-2xl rounded-none md:rounded-[32px] border-0 md:border md:border-white/[0.08] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <TopBar
          activeDoc={activeDoc}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onQuickQuery={q => handleGoToChat(q)}
        />

        {/* Dashboard Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Navigation Sidebar */}
          <div
            className={`${
              showMobileSidebar ? 'fixed inset-0 z-40 flex lg:relative lg:z-auto' : 'hidden lg:flex'
            }`}
          >
            {showMobileSidebar && (
              <div
                className="fixed inset-0 bg-[#0a0b16]/80 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileSidebar(false)}
              />
            )}
            <div className="relative z-50 flex-1 max-w-xs lg:max-w-none flex">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={tab => {
                  setActiveTab(tab);
                  setShowMobileSidebar(false);
                }}
                documents={documents}
                activeDoc={activeDoc}
                onSelectDoc={doc => {
                  handleSelectDoc(doc);
                  setShowMobileSidebar(false);
                }}
                onAddDoc={handleAddDoc}
                ragConfig={ragConfig}
                onUpdateConfig={handleUpdateConfig}
                chunkCount={chunks.length}
                onReindex={handleReindex}
                isIndexing={isIndexing}
                onResetSession={handleResetSession}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
            {/* Mobile Nav Header */}
            <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-[#12152b] border-b border-white/[0.06] text-xs">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 font-medium"
              >
                <span>☰ STAX Menu</span>
              </button>
              <span className="font-mono text-sky-400 text-[11px] truncate max-w-[170px]">
                {activeDoc.filename}
              </span>
            </div>

            {/* View Switcher */}
            {activeTab === 'overview' && (
              <DashboardOverview
                documents={documents}
                activeDoc={activeDoc}
                onSelectDoc={handleSelectDoc}
                chunkCount={chunks.length}
                onGoToChat={handleGoToChat}
              />
            )}

            {activeTab === 'chat' && (
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeDoc={activeDoc}
                onClearChat={handleClearChat}
                onOpenInspector={() => setActiveTab('pipeline')}
              />
            )}

            {activeTab === 'pipeline' && (
              <PipelineInspector
                activeDoc={activeDoc}
                ragConfig={ragConfig}
                latestMessage={latestAssistantMessage}
                chunkCount={chunks.length}
              />
            )}

            {activeTab === 'chunks' && (
              <DocumentViewer activeDoc={activeDoc} chunks={chunks} />
            )}

            {activeTab === 'code' && <PythonCodeModal />}
          </main>
        </div>
      </div>
    </div>
  );
}
