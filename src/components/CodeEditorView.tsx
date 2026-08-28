import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Play, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  FileCode, 
  Layers,
  Terminal,
  Info
} from 'lucide-react';
import { StreamlitAppTemplate } from '../types';

interface CodeEditorViewProps {
  app: StreamlitAppTemplate;
  editableCode: string;
  setEditableCode: (code: string) => void;
  onRunCode: () => void;
  onResetCode: () => void;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  app,
  editableCode,
  setEditableCode,
  onRunCode,
  onResetCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'requirements' | 'architecture'>('editor');

  const handleCopy = () => {
    navigator.clipboard.writeText(
      activeTab === 'editor' ? editableCode : app.requirements
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'editor' ? 'app.py' : 'requirements.txt';
    const content = activeTab === 'editor' ? editableCode : app.requirements;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lines = editableCode.split('\n');

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-100 font-mono text-xs select-none">
      
      {/* Editor Header Bar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          {/* File Tabs */}
          <button
            id="tab-app-py"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-red-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-red-400" />
            <span>app.py</span>
          </button>

          <button
            id="tab-requirements-txt"
            onClick={() => setActiveTab('requirements')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeTab === 'requirements'
                ? 'bg-slate-800 text-red-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>requirements.txt</span>
          </button>

          <button
            id="tab-architecture-guide"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs transition-all ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>App Breakdown</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            id="btn-copy-code"
            onClick={handleCopy}
            className="inline-flex items-center justify-center p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors h-7 w-7"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            id="btn-download-file"
            onClick={handleDownload}
            className="inline-flex items-center justify-center p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors h-7 w-7"
            title="Download File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {activeTab === 'editor' && (
            <button
              id="btn-reset-code"
              onClick={onResetCode}
              className="inline-flex items-center justify-center p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors h-7 w-7"
              title="Reset Code to Template Default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            id="btn-apply-run-code"
            onClick={onRunCode}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-sans text-xs font-semibold shadow-sm transition-all h-7"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Apply & Run</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="h-full flex overflow-auto bg-slate-950 font-mono text-xs">
            {/* Line numbers */}
            <div className="w-12 py-3 bg-slate-950 border-r border-slate-800 text-slate-600 text-right pr-3 select-none shrink-0 font-mono text-[11px] leading-relaxed">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Textarea */}
            <textarea
              id="python-code-editor"
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              spellCheck={false}
              className="flex-1 py-3 px-4 bg-transparent text-slate-200 outline-none resize-none font-mono text-[11px] leading-relaxed whitespace-pre focus:ring-0 select-text"
            />
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="h-full p-4 bg-slate-950 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">Install via terminal:</span>
              <span className="text-[10px] text-emerald-400 font-mono">pip install -r requirements.txt</span>
            </div>
            <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-indigo-300 text-xs">
              {app.requirements}
            </pre>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="font-semibold text-slate-200">🚀 Quickstart Guide:</div>
              <div>1. Create and activate a Python virtual environment:</div>
              <code className="block p-2 bg-slate-950 rounded text-slate-300">
                python -m venv .venv && source .venv/bin/activate
              </code>
              <div>2. Install dependencies:</div>
              <code className="block p-2 bg-slate-950 rounded text-slate-300">
                pip install streamlit google-genai
              </code>
              <div>3. Set your API Key and run:</div>
              <code className="block p-2 bg-slate-950 rounded text-slate-300">
                export GEMINI_API_KEY="your-gemini-key"<br />
                streamlit run app.py
              </code>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="h-full p-5 bg-slate-950 overflow-y-auto space-y-4 text-xs font-sans">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>{app.title} - Architecture & SDK Patterns</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">{app.description}</p>
            </div>

            <div className="space-y-3 text-slate-300 text-xs leading-relaxed">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-red-400 text-xs">1. Official Google GenAI SDK Usage</span>
                <p className="text-slate-400 text-[11px]">
                  Uses the new standard <code className="text-red-300">google-genai</code> SDK:
                  <code className="block p-2 mt-1 bg-slate-950 rounded text-slate-200 font-mono">
                    from google import genai<br />
                    client = genai.Client()
                  </code>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-indigo-400 text-xs">2. Caching Client with st.cache_resource</span>
                <p className="text-slate-400 text-[11px]">
                  Prevents creating new client instances on every Streamlit rerun, improving response latency:
                  <code className="block p-2 mt-1 bg-slate-950 rounded text-slate-200 font-mono">
                    @st.cache_resource<br />
                    def get_client(): return genai.Client()
                  </code>
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-emerald-400 text-xs">3. Session State Management</span>
                <p className="text-slate-400 text-[11px]">
                  Preserves chat messages and tool outputs across user interactions:
                  <code className="block p-2 mt-1 bg-slate-950 rounded text-slate-200 font-mono">
                    if "messages" not in st.session_state:<br />
                    &nbsp;&nbsp;st.session_state.messages = []
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Status */}
      <div className="bg-slate-950 px-4 py-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center space-x-3">
          <span>Python 3.10+</span>
          <span>{lines.length} lines</span>
          <span>{editableCode.length} chars</span>
        </div>
        <span className="text-red-400">Streamlit Ready</span>
      </div>

    </div>
  );
};
