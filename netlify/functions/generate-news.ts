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
    const { prompt, category, isBreaking } = body;

    const systemInstruction = `You are an expert Hindi News editor and chief reporter for "Varta X News Media Live" (वार्ता एक्स न्यूज़ मीडिया).
Your goal is to write a highly compelling, authentic, professional and detailed news article in Hindi language.
The article should feel live, realistic, and contain multiple paragraphs (around 3-4 paragraphs) formatted nicely with markdown (such as bold accents, lists, or blockquotes).
Include localized feel from Uttar Pradesh, Jhansi, Mathura, Barsana, or National levels depending on the topic.
If the prompt is empty or vague, write a highly relevant news piece about local/national events or cultural/festive celebrations of Mathura/Barsana temple or Jhansi development.`;

    const contentsPrompt = prompt 
      ? `Generate a news post based on the following topic or draft headline: "${prompt}".
         Please ensure the category aligns well with the topic. User selected preferred category is: "${category || 'any'}" and isBreaking is: ${isBreaking ? 'true' : 'false'}.`
      : `Generate a completely fresh, highly engaging and realistic local news post about Jhansi, Mathura, Barsana, or Uttar Pradesh.
         It could be about a recent developmental milestone, tourist influx, cultural festival at Sri Radha Rani Temple, local development, or weather/infrastructure news.
         Category must be relevant, isBreaking can be randomly true or false.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contentsPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The compelling, attention-grabbing news headline/title in Hindi."
            },
            content: {
              type: Type.STRING,
              description: "The detailed news story text in Hindi. Must be 3-4 paragraphs, formatted beautifully with markdown paragraphs, quotes, or sub-bullets."
            },
            category: {
              type: Type.STRING,
              description: "The news category. Must be EXACTLY one of: 'Breaking', 'National', 'Local', 'Sports', 'Entertainment', 'Crime'."
            },
            isBreaking: {
              type: Type.BOOLEAN,
              description: "Whether this represents urgent or major breaking news."
            },
            authorName: {
              type: Type.STRING,
              description: "Creative Hindi name for the reporter. E.g. 'विशेष संवाददाता', 'अमित शर्मा', 'वार्ता एक्स ब्यूरो'."
            },
            authorRole: {
              type: Type.STRING,
              description: "Creative role for the reporter. E.g. 'वरिष्ठ पत्रकार', 'ग्राउंड ज़ीरो ब्यूरो'."
            },
            imageThemeKeyword: {
              type: Type.STRING,
              description: "A simple English keyword describing the visual theme of this news. E.g. 'temple', 'rain', 'festival', 'development', 'sports', 'national'."
            }
          },
          required: ["title", "content", "category", "isBreaking", "authorName", "authorRole", "imageThemeKeyword"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(textOutput.trim());

    // Map keywords to standard input assets:
    const themeKeyword = (data.imageThemeKeyword || "").toLowerCase();
    let selectedImage = "/input_file_3.png";
    if (themeKeyword.includes("temple") || themeKeyword.includes("mandir") || themeKeyword.includes("festival") || themeKeyword.includes("mela") || themeKeyword.includes("barsana")) {
      selectedImage = "/input_file_1.png";
    } else if (themeKeyword.includes("people") || themeKeyword.includes("crowd") || themeKeyword.includes("gathering") || themeKeyword.includes("social")) {
      selectedImage = "/input_file_0.png";
    } else if (themeKeyword.includes("report") || themeKeyword.includes("office") || themeKeyword.includes("newsroom") || themeKeyword.includes("desk")) {
      selectedImage = "/input_file_2.png";
    } else if (themeKeyword.includes("rain") || themeKeyword.includes("weather") || themeKeyword.includes("crime") || themeKeyword.includes("police")) {
      selectedImage = "/input_file_4.png";
    }

    const newsPost = {
      title: data.title,
      content: data.content,
      category: data.category,
      isBreaking: data.isBreaking !== undefined ? data.isBreaking : (isBreaking || false),
      authorName: data.authorName || "वार्ता एक्स एआई रिपोर्टर",
      authorRole: data.authorRole || "एआई न्यूज डेस्क",
      imageUrl: selectedImage,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, post: newsPost }),
    };
  } catch (error: any) {
    console.error("Netlify AI News Generation Error:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate news through AI." 
      }),
    };
  }
};
