import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  Code, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Eye, 
  Bot, 
  BarChart3, 
  Scale, 
  Cpu, 
  Code2,
  ArrowRight
} from 'lucide-react';
import { StreamlitAppTemplate } from '../types';
import { PREBUILT_APPS } from '../data/prebuiltApps';

interface TemplateGalleryProps {
  onSelectApp: (app: StreamlitAppTemplate) => void;
  activeAppId: string;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectApp, activeAppId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Vision', 'Chatbot', 'Analytics', 'Prompt Engineering', 'Agent & Tools', 'Code & Dev'];

  const filteredApps = PREBUILT_APPS.filter((app) => {
    const matchesCat = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch =
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Vision':
        return <Eye className="w-5 h-5 text-red-400" />;
      case 'Chatbot':
        return <Bot className="w-5 h-5 text-rose-400" />;
      case 'Analytics':
        return <BarChart3 className="w-5 h-5 text-amber-400" />;
      case 'Prompt Engineering':
        return <Scale className="w-5 h-5 text-indigo-400" />;
      case 'Agent & Tools':
        return <Cpu className="w-5 h-5 text-emerald-400" />;
      case 'Code & Dev':
        return <Code2 className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 text-red-400 font-mono text-xs uppercase tracking-wider mb-2">
          <Layers className="w-4 h-4" />
          <span>Production App Blueprints</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Gemini & Streamlit Application Templates
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Prebuilt, fully functional Generative AI applications using Streamlit and Google Gemini. Click any template to launch its interactive runtime sandbox and inspect the Python code.
        </p>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tags..."
            className="w-full sm:w-64 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredApps.map((app) => {
          const isActive = app.id === activeAppId;
          return (
            <div
              key={app.id}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all group hover:border-red-500/50 hover:shadow-xl ${
                isActive ? 'border-red-500 ring-1 ring-red-500/40 bg-slate-900/90' : 'border-slate-800'
              }`}
            >
              <div className="space-y-4 flex-1">
                
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-red-500/30 transition-colors shrink-0">
                    {getCategoryIcon(app.category)}
                  </div>
                  <span className="inline-flex items-center text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 leading-none">
                    {app.badge}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight group-hover:text-red-400 transition-colors leading-snug">
                    {app.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {app.description}
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  {app.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {app.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Action Button */}
              <button
                id={`btn-select-app-${app.id}`}
                onClick={() => onSelectApp(app)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center space-x-2 transition-all mt-auto ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white border border-slate-700'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span>{isActive ? 'Currently Active in Sandbox' : 'Launch in Sandbox'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 shrink-0" />
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
