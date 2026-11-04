import React, { useState } from 'react';
import { Layers, FileText, Search, BookOpen } from 'lucide-react';
import { DocumentChunk, DocumentMeta } from '../types';

interface DocumentViewerProps {
  activeDoc: DocumentMeta;
  chunks: DocumentChunk[];
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ activeDoc, chunks }) => {
  const [viewMode, setViewMode] = useState<'chunks' | 'pages'>('chunks');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const filteredChunks = chunks.filter(c =>
    c.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent text-slate-100 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>Document & Chunks Explorer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeDoc.title} • {activeDoc.pageCount} Pages • {chunks.length} Vector Chunks
          </p>
        </div>

        {/* View Mode Toggle Capsule */}
        <div className="flex items-center space-x-1.5 bg-[#13162b]/90 p-1.5 rounded-full border border-white/[0.08]">
          <button
            onClick={() => setViewMode('chunks')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'chunks'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vector Chunks ({chunks.length})
          </button>
          <button
            onClick={() => setViewMode('pages')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'pages'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Original Pages ({activeDoc.pageCount})
          </button>
        </div>
      </div>

      {viewMode === 'chunks' ? (
        <div className="space-y-4">
          {/* Search Bar for Chunks */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filter vector chunks by keyword (e.g. attention, encoder, bleu)..."
                className="w-full bg-[#13162b]/80 border border-white/10 focus:border-sky-400 rounded-full pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredChunks.length} of {chunks.length}
            </span>
          </div>

          {/* Chunks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChunks.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-4 border border-white/[0.08] hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-sky-400 font-mono">
                        Chunk #{chunk.chunkIndex + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 font-mono">
                        Page {chunk.pageNumber}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ~{chunk.tokenEstimate} tokens
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-5">
                    {chunk.text}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Characters: {chunk.text.length}</span>
                  <span className="text-emerald-400">Indexed in Vector DB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Pages View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Page Picker */}
          <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-3 border border-white/[0.08] space-y-1.5 max-h-[600px] overflow-y-auto shadow-xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Select Page
            </h4>
            {activeDoc.pages?.map(p => (
              <button
                key={p.pageNumber}
                onClick={() => setSelectedPage(p.pageNumber)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                  selectedPage === p.pageNumber
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span>Page {p.pageNumber}</span>
                <span className="text-[10px] opacity-70">
                  {p.text.slice(0, 15)}...
                </span>
              </button>
            ))}
          </div>

          {/* Page Content Inspector */}
          <div className="md:col-span-3 bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
                Page {selectedPage} of {activeDoc.pageCount}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {activeDoc.filename}
              </span>
            </div>

            <pre className="text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed max-h-[500px] overflow-y-auto">
              {activeDoc.pages?.find(p => p.pageNumber === selectedPage)?.text ||
                'No content on this page.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
