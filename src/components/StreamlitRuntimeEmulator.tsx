import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Terminal, 
  Send, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Sliders, 
  Check, 
  Copy, 
  AlertCircle, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Database, 
  Code2, 
  CheckCircle2, 
  Layers, 
  Activity,
  Bot,
  User,
  Zap,
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { StreamlitAppTemplate, ChatMessage, ToolCallLog } from '../types';

interface StreamlitRuntimeEmulatorProps {
  app: StreamlitAppTemplate;
  isRunning: boolean;
  onRerun: () => void;
  onCodeChange?: (newCode: string) => void;
}

export const StreamlitRuntimeEmulator: React.FC<StreamlitRuntimeEmulatorProps> = ({
  app,
  isRunning,
  onRerun,
}) => {
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.95);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful, production-ready AI Assistant specializing in Streamlit and Google Gemini integration.'
  );

  // Common UI states
  const [activeTab, setActiveTab] = useState('main');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; icon?: string }[]>([]);
  const [showSessionState, setShowSessionState] = useState(false);

  // Multimodal Vision App states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState(
    'Analyze this image in detail. Extract any text, charts, diagrams, and summarize key insights in markdown.'
  );
  const [visionOutput, setVisionOutput] = useState<string>('');

  // Chatbot App states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Gemini Copilot in Streamlit. How can I help you build, optimize, or research today?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('Senior Python & AI Architect');

  // Analytics App states
  const [datasetChoice, setDatasetChoice] = useState('SaaS Subscription Metrics');
  const [dataSearchQuery, setDataSearchQuery] = useState('');
  const [analyticsQuestion, setAnalyticsQuestion] = useState(
    'Provide an executive summary, identify high-growth drivers, and recommend 3 strategic action items.'
  );
  const [analyticsOutput, setAnalyticsOutput] = useState('');

  // Prompt A/B App states
  const [abTestInput, setAbTestInput] = useState(
    'Our production PostgreSQL database experienced an unexpected failover during peak traffic at 14:00 UTC. The read replicas lagged by 45 seconds, causing transient 504 gateway errors for approximately 8 minutes before automated reconciliation restored normal operations. Write a post-mortem incident summary for our enterprise SLA customers.'
  );
  const [promptVariantA, setPromptVariantA] = useState(
    'You are a concise, empathetic customer relations manager. Write a clear, calm, and professional incident communication with sincere apologies.'
  );
  const [promptVariantB, setPromptVariantB] = useState(
    'You are a lead Site Reliability Engineer (SRE). Write a highly technical, transparent post-mortem with exact timelines, root cause, and remediation steps.'
  );
  const [tempA, setTempA] = useState(0.3);
  const [tempB, setTempB] = useState(0.7);
  const [outputA, setOutputA] = useState<{ text: string; latency: number } | null>(null);
  const [outputB, setOutputB] = useState<{ text: string; latency: number } | null>(null);

  // Function Calling Agent states
  const [agentGoal, setAgentGoal] = useState(
    'We plan to invest $75,000 into a new cloud caching tier that will save us $25,000 per year in server compute over a 4-year horizon. Calculate our ROI.'
  );
  const [toolLogs, setToolLogs] = useState<ToolCallLog[]>([]);
  const [agentFinalResponse, setAgentFinalResponse] = useState<string>('');

  // Code Synthesizer states
  const [rawCodeInput, setRawCodeInput] = useState(`def process_transactions(data):
    results = []
    for item in data:
        if item['status'] == 'completed':
            val = item['amount'] * 1.0825
            results.append({'id': item['id'], 'total': val})
    return results`);
  const [codeAction, setCodeAction] = useState('Refactor & Optimize (Type Hints, Clean Code, Error Handling)');
  const [codeSynthesizerOutput, setCodeSynthesizerOutput] = useState('');

  // Generic / Custom App states
  const [customAppInput, setCustomAppInput] = useState('Generate an executive briefing based on the latest AI trends.');
  const [customAppOutput, setCustomAppOutput] = useState('');

  // Helper: Trigger Streamlit toast
  const triggerToast = (message: string, icon = '✅') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Helper: Trigger Balloons
  const triggerBalloons = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    triggerToast('Celebration triggered! 🎈', '🎈');
  };

  // Reset states when app template changes
  useEffect(() => {
    setVisionOutput('');
    setAnalyticsOutput('');
    setOutputA(null);
    setOutputB(null);
    setToolLogs([]);
    setAgentFinalResponse('');
    setCodeSynthesizerOutput('');
    setCustomAppOutput('');

    if (app.id === 'multimodal-vision') {
      // Set sample invoice image by default
      setUploadedImage(
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
      );
    }
  }, [app.id]);

  // Handle Multimodal Vision Submission
  const handleVisionAnalyze = async () => {
    if (!uploadedImage) {
      triggerToast('Please upload or select an image first!', '⚠️');
      return;
    }
    setIsProcessing(true);
    try {
      // If remote unsplash image, fetch & convert to base64 or pass data
      let base64 = uploadedImage;
      if (uploadedImage.startsWith('http')) {
        const res = await fetch(uploadedImage);
        const blob = await res.blob();
        base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: visionPrompt,
          imageBase64: base64,
          systemInstruction: systemPrompt,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVisionOutput(data.text);
      triggerToast('Vision analysis complete!', '🚀');
    } catch (err: any) {
      setVisionOutput(`⚠️ Error: ${err.message}`);
      triggerToast(err.message, '❌');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Chatbot Submission with Streaming
  const handleChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString(),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    setChatInput('');
    setIsProcessing(true);
    setStreamingText('');

    try {
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatInput,
          systemInstruction: `${systemPrompt} Persona: ${selectedPersona}`,
          temperature,
          topP,
          model: selectedModel,
          history: newHistory.slice(-8), // Send context
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamingText(accumulated);
                }
              } catch {
                // ignore SSE parse errors
              }
            }
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulated || 'Generated response complete.',
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setStreamingText('');
      triggerToast('Message received', '💬');
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ Error during response streaming: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Data Analytics Submission
  const handleAnalyticsSubmit = async () => {
    setIsProcessing(true);
    try {
      const sampleContext =
        datasetChoice === 'SaaS Subscription Metrics'
          ? `Dataset: SaaS MRR 2024. Columns: Month, MRR ($), New_Signups, Churn_Rate (%), CAC ($). 
             Jan: $45K MRR, 410 signups, 2.4% churn, $140 CAC.
             Jun: $67.8K MRR, 710 signups, 1.7% churn, $120 CAC.
             Dec: $115K MRR, 1420 signups, 1.1% churn, $98 CAC.`
          : `Dataset: E-Commerce Regional Sales 2024. Columns: Region, Sales_USD, Orders, AOV, Growth_YoY.
             North America: $1.45M (18.2K orders, 24.5% YoY). Europe: $980K (12.4K orders, 18.2% YoY).
             Asia-Pacific: $1.24M (21K orders, 36.8% YoY). Latin America: $420K. Middle East: $310K.`;

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze this dataset:\n${sampleContext}\n\nUser Question: ${analyticsQuestion}\nProvide: 1. Executive Summary 2. Key Trends 3. 3 Strategic Action Items.`,
          systemInstruction: 'You are a Principal Data Scientist and BI Strategist. Formulate structured, clear insights with markdown formatting.',
          temperature: 0.2,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAnalyticsOutput(data.text);
      triggerToast('Analytics report generated!', '📈');
    } catch (err: any) {
      setAnalyticsOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Prompt A/B Evaluation
  const handlePromptABSubmit = async () => {
    setIsProcessing(true);
    setOutputA(null);
    setOutputB(null);
    try {
      const startA = performance.now();
      const resAPromise = fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: abTestInput,
          systemInstruction: promptVariantA,
          temperature: tempA,
          model: selectedModel,
        }),
      }).then(async r => {
        const d = await r.json();
        const lat = (performance.now() - startA) / 1000;
        return { text: d.text || d.error, latency: lat };
      });

      const startB = performance.now();
      const resBPromise = fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: abTestInput,
          systemInstruction: promptVariantB,
          temperature: tempB,
          model: selectedModel,
        }),
      }).then(async r => {
        const d = await r.json();
        const lat = (performance.now() - startB) / 1000;
        return { text: d.text || d.error, latency: lat };
      });

      const [resA, resB] = await Promise.all([resAPromise, resBPromise]);
      setOutputA(resA);
      setOutputB(resB);
      triggerToast('Side-by-side benchmark completed!', '⚖️');
    } catch (err: any) {
      triggerToast(err.message, '❌');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Function Calling Agent
  const handleAgentSubmit = async () => {
    setIsProcessing(true);
    setToolLogs([]);
    setAgentFinalResponse('');
    try {
      const response = await fetch('/api/gemini/function-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: agentGoal,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.functionCalls && data.functionCalls.length > 0) {
        const logs: ToolCallLog[] = data.functionCalls.map((fc: any, i: number) => {
          let calculatedResult: any = null;
          if (fc.name === 'calculate_roi') {
            const inv = fc.args?.investment || 75000;
            const rev = fc.args?.annualRevenue || 25000;
            const yrs = fc.args?.years || 4;
            const totalRet = rev * yrs;
            const net = totalRet - inv;
            const roiPct = ((net / inv) * 100).toFixed(1);
            calculatedResult = {
              initial_investment: `$${inv.toLocaleString()}`,
              total_savings: `$${totalRet.toLocaleString()}`,
              net_profit: `$${net.toLocaleString()}`,
              roi: `${roiPct}%`,
              payback_years: `${(inv / rev).toFixed(2)} years`,
            };
          } else {
            calculatedResult = {
              status: 'success',
              matched_records: 12,
              in_stock: true,
              warehouse: 'US-East-Primary',
            };
          }

          return {
            id: i.toString(),
            toolName: fc.name,
            args: fc.args,
            result: calculatedResult,
            status: 'completed',
            timestamp: new Date().toLocaleTimeString(),
          };
        });

        setToolLogs(logs);

        // Synthesized answer
        setAgentFinalResponse(
          `### 💡 Agent Executive Synthesis:\nBased on the \`${logs[0].toolName}\` execution:\n- **Initial Outlay**: ${logs[0].result?.initial_investment}\n- **Total Benefit**: ${logs[0].result?.total_savings}\n- **Net Value**: ${logs[0].result?.net_profit}\n- **Calculated ROI**: **${logs[0].result?.roi}**\n- **Payback Horizon**: **${logs[0].result?.payback_years}**\n\nThe financial parameters indicate a highly positive ROI with rapid breakeven.`
        );
      } else {
        setAgentFinalResponse(data.text || 'Tool reasoning complete.');
      }
      triggerToast('Agent execution finished!', '🛠️');
    } catch (err: any) {
      setAgentFinalResponse(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Code Synthesizer
  const handleCodeSynthesizer = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Code:\n\`\`\`python\n${rawCodeInput}\n\`\`\`\n\nAction: ${codeAction}\nProvide clean markdown with formatted code, type hints, tests, or complexity analysis.`,
          systemInstruction: 'You are a Principal Software Engineer and Reviewer. Output production-ready Python with explanations.',
          temperature: 0.2,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCodeSynthesizerOutput(data.text);
      triggerToast('Code transformed successfully!', '💻');
    } catch (err: any) {
      setCodeSynthesizerOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Generic / Custom AI Generated App
  const handleCustomAppSubmit = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customAppInput,
          systemInstruction: systemPrompt,
          temperature,
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setCustomAppOutput(data.text);
      triggerToast('App generated output!', '✨');
    } catch (err: any) {
      setCustomAppOutput(`⚠️ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Mock SaaS Chart Data for Analytics
  const saasData = [
    { month: 'Jan', mrr: 45000, signups: 410, cac: 140 },
    { month: 'Feb', mrr: 48200, signups: 435, cac: 138 },
    { month: 'Mar', mrr: 52100, signups: 520, cac: 132 },
    { month: 'Apr', mrr: 56000, signups: 580, cac: 128 },
    { month: 'May', mrr: 61400, signups: 640, cac: 125 },
    { month: 'Jun', mrr: 67800, signups: 710, cac: 120 },
    { month: 'Jul', mrr: 74200, signups: 830, cac: 118 },
    { month: 'Aug', mrr: 81000, signups: 920, cac: 115 },
    { month: 'Sep', mrr: 89500, signups: 1010, cac: 110 },
    { month: 'Oct', mrr: 97000, signups: 1150, cac: 108 },
    { month: 'Nov', mrr: 106000, signups: 1280, cac: 102 },
    { month: 'Dec', mrr: 115000, signups: 1420, cac: 98 },
  ];

  const ecommerceData = [
    { region: 'North America', sales: 1450000, orders: 18200 },
    { region: 'Asia-Pacific', sales: 1240000, orders: 21000 },
    { region: 'Europe', sales: 980000, orders: 12400 },
    { region: 'Latin America', sales: 420000, orders: 6200 },
    { region: 'Middle East', sales: 310000, orders: 4100 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      
      {/* Streamlit Top App Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-10 shrink-0 h-14">
        <div className="flex items-center space-x-3">
          <button
            id="toggle-streamlit-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors h-8 w-8"
            title="Toggle Streamlit Sidebar"
          >
            <Sliders className="w-4 h-4 text-red-400" />
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse shrink-0" />
            <span className="text-xs font-mono text-slate-300">streamlit run app.py</span>
            <span className="text-slate-600">|</span>
            <span className="inline-flex items-center text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 leading-none">
              {app.category}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Running Spinner indicator like real Streamlit */}
          {isProcessing && (
            <div className="inline-flex items-center space-x-2 bg-red-950/60 border border-red-800/80 px-2.5 py-1 rounded-full text-xs text-red-300 animate-pulse h-7">
              <RefreshCw className="w-3 h-3 animate-spin text-red-400 shrink-0" />
              <span className="font-mono font-medium leading-none">RUNNING...</span>
            </div>
          )}

          <button
            id="btn-inspect-session-state"
            onClick={() => setShowSessionState(!showSessionState)}
            className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors inline-flex items-center space-x-1.5 h-8 ${
              showSessionState
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden sm:inline">st.session_state</span>
          </button>

          <button
            id="btn-trigger-balloons"
            onClick={triggerBalloons}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors inline-flex items-center justify-center h-8"
            title="Trigger st.balloons()"
          >
            🎈
          </button>

          <button
            id="btn-rerun-streamlit"
            onClick={onRerun}
            disabled={isProcessing}
            className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors h-8 w-8"
            title="Rerun Streamlit App (R)"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Emulator Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Streamlit Sidebar (st.sidebar) */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 space-y-5 select-none transition-all duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                <span>st.sidebar Controls</span>
              </div>
              <span className="text-[10px] uppercase font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                Settings
              </span>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Select Model</span>
                <span className="text-[10px] text-slate-500 font-mono">st.selectbox</span>
              </label>
              <select
                id="select-model-choice"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Default & Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Temperature</span>
                <span className="font-mono text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded text-[11px]">
                  {temperature}
                </span>
              </div>
              <input
                id="slider-temperature"
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.0 (Deterministic)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* App specific sidebar items */}
            {app.id === 'conversational-copilot' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">AI Persona Preset</label>
                <select
                  id="select-persona"
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-red-500"
                >
                  <option value="Senior Python & AI Architect">Senior Python & AI Architect</option>
                  <option value="Socratic Data Science Tutor">Socratic Data Science Tutor</option>
                  <option value="Concise Tech Lead">Concise Tech Lead</option>
                  <option value="Creative Product Strategist">Creative Product Strategist</option>
                </select>

                <button
                  id="btn-clear-chat-history"
                  onClick={() => {
                    setChatMessages([
                      {
                        id: '1',
                        role: 'assistant',
                        content: 'Chat history cleared. How can I assist you?',
                        timestamp: new Date().toLocaleTimeString(),
                      },
                    ]);
                    triggerToast('Chat history cleared', '🧹');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors mt-2"
                >
                  🧹 Clear Chat (st.session_state)
                </button>
              </div>
            )}

            {app.id === 'csv-data-analyst' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300">Dataset Source</label>
                <select
                  id="select-dataset-source"
                  value={datasetChoice}
                  onChange={(e) => setDatasetChoice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                >
                  <option value="SaaS Subscription Metrics">SaaS Subscription Metrics (Sample)</option>
                  <option value="E-Commerce Regional Sales">E-Commerce Regional Sales (Sample)</option>
                </select>
              </div>
            )}

            {/* System Instruction */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>System Instruction</span>
                <span className="text-[10px] text-slate-500 font-mono">st.text_area</span>
              </label>
              <textarea
                id="textarea-system-instruction"
                rows={3}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 font-mono focus:border-red-500 resize-none"
              />
            </div>

            {/* Features Info Box */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="font-semibold text-red-400 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Streamlit + GenAI Features</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                {app.features.map((f, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
              ⚡ Connected to Gemini Server-Side Gateway (`@google/genai`)
            </div>
          </aside>
        )}

        {/* Main Streamlit App Canvas Container */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* App Title & Header Banner */}
          <div className="border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-2 text-xs font-mono text-red-400 mb-1">
              <span>st.title</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>{app.title}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {app.description}
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 1. APP: Multimodal Vision & Document Inspector */}
          {/* ========================================================================= */}
          {app.id === 'multimodal-vision' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* Left Column: Image Upload & Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Input Image (st.file_uploader)</span>
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">JPG, PNG, WEBP</span>
                    </div>

                    {/* Preset Image Selection */}
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400">Or pick a demo preset:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { label: 'Receipt / Invoice', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
                          { label: 'Architecture Tech', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' },
                          { label: 'Data Dashboard', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80' },
                          { label: 'Whiteboard Note', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
                        ].map((preset, i) => (
                          <button
                            key={i}
                            id={`preset-img-${i}`}
                            onClick={() => {
                              setUploadedImage(preset.url);
                              triggerToast(`Loaded "${preset.label}" image`, '🖼️');
                            }}
                            className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all text-center truncate"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Display */}
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-2 bg-slate-950/50 flex flex-col items-center justify-center min-h-[260px] relative group overflow-hidden">
                      {uploadedImage ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          <img
                            src={uploadedImage}
                            alt="Uploaded input preview"
                            className="max-h-72 w-auto object-contain rounded-lg shadow-md"
                            crossOrigin="anonymous"
                          />
                          <button
                            onClick={() => setUploadedImage(null)}
                            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1.5 rounded-full text-xs transition-colors"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-6 space-y-3">
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-300">Drag & drop image or browse</p>
                            <p className="text-xs text-slate-500 mt-1">Select from local files</p>
                          </div>
                          <input
                            id="file-uploader-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => setUploadedImage(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Prompt & Execution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between h-full">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Vision Query (st.text_area & st.button)</span>
                      </h3>
                    </div>

                    {/* Sample Query Chips */}
                    <div className="space-y-1.5">
                      <span className="text-xs text-slate-400">Suggested queries:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {app.samplePrompts?.map((sp, idx) => (
                          <button
                            key={idx}
                            id={`sample-prompt-${idx}`}
                            onClick={() => setVisionPrompt(sp)}
                            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full transition-all text-left"
                          >
                            {sp.slice(0, 50)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      id="vision-query-textarea"
                      rows={4}
                      value={visionPrompt}
                      onChange={(e) => setVisionPrompt(e.target.value)}
                      placeholder="Enter your question for Gemini Vision..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />

                    <button
                      id="btn-analyze-vision"
                      onClick={handleVisionAnalyze}
                      disabled={isProcessing || !uploadedImage}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all disabled:opacity-50 inline-flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                          <span>Gemini is Reasoning over Image...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>🚀 Run Gemini Multimodal Analysis</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Output Preview */}
                  <div className="border border-slate-800 rounded-xl bg-slate-950 p-4 overflow-y-auto max-h-72 mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2 border-b border-slate-800 pb-2">
                      <span className="font-semibold text-red-400">st.markdown Output</span>
                      {visionOutput && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(visionOutput);
                            triggerToast('Copied output to clipboard!', '📋');
                          }}
                          className="hover:text-white inline-flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                    {visionOutput ? (
                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {visionOutput}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic flex items-center justify-center h-24">
                        Click "Run Gemini Multimodal Analysis" to inspect and extract insights.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. APP: Conversational Copilot with Dynamic Persona */}
          {/* ========================================================================= */}
          {app.id === 'conversational-copilot' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[580px] overflow-hidden">
              
              {/* Chat Header info */}
              <div className="bg-slate-950/80 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">
                      Gemini Copilot <span className="text-slate-400 font-normal">({selectedPersona})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      st.chat_message + st.session_state + st.write_stream
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Session
                  </span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white rounded-tr-none shadow-md'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none shadow-inner'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-300/80 mb-1">
                        <span className="font-semibold uppercase tracking-wider">
                          {msg.role === 'user' ? 'You (st.chat_input)' : 'Gemini 3.7 Flash'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Real-time Streaming Typewriter Bubble */}
                {isProcessing && streamingText && (
                  <div className="flex items-start space-x-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none">
                      <div className="flex items-center space-x-1.5 text-[10px] text-red-400 mb-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        <span className="font-mono">Streaming Tokens (st.write_stream)...</span>
                      </div>
                      <div className="whitespace-pre-wrap">{streamingText}</div>
                      <span className="inline-block w-1.5 h-3.5 bg-red-400 ml-1 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar (st.chat_input) */}
              <form onSubmit={handleChatSubmit} className="p-3 bg-slate-950 border-t border-slate-800">
                <div className="relative flex items-center">
                  <input
                    id="chat-user-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Gemini anything or prompt Python code (st.chat_input)..."
                    disabled={isProcessing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    id="btn-send-chat"
                    type="submit"
                    disabled={isProcessing || !chatInput.trim()}
                    className="absolute right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. APP: AI Tabular Data & Plot Generator Copilot */}
          {/* ========================================================================= */}
          {app.id === 'csv-data-analyst' && (
            <div className="space-y-6">
              
              {/* Top Metrics Row (st.metric) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-stretch">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-mono">st.metric (MRR)</span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {datasetChoice === 'SaaS Subscription Metrics' ? '$115,000' : '$4,400,000'}
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>+28.4% YoY</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-mono">Active Customers</span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {datasetChoice === 'SaaS Subscription Metrics' ? '1,420' : '61,900'}
                  </div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>+12.6% vs Q3</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-mono">Churn Rate</span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">1.1%</div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>-0.3% Improved</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-mono">Acquisition Cost</span>
                  <div className="text-xl sm:text-2xl font-bold text-white mt-1">$98.00</div>
                  <div className="text-xs text-emerald-400 mt-2 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>-14% Efficiency</span>
                  </div>
                </div>
              </div>

              {/* Dataframe & Chart View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                
                {/* DataFrame Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center space-x-2">
                      <Database className="w-4 h-4 text-red-400" />
                      <span>Dataset Preview (st.dataframe)</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">{datasetChoice}</span>
                  </div>

                  <div className="overflow-x-auto max-h-64 rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0">
                        {datasetChoice === 'SaaS Subscription Metrics' ? (
                          <tr>
                            <th className="p-2.5">Month</th>
                            <th className="p-2.5">MRR ($)</th>
                            <th className="p-2.5">New Signups</th>
                            <th className="p-2.5">CAC ($)</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="p-2.5">Region</th>
                            <th className="p-2.5">Sales (USD)</th>
                            <th className="p-2.5">Orders</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {datasetChoice === 'SaaS Subscription Metrics'
                          ? saasData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-semibold text-white">{row.month}</td>
                                <td className="p-2.5">${row.mrr.toLocaleString()}</td>
                                <td className="p-2.5">{row.signups}</td>
                                <td className="p-2.5">${row.cac}</td>
                              </tr>
                            ))
                          : ecommerceData.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-semibold text-white">{row.region}</td>
                                <td className="p-2.5">${row.sales.toLocaleString()}</td>
                                <td className="p-2.5">{row.orders.toLocaleString()}</td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Streamlit Charts (st.line_chart / st.bar_chart) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-white flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-red-400" />
                      <span>Interactive Visual Plot (st.line_chart)</span>
                    </h3>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {datasetChoice === 'SaaS Subscription Metrics' ? (
                        <LineChart data={saasData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="mrr" stroke="#ef4444" strokeWidth={2} name="MRR ($)" />
                          <Line type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} name="Signups" />
                        </LineChart>
                      ) : (
                        <BarChart data={ecommerceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="region" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          />
                          <Bar dataKey="sales" fill="#ef4444" radius={[4, 4, 0, 0]} name="Sales ($)" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Natural Language Query Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span>Ask Gemini About This Data</span>
                </h3>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="analytics-question-input"
                    type="text"
                    value={analyticsQuestion}
                    onChange={(e) => setAnalyticsQuestion(e.target.value)}
                    placeholder="Ask questions about correlations, growth, outliers..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:border-red-500"
                  />
                  <button
                    id="btn-generate-analytics"
                    onClick={handleAnalyticsSubmit}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-md shrink-0 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Generate AI Insights</span>
                  </button>
                </div>

                {analyticsOutput && (
                  <div className="border border-slate-800 rounded-xl bg-slate-950 p-4 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {analyticsOutput}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. APP: Prompt Engineering & A/B Benchmark Studio */}
          {/* ========================================================================= */}
          {app.id === 'prompt-evaluator' && (
            <div className="space-y-6">
              
              {/* Shared Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <label className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>📥 Shared Test Input (st.text_area)</span>
                  <span className="text-xs text-slate-400">Identical input fed to both variants</span>
                </label>
                <textarea
                  id="ab-test-input-textarea"
                  rows={3}
                  value={abTestInput}
                  onChange={(e) => setAbTestInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:border-red-500"
                />
              </div>

              {/* Side by side variant configs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* Variant A */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-sm font-bold text-red-400">Variant A (Customer Relations)</span>
                      <span className="text-xs text-slate-400 font-mono">Temp: {tempA}</span>
                    </div>
                    <textarea
                      id="sys-prompt-a-textarea"
                      rows={3}
                      value={promptVariantA}
                      onChange={(e) => setPromptVariantA(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Temperature</span>
                      <span>{tempA}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={tempA}
                      onChange={(e) => setTempA(parseFloat(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />
                  </div>
                </div>

                {/* Variant B */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-sm font-bold text-indigo-400">Variant B (Lead SRE Technical)</span>
                      <span className="text-xs text-slate-400 font-mono">Temp: {tempB}</span>
                    </div>
                    <textarea
                      id="sys-prompt-b-textarea"
                      rows={3}
                      value={promptVariantB}
                      onChange={(e) => setPromptVariantB(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>Temperature</span>
                      <span>{tempB}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={tempB}
                      onChange={(e) => setTempB(parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded"
                    />
                  </div>
                </div>

              </div>

              {/* Execution Action Button */}
              <button
                id="btn-run-ab-comparison"
                onClick={handlePromptABSubmit}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>Executing Side-by-Side Model Invocations...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>🚀 Run Side-by-Side Benchmark & Latency Profiling</span>
                  </>
                )}
              </button>

              {/* Benchmark Results */}
              {(outputA || outputB) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 items-stretch">
                  
                  {/* Result A */}
                  <div className="bg-slate-900 border border-red-500/30 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-red-400 uppercase">Variant A Output</span>
                        <span className="text-xs font-mono text-emerald-400">
                          ⚡ {outputA?.latency.toFixed(2)}s | {outputA?.text.length} chars
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pt-3">
                        {outputA?.text}
                      </div>
                    </div>
                  </div>

                  {/* Result B */}
                  <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-indigo-400 uppercase">Variant B Output</span>
                        <span className="text-xs font-mono text-emerald-400">
                          ⚡ {outputB?.latency.toFixed(2)}s | {outputB?.text.length} chars
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pt-3">
                        {outputB?.text}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. APP: Autonomous Function Calling Agent */}
          {/* ========================================================================= */}
          {app.id === 'function-calling-agent' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <label className="text-sm font-semibold text-white flex items-center justify-between">
                  <span>🎯 Enter Goal for Autonomous Agent</span>
                  <span className="text-xs text-slate-400 font-mono">types.FunctionDeclaration</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="agent-goal-input"
                    type="text"
                    value={agentGoal}
                    onChange={(e) => setAgentGoal(e.target.value)}
                    placeholder="Ask a question that requires tool invocation (e.g. ROI calculation, inventory check)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:border-red-500"
                  />
                  <button
                    id="btn-run-agent"
                    onClick={handleAgentSubmit}
                    disabled={isProcessing}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center space-x-2 shadow-md shrink-0 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <Zap className="w-4 h-4 shrink-0" />}
                    <span>Run Agent</span>
                  </button>
                </div>
              </div>

              {/* Tool Execution Logs */}
              {toolLogs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Tool Invocations Detected (st.json & st.info)</span>
                  </h3>

                  {toolLogs.map((log) => (
                    <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-xs font-mono font-bold text-amber-400">
                            tool: {log.toolName}()
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 leading-none">
                          {log.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono items-stretch">
                        <div>
                          <span className="text-slate-400 block mb-1">Extracted Arguments:</span>
                          <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.args, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-400 block mb-1">Tool Execution Output:</span>
                          <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 overflow-x-auto">
                            {JSON.stringify(log.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agent Final Output */}
              {agentFinalResponse && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Final Synthesized Answer</span>
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {agentFinalResponse}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. APP: Code Synthesizer, Unit Test & Complexity Explainer */}
          {/* ========================================================================= */}
          {app.id === 'code-refactoring-studio' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <label className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-red-400 shrink-0" />
                    <span>Paste Python / JavaScript Code (st.text_area)</span>
                  </label>
                </div>

                <textarea
                  id="code-input-textarea"
                  rows={5}
                  value={rawCodeInput}
                  onChange={(e) => setRawCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:border-red-500"
                />

                {/* Radio Action */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-mono">st.radio Action</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-stretch">
                    {[
                      'Refactor & Optimize (Type Hints, Clean Code, Error Handling)',
                      'Generate Unit Tests (PyTest / Unittest)',
                      'Big-O Complexity & Performance Analysis',
                    ].map((act, i) => (
                      <button
                        key={i}
                        id={`code-action-btn-${i}`}
                        onClick={() => setCodeAction(act)}
                        className={`p-3 rounded-lg text-xs text-left border transition-all flex items-center ${
                          codeAction === act
                            ? 'bg-red-500/20 border-red-500 text-red-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <span className="leading-snug">{act}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="btn-execute-code-synthesis"
                  onClick={handleCodeSynthesizer}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <Play className="w-4 h-4 fill-current shrink-0" />}
                  <span>🚀 Transform Code with Gemini</span>
                </button>
              </div>

              {codeSynthesizerOutput && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-sm font-bold text-red-400">Transformed Result (st.markdown)</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codeSynthesizerOutput);
                        triggerToast('Copied code output!', '📋');
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto">
                    {codeSynthesizerOutput}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. GENERIC / CUSTOM AI GENERATED APP */}
          {/* ========================================================================= */}
          {!['multimodal-vision', 'conversational-copilot', 'csv-data-analyst', 'prompt-evaluator', 'function-calling-agent', 'code-refactoring-studio'].includes(app.id) && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span>Custom Streamlit Application Sandbox</span>
                </h3>

                <textarea
                  id="custom-app-input-textarea"
                  rows={3}
                  value={customAppInput}
                  onChange={(e) => setCustomAppInput(e.target.value)}
                  placeholder="Enter prompt or inputs for this custom Streamlit application..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 focus:border-red-500"
                />

                <button
                  id="btn-run-custom-app"
                  onClick={handleCustomAppSubmit}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>🚀 Execute Application Logic</span>
                </button>
              </div>

              {customAppOutput && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <span className="text-sm font-bold text-red-400">Generated Output (st.markdown)</span>
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {customAppOutput}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Streamlit Toast Notification Stack (st.toast) */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-slate-900 border border-red-500/40 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 text-xs animate-bounce pointer-events-auto"
          >
            <span>{toast.icon}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Streamlit Session State Drawer (st.session_state debugger) */}
      {showSessionState && (
        <div className="fixed bottom-0 left-0 right-0 max-h-64 bg-slate-900 border-t-2 border-red-500 shadow-2xl z-40 p-4 overflow-y-auto flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-red-400 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>st.session_state Inspector</span>
            </span>
            <button
              onClick={() => setShowSessionState(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="pt-2 text-slate-300 space-y-1">
            <pre className="text-[11px] text-emerald-400">
              {JSON.stringify(
                {
                  active_app_id: app.id,
                  selected_model: selectedModel,
                  temperature: temperature,
                  top_p: topP,
                  chat_history_length: chatMessages.length,
                  dataset_selected: datasetChoice,
                  tool_logs_count: toolLogs.length,
                  runtime_status: isProcessing ? 'busy' : 'idle',
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
