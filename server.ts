import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. API Route: AI News Generator Endpoint
app.post("/api/ai/generate-news", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API Key missing on server. Please configure GEMINI_API_KEY in the Settings > Secrets panel."
      });
    }

    const { prompt, category, isBreaking } = req.body;

    const systemInstruction = `You are an expert Hindi News editor and chief reporter for "Varta X News Media Live" (वार्ता एक्स न्यूज़ मीडिया).
Your goal is to write a highly compelling, authentic, professional and detailed news article in Hindi language.
The article should feel live, realistic, and contain multiple paragraphs (around 3-4 paragraphs) formatted nicely with markdown (such as bold accents, lists, or blockquotes).
Include localized feel from Uttar Pradesh, Mathura, Barsana, or National levels depending on the topic.
If the prompt is empty or vague, write a highly relevant news piece about local/national events or cultural/festive celebrations of Mathura/Barsana temple.`;

    const contentsPrompt = prompt 
      ? `Generate a news post based on the following topic or draft headline: "${prompt}".
         Please ensure the category aligns well with the topic. User selected preferred category is: "${category || 'any'}" and isBreaking is: ${isBreaking ? 'true' : 'false'}.`
      : `Generate a completely fresh, highly engaging and realistic local news post about Mathura, Barsana, or Uttar Pradesh.
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

    // Map keywords to standard input assets to give a highly polished visual feel:
    const themeKeyword = (data.imageThemeKeyword || "").toLowerCase();
    let selectedImage = "/input_file_3.png"; // Default to India Gate Banner Poster
    if (themeKeyword.includes("temple") || themeKeyword.includes("mandir") || themeKeyword.includes("festival") || themeKeyword.includes("mela") || themeKeyword.includes("barsana")) {
      selectedImage = "/input_file_1.png"; // Sri Radha Rani Temple festival coverage
    } else if (themeKeyword.includes("people") || themeKeyword.includes("crowd") || themeKeyword.includes("gathering") || themeKeyword.includes("social")) {
      selectedImage = "/input_file_0.png"; // General local gathering
    } else if (themeKeyword.includes("report") || themeKeyword.includes("office") || themeKeyword.includes("newsroom") || themeKeyword.includes("desk")) {
      selectedImage = "/input_file_2.png"; // News desk bureau
    } else if (themeKeyword.includes("rain") || themeKeyword.includes("weather") || themeKeyword.includes("crime") || themeKeyword.includes("police")) {
      selectedImage = "/input_file_4.png"; // Senior reporter on field
    }

    // Prepare complete news post object
    const newsPost = {
      title: data.title,
      content: data.content,
      category: data.category,
      isBreaking: data.isBreaking !== undefined ? data.isBreaking : (isBreaking || false),
      authorName: data.authorName || "वार्ता एक्स एआई रिपोर्टर",
      authorRole: data.authorRole || "एआई न्यूज डेस्क",
      imageUrl: selectedImage,
    };

    return res.json({ success: true, post: newsPost });

  } catch (error: any) {
    console.error("AI News Generation Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate news through AI. Please try again." 
    });
  }
});

// 1B. API Route: AI Horoscope (Rashifal) Generator Endpoint
app.post("/api/ai/generate-horoscope", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API Key missing on server."
      });
    }

    const { signId } = req.body;

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
    return res.json({ success: true, horoscope: data });

  } catch (error: any) {
    console.error("AI Horoscope Generation Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate horoscope." 
    });
  }
});

// 2. Direct Static Routes for Input Files, Manifest and Service Worker
// This guarantees that all assets (including input files) load flawlessly in the production build/public share link.
const serveLocalFile = (fileName: string, res: express.Response) => {
  const localPath = path.join(process.cwd(), fileName);
  const rootPath = path.join("/", fileName);
  
  res.sendFile(localPath, (err) => {
    if (err) {
      res.sendFile(rootPath, (err2) => {
        if (err2) {
          res.status(404).send("File not found");
        }
      });
    }
  });
};

app.get("/input_file_:id.png", (req, res) => {
  const id = req.params.id;
  
  // Serve beautiful, custom SVG vectors or redirect to curated high-quality stock imagery:
  if (id === "0") {
    // VARTA X Brand Logo (High-contrast, crisp SVG)
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <rect width="512" height="512" rx="128" fill="#0d0d0d" stroke="#1c1c1c" stroke-width="4"/>
        <path d="M0 64h512M0 128h512M0 192h512M0 256h512M0 320h512M0 384h512M0 448h512" stroke="#ffffff" stroke-opacity="0.02" stroke-width="2"/>
        <path d="M64 0v512M128 0v512M192 0v512M256 0v512M320 0v512M384 0v512M448 0v512" stroke="#ffffff" stroke-opacity="0.02" stroke-width="2"/>
        <circle cx="256" cy="256" r="210" fill="none" stroke="#dc2626" stroke-width="4" stroke-opacity="0.2"/>
        <circle cx="256" cy="256" r="190" fill="none" stroke="#dc2626" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="8 6"/>
        
        <!-- Elegant V and X Logo Design -->
        <g transform="translate(16, -10)">
          <!-- V-Wing Left -->
          <path d="M120 180 L216 350 L242 350 L338 180 L300 180 L229 310 L158 180 Z" fill="#ffffff"/>
          <!-- X-Wing Right -->
          <path d="M280 185 L370 345 L335 345 L260 215 Z" fill="#dc2626"/>
          <path d="M370 185 L280 345 L315 345 L390 215 Z" fill="#dc2626"/>
        </g>

        <!-- Typography -->
        <text x="256" y="435" font-family="'Inter', -apple-system, system-ui, sans-serif" font-size="44" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="8">VARTA X</text>
        <text x="256" y="470" font-family="'Inter', -apple-system, system-ui, sans-serif" font-size="16" font-weight="800" fill="#dc2626" text-anchor="middle" letter-spacing="4">LIVE NEWS MEDIA</text>
      </svg>
    `);
  }

  // Beautiful Unsplash images corresponding to our news topics:
  const imageMap: Record<string, string> = {
    "1": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80", // Festive temple celebration / crowd in India
    "2": "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80", // Modern newsroom media monitors
    "3": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80", // India Gate monument national flag feel
    "4": "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=1200&q=80", // Journalism camera/mic reporting
    "5": "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80", // Corporate red promotional design
    "6": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",  // Young professional male journalist
    "7": "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=1200&q=80", // Alternate journalism / newsroom desk
    "8": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80", // Digital news broadcast globe background
  };

  const redirectUrl = imageMap[id];
  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }

  // Fallback to picsum if ID is anything else:
  return res.redirect(`https://picsum.photos/seed/varta_${id}/800/600`);
});

app.get("/manifest.json", (req, res) => {
  serveLocalFile("manifest.json", res);
});

app.get("/sw.js", (req, res) => {
  serveLocalFile("sw.js", res);
});

// Vite middleware setup for development, or static serving for production
async function startViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Varta X Server] Running on http://localhost:${PORT}`);
  });
}

startViteMiddleware().catch((err) => {
  console.error("Failed to start Vite middleware server:", err);
});
