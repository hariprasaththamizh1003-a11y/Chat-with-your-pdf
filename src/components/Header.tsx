import React from 'react';
import { FileText, Cpu, Layers, Terminal, Sparkles, BookOpen } from 'lucide-react';
import { DocumentMeta } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'pipeline' | 'chunks' | 'code';
  setActiveTab: (tab: 'chat' | 'pipeline' | 'chunks' | 'code') => void;
  activeDoc: DocumentMeta;
  chunkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDoc,
  chunkCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">DocuChat RAG</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  Vector QA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chat with Your PDFs (research papers, books, notes) using RAG
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Chat & Citations</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>RAG Inspector</span>
            </button>

            <button
              onClick={() => setActiveTab('chunks')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'chunks'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Document & Chunks ({chunkCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Python / LangChain</span>
            </button>
          </nav>

          {/* Quick Status Info */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-mono">HNSW Vector DB: Ready</span>
            </div>
            <div className="hidden lg:flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[140px] truncate">{activeDoc.filename}</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex space-x-1 py-2 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            RAG Inspector
          </button>
          <button
            onClick={() => setActiveTab('chunks')}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              activeTab === 'chunks' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Chunks ({chunkCount})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 rounded-lg text-xs font-medium ${
              activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Python Code
          </button>
        </div>
      </div>
    </header>
  );
};
