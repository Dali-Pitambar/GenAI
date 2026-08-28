import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Terminal, 
  Key, 
  FileText, 
  Layers,
  Container
} from 'lucide-react';
import { StreamlitAppTemplate } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: StreamlitAppTemplate;
  currentCode: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  app,
  currentCode,
}) => {
  const [activeFile, setActiveFile] = useState<'app.py' | 'requirements.txt' | '.env.example' | 'README.md' | 'Dockerfile'>('app.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envExampleContent = `# Google Gemini API Key
# Get your API key from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional App Port
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS="0.0.0.0"
`;

  const readmeContent = `# ${app.title}

${app.description}

Built with **Google Gemini** (\`@google/genai\`) and **Streamlit**.

## 🚀 Quickstart

1. **Clone or download this repository**
   \`\`\`bash
   cd ${app.id}
   \`\`\`

2. **Create a virtual environment**
   \`\`\`bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Set your Gemini API Key**
   \`\`\`bash
   export GEMINI_API_KEY="your-gemini-api-key"
   \`\`\`

5. **Run the Streamlit application**
   \`\`\`bash
   streamlit run app.py
   \`\`\`

## 📦 Features
${app.features.map(f => `- ${f}`).join('\n')}
`;

  const dockerfileContent = `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
`;

  const getFileContent = () => {
    switch (activeFile) {
      case 'app.py':
        return currentCode;
      case 'requirements.txt':
        return app.requirements;
      case '.env.example':
        return envExampleContent;
      case 'README.md':
        return readmeContent;
      case 'Dockerfile':
        return dockerfileContent;
      default:
        return currentCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadActive = () => {
    const content = getFileContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const files = [
      { name: 'app.py', content: currentCode },
      { name: 'requirements.txt', content: app.requirements },
      { name: '.env.example', content: envExampleContent },
      { name: 'README.md', content: readmeContent },
      { name: 'Dockerfile', content: dockerfileContent },
    ];

    files.forEach((f) => {
      const blob = new Blob([f.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
              <Download className="w-5 h-5 text-red-400" />
              <span>Export Streamlit + Gemini App Package</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{app.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs & Actions */}
        <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'app.py', icon: <FileCode className="w-3.5 h-3.5 text-red-400 shrink-0" /> },
              { id: 'requirements.txt', icon: <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> },
              { id: '.env.example', icon: <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" /> },
              { id: 'README.md', icon: <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> },
              { id: 'Dockerfile', icon: <Container className="w-3.5 h-3.5 text-blue-400 shrink-0" /> },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFile(f.id as any)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeFile === f.id
                    ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {f.icon}
                <span className="whitespace-nowrap">{f.id}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
              <span className="whitespace-nowrap">{copied ? 'Copied' : `Copy ${activeFile}`}</span>
            </button>

            <button
              onClick={handleDownloadActive}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Download {activeFile}</span>
            </button>

            <button
              onClick={handleDownloadAll}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white inline-flex items-center space-x-1.5 shadow-md shadow-red-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Download Full Package</span>
            </button>
          </div>
        </div>

        {/* File Preview */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
            <code>{getFileContent()}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
