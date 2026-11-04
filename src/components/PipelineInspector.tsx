import React from 'react';
import {
  Cpu,
  Layers,
  Database,
  Search,
  Code,
  Zap,
  FileText,
  BarChart3,
  MoreVertical,
} from 'lucide-react';
import { ChatMessage, DocumentMeta, RAGConfig } from '../types';

interface PipelineInspectorProps {
  activeDoc: DocumentMeta;
  ragConfig: RAGConfig;
  latestMessage: ChatMessage | null;
  chunkCount: number;
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  activeDoc,
  ragConfig,
  latestMessage,
  chunkCount,
}) => {
  const steps = [
    {
      title: '1. PDF Extraction',
      desc: 'Page boundary parsing & text extraction',
      stat: `${activeDoc.pageCount} Pages • ${activeDoc.sizeFormatted}`,
      icon: FileText,
      color: 'bg-sky-500 text-white shadow-sky-500/30',
    },
    {
      title: '2. Recursive Chunking',
      desc: `${ragConfig.chunkSize} chars, ${ragConfig.chunkOverlap} overlap`,
      stat: `${chunkCount} Vector Chunks`,
      icon: Layers,
      color: 'bg-indigo-500 text-white shadow-indigo-500/30',
    },
    {
      title: '3. Vector Database',
      desc: 'Sparse/Dense TF-IDF embeddings',
      stat: `Metric: ${ragConfig.metric.toUpperCase()}`,
      icon: Database,
      color: 'bg-purple-600 text-white shadow-purple-600/30',
    },
    {
      title: '4. Similarity Search',
      desc: `Top-${ragConfig.topK} Nearest Neighbors`,
      stat: `Threshold: ${(ragConfig.similarityThreshold * 100).toFixed(0)}%`,
      icon: Search,
      color: 'bg-sky-500 text-white shadow-sky-500/30',
    },
    {
      title: '5. Grounded Synthesis',
      desc: 'Zero-hallucination prompt synthesis',
      stat: 'Strictly Grounded',
      icon: Zap,
      color: 'bg-cyan-500 text-white shadow-cyan-500/30',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent text-slate-100 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <span>RAG Pipeline & Execution Inspector</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time execution trace for vector retrieval, context augmentation, and citation grounding
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-[#13162b]/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active: {activeDoc.filename}</span>
        </div>
      </div>

      {/* RAG Pipeline Flowchart */}
      <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Vector Pipeline Architecture</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#181c38]/80 rounded-xl p-3.5 border border-white/[0.06] flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 shadow-md ${step.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-sky-300 bg-white/[0.05] px-2 py-0.5 rounded-md">
                    {step.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latest Query Trace */}
      {latestMessage ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Retrieved Chunks & Scores */}
          <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Retrieved Chunks & Similarity Scores</span>
              </h3>
              {latestMessage.latencyMs && (
                <span className="text-[11px] font-mono text-sky-300 bg-[#0e1022] px-2 py-1 rounded-md border border-white/10">
                  Latency: {latestMessage.latencyMs}ms
                </span>
              )}
            </div>

            {latestMessage.citations && latestMessage.citations.length > 0 ? (
              <div className="space-y-3">
                {latestMessage.citations.map((cit, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-[#0e1022]/90 rounded-xl p-3.5 border border-white/[0.06] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sky-400">
                          Chunk #{cit.chunk.chunkIndex + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-mono">
                          Page {cit.chunk.pageNumber}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Cosine Sim: {(cit.score * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, cit.score * 100))}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-3">
                      "{cit.chunk.text}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                      <span>Tokens: ~{cit.chunk.tokenEstimate}</span>
                      <span>Chars: {cit.chunk.text.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No citations retrieved for this message.
              </div>
            )}
          </div>

          {/* Right: Injected Prompt Payload */}
          <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] space-y-4 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Code className="w-4 h-4 text-purple-400" />
              <span>Grounded Prompt Context Payload</span>
            </h3>

            <div className="bg-[#0e1022]/90 rounded-xl p-4 border border-white/[0.06] font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[380px] space-y-2">
              <div className="text-purple-300 font-bold mb-1">// System Prompt Directive</div>
              <p className="text-slate-400">
                "Answer the question based EXCLUSIVELY on the retrieved context below from{' '}
                {activeDoc.title}. Formulate key findings as numbered points and cite pages."
              </p>

              <div className="text-sky-300 font-bold mt-3 mb-1">// Injected Context Passages</div>
              <pre className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {latestMessage.promptContextSnippet || 'No context snippet available.'}
              </pre>

              <div className="text-emerald-300 font-bold mt-3 mb-1">// User Query</div>
              <p className="text-white">"{latestMessage.content.slice(0, 150)}..."</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08] text-center shadow-xl">
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Send a query in the Chat tab to view real-time vector similarity distributions,
            exact retrieved chunks, and the augmented prompt payload.
          </p>
        </div>
      )}
    </div>
  );
};
