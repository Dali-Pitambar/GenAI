import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StreamlitRuntimeEmulator } from './components/StreamlitRuntimeEmulator';
import { CodeEditorView } from './components/CodeEditorView';
import { TemplateGallery } from './components/TemplateGallery';
import { AiAppGenerator } from './components/AiAppGenerator';
import { StreamlitCheatSheet } from './components/StreamlitCheatSheet';
import { ExportModal } from './components/ExportModal';
import { PREBUILT_APPS } from './data/prebuiltApps';
import { StreamlitAppTemplate } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'emulator' | 'gallery' | 'generator' | 'cheatsheet'>('emulator');
  const [currentApp, setCurrentApp] = useState<StreamlitAppTemplate>(PREBUILT_APPS[0]);
  const [editableCode, setEditableCode] = useState<string>(PREBUILT_APPS[0].pythonCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showEditorSplit, setShowEditorSplit] = useState<boolean>(true);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Switch active app
  const handleSelectApp = (app: StreamlitAppTemplate) => {
    setCurrentApp(app);
    setEditableCode(app.pythonCode);
    setActiveTab('emulator');
  };

  // Run or rerun app
  const handleRunApp = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 400);
  };

  // Reset editable code to original template
  const handleResetCode = () => {
    setEditableCode(currentApp.pythonCode);
  };

  // Load custom generated app from AI builder
  const handleLoadGeneratedApp = (newTemplate: StreamlitAppTemplate) => {
    setCurrentApp(newTemplate);
    setEditableCode(newTemplate.pythonCode);
    setActiveTab('emulator');
  };

  return (
    <div id="gemini-streamlit-studio-root" className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased">
      
      {/* Top Studio Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAppTitle={currentApp.title}
        onRunApp={handleRunApp}
        onOpenExport={() => setShowExportModal(true)}
        isRunning={isRunning}
        activeEditorSplit={showEditorSplit}
        setActiveEditorSplit={setShowEditorSplit}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. Live Sandbox & Code Editor View */}
        {activeTab === 'emulator' && (
          <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
            
            {/* Left: Streamlit Runtime Emulator Canvas */}
            <div className={`h-full overflow-hidden flex flex-col ${showEditorSplit ? 'w-full lg:w-3/5 xl:w-2/3' : 'w-full'}`}>
              <StreamlitRuntimeEmulator
                app={currentApp}
                isRunning={isRunning}
                onRerun={handleRunApp}
                onCodeChange={setEditableCode}
              />
            </div>

            {/* Right: Split Python Code Editor (app.py) */}
            {showEditorSplit && (
              <div className="hidden lg:block w-full lg:w-2/5 xl:w-1/3 h-full overflow-hidden border-t lg:border-t-0 border-slate-800">
                <CodeEditorView
                  app={currentApp}
                  editableCode={editableCode}
                  setEditableCode={setEditableCode}
                  onRunCode={handleRunApp}
                  onResetCode={handleResetCode}
                />
              </div>
            )}

          </div>
        )}

        {/* 2. Templates Gallery */}
        {activeTab === 'gallery' && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-950">
            <TemplateGallery
              onSelectApp={handleSelectApp}
              activeAppId={currentApp.id}
            />
          </div>
        )}

        {/* 3. AI App Builder */}
        {activeTab === 'generator' && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-950">
            <AiAppGenerator
              onLoadGeneratedApp={handleLoadGeneratedApp}
            />
          </div>
        )}

        {/* 4. Developer Cheatsheet & Best Practices */}
        {activeTab === 'cheatsheet' && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-950">
            <StreamlitCheatSheet />
          </div>
        )}

      </div>

      {/* Full Project Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        app={currentApp}
        currentCode={editableCode}
      />

    </div>
  );
}
