import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  Play, 
  Code, 
  CheckCircle2, 
  Copy, 
  Download, 
  RefreshCw, 
  Terminal, 
  Layers, 
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { AppGenerationResult, StreamlitAppTemplate } from '../types';

interface AiAppGeneratorProps {
  onLoadGeneratedApp: (template: StreamlitAppTemplate) => void;
}

export const AiAppGenerator: React.FC<AiAppGeneratorProps> = ({ onLoadGeneratedApp }) => {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Productivity & Business');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AppGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleIdeas = [
    {
      title: 'Legal Contract Risk & Clause Analyzer',
      category: 'Vision & Documents',
      prompt: 'Build a Streamlit app where legal teams upload PDF/text contract agreements, and Gemini flags high-risk indemnity clauses, missing warranties, and generates renegotiation redlines in a structured table.'
    },
    {
      title: 'Natural Language to SQL Query & Dashboard',
      category: 'Analytics',
      prompt: 'Build an AI SQL Copilot in Streamlit. Users type questions in plain English, Gemini translates them into optimized PostgreSQL queries, explains the execution plan, and visualizes sample results.'
    },
    {
      title: 'Customer Feedback Sentiment & Action Item Matrix',
      category: 'Productivity & Business',
      prompt: 'Build an app that ingests customer survey feedback, clusters common pain points by frequency, generates an executive sentiment score gauge, and formulates prioritized engineering action items.'
    },
    {
      title: 'Medical Lab Report Patient Explainer',
      category: 'Vision & Documents',
      prompt: 'Build a Streamlit app that takes medical bloodwork/lab results (via text or image), translates medical terminology into plain English, flags out-of-range biomarkers, and suggests lifestyle discussion points for doctors.'
    },
    {
      title: 'Automated YouTube Video Script & Storyboard Studio',
      category: 'Creative & Media',
      prompt: 'Build an app where creators enter a video topic, target audience, and duration. Gemini generates a timestamped hook, script, B-roll visual descriptions, and SEO title/tags.'
    }
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt;
    if (!promptToUse.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/generate-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: promptToUse,
          appCategory: category,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate app');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLaunchInEmulator = () => {
    if (!result) return;
    const newTemplate: StreamlitAppTemplate = {
      id: `generated-${Date.now()}`,
      title: result.title || 'AI Generated Streamlit App',
      category: 'Code & Dev',
      badge: 'Custom AI Generated',
      description: result.description || 'Custom application generated with Google Gemini and Streamlit.',
      tags: ['Custom', 'Gemini 3.7 Flash', 'Streamlit'],
      features: result.features || ['Custom interactive widgets', 'Gemini SDK integration', 'Streamlit UI'],
      requirements: result.requirements || 'streamlit>=1.38.0\ngoogle-genai>=0.1.0\npython-dotenv>=1.0.1',
      pythonCode: result.code,
    };
    onLoadGeneratedApp(newTemplate);
  };

  const handleCopyCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-indigo-950/70 border border-red-500/20 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 text-red-400 font-mono text-xs uppercase tracking-wider mb-2">
          <Wand2 className="w-4 h-4" />
          <span>AI App Generator (Prompt to Streamlit)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Describe any Gen AI app. Gemini writes the complete Streamlit code.
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Powered by Gemini 3.7 Flash. Generates modern Python syntax using the official{' '}
          <code className="text-red-400 font-mono">google-genai</code> SDK, clean state handling, and interactive Streamlit widgets.
        </p>
      </div>

      {/* Input Generator Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-md">
        <div className="space-y-2">
          <label className="text-sm font-bold text-white flex items-center justify-between">
            <span>What kind of Gen AI Streamlit app do you want to build?</span>
            <span className="text-xs text-slate-400 font-mono">Natural Language Prompt</span>
          </label>
          <textarea
            id="ai-builder-prompt-input"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Build an AI Travel Planning Studio that takes destination, trip length, and budget, and outputs a day-by-day itinerary table, packing checklist, and local restaurant recommendations with Gemini..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Category & Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Category:</span>
            <select
              id="ai-builder-category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-red-500 w-full sm:w-auto"
            >
              <option value="Productivity & Business">Productivity & Business</option>
              <option value="Vision & Documents">Vision & Documents</option>
              <option value="Analytics & BI">Analytics & BI</option>
              <option value="Agent & Tools">Agent & Tools</option>
              <option value="Creative & Media">Creative & Media</option>
              <option value="Developer Tools">Developer Tools</option>
            </select>
          </div>

          <button
            id="btn-generate-ai-app"
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 inline-flex items-center justify-center space-x-2 shrink-0"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>Generating Streamlit Application...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>🚀 Generate Streamlit App</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Inspiration Chips */}
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Popular App Blueprints (Click to generate):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-stretch">
            {sampleIdeas.map((idea, i) => (
              <button
                key={i}
                id={`sample-idea-btn-${i}`}
                onClick={() => {
                  setPrompt(idea.prompt);
                  setCategory(idea.category);
                  handleGenerate(idea.prompt);
                }}
                className="p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all text-xs group flex flex-col justify-between space-y-2 h-full"
              >
                <div className="font-bold text-slate-200 group-hover:text-red-400 flex items-center justify-between gap-2">
                  <span className="leading-snug">{idea.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {idea.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Generated Result Card */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-red-400 mb-1">
                <span>{result.category || 'Streamlit App'}</span>
                <span>•</span>
                <span>Generated Successfully</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {result.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {result.description}
              </p>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                id="btn-copy-generated-code"
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                id="btn-launch-generated-app"
                onClick={handleLaunchInEmulator}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-500/20 flex items-center space-x-2 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch in Live Sandbox</span>
              </button>
            </div>
          </div>

          {/* Features Highlights */}
          {result.features && result.features.length > 0 && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                Key Application Capabilities:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {result.features.map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Viewer Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>app.py (Generated Python Script)</span>
              <span>{result.code?.split('\n').length || 0} lines</span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
              <code>{result.code}</code>
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
