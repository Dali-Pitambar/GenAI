export interface StreamlitAppTemplate {
  id: string;
  title: string;
  category: 'Vision' | 'Chatbot' | 'Analytics' | 'Prompt Engineering' | 'Agent & Tools' | 'Code & Dev';
  badge: string;
  description: string;
  tags: string[];
  pythonCode: string;
  requirements: string;
  defaultInputs?: Record<string, any>;
  samplePrompts?: string[];
  features: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens?: number;
  model?: string;
}

export interface MetricItem {
  label: string;
  value: string | number;
  delta?: string | number;
  deltaType?: 'positive' | 'negative' | 'neutral';
}

export interface DataRow {
  [key: string]: string | number | boolean;
}

export interface ToolCallLog {
  id: string;
  toolName: string;
  args: Record<string, any>;
  result?: any;
  status: 'invoked' | 'running' | 'completed' | 'error';
  timestamp: string;
}

export interface AppGenerationResult {
  title: string;
  description: string;
  category: string;
  code: string;
  requirements: string;
  features: string[];
  howToRun?: string;
}
