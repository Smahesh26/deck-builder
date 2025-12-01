import { GoogleGenerativeAI } from "@google/generative-ai";

// Type declaration for import.meta.env
declare global {
  interface ImportMetaEnv {
    VITE_GEMINI_API_KEY?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}


// Use NEXT_PUBLIC_ prefix for Next.js frontend env vars
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in environment variables");
}

export const geminiApiKey = GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function geminiAnalyzeWebsite({ html, url, image }: { html?: string; url?: string; image?: string }) {
  // Improved prompt for Gemini
  let prompt = `Extract all available brand and product information from the following website HTML.\n\nReturn a JSON object with these keys:\n- title: Brand/company name\n- fonts: Array of font names used\n- colors: Array of color hex codes used\n- logo: Logo description or image URL\n- description: Short brand description\n- productImages: Array of product image URLs (if any)\n\nIf any field is missing, return an empty array or empty string for that field. Only return valid JSON.`;

  let input = html || url || "";
  let model = genAI.getGenerativeModel({ model: "gemini-pro" });

  let contents: Array<{
    role: string;
    parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    >;
  }> = [
    { role: "user", parts: [ { text: prompt + "\n\n" + input } ] }
  ];

  // If image is provided, add it as a part
  if (image) {
    contents[0].parts.push({ inlineData: { mimeType: "image/png", data: image } });
  }

  try {
    const result = await model.generateContent({ contents });
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      // Try to parse JSON from Gemini's response
      const json = JSON.parse(text);
      return json;
    } catch {
      // Fallback: return raw text with a parsing error message
      return { raw: text, error: "Failed to parse JSON from Gemini response" };
    }
  } catch (err: any) {
    // Handle and return Gemini API errors
    return { error: err?.message || "Gemini API error" };
  }
}
