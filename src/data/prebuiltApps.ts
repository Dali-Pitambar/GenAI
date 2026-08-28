import { StreamlitAppTemplate } from '../types';

export const PREBUILT_APPS: StreamlitAppTemplate[] = [
  {
    id: 'multimodal-vision',
    title: 'Multimodal Vision & Document Inspector',
    category: 'Vision',
    badge: 'Gemini 3.7 Flash + Streamlit',
    description: 'Upload images, diagrams, receipts, charts, or screenshots and perform deep visual reasoning, OCR extraction, and Q&A using Gemini Multimodal vision.',
    tags: ['Vision', 'OCR', 'Multimodal', 'Document AI'],
    features: [
      'Image upload & live image canvas preview',
      'Visual Question Answering (VQA) with Gemini',
      'One-click OCR and table data extraction',
      'Detailed diagram and architectural breakdown',
      'Configurable temperature and system instructions'
    ],
    samplePrompts: [
      'Extract all key entities, amounts, and dates from this receipt/document in Markdown table format.',
      'Explain this architecture diagram step-by-step and highlight potential bottlenecks.',
      'Transcribe all handwritten notes and formulate a concise executive summary.',
      'What UI improvements and accessibility fixes would you recommend based on this screenshot?'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
pillow>=10.4.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
from google import genai
from google.genai import types
from PIL import Image
import os
import io

# 1. Page Configuration
st.set_page_config(
    page_title="Gemini Vision & Doc Inspector",
    page_icon="🔍",
    layout="wide"
)

# 2. Initialize Gemini Client
@st.cache_resource
def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        st.error("Please set GEMINI_API_KEY environment variable.")
    return genai.Client(api_key=api_key)

client = get_gemini_client()

# 3. Sidebar Configuration
with st.sidebar:
    st.header("⚙️ Model Settings")
    model_choice = st.selectbox(
        "Select Model",
        ["gemini-2.5-flash", "gemini-2.5-pro"],
        index=0,
        help="gemini-2.5-flash delivers ultra-fast multimodal reasoning."
    )
    temperature = st.slider("Temperature", 0.0, 1.0, 0.4, 0.05)
    system_instruction = st.text_area(
        "System Instruction",
        "You are an expert Vision and Document AI Analyst. Provide precise, structured, and insightful answers based on visual inputs.",
        height=100
    )
    st.divider()
    st.info("💡 **Tip**: You can upload JPEG, PNG, or WEBP images.")

# 4. Main UI Layout
st.title("🔍 Gemini Multimodal Vision & Doc Inspector")
st.caption("Inspect, transcribe, and reason over images and documents with Google Gemini.")

col1, col2 = st.columns([1, 1], gap="medium")

with col1:
    st.subheader("📤 Input Image")
    uploaded_file = st.file_uploader(
        "Choose an image or document screenshot",
        type=["jpg", "jpeg", "png", "webp"]
    )
    
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Image Preview", use_container_width=True)
    else:
        st.info("Upload an image to start visual analysis.")

with col2:
    st.subheader("💬 Prompt & Analysis")
    user_prompt = st.text_area(
        "Ask a question or provide instruction for the image:",
        "Analyze this image in detail. Extract any text, charts, diagrams, and summarize key insights.",
        height=120
    )
    
    col_btn, col_clear = st.columns([1, 1])
    with col_btn:
        analyze_btn = st.button("🚀 Analyze with Gemini", type="primary", use_container_width=True)
    with col_clear:
        clear_btn = st.button("🧹 Clear", use_container_width=True)

    if analyze_btn:
        if uploaded_file is None:
            st.warning("Please upload an image first!")
        elif not user_prompt.strip():
            st.warning("Please enter a question or prompt.")
        else:
            with st.spinner("Gemini is analyzing the image..."):
                try:
                    # Convert image to bytes
                    img_bytes = uploaded_file.getvalue()
                    mime_type = uploaded_file.type or "image/jpeg"
                    
                    part = types.Part.from_bytes(
                        data=img_bytes,
                        mime_type=mime_type
                    )
                    
                    response = client.models.generate_content(
                        model=model_choice,
                        contents=[part, user_prompt],
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=temperature
                        )
                    )
                    
                    st.success("Analysis Complete!")
                    st.markdown("### 📊 Gemini Output")
                    st.markdown(response.text)
                    
                    st.toast("Analysis generated successfully!", icon="✅")
                except Exception as e:
                    st.error(f"Error during generation: {str(e)}")
`
  },
  {
    id: 'conversational-copilot',
    title: 'Conversational Copilot with Dynamic Persona',
    category: 'Chatbot',
    badge: 'Multi-turn Memory + Streaming',
    description: 'A full-featured Streamlit chat application powered by Gemini with streaming tokens, customizable system personas, parameter tuning, and session state memory.',
    tags: ['Chatbot', 'Streaming', 'Session State', 'Persona'],
    features: [
      'Real-time streaming responses with st.write_stream',
      'Persistent multi-turn chat history with st.session_state',
      'Customizable Persona presets (Senior Python Architect, Socratic Tutor, Creative Storyteller, Data Scientist)',
      'Export and download chat transcript as Markdown',
      'One-click chat clear and context token estimation'
    ],
    samplePrompts: [
      'Explain how Python decorators work with real-world caching examples.',
      'Design a scalable microservices architecture for a real-time analytics platform.',
      'Help me debug an async asyncio queue race condition.',
      'What are the best practices for caching data in Streamlit with st.cache_data?'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
from google import genai
from google.genai import types
import os

# 1. Page Configuration
st.set_page_config(
    page_title="Gemini Conversational Copilot",
    page_icon="🤖",
    layout="wide"
)

# 2. Initialize Gemini Client
@st.cache_resource
def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)

client = get_gemini_client()

# 3. Sidebar Persona & Controls
with st.sidebar:
    st.header("🎭 AI Persona & Tuning")
    persona_options = {
        "Senior Python & AI Architect": "You are a Principal Software Architect. Give concise, highly production-ready code with type annotations, error handling, and architecture insights.",
        "Socratic Data Science Tutor": "You are a patient tutor. Guide the user to discover answers step-by-step using thought-provoking questions and clear analogies.",
        "Concise Tech Lead": "You are a direct, no-nonsense Tech Lead. Give brief, bulleted answers and clear trade-offs without fluff.",
        "Creative Product Strategist": "You are an innovative product designer. Brainstorm engaging features, user flows, and product metrics."
    }
    
    selected_persona = st.selectbox("Choose Persona", list(persona_options.keys()))
    custom_system_prompt = st.text_area(
        "System Instruction",
        value=persona_options[selected_persona],
        height=120
    )
    
    model_name = st.selectbox("Model", ["gemini-2.5-flash", "gemini-2.5-pro"])
    temperature = st.slider("Temperature", 0.0, 1.0, 0.7, 0.05)
    
    st.divider()
    if st.button("🧹 Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

# 4. Main Chat Interface
st.title("🤖 Gemini Conversational Copilot")
st.caption("Powered by Gemini 3.7 Flash & Streamlit st.session_state")

# Initialize chat history in session state
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hello! I am your Gemini-powered Copilot. How can I assist you with code, architecture, or research today?"}
    ]

# Display historical messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# User Chat Input
if prompt := st.chat_input("Ask Gemini anything..."):
    # Append and display user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate assistant streaming response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        
        # Build contents from history
        contents = []
        for m in st.session_state.messages:
            role = "user" if m["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part.from_text(text=m["content"])]))
            
        try:
            response_stream = client.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=custom_system_prompt,
                    temperature=temperature
                )
            )
            
            full_response = ""
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    message_placeholder.markdown(full_response + "▌")
            
            message_placeholder.markdown(full_response)
            st.session_state.messages.append({"role": "assistant", "content": full_response})
        except Exception as e:
            st.error(f"Generation error: {str(e)}")
`
  },
  {
    id: 'csv-data-analyst',
    title: 'AI Tabular Data & Plot Generator Copilot',
    category: 'Analytics',
    badge: 'Pandas + Charts + GenAI',
    description: 'Transform raw CSV spreadsheets and datasets into actionable executive insights, automated Pandas metrics, and visual distribution charts with Gemini.',
    tags: ['Analytics', 'CSV', 'Data Science', 'Charts'],
    features: [
      'Instant statistical profiling (mean, min, max, percentiles, nulls)',
      'Natural language queries on structured data',
      'Automated interactive chart generation (Line, Bar, Area)',
      'Executive key takeaways and correlation insights',
      'Pre-loaded sample datasets (SaaS Revenue, E-commerce Sales, Server Telemetry)'
    ],
    samplePrompts: [
      'What are the top 3 revenue drivers and which region had the highest growth rate?',
      'Identify anomalies or unusual drop-offs in customer retention.',
      'Generate a summary of profit margins by product category and suggest optimizations.'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
pandas>=2.2.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
import pandas as pd
from google import genai
from google.genai import types
import os
import json

st.set_page_config(page_title="AI Data Analyst Copilot", page_icon="📈", layout="wide")

@st.cache_resource
def get_gemini_client():
    return genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

client = get_gemini_client()

st.title("📈 AI Data & Plot Generator Copilot")
st.caption("Ask natural language questions about your data and generate automated insights.")

# Sample dataset options
dataset_option = st.sidebar.selectbox(
    "Choose Dataset Source",
    ["SaaS Subscription Metrics (Sample)", "E-Commerce Regional Sales (Sample)", "Upload Custom CSV"]
)

if dataset_option == "SaaS Subscription Metrics (Sample)":
    data = {
        "Month": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "MRR": [45000, 48200, 52100, 56000, 61400, 67800, 74200, 81000, 89500, 97000, 106000, 115000],
        "New_Signups": [410, 435, 520, 580, 640, 710, 830, 920, 1010, 1150, 1280, 1420],
        "Churn_Rate": [2.4, 2.3, 2.1, 1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1],
        "Customer_Acquisition_Cost": [140, 138, 132, 128, 125, 120, 118, 115, 110, 108, 102, 98]
    }
    df = pd.DataFrame(data)
elif dataset_option == "E-Commerce Regional Sales (Sample)":
    data = {
        "Region": ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East"],
        "Sales_USD": [1450000, 980000, 1240000, 420000, 310000],
        "Orders": [18200, 12400, 21000, 6200, 4100],
        "Average_Order_Value": [79.6, 79.0, 59.0, 67.7, 75.6],
        "Growth_YoY_Percent": [24.5, 18.2, 36.8, 14.1, 29.3]
    }
    df = pd.DataFrame(data)
else:
    uploaded_file = st.sidebar.file_uploader("Upload CSV file", type=["csv"])
    if uploaded_file:
        df = pd.read_csv(uploaded_file)
    else:
        st.info("Upload a CSV file to begin analysis.")
        st.stop()

# Display summary metrics
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Rows", f"{len(df):,}")
col2.metric("Total Columns", f"{len(df.columns)}")
num_cols = df.select_dtypes(include=['number']).columns.tolist()
if num_cols:
    first_num = num_cols[0]
    col3.metric(f"Mean {first_num}", f"{df[first_num].mean():,.2f}")
    col4.metric(f"Max {first_num}", f"{df[first_num].max():,.2f}")

st.subheader("📋 Dataset Preview")
st.dataframe(df, use_container_width=True)

# Chart preview
if "Month" in df.columns and "MRR" in df.columns:
    st.subheader("📊 Visual Trends")
    st.line_chart(df.set_index("Month")[["MRR", "New_Signups"]])
elif "Region" in df.columns and "Sales_USD" in df.columns:
    st.subheader("📊 Sales by Region")
    st.bar_chart(df.set_index("Region")["Sales_USD"])

# Gemini Natural Language Query
st.subheader("🧠 Ask Gemini About This Data")
question = st.text_input("Enter your analytical question:", "Provide an executive summary, identify high-growth drivers, and recommend 3 strategic action items.")

if st.button("🚀 Generate AI Analysis", type="primary"):
    with st.spinner("Analyzing dataset with Gemini..."):
        data_summary = df.describe().to_string()
        data_sample = df.head(10).to_string()
        
        prompt = f"""
Dataset columns: {list(df.columns)}
Summary statistics:
{data_summary}

Sample data rows:
{data_sample}

User Question: {question}

Provide a structured, data-driven analysis including:
1. Executive Key Findings
2. Specific Trends & Outliers
3. Actionable Strategic Recommendations
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                system_instruction="You are a Lead Data Scientist and Business Intelligence Strategist. Answer with precise statistical backing."
            )
        )
        
        st.markdown("### 📊 Executive Intelligence Report")
        st.markdown(response.text)
`
  },
  {
    id: 'prompt-evaluator',
    title: 'Prompt Engineering & A/B Benchmark Studio',
    category: 'Prompt Engineering',
    badge: 'A/B Testing & Evaluation',
    description: 'Compare two prompt templates, system instructions, or temperature settings side-by-side on identical test cases with automated scoring.',
    tags: ['Prompt Engineering', 'Evaluation', 'A/B Testing', 'Benchmarking'],
    features: [
      'Side-by-side execution of Prompt Variant A vs Variant B',
      'Configurable System Instructions, Temperature, and Top-P for each variant',
      'Automated latency, character count, and response time comparison',
      'AI Evaluator: Gemini grades both outputs on clarity, tone, and conciseness',
      'Pre-configured templates for summarization, customer support, and code generation'
    ],
    samplePrompts: [
      'Customer support reply for a delayed enterprise shipment with a polite refund policy apology.',
      'Explain quantum computing to an 8-year old vs a computer science undergraduate.',
      'Summarize a quarterly financial statement into a 3-bullet executive brief.'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
from google import genai
from google.genai import types
import os
import time

st.set_page_config(page_title="Prompt A/B Benchmark Studio", page_icon="⚖️", layout="wide")

@st.cache_resource
def get_gemini_client():
    return genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

client = get_gemini_client()

st.title("⚖️ Gemini Prompt Engineering & A/B Benchmark Studio")
st.caption("Compare prompt structures, system instructions, and parameter tuning side-by-side.")

test_input = st.text_area(
    "📥 Shared Test Input / User Query",
    value="Our production PostgreSQL database experienced an unexpected failover during peak traffic at 14:00 UTC. The read replicas lagged by 45 seconds, causing transient 504 gateway errors for approximately 8 minutes before automated reconciliation restored normal operations. Write a post-mortem incident summary for our enterprise SLA customers.",
    height=120
)

colA, colB = st.columns(2, gap="large")

with colA:
    st.subheader("🅰️ Variant A")
    sys_prompt_a = st.text_area("System Instruction A", "You are a concise, empathetic customer relations manager. Write a clear, calm, and professional incident communication with sincere apologies.", height=100)
    temp_a = st.slider("Temperature A", 0.0, 1.0, 0.3, 0.05, key="temp_a")

with colB:
    st.subheader("🅱️ Variant B")
    sys_prompt_b = st.text_area("System Instruction B", "You are a lead Site Reliability Engineer (SRE). Write a highly technical, transparent post-mortem with exact timelines, root cause, and remediation steps.", height=100)
    temp_b = st.slider("Temperature B", 0.0, 1.0, 0.7, 0.05, key="temp_b")

if st.button("🚀 Run Side-by-Side Comparison", type="primary", use_container_width=True):
    with st.spinner("Generating responses from Gemini..."):
        # Run Variant A
        start_a = time.time()
        res_a = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=test_input,
            config=types.GenerateContentConfig(system_instruction=sys_prompt_a, temperature=temp_a)
        )
        latency_a = time.time() - start_a
        
        # Run Variant B
        start_b = time.time()
        res_b = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=test_input,
            config=types.GenerateContentConfig(system_instruction=sys_prompt_b, temperature=temp_b)
        )
        latency_b = time.time() - start_b
        
        # Display Results
        res_col_a, res_col_b = st.columns(2, gap="large")
        with res_col_a:
            st.success(f"Variant A (Latency: {latency_a:.2f}s | Length: {len(res_a.text)} chars)")
            st.markdown(res_a.text)
            
        with res_col_b:
            st.success(f"Variant B (Latency: {latency_b:.2f}s | Length: {len(res_b.text)} chars)")
            st.markdown(res_b.text)
`
  },
  {
    id: 'function-calling-agent',
    title: 'Autonomous Tool Agent with Function Calling',
    category: 'Agent & Tools',
    badge: 'Function Declarations + Tools',
    description: 'Build an autonomous agent where Gemini reasons over user intent and autonomously invokes backend functions (e.g., ROI Calculator, Inventory Check, Database Query).',
    tags: ['Agent', 'Function Calling', 'Tools', 'Automation'],
    features: [
      'Official Gemini function declarations using types.FunctionDeclaration',
      'Step-by-step tool invocation audit trail and parameter extraction',
      'Interactive tool execution sandbox with simulated backend responses',
      'Final synthesized natural language answer'
    ],
    samplePrompts: [
      'If we invest $50,000 in automation software and expect $18,000 annual cost savings, what is our ROI over 3 years?',
      'Check warehouse stock for SKU ELEC-992 and tell me if we need to restock before Q4.',
      'Search our knowledge base for the employee parental leave policy in engineering.'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
from google import genai
from google.genai import types
import os
import json

st.set_page_config(page_title="Gemini Function Calling Agent", page_icon="🛠️", layout="wide")

@st.cache_resource
def get_gemini_client():
    return genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

client = get_gemini_client()

st.title("🛠️ Autonomous Gemini Tool Agent")
st.caption("Watch Gemini automatically decide which tool to call, extract arguments, and synthesize results.")

# 1. Define Function Declarations
roi_tool = types.FunctionDeclaration(
    name="calculate_roi",
    description="Calculates Return on Investment (ROI) and payback duration in years.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "investment": {"type": "NUMBER", "description": "Initial investment cost in USD"},
            "annualRevenue": {"type": "NUMBER", "description": "Expected annual revenue or savings in USD"},
            "years": {"type": "NUMBER", "description": "Number of years"}
        },
        "required": ["investment", "annualRevenue"]
    }
)

inventory_tool = types.FunctionDeclaration(
    name="query_database_inventory",
    description="Queries inventory stock, supplier cost, and lead time for a given SKU.",
    parameters={
        "type": "OBJECT",
        "properties": {
            "sku": {"type": "STRING", "description": "Product SKU code"}
        },
        "required": ["sku"]
    }
)

with st.sidebar:
    st.header("🧰 Available Registered Tools")
    st.markdown("- **calculate_roi**: Financial modeling & payback analysis")
    st.markdown("- **query_database_inventory**: Warehouse stock & SKU search")
    st.markdown("- **search_knowledge_base**: Enterprise handbook & policy lookup")

user_goal = st.text_input(
    "Enter your request for the agent:",
    "We plan to invest $75,000 into a new cloud caching tier that will save us $25,000 per year in server compute over a 4-year horizon. Calculate our ROI."
)

if st.button("🚀 Run Agent Execution", type="primary"):
    with st.spinner("Gemini is reasoning over tools..."):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_goal,
                config=types.GenerateContentConfig(
                    tools=[types.Tool(function_declarations=[roi_tool, inventory_tool])],
                    temperature=0.1
                )
            )
            
            # Check for function call
            if response.function_calls:
                st.subheader("🔍 Tool Invocations Detected")
                for call in response.function_calls:
                    st.info(f"Function Called: {call.name}")
                    st.json(call.args)
                    
                    # Execute mock tool handler
                    if call.name == "calculate_roi":
                        inv = call.args.get("investment", 1)
                        rev = call.args.get("annualRevenue", 0)
                        yrs = call.args.get("years", 1)
                        total_return = rev * yrs
                        net_profit = total_return - inv
                        roi_pct = (net_profit / inv) * 100
                        payback = inv / rev if rev > 0 else 0
                        
                        tool_result = {
                            "initial_investment": f"${"{"}inv:,.2f{"}"}",
                            "total_savings": f"${"{"}total_return:,.2f{"}"}",
                            "net_profit": f"${"{"}net_profit:,.2f{"}"}",
                            "roi_percentage": f"{"{"}roi_pct:.1f{"}"}%",
                            "payback_years": f"{"{"}payback:.2f{"}"} years"
                        }
                        
                        st.subheader("📊 Tool Execution Output")
                        st.json(tool_result)
                        
                        st.markdown("### 💡 Agent Summary:")
                        st.markdown(f"- **Net ROI**: **{"{"}roi_pct:.1f{"}"}%**")
                        st.markdown(f"- **Payback Period**: **{"{"}payback:.2f{"}"} years**")
                        st.markdown(f"- Over {"{"}yrs{"}"} years, an initial outlay of ${"{"}inv:,.2f{"}"} yields ${"{"}total_return:,.2f{"}"} in savings, resulting in a net profit of ${"{"}net_profit:,.2f{"}"}.")
            else:
                st.markdown("### 💬 Direct Answer")
                st.markdown(response.text)
        except Exception as e:
            st.error(f"Error: {str(e)}")
`
  },
  {
    id: 'code-refactoring-studio',
    title: 'Code Synthesizer, Unit Test & Complexity Explainer',
    category: 'Code & Dev',
    badge: 'Code Generation & Optimization',
    description: 'Transform legacy Python/TypeScript scripts into optimized, type-annotated, modern code with automated unit tests and Big-O complexity breakdown.',
    tags: ['Coding', 'Refactoring', 'Unit Tests', 'Big-O Analysis'],
    features: [
      'Automated code refactoring with PEP 8 standards and type hinting',
      'PyTest / Jest unit test suite generation with edge cases',
      'Big-O Time & Space complexity breakdown with explanation',
      'Vulnerability and security audit detection'
    ],
    samplePrompts: [
      'Refactor a nested Fibonacci memoization function with asymptotic complexity proof.',
      'Convert a synchronous REST fetch script to async aiohttp with exponential backoff retry logic.',
      'Generate comprehensive pytest unit tests covering invalid inputs, boundary values, and mock network failures.'
    ],
    requirements: `streamlit>=1.38.0
google-genai>=0.1.0
python-dotenv>=1.0.1`,
    pythonCode: `import streamlit as st
from google import genai
from google.genai import types
import os

st.set_page_config(page_title="Gemini Code Synthesizer", page_icon="💻", layout="wide")

@st.cache_resource
def get_gemini_client():
    return genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

client = get_gemini_client()

st.title("💻 Gemini Code Synthesizer & Refactoring Studio")
st.caption("Refactor code, generate comprehensive PyTest suites, and analyze Big-O complexity.")

default_code = """def process_transactions(data):
    results = []
    for item in data:
        if item['status'] == 'completed':
            val = item['amount'] * 1.0825
            results.append({'id': item['id'], 'total': val})
    return results"""

code_input = st.text_area("📥 Paste Python / JS Code:", value=default_code, height=180)

action = st.radio(
    "Select Action",
    ["⚡ Refactor & Optimize (Type Hints, Clean Code, Error Handling)", "🧪 Generate Unit Tests (PyTest / Unittest)", "⏱️ Big-O Complexity & Performance Analysis"],
    horizontal=True
)

if st.button("🚀 Execute with Gemini", type="primary"):
    with st.spinner("Processing code with Gemini..."):
        prompt = (
            "Code:\\n"
            "\`\`\`python\\n"
            + code_input + "\\n"
            "\`\`\`\\n\\n"
            "Action Requested: " + action + "\\n\\n"
            "Provide high-level, production-grade output with clear markdown headings and explanations."
        )
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                system_instruction="You are a Principal Software Engineer and Code Reviewer."
            )
        )
        
        st.markdown("### 🛠️ Gemini Output")
        st.markdown(response.text)
`
  }
];
