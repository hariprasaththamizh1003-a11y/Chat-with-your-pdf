import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Send,
  Sparkles,
  User,
  ChevronDown,
  ChevronUp,
  Clock,
  Bookmark,
  Share2,
  Trash2,
  Zap,
  MoreVertical,
} from 'lucide-react';
import { ChatMessage, DocumentMeta, RetrievalResult } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  activeDoc: DocumentMeta;
  onClearChat: () => void;
  onOpenInspector: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeDoc,
  onClearChat,
  onOpenInspector,
}) => {
  const [input, setInput] = useState('');
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const handleSuggestionClick = (query: string) => {
    if (isLoading) return;
    onSendMessage(query);
  };

  const toggleCitation = (messageId: string) => {
    setExpandedCitations(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const suggestions = [
    'What are the key findings in this paper?',
    'How does Multi-Head Attention work?',
    'Why is self-attention faster than recurrent layers?',
    'What BLEU scores were achieved on machine translation?',
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden text-slate-100">
      {/* Top Document Header Banner - STAX Glassmorphic Card */}
      <div className="px-6 py-3.5 border-b border-white/[0.06] bg-[#101328]/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          {/* Electric Cyan Icon Box */}
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{activeDoc.filename}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-sky-300 border border-white/[0.08]">
                {activeDoc.sizeFormatted}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Grounded RAG active • {activeDoc.pageCount} Pages • Dynamic vector retrieval
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenInspector}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-400/30 transition-all cursor-pointer shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Inspect Pipeline</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-4 shadow-xl shadow-sky-500/20">
              <FileText className="w-7 h-7 text-sky-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Chat with Your PDF
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Ask questions directly from <strong className="text-white">{activeDoc.title}</strong>.
              Answers are retrieved using dense vector similarity over the document's pages.
            </p>

            <div className="w-full mt-6 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(query)}
                    className="text-left text-xs bg-[#13162b]/80 hover:bg-[#181c38] text-slate-200 hover:text-white p-3 rounded-xl border border-white/[0.08] hover:border-indigo-500/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{query}</span>
                    <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const isUser = msg.role === 'user';
            const isCitationOpen = expandedCitations[msg.id] ?? true;

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3.5 ${
                  isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-sky-400 to-indigo-600 text-white'
                      : 'bg-[#181c38] border border-white/10 text-sky-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <FileText className="w-4 h-4 text-sky-400" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-xl border ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/40'
                      : 'bg-[#13162b]/90 backdrop-blur-xl text-slate-100 border-white/[0.08]'
                  }`}
                >
                  {/* Content */}
                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Copy Action */}
                  {!isUser && (
                    <div className="mt-2.5 flex items-center justify-end space-x-2 text-slate-400">
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[11px] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        title="Copy answer"
                      >
                        <Share2 className="w-3 h-3 text-sky-400" />
                        <span>Copy</span>
                      </button>
                    </div>
                  )}

                  {/* Citations Drawer */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => toggleCitation(msg.id)}
                        className="flex items-center justify-between w-full text-left text-xs font-semibold text-slate-300 hover:text-sky-300 transition-colors py-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                          <span>
                            RAG Citations & Grounded Passages ({msg.citations.length} retrieved)
                          </span>
                        </div>
                        {isCitationOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isCitationOpen && (
                        <div className="mt-2.5 space-y-2">
                          {msg.citations.map((cit, cIdx) => (
                            <div
                              key={cit.chunk.id || cIdx}
                              className="bg-[#0e1022]/90 rounded-xl p-3 border border-white/[0.06] text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sky-400">
                                    [Source #{cIdx + 1}]
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-mono text-[10px]">
                                    Page {cit.chunk.pageNumber}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                                  {(cit.score * 100).toFixed(1)}% Cosine Match
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed italic">
                                "{cit.chunk.text}"
                              </p>
                              {cit.matchedTerms.length > 0 && (
                                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                                  <span className="text-[10px] text-slate-500">Matched:</span>
                                  {cit.matchedTerms.slice(0, 5).map((term, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono"
                                    >
                                      {term}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Performance Latency Bar */}
                      {msg.latencyMs !== undefined && (
                        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3 h-3 text-sky-400" />
                            <span>Execution Latency: {msg.latencyMs}ms</span>
                          </div>
                          <span>Top-K: {msg.citations.length}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#181c38] border border-white/10 flex items-center justify-center text-sky-400 shadow-sm animate-pulse">
              <FileText className="w-4 h-4 text-sky-400" />
            </div>
            <div className="bg-[#13162b]/90 border border-white/[0.08] rounded-2xl p-4 shadow-sm flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="text-xs text-slate-300">
                Vectorizing query & searching nearest neighbor embeddings...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length > 0 && (
        <div className="px-6 py-2 bg-[#0c0e1d]/60 border-t border-white/[0.06] flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex-shrink-0">
            Suggested:
          </span>
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(q)}
              className="flex-shrink-0 px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] transition-all text-xs whitespace-nowrap cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Chat Input Form - STAX Floating Capsule */}
      <div className="p-4 bg-[#0c0e1d]/80 border-t border-white/[0.06] backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 max-w-4xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask a question from ${activeDoc.filename}...`}
            disabled={isLoading}
            className="flex-1 bg-[#13162b]/90 border border-white/10 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 rounded-full px-5 py-3 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold transition-all flex items-center justify-center shadow-lg shadow-sky-500/30 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
