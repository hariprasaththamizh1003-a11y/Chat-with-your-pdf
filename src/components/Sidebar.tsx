import React, { useRef, useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  LogOut,
  Upload,
  Sliders,
  CheckCircle,
  Cpu,
  Layers,
  Terminal,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DocumentMeta, RAGConfig } from '../types';
import { parseUploadedFile } from '../utils/pdfLoader';

interface SidebarProps {
  activeTab: 'overview' | 'chat' | 'pipeline' | 'chunks' | 'code';
  setActiveTab: (tab: 'overview' | 'chat' | 'pipeline' | 'chunks' | 'code') => void;
  documents: DocumentMeta[];
  activeDoc: DocumentMeta;
  onSelectDoc: (doc: DocumentMeta) => void;
  onAddDoc: (doc: DocumentMeta) => void;
  ragConfig: RAGConfig;
  onUpdateConfig: (config: Partial<RAGConfig>) => void;
  chunkCount: number;
  onReindex: () => void;
  isIndexing: boolean;
  onResetSession: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documents,
  activeDoc,
  onSelectDoc,
  onAddDoc,
  ragConfig,
  onUpdateConfig,
  chunkCount,
  onReindex,
  isIndexing,
  onResetSession,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showDocPicker, setShowDocPicker] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newDoc = await parseUploadedFile(file);
      onAddDoc(newDoc);
      onSelectDoc(newDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Statistics',
    },
    {
      id: 'chat',
      label: 'Chat with PDF',
      icon: MessageSquare,
      desc: 'RAG Question Answering',
    },
    {
      id: 'pipeline',
      label: 'RAG Pipeline',
      icon: Cpu,
      desc: 'Vector Search & Trace',
    },
    {
      id: 'chunks',
      label: 'Chunks & Pages',
      icon: Layers,
      desc: `Explore ${chunkCount} chunks`,
    },
    {
      id: 'code',
      label: 'Python Code',
      icon: Terminal,
      desc: 'LangChain & LlamaIndex',
    },
  ] as const;

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between p-5 border-r border-white/[0.06] bg-[#0c0e1d]/90 backdrop-blur-2xl text-slate-300 select-none z-20">
      {/* Top Brand Logo matching STAX logo */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 pt-1">
          <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400">
            STAX
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
            RAG
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-400/30 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Document Ingestion & Quick Switcher */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Document
            </span>
            <button
              onClick={() => setShowDocPicker(!showDocPicker)}
              className="text-[11px] text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              {showDocPicker ? 'Hide' : 'Switch'}
            </button>
          </div>

          {/* Active Document Card */}
          <div className="p-3 rounded-xl bg-[#14182e]/90 border border-white/[0.08] flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate" title={activeDoc.filename}>
                {activeDoc.filename}
              </p>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                <span>{activeDoc.sizeFormatted}</span>
                <span>•</span>
                <span className="text-emerald-400">{chunkCount} chunks</span>
              </div>
            </div>
          </div>

          {/* Document Picker Dropdown */}
          {showDocPicker && (
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc);
                    setShowDocPicker(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs truncate transition-all cursor-pointer ${
                    doc.id === activeDoc.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <p className="font-medium truncate">{doc.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{doc.filename}</p>
                </button>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>{isUploading ? 'Parsing PDF...' : 'Upload New PDF'}</span>
          </button>
        </div>

        {/* Hyperparameters Disclosure */}
        <div className="pt-2 border-t border-white/[0.06]">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 py-1 cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>RAG Settings</span>
            </div>
            {showConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showConfig && (
            <div className="mt-2.5 space-y-2 text-[11px] bg-[#12152b] p-3 rounded-xl border border-white/[0.06]">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Chunk Size:</span>
                  <span className="text-sky-400 font-mono">{ragConfig.chunkSize}</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1200"
                  step="50"
                  value={ragConfig.chunkSize}
                  onChange={e => onUpdateConfig({ chunkSize: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Top-K:</span>
                  <span className="text-sky-400 font-mono">{ragConfig.topK}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={ragConfig.topK}
                  onChange={e => onUpdateConfig({ topK: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <button
                onClick={onReindex}
                disabled={isIndexing}
                className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-medium text-center transition-all cursor-pointer"
              >
                {isIndexing ? 'Indexing...' : 'Apply & Reindex'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Logout / Reset Button matching reference */}
      <div className="pt-4 border-t border-white/[0.06]">
        <button
          onClick={onResetSession}
          className="flex items-center space-x-2.5 text-xs text-slate-400 hover:text-rose-400 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Reset Session</span>
        </button>
      </div>
    </aside>
  );
};
