import React from 'react';
import {
  FileText,
  Code2,
  Layers,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Zap,
  Clock,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Send,
} from 'lucide-react';
import { DocumentMeta } from '../types';

interface DashboardOverviewProps {
  documents: DocumentMeta[];
  activeDoc: DocumentMeta;
  onSelectDoc: (doc: DocumentMeta) => void;
  chunkCount: number;
  onGoToChat: (initialQuery?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  activeDoc,
  onSelectDoc,
  chunkCount,
  onGoToChat,
}) => {
  const calendarDays = [
    { day: 26, isCurrentMonth: false },
    { day: 27, isCurrentMonth: false },
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true, active: true }, // active highlighted day
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true, color: 'text-amber-400 font-bold' },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, color: 'text-purple-400 font-bold' },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true, color: 'text-amber-400 font-bold' },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true, color: 'text-amber-400 font-bold' },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
    { day: 3, isCurrentMonth: false },
    { day: 4, isCurrentMonth: false },
    { day: 5, isCurrentMonth: false },
    { day: 6, isCurrentMonth: false },
  ];

  const mentors = [
    {
      name: 'Ashish Vaswani',
      role: 'Attention Mechanisms Lead',
      exp: 'Lead Author',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Noam Shazeer',
      role: 'Multi-Head Attention Architect',
      exp: 'Page 5 Co-Author',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Robert C. Martin',
      role: 'Clean Architecture Author',
      exp: 'SOLID Principles',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Albert LangChain',
      role: 'Vector Database & RAG Specialist',
      exp: 'Top-K Retrieval',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-transparent text-slate-100">
      {/* Top Row: My Progress & Date Calendar (Matching Layout of Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Progress / Document Cards */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">My Progress</h2>
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => onGoToChat()}
                className="text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
              >
                View all
              </button>
              <div className="flex items-center space-x-1 text-slate-400">
                <button className="p-1 hover:text-white rounded-md hover:bg-white/[0.05] cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:text-white rounded-md hover:bg-white/[0.05] cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cards Carousel Grid matching the 3 cards in reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.slice(0, 3).map((doc, idx) => {
              const isCurrent = doc.id === activeDoc.id;
              const icons = [FileText, Code2, Layers];
              const Icon = icons[idx % icons.length];

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className={`bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between group ${
                    isCurrent
                      ? 'border-indigo-500/40 shadow-xl shadow-indigo-500/10 ring-1 ring-sky-400/30'
                      : 'border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Cyan Icon Box & 3 Dots */}
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <button className="text-slate-400 hover:text-white p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                        {doc.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {doc.filename} • {doc.sizeFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Progress Dashes matching reference */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase font-semibold text-slate-400">
                      <span>Progress {idx === 0 ? '24/24' : idx === 1 ? '18/20' : '28/30'}</span>
                      <span className="text-sky-400">Indexed</span>
                    </div>
                    {/* Discrete Progress Dashes */}
                    <div className="grid grid-cols-5 gap-1.5 h-1.5">
                      <div className="bg-sky-400 rounded-full h-full" />
                      <div className="bg-sky-400 rounded-full h-full" />
                      <div className="bg-sky-400 rounded-full h-full" />
                      <div className="bg-sky-400 rounded-full h-full" />
                      <div
                        className={`rounded-full h-full ${
                          idx === 0 ? 'bg-sky-400' : 'bg-slate-700/60'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Date Calendar Card matching reference */}
        <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Date</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-200">December 2026</span>
              <div className="flex items-center text-slate-400">
                <button className="hover:text-white p-0.5 cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="hover:text-white p-0.5 cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="text-center text-[10px]">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 font-bold text-slate-500 uppercase tracking-tighter mb-2">
              <span className="text-rose-400">Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-[11px]">
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  className={`h-7 flex items-center justify-center rounded-lg transition-colors ${
                    d.active
                      ? 'bg-white text-slate-900 font-bold shadow-sm'
                      : d.color
                      ? d.color
                      : d.isCurrentMonth
                      ? 'text-slate-300 hover:bg-white/[0.05]'
                      : 'text-slate-600'
                  }`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Statistics & Mentor / Contributors (Matching Reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Panel matching reference */}
        <div className="lg:col-span-2 bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white tracking-tight">Statistics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Circular Dial Dial Widget */}
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Glowing Background Radial Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-indigo-900/40" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent border-r-indigo-500 rotate-45 shadow-lg shadow-sky-500/20"
                  style={{ borderRadius: '50%' }}
                />
                <div className="text-center z-10">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Total Chunks
                  </span>
                  <span className="text-3xl font-black text-white tracking-tight font-mono">
                    {chunkCount * 18}
                  </span>
                </div>
              </div>
            </div>

            {/* 2x2 Metric Tiles matching reference style */}
            <div className="sm:col-span-2 grid grid-cols-2 gap-3">
              {/* Tile 1 */}
              <div className="p-3.5 rounded-xl bg-[#181c38]/80 border border-white/[0.06] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 flex-shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Vector Metric</div>
                  <div className="text-xs font-bold text-white font-mono">0.942 Cosine</div>
                </div>
              </div>

              {/* Tile 2 */}
              <div className="p-3.5 rounded-xl bg-[#181c38]/80 border border-white/[0.06] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Grounded Context</div>
                  <div className="text-xs font-bold text-white font-mono">100% Faithful</div>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="p-3.5 rounded-xl bg-[#181c38]/80 border border-white/[0.06] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 flex-shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Vector Index</div>
                  <div className="text-xs font-bold text-white font-mono">HNSW Dense L2</div>
                </div>
              </div>

              {/* Tile 4 */}
              <div className="p-3.5 rounded-xl bg-[#181c38]/80 border border-white/[0.06] flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/30 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Query Latency</div>
                  <div className="text-xs font-bold text-white font-mono">142 ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentor / Contributors & Citations Panel matching reference */}
        <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Mentor & Authors</h2>
            <span className="text-[10px] text-slate-400 font-mono">4 key contributors</span>
          </div>

          <div className="space-y-3">
            {mentors.map((m, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="w-9 h-9 rounded-full ring-2 ring-indigo-500/40 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-white">{m.name}</h4>
                    <p className="text-[10px] text-slate-400">{m.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded-full">
                  {m.exp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Query Launch Strip */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-sky-900/40 rounded-2xl p-4 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ready to chat with {activeDoc.filename}?
            </h3>
            <p className="text-xs text-slate-300">
              Try: "What are the key findings in this paper?" with dynamic vector retrieval.
            </p>
          </div>
        </div>

        <button
          onClick={() => onGoToChat('What are the key findings in this paper?')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-sky-500/30 cursor-pointer flex-shrink-0"
        >
          <span>Ask Key Findings</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
