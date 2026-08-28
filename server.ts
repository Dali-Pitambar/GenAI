import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Using empty fallback key if available.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Standard text / chat / completion generation
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const {
      prompt,
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      responseFormat = "text", // "text" | "json"
      model = "gemini-3.7-flash",
      history = [],
    } = req.body;

    if (!prompt && (!history || history.length === 0)) {
      return res.status(400).json({ error: "Prompt or conversation history is required" });
    }

    const ai = getAI();
    const config: any = {
      temperature: Number(temperature),
      topP: Number(topP),
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (responseFormat === "json") {
      config.responseMimeType = "application/json";
    }

    let contents: any;
    if (history && history.length > 0) {
      // Multi-turn chat format
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content || msg.text || "" }],
      }));

      if (prompt) {
        formattedHistory.push({
          role: "user",
          parts: [{ text: prompt }],
        });
      }
      contents = formattedHistory;
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-3.7-flash",
      contents,
      config,
    });

    const text = response.text || "";
    return res.json({ text, usage: response.usageMetadata });
  } catch (error: any) {
    console.error("Error in /api/gemini/generate:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate response from Gemini API",
    });
  }
});

// 2. Streaming text generation via SSE
app.post("/api/gemini/stream", async (req, res) => {
  try {
    const {
      prompt,
      systemInstruction,
      temperature = 0.7,
      topP = 0.95,
      model = "gemini-3.7-flash",
      history = [],
    } = req.body;

    if (!prompt && (!history || history.length === 0)) {
      return res.status(400).json({ error: "Prompt or conversation history is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getAI();
    const config: any = {
      temperature: Number(temperature),
      topP: Number(topP),
    };

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    let contents: any;
    if (history && history.length > 0) {
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content || msg.text || "" }],
      }));

      if (prompt) {
        formattedHistory.push({
          role: "user",
          parts: [{ text: prompt }],
        });
      }
      contents = formattedHistory;
    } else {
      contents = prompt;
    }

    const responseStream = await ai.models.generateContentStream({
      model: model || "gemini-3.7-flash",
      contents,
      config,
    });

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || "";
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Error in /api/gemini/stream:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || "Streaming failed" });
    }
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// 3. Vision & Multimodal generation
app.post("/api/gemini/vision", async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType = "image/jpeg", systemInstruction } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    const ai = getAI();
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: cleanBase64,
      },
    };
    const textPart = {
      text: prompt || "Analyze this image in detail and describe its key features, text, and insights.",
    };

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts: [imagePart, textPart] },
      config,
    });

    return res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Error in /api/gemini/vision:", error);
    return res.status(500).json({
      error: error.message || "Failed to analyze multimodal content",
    });
  }
});

// 4. Generate Streamlit + Gemini application code based on prompt
app.post("/api/gemini/generate-app", async (req, res) => {
  try {
    const { userPrompt, appCategory = "General" } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "userPrompt is required" });
    }

    const systemInstruction = `You are a world-class Principal Python & AI Engineer specializing in building modern, production-grade Generative AI web apps using Google Gemini and Streamlit.
When asked to build a Streamlit app, output high quality, modular, bug-free Python code using the official '@google/genai' SDK (Python: \`from google import genai\` and \`client = genai.Client()\`).

Rules for the Streamlit App:
1. Use standard Streamlit widgets: \`st.set_page_config\`, \`st.title\`, \`st.sidebar\`, \`st.columns\`, \`st.chat_message\`, \`st.chat_input\`, \`st.file_uploader\`, \`st.slider\`, \`st.selectbox\`, \`st.metric\`, \`st.tabs\`, \`st.expander\`, \`st.dataframe\`, \`st.spinner\`, \`st.toast\`.
2. Manage state cleanly with \`st.session_state\`.
3. Use the latest Google GenAI SDK syntax:
   \`\`\`python
   from google import genai
   from google.genai import types
   import os

   client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
   response = client.models.generate_content(
       model="gemini-2.5-flash" or "gemini-2.5-pro",
       contents="...",
   )
   \`\`\`
4. Structure the response in JSON format with:
   - "title": string (App title)
   - "description": string (App summary)
   - "category": string (e.g., Vision, Chatbot, Analytics, Agent, Productivity)
   - "code": string (Full runnable app.py code)
   - "requirements": string (requirements.txt content)
   - "features": array of strings (key capabilities)
   - "howToRun": string (CLI command and quick guide)`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Build a complete, elegant Streamlit Generative AI application with Gemini for the following idea: "${userPrompt}" in the category "${appCategory}". Return strictly valid JSON.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            code: { type: Type.STRING },
            requirements: { type: Type.STRING },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            howToRun: { type: Type.STRING },
          },
          required: ["title", "description", "category", "code", "requirements", "features"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-app:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate Streamlit application",
    });
  }
});

// 5. Function Calling / Agent simulation endpoint
app.post("/api/gemini/function-call", async (req, res) => {
  try {
    const { prompt, availableTools } = req.body;

    const ai = getAI();

    // Default mock tools for agent demo
    const functionDeclarations = [
      {
        name: "calculate_roi",
        description: "Calculates the Return on Investment (ROI) and payback period given initial investment, revenue, and timeline.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            investment: { type: Type.NUMBER, description: "Initial cost or investment in USD" },
            annualRevenue: { type: Type.NUMBER, description: "Expected annual revenue or savings in USD" },
            years: { type: Type.NUMBER, description: "Investment duration in years" },
          },
          required: ["investment", "annualRevenue"],
        },
      },
      {
        name: "query_database_inventory",
        description: "Queries warehouse inventory database for item stock, supplier price, and restocking date.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            sku: { type: Type.STRING, description: "Product SKU or item identifier" },
            category: { type: Type.STRING, description: "Item category (e.g. electronics, apparel)" },
          },
          required: ["sku"],
        },
      },
      {
        name: "search_knowledge_base",
        description: "Searches enterprise document repository for policies, technical specifications, and user manuals.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: "Search query string" },
            department: { type: Type.STRING, description: "Department filter (engineering, hr, finance, sales)" },
          },
          required: ["query"],
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        tools: [{ functionDeclarations }],
      },
    });

    const functionCalls = response.functionCalls || [];
    const text = response.text || "";

    return res.json({
      text,
      functionCalls,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/function-call:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute function calling request",
    });
  }
});

// Setup Vite middleware for development and static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gemini & Streamlit Studio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
