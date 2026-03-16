import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEYS = process.env.GEMINI_API_KEYS?.split(',') || [process.env.GEMINI_API_KEY || ''];

let currentKeyIndex = 0;

function getNextKey(): string {
  const key = API_KEYS[currentKeyIndex % API_KEYS.length];
  currentKeyIndex++;
  return key;
}

export function getGeminiModel(modelName = 'gemini-3.1-flash-lite-preview') {
  const genAI = new GoogleGenerativeAI(getNextKey());
  return genAI.getGenerativeModel({ model: modelName });
}
