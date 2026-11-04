import React from 'react';
import { Search, Mail, Bell, Sparkles, BookOpen } from 'lucide-react';
import { DocumentMeta } from '../types';

interface TopBarProps {
  activeDoc: DocumentMeta;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickQuery: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeDoc,
  searchQuery,
  onSearchChange,
  onQuickQuery,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onQuickQuery(searchQuery.trim());
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 px-6 border-b border-white/[0.06] bg-transparent">
      {/* Greeting & Active Document Context */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Hello Researcher!</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Ask questions from <span className="text-sky-400 font-medium">{activeDoc.filename}</span> using Grounded RAG
        </p>
      </div>

      {/* Right Controls: Search & Action Icons */}
      <div className="flex items-center space-x-3">
        {/* Search Input matching reference image capsule */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or ask document..."
            className="w-full bg-[#13162b]/80 border border-white/10 hover:border-indigo-500/40 focus:border-sky-400 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Mail / Share Icon */}
        <button
          type="button"
          className="w-9 h-9 rounded-xl bg-[#13162b]/80 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
          title="Share document intelligence"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: activeDoc.title, url: window.location.href }).catch(() => {});
            }
          }}
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* Notification Bell with red badge */}
        <div className="relative">
          <button
            type="button"
            className="w-9 h-9 rounded-xl bg-[#13162b]/80 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Vector Index Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0b0d19]" />
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-9 h-9 rounded-full ring-2 ring-indigo-500/50 p-0.5 overflow-hidden bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
            <span>AR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
