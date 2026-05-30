import { toByteArray } from 'base64-js';

const HF_API_TOKEN = process.env.EXPO_PUBLIC_HF_API_TOKEN || '';

// Models
const ID_MODEL = 'Hemant_Kumar/plant-identification';
const DISEASE_MODEL = 'imadegunawan/plant-disease-detection-using-vit';
const CHAT_MODEL = 'HuggingFaceH4/zephyr-7b-beta';

export interface HFClassificationResult {
  label: string;
  score: number;
}

async function query(model: string, imageBase64: string): Promise<HFClassificationResult[]> {
  try {
    // Clean base64 string and convert to Uint8Array
    const base64Clean = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/\s/g, '');
    const binaryBody = toByteArray(base64Clean);
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: { 
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/octet-stream'
        },
        method: 'POST',
        body: binaryBody as any,
      }
    );

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error('AI Model is booting up. Please try again in 30 seconds.');
      }
      const errorData = await response.json();
      throw new Error(errorData.error || 'Hugging Face API request failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`HF Inference Error (${model}):`, error);
    throw error;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function chatText(messages: ChatMessage[]): Promise<string> {
  try {
    // Format messages into Zephyr's expected prompt format
    let prompt = '';
    for (const msg of messages) {
      prompt += `<|${msg.role}|>\n${msg.content}</s>\n`;
    }
    prompt += `<|assistant|>\n`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${CHAT_MODEL}`,
      {
        headers: { 
          Authorization: `Bearer ${HF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ 
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            return_full_text: false,
            temperature: 0.7,
            top_p: 0.95
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Hugging Face Chat request failed');
    }

    const result = await response.json();
    // Hugging Face text generation returns an array with generated_text
    let generatedText = '';
    if (Array.isArray(result) && result.length > 0) {
      generatedText = result[0].generated_text;
    } else if (result.generated_text) {
      generatedText = result.generated_text;
    }
    
    return generatedText.trim();
  } catch (error) {
    console.error(`HF Chat Error:`, error);
    throw error;
  }
}

export const hfInference = {
  identifyPlant: (imageBase64: string) => query(ID_MODEL, imageBase64),
  detectDisease: (imageBase64: string) => query(DISEASE_MODEL, imageBase64),
  chat: (messages: ChatMessage[]) => chatText(messages),
};

