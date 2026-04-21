import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function summarizeMarkdown(content: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following markdown content into 3 concise bullet points:\n\n${content}`,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Could not generate summary.";
  }
}
