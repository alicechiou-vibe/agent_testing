import { GoogleGenAI } from "@google/genai";
import { ReportType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

interface GenerateReportResult {
  content: string;
  urls: Array<{ title: string; url: string }>;
}

export const generateMarketReport = async (type: ReportType): Promise<GenerateReportResult> => {
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
      
      1. **Today's Market Drivers**: Search for major news, economic data, or Fed speeches that happened *today*.
      2. **Sentiment Analysis**: Analyze the general market sentiment of the current trading session.
      3. **Outlook**: Provide a brief prediction for the close or next day open.
      
      Output Language: Traditional Chinese (繁體中文).
      Format: Use Markdown. Keep it concise, readable on mobile.
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
        responseMimeType: "text/plain",
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

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate market report. Please check API configuration.");
  }
};