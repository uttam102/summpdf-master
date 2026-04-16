import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const baseURL = "https://api.sree.shop/v1";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env?.GEMINI_API_KEY || "");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

/**
 * Emergency local summarizer for when ALL AI services are rate-limited.
 */
function emergencyLocalSummarize(text: string): string {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 20);
  const keySentences = sentences.slice(0, 8); // Top 8 sentences for a quick summary
  return (
    "[EMERGENCY SUMMARY - AI BUSY]\n" +
    keySentences.join(". ") +
    "." +
    "\n\nNote: The AI service is currently at maximum capacity. This is an extractive summary of the key points."
  );
}

export async function generateSummaryFromAI(pdfText: string) {
  if (!pdfText || pdfText.trim().length === 0) {
    throw new Error("PDF_TEXT_EMPTY");
  }

  const maxRetries = 3;
  let lastError: any;

  // 1. Try Gemini Models first
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash"];

  for (const modelName of modelsToTry) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Trying ${modelName} (Attempt ${i + 1})...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction:
            "Summarize the text as Michael Scott from The Office. Be fun, use 'that's what she said', but stay accurate.",
        });

        const result = await model.generateContent(pdfText.substring(0, 25000));
        const resText = result.response.text();
        if (resText) return resText;
      } catch (error: any) {
        lastError = error;
        if (error?.status === 429) {
          await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
          continue;
        }
        break;
      }
    }
  }

  // 2. Fallback to OpenAI if Gemini fails
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("Gemini limit reached. Falling back to OpenAI...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Summarize as Michael Scott from The Office.",
          },
          { role: "user", content: pdfText.substring(0, 15000) },
        ],
      });
      return completion.choices[0].message.content || "";
    } catch (error) {
      console.error("OpenAI Fallback failed:", error);
    }
  }

  // 3. Last Resort: Local Summarization
  console.warn("All AI services exhausted. Using local emergency summarizer.");
  return emergencyLocalSummarize(pdfText);
}
