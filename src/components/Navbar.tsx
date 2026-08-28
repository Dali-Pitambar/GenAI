import React from 'react';
import { 
  Play, 
  Code, 
  Layers, 
  BookOpen, 
  Wand2, 
  Download, 
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'emulator' | 'gallery' | 'generator' | 'cheatsheet';
  setActiveTab: (tab: 'emulator' | 'gallery' | 'generator' | 'cheatsheet') => void;
  activeAppTitle: string;
  onRunApp: () => void;
  onOpenExport: () => void;
  isRunning: boolean;
  activeEditorSplit: boolean;
  setActiveEditorSplit: (split: boolean | ((prev: boolean) => boolean)) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRunApp,
  onOpenExport,
  isRunning,
  activeEditorSplit,
  setActiveEditorSplit,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-600 to-indigo-600 shadow-lg shadow-red-500/20 text-white font-black text-xl select-none">
            <span className="text-white font-mono leading-none">S</span>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white tracking-tight text-base sm:text-lg leading-tight">
                Gemini <span className="text-red-400 font-mono">&</span> Streamlit
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 leading-none">
                GenAI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block leading-tight mt-0.5">
              Rapid Python App Prototyping & Live Sandbox
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <button
            id="nav-tab-emulator"
            onClick={() => setActiveTab('emulator')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'emulator'
                ? 'bg-red-500 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
            <span className="whitespace-nowrap">App Sandbox</span>
          </button>

          <button
            id="nav-tab-gallery"
            onClick={() => setActiveTab('gallery')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-red-500 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">Templates Gallery</span>
            <span className="md:hidden whitespace-nowrap">Templates</span>
          </button>

          <button
            id="nav-tab-generator"
            onClick={() => setActiveTab('generator')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-red-500 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span className="hidden md:inline whitespace-nowrap">AI App Generator</span>
            <span className="md:hidden whitespace-nowrap">AI Builder</span>
          </button>

          <button
            id="nav-tab-cheatsheet"
            onClick={() => setActiveTab('cheatsheet')}
            className={`inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'cheatsheet'
                ? 'bg-red-500 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline whitespace-nowrap">SDK Cheatsheet</span>
            <span className="md:hidden whitespace-nowrap">Guide</span>
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {activeTab === 'emulator' && (
            <>
              <button
                id="btn-toggle-editor-split"
                onClick={() => setActiveEditorSplit(prev => !prev)}
                className={`hidden lg:inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all h-9 ${
                  activeEditorSplit
                    ? 'bg-slate-800 text-red-400 border-red-500/40 shadow-inner'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
                title="Toggle Split Code Editor"
              >
                <Code className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{activeEditorSplit ? 'Hide Code' : 'View Python Code'}</span>
              </button>

              <button
                id="btn-run-app"
                onClick={onRunApp}
                disabled={isRunning}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 h-9"
              >
                <Play className={`w-3.5 h-3.5 shrink-0 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap">{isRunning ? 'Rerunning...' : 'Rerun'}</span>
              </button>
            </>
          )}

          <button
            id="btn-export-bundle"
            onClick={onOpenExport}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all h-9"
            title="Download full Streamlit app & requirements"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Export App</span>
          </button>
        </div>

      </div>
    </header>
  );
};
