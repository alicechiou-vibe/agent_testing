import { GoogleGenAI } from "@google/genai";
import { ReportType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

interface GenerateReportResult {
  content: string;
  urls: Array<{ title: string; url: string }>;
}

export const generateMarketReport = async (type: ReportType): Promise<GenerateReportResult> => {
  let prompt = "";
  
  if (type === ReportType.EVENING) {
    prompt = `
      Act as a senior financial analyst.
      1. Search for today's major US stock market news, key economic indicators released today, and geopolitical events affecting the market.
      2. Analyze the current market sentiment based on today's trading session and after-hours movement.
      3. Provide a prediction/estimation for the market trend (Bullish, Bearish, or Neutral) for the next trading session.
      4. Format the output as a clear, professional email briefing.
      5. Use Markdown for formatting.
    `;
  } else {
    prompt = `
      Act as a senior financial analyst.
      1. Search for the most recent closing performance of the "Magnificent Seven" US stocks: Apple (AAPL), Microsoft (MSFT), Alphabet (GOOGL), Amazon (AMZN), NVIDIA (NVDA), Meta (META), and Tesla (TSLA).
      2. Create a summary table showing their closing price and percentage change.
      3. Provide a brief analysis of why they moved (earnings, news, sector rotation) based on recent search results.
      4. Format the output as a clear, professional email briefing.
      5. Use Markdown for formatting.
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
    
    // Safe access to grounding metadata
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