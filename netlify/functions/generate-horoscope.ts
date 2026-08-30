import { Handler } from '@netlify/functions';
import { GoogleGenAI, Type } from '@google/genai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'GEMINI_API_KEY is not set in Netlify environment variables.'
        }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const body = event.body ? JSON.parse(event.body) : {};
    const { signId } = body;

    const systemInstruction = `You are an expert Vedic Astrologer (ज्योतिषाचार्य) for "Varta X Jyotish Sansthan" (वार्ता एक्स ज्योतिष संस्थान).
Your task is to generate an authentic, inspiring, and detailed daily horoscope prediction in Hindi for the requested zodiac sign (or all 12 signs).
Include accurate prediction details, luck percentage (between 70 and 98), lucky number, lucky color in Hindi, career prediction, health prediction, love prediction, and a powerful Vedic remedy (महाउपाय).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Generate today's Vedic Horoscope prediction in Hindi for zodiac sign ID: "${signId || 'all'}". Current date is ${new Date().toLocaleDateString('hi-IN')}.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            luckPercentage: { type: Type.NUMBER, description: "Luck percentage (70-98)" },
            luckyNumber: { type: Type.NUMBER, description: "Lucky number for today" },
            luckyColor: { type: Type.STRING, description: "Lucky color name in Hindi" },
            generalPrediction: { type: Type.STRING, description: "General daily prediction in Hindi" },
            careerPrediction: { type: Type.STRING, description: "Career & business prediction in Hindi" },
            healthPrediction: { type: Type.STRING, description: "Health & wellness prediction in Hindi" },
            lovePrediction: { type: Type.STRING, description: "Love & family prediction in Hindi" },
            remedy: { type: Type.STRING, description: "Today's Vedic remedy (महाउपाय) in Hindi" }
          },
          required: ["luckPercentage", "luckyNumber", "luckyColor", "generalPrediction", "careerPrediction", "healthPrediction", "lovePrediction", "remedy"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(textOutput.trim());
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, horoscope: data }),
    };

  } catch (error: any) {
    console.error("Netlify AI Horoscope Generation Error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate horoscope." 
      }),
    };
  }
};
