import { GoogleGenAI } from "@google/genai";
import { ReportType } from '../types';

// Check for API key immediately
const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("CRITICAL: process.env.API_KEY is missing or empty.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_to_prevent_init_crash' });

// Switched to Flash model to prevent 429 Resource Exhausted errors and improve speed
const MODEL_NAME = 'gemini-3-flash-preview';

interface GenerateReportResult {
  content: string;
  urls: Array<{ title: string; url: string }>;
}

export const generateMarketReport = async (type: ReportType): Promise<GenerateReportResult> => {
  if (!apiKey) {
    throw new Error("API Key 未設定。請確認 GitHub Repository Secrets 中的 API_KEY 是否正確。");
  }

  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US');

  let prompt = "";
  
  if (type === ReportType.EVENING) {
    // 晚上：重點是「今天」發生的事
    prompt = `
      Current Date and Time: ${dateString}, ${timeString}.
      Role: Senior Financial Analyst for a Chinese audience.
      Task: Provide a "US Market Evening Briefing" (美股晚報).
      
      1. **Today's Major News**: Identify the most significant news, economic data, or earnings released *today* that are driving the market.
      2. **Market Sentiment & Trend**: Analyze the current market mood (Bullish/Bearish/Neutral) and the estimated trend for the close.
      3. **Outlook**: Brief prediction for the next session.
      
      Output Language: Traditional Chinese (繁體中文).
      Format: Use Markdown. Keep it concise, professional, and readable on mobile.
    `;
  } else {
    // 早上：重點是「昨天」收盤的表現 (Mag 7)
    prompt = `
      Current Date and Time: ${dateString}, ${timeString}.
      Role: Senior Financial Analyst for a Chinese audience.
      Task: Provide a "Morning Magnificent 7 Review" (美股早報 - 七巨頭分析).
      
      1. **Mag 7 Performance**: Search for the *most recent closing prices* (likely yesterday's close) for: Apple (AAPL), Microsoft (MSFT), Alphabet (GOOGL), Amazon (AMZN), NVIDIA (NVDA), Meta (META), and Tesla (TSLA).
      2. **Data Table**: Create a clean Markdown table with columns: Stock, Price, Change %.
      3. **Key Movers**: Briefly explain the biggest mover's reason (news, earnings, etc.).
      
      Output Language: Traditional Chinese (繁體中文).
      Format: Use Markdown. Keep it concise, readable on mobile.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "text/plain", // Removed to let model decide best format with grounding
      },
    });

    const content = response.text || "No content generated.";
    
    // Extract grounding chunks if available
    const urls: Array<{ title: string; url: string }> = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          urls.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri
          });
        }
      });
    }

    return { content, urls };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a more user-friendly error message if possible
    const errorMessage = error.message || "Unknown error";
    if (errorMessage.includes("429") || errorMessage.includes("Quota")) {
        throw new Error("系統繁忙 (429)，請稍後再試。");
    }
    if (errorMessage.includes("API key")) {
        throw new Error("API Key 無效或過期。");
    }
    throw new Error(`生成報告失敗: ${errorMessage}`);
  }
};
