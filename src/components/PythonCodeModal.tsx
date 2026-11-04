import React, { useState } from 'react';
import { Terminal, Copy, Check, Download } from 'lucide-react';
import { PYTHON_LANGCHAIN_STREAMLIT, PYTHON_LLAMAINDEX_STREAMLIT } from '../data/pythonTemplates';

export const PythonCodeModal: React.FC = () => {
  const [activeFramework, setActiveFramework] = useState<'langchain' | 'llamaindex'>('langchain');
  const [copied, setCopied] = useState(false);

  const currentCode =
    activeFramework === 'langchain' ? PYTHON_LANGCHAIN_STREAMLIT : PYTHON_LLAMAINDEX_STREAMLIT;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeFramework === 'langchain' ? 'app_langchain_streamlit.py' : 'app_llamaindex_streamlit.py';
    const blob = new Blob([currentCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-transparent text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <span>Python & LangChain / LlamaIndex Code</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-ready Python RAG scripts with ChromaDB, FAISS, and Streamlit UI
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Framework Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#13162b]/90 p-1.5 rounded-full border border-white/[0.08] text-xs">
            <button
              onClick={() => setActiveFramework('langchain')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeFramework === 'langchain'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LangChain + Chroma
            </button>
            <button
              onClick={() => setActiveFramework('llamaindex')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeFramework === 'llamaindex'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              LlamaIndex + FAISS
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#13162b]/80 hover:bg-[#181c38] border border-white/10 text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-md shadow-sky-500/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .py</span>
          </button>
        </div>
      </div>

      {/* Code Card */}
      <div className="bg-[#13162b]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
        <div className="bg-[#0e1022] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <span>
              {activeFramework === 'langchain'
                ? 'app_langchain_streamlit.py'
                : 'app_llamaindex_streamlit.py'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Python 3.10+ • Streamlit 1.30+</span>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-[580px] bg-[#0c0e1d]/90">
          <code>{currentCode}</code>
        </pre>
      </div>
    </div>
  );
};
