import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  Check, 
  Code, 
  Terminal, 
  Sparkles, 
  Cpu, 
  Layers, 
  FileText, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Sliders,
  ExternalLink
} from 'lucide-react';

export const StreamlitCheatSheet: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    {
      id: 'quickstart',
      title: '1. Official @google/genai Python SDK Quickstart',
      desc: 'Use the modern official Google GenAI Python SDK (google-genai) with Streamlit.',
      code: `import streamlit as st
from google import genai
from google.genai import types
import os

# Set page config
st.set_page_config(page_title="Gemini Streamlit App", page_icon="✨")

# Initialize client with cache_resource to avoid reconnections
@st.cache_resource
def get_client():
    return genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

client = get_client()

# Generate content
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Explain quantum computing in 3 bullets."
)

st.write(response.text)`
    },
    {
      id: 'streaming-chat',
      title: '2. Streaming Chat Responses with st.write_stream',
      desc: 'Stream tokens in real-time and maintain multi-turn chat memory in Streamlit session state.',
      code: `import streamlit as st
from google import genai
from google.genai import types

st.title("🤖 Gemini Streaming Chat")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Render past conversation
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Handle user input
if prompt := st.chat_input("Ask Gemini anything..."):
    # Display user query
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Stream Gemini response
    with st.chat_message("assistant"):
        def generate_chunks():
            response_stream = client.models.generate_content_stream(
                model="gemini-2.5-flash",
                contents=prompt
            )
            for chunk in response_stream:
                yield chunk.text

        full_response = st.write_stream(generate_chunks())
        st.session_state.messages.append({"role": "assistant", "content": full_response})`
    },
    {
      id: 'multimodal',
      title: '3. Multimodal Image & Document Inspection',
      desc: 'Handle file uploads with st.file_uploader and pass bytes directly to Gemini.',
      code: `import streamlit as st
from google import genai
from google.genai import types
from PIL import Image

uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "png", "webp"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption="Preview", use_container_width=True)
    
    if st.button("Inspect with Gemini"):
        with st.spinner("Analyzing..."):
            image_bytes = uploaded_file.getvalue()
            part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=uploaded_file.type
            )
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[part, "Transcribe all text and identify objects in this image."]
            )
            st.markdown(response.text)`
    },
    {
      id: 'structured-json',
      title: '4. Structured JSON Output & Pydantic Validation',
      desc: 'Enforce strict schema compliance for downstream automation, data extraction, and API building.',
      code: `import streamlit as st
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

class Recipe(BaseModel):
    title: str = Field(description="Recipe name")
    servings: int = Field(description="Number of portions")
    ingredients: List[str] = Field(description="List of ingredients with quantities")
    cook_time_minutes: int = Field(description="Cooking time in minutes")

# Generate structured JSON
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Generate a healthy Mediterranean breakfast recipe.",
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=Recipe
    )
)

st.json(response.text)`
    },
    {
      id: 'function-calling',
      title: '5. Autonomous Function Calling & Tools',
      desc: 'Register custom Python functions that Gemini can invoke autonomously to query databases or APIs.',
      code: `import streamlit as st
from google import genai
from google.genai import types

# 1. Define Tool Declaration
weather_tool = types.FunctionDeclaration(
    name="get_current_weather",
    description="Get current temperature and forecast for a given city.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "city": {"type": "STRING", "description": "City name, e.g. Tokyo, Paris"}
        },
        "required": ["city"]
    }
)

# 2. Invoke Gemini with Registered Tools
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="What should I wear in Tokyo today?",
    config=types.GenerateContentConfig(
        tools=[types.Tool(function_declarations=[weather_tool])],
        temperature=0.2
    )
)

# 3. Check for Function Calls
if response.function_calls:
    for call in response.function_calls:
        st.info(f"Tool invoked: {call.name}")
        st.json(call.args)`
    },
    {
      id: 'deployment',
      title: '6. Deployment on Cloud Run & Streamlit Cloud',
      desc: 'Standard Dockerfile and setup for containerized production deployments.',
      code: `# Dockerfile for Streamlit + Gemini App
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501

ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]`
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-3 text-red-400 font-mono text-xs uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Developer Cheatsheet & Best Practices</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Building Gen AI Apps with Google Gemini & Streamlit
        </h1>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Comprehensive guide for architecting high-performance, production-ready Gen AI web applications with Python, the official <code className="text-red-400 font-mono">google-genai</code> SDK, and Streamlit components.
        </p>
      </div>

      {/* Code Snippet Sections */}
      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {sec.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{sec.desc}</p>
              </div>

              <button
                id={`btn-copy-snippet-${sec.id}`}
                onClick={() => handleCopy(sec.id, sec.code)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 self-start sm:self-auto transition-colors"
              >
                {copiedId === sec.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
              <code>{sec.code}</code>
            </pre>
          </div>
        ))}
      </div>

    </div>
  );
};
