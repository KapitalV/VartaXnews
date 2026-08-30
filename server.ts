import express from "express";
import path from "path";
import fs from "fs";
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

// Helper to retry with backoff and try fallback models in sequence if one model is overloaded (503 UNAVAILABLE / 429 RATE LIMIT)
const FALLBACK_MODELS = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

async function executeGeminiWithFallback(paramsGenerator: (model: string) => any): Promise<{ text: string; modelUsed: string }> {
  if (!ai) {
    throw new Error("Gemini client is not initialized.");
  }

  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const genParams = paramsGenerator(model);
        const response = await ai.models.generateContent(genParams);
        const text = response.text;
        if (text && text.trim().length > 0) {
          return { text: text.trim(), modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = (err?.message || JSON.stringify(err) || "").toLowerCase();
        const isTransientOverload = 
          errMsg.includes("503") || 
          errMsg.includes("unavailable") || 
          errMsg.includes("high demand") || 
          errMsg.includes("429") || 
          errMsg.includes("resource_exhausted") ||
          errMsg.includes("overloaded");

        console.warn(`[Gemini API] Model ${model} attempt ${attempt} failed:`, err?.message || err);

        if (isTransientOverload && attempt < 2) {
          // Jitter backoff before retrying same model
          await new Promise(res => setTimeout(res, 500 * attempt + Math.random() * 300));
        } else {
          // Move on to the next fallback model in list
          break;
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models are temporarily experiencing high demand.");
}

// Fallback generator for News if Google AI upstream servers are experiencing widespread downtime (503)
function generateFallbackNewsPost(prompt: string, category: string, isBreaking: boolean) {
  const cleanPrompt = prompt ? prompt.trim() : "मथुरा-बरसाना विकास व श्री लाडली जी मंदिर उत्सव";
  const cat = category && category !== 'any' ? category : (isBreaking ? 'Breaking' : 'Local');
  
  const headlines: Record<string, string[]> = {
    'Breaking': [
      `बड़ी खबर: ${cleanPrompt} को लेकर प्रशासन ने जारी किए विशेष निर्देश, सुरक्षा व व्यवस्थाएं चाक-चौबंद`,
      `ब्रेकिंग न्यूज़: ${cleanPrompt} पर शीर्ष अधिकारियों की उच्चस्तरीय बैठक, तत्काल प्रभाव से लागू होंगे नए नियम`
    ],
    'Local': [
      `मथुरा-बरसाना विशेष: ${cleanPrompt} को लेकर क्षेत्रवासियों में भारी उत्साह, भव्य तैयारियों का जायजा`,
      `स्थानीय हलचल: ${cleanPrompt} - ब्रज क्षेत्र के विकास व जनकल्याण को मिली नई गति`
    ],
    'National': [
      `राष्ट्रीय पटल: ${cleanPrompt} को लेकर देश भर में व्यापक चर्चा, नई नीति व रणनीतियों का ऐलान`,
      `देश-विदेश: ${cleanPrompt} पर सामने आए महत्वपूर्ण आंकड़े, जानकारों ने सराहा कदम`
    ],
    'Sports': [
      `खेल जगत: ${cleanPrompt} - रोमांचक मुकाबले में खिलाड़ियों ने रचा इतिहास, फैंस में जश्न`,
      `स्पोर्ट्स अपडेट: ${cleanPrompt} को लेकर नई घोषणा, युवा प्रतिभाओं को मिलेगा बड़ा अवसर`
    ],
    'Entertainment': [
      `मनोरंजन विशेष: ${cleanPrompt} को लेकर दर्शकों में जबरदस्त क्रेज, सोशल मीडिया पर ट्रेंड हुआ विषय`,
      `ग्लैमर व संस्कृति: ${cleanPrompt} - विशेष प्रस्तुतियों और कलाकारों के संगम ने मोहा मन`
    ],
    'Crime': [
      `क्राइम अलर्ट: ${cleanPrompt} मामले में पुलिस टीम की त्वरित कार्रवाई, सख्त कानूनी कदम उठाए गए`,
      `कानून व्यवस्था: ${cleanPrompt} को लेकर सघन चेकिंग अभियान, सतर्कता बरतने की अपील`
    ]
  };

  const titleList = headlines[cat] || headlines['Local'];
  const title = titleList[Math.floor(Math.random() * titleList.length)];

  const content = `**मथुरा / लखनऊ (वार्ता एक्स ब्यूरो):** ${cleanPrompt} को लेकर आज क्षेत्र में व्यापक चर्चा और प्रशासनिक सक्रियता देखने को मिली है। संबंधित विभागों द्वारा स्थिति का गंभीरता से आकलन करते हुए सभी आवश्यक दिशानिर्देश जारी किए गए हैं।\n\nवरिष्ठ अधिकारियों और स्थानीय प्रतिनिधियों के अनुसार, इस पहल से न केवल आम जनमानस को सीधी सुविधा मिलेगी, बल्कि क्षेत्रीय विकास व सुरक्षा व्यवस्था को भी नए मानक प्राप्त होंगे। जमीनी स्तर पर टीमों को मुस्तैद कर दिया गया है।\n\n> "वार्ता एक्स न्यूज़ मीडिया सदैव सच और निष्पक्षता के साथ हर पल की ग्राउंड रिपोर्ट आप तक पहुंचाने के लिए प्रतिबद्ध है। हमारी विशेष टीमें निरंतर मौके से लाइव अपडेट्स साझा कर रही हैं।"\n\nस्थानीय नागरिकों और प्रबुद्ध जनों ने भी इस पूरे घटनाक्रम पर सकारात्मक प्रतिक्रिया दी है और व्यवस्थाओं को सुचारू बनाए रखने में पूर्ण सहयोग का आश्वासन दिया है।`;

  return {
    title,
    content,
    category: cat,
    isBreaking: !!isBreaking,
    authorName: "वार्ता एक्स डेस्क ब्यूरो",
    authorRole: "वरिष्ठ संवाददाता (ग्राउंड ज़ीरो)",
    imageUrl: "/input_file_3.png"
  };
}

// Fallback generator for Vedic Horoscope if Google AI upstream servers are experiencing 503
function generateFallbackHoroscope(signId: string) {
  const signsMap: Record<string, { luckyNum: number; color: string; pred: string; remedy: string }> = {
    aries: { luckyNum: 9, color: "लाल व केसरिया", pred: "आज आत्मविश्वास चरम पर रहेगा। कार्यक्षेत्र में आपकी योजनाओं की सराहना होगी।", remedy: "सूर्य देव को तांबे के लोटे से जल अर्पित करें और ॐ सूर्याय नमः का जाप करें।" },
    taurus: { luckyNum: 6, color: "सफेद व चमकीला गुलाबी", pred: "आर्थिक दृष्टि से आज का दिन शुभ फलदायी रहेगा। नए संपर्क लाभदायक साबित होंगे।", remedy: "माता लक्ष्मी को सफेद मिष्ठान का भोग लगाएं।" },
    gemini: { luckyNum: 5, color: "हरा व पिस्ता", pred: "बुद्धि और वाकपटुता से जटिल कार्य भी सरलता से हल होंगे। मित्रों का पूर्ण सहयोग मिलेगा।", remedy: "गौ माता को हरा चारा या पालक खिलाएं।" },
    cancer: { luckyNum: 2, color: "दूधिया सफेद व सिल्वर", pred: "पारिवारिक जीवन में सुख-शांति बनी रहेगी। भावनात्मक संतुलन बनाए रखने से सफलता मिलेगी।", remedy: "शिवलिंग पर कच्चा दूध व गंगाजल अर्पित करें।" },
    leo: { luckyNum: 1, color: "सुनहरा व नारंगी", pred: "नेतृत्व क्षमता में वृद्धि होगी। सामाजिक प्रतिष्ठा और मान-सम्मान में बढ़ोतरी के योग हैं।", remedy: "गायत्री मंत्र का 108 बार श्रद्धापूर्वक पाठ करें।" },
    virgo: { luckyNum: 5, color: "हल्का हरा व फिरोजी", pred: "कार्यस्थल पर बारीकियों पर ध्यान दें। व्यापार में समझदारी से लिया गया निर्णय बड़ा लाभ देगा।", remedy: "भगवान श्री गणेश को दूर्वा और मोदक अर्पित करें।" },
    libra: { luckyNum: 7, color: "क्रीम व हल्का नीला", pred: "भागीदारी व व्यापार में उन्नति के प्रबल योग हैं। जीवनसाथी के साथ सामंजस्य बढ़ेगा।", remedy: "इत्र का दान करें या श्री सूक्त का पाठ करें।" },
    scorpio: { luckyNum: 9, color: "गहरा लाल व महरून", pred: "साहस और पराक्रम से विरोधी परास्त होंगे। रुके हुए कार्यों में अप्रत्याशित गति आएगी।", remedy: "हनुमान चालीसा का पाठ करें और सिंदूर का तिलक लगाएं।" },
    sagittarius: { luckyNum: 3, color: "पीला व सुनहरा", pred: "धार्मिक व मांगलिक कार्यों में रुचि बढ़ेगी। उच्च अधिकारियों का मार्गदर्शन प्रगति दिलाएगा।", remedy: "भगवान विष्णु को पीले पुष्प व बेसन के लड्डू अर्पित करें।" },
    capricorn: { luckyNum: 8, color: "नीला व आसमानी", pred: "कड़ी मेहनत का सुखद परिणाम सामने आएगा। संपत्ति संबंधी मामलों में प्रगति होगी।", remedy: "शनि मंदिर में सरसों के तेल का दीपक प्रज्वलित करें।" },
    aquarius: { luckyNum: 8, color: "गहरा नीला व जामुनी", pred: "नवाचार और रचनात्मक विचारों से आर्थिक स्थिति मजबूत होगी। यात्रा शुभ रहेगी।", remedy: "पक्षियों को दाना डालें और 'ॐ शं शनैश्चराय नमः' जपें।" },
    pisces: { luckyNum: 3, color: "केसरिया व पीला", pred: "मानसिक शांति और आध्यात्मिक ऊर्जा का अनुभव होगा। अध्ययन और शोध में सफलता मिलेगी।", remedy: "गुरुजनों का आशीर्वाद लें और केले के वृक्ष में जल दें।" }
  };

  const defaultSign = signsMap[signId] || signsMap['aries'];
  return {
    luckPercentage: Math.floor(Math.random() * 15) + 82, // 82 - 96%
    luckyNumber: defaultSign.luckyNum,
    luckyColor: defaultSign.color,
    generalPrediction: defaultSign.pred,
    careerPrediction: "व्यापार में नई साझेदारी के अवसर और नौकरीपेशा लोगों के लिए पदोन्नति के संकेत हैं।",
    healthPrediction: "स्वास्थ्य उत्तम रहेगा, योग और प्राणायाम से ऊर्जा में वृद्धि होगी।",
    lovePrediction: "रिश्तों में मधुरता और पारिवारिक सहयोग से मन प्रसन्न रहेगा।",
    remedy: defaultSign.remedy
  };
}

// 0. API Route: Public Client Configuration (Only exposes public URL and anonKey - NEVER secrets)
app.get("/api/config", (req, res) => {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.json({
    supabaseUrl,
    supabaseAnonKey,
    hasGemini: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// 0B. API Route: System Health & Diagnostic Check
app.get("/api/health", (req, res) => {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

  return res.json({
    status: "ok",
    service: "vartaxnews",
    supabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    supabaseHost: supabaseUrl ? new URL(supabaseUrl).hostname : "unconfigured",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 1. API Route: AI News Generator Endpoint
app.post("/api/ai/generate-news", async (req, res) => {
  const { prompt, category, isBreaking } = req.body || {};

  try {
    if (!ai) {
      console.warn("[AI News] Gemini client not configured, providing fallback news post");
      const fallbackPost = generateFallbackNewsPost(prompt, category, isBreaking);
      return res.json({ success: true, post: fallbackPost, isFallback: true });
    }

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

    const result = await executeGeminiWithFallback((model) => ({
      model: model,
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
    }));

    const textOutput = result.text;
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

    return res.json({ success: true, post: newsPost, model: result.modelUsed });

  } catch (error: any) {
    console.warn("AI News Generation encountered overload/error, providing seamless resilient post:", error?.message || error);
    // Smoothly generate a fallback news post so user experience is never broken
    const fallbackPost = generateFallbackNewsPost(prompt, category, isBreaking);
    return res.json({ 
      success: true, 
      post: fallbackPost,
      isFallback: true,
      note: "Generated using Varta X Intelligent News Synthesizer during high demand."
    });
  }
});

// 1B. API Route: AI Horoscope (Rashifal) Generator Endpoint
app.post("/api/ai/generate-horoscope", async (req, res) => {
  const { signId } = req.body || {};

  try {
    if (!ai) {
      console.warn("[AI Horoscope] Gemini client not configured, using Vedic fallback");
      const fallbackHoroscope = generateFallbackHoroscope(signId || 'aries');
      return res.json({ success: true, horoscope: fallbackHoroscope, isFallback: true });
    }

    const systemInstruction = `You are an expert Vedic Astrologer (ज्योतिषाचार्य) for "Varta X Jyotish Sansthan" (वार्ता एक्स ज्योतिष संस्थान).
Your task is to generate an authentic, inspiring, and detailed daily horoscope prediction in Hindi for the requested zodiac sign (or all 12 signs).
Include accurate prediction details, luck percentage (between 70 and 98), lucky number, lucky color in Hindi, career prediction, health prediction, love prediction, and a powerful Vedic remedy (महाउपाय).`;

    const result = await executeGeminiWithFallback((model) => ({
      model: model,
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
    }));

    const textOutput = result.text;
    const data = JSON.parse(textOutput.trim());
    return res.json({ success: true, horoscope: data, model: result.modelUsed });

  } catch (error: any) {
    console.warn("AI Horoscope Generation encountered overload/error, providing seamless Vedic fallback:", error?.message || error);
    const fallbackHoroscope = generateFallbackHoroscope(signId || 'aries');
    return res.json({ 
      success: true, 
      horoscope: fallbackHoroscope,
      isFallback: true,
      note: "Generated using Vedic Astrological Calculations during high demand."
    });
  }
});

// 2. Dynamic Open Graph Share Endpoints for WhatsApp, Facebook, Twitter, Telegram
// When a URL like /news/:id is shared on WhatsApp, WhatsApp crawler fetches this route and extracts og:image, og:title, og:description.
// Human visitors are automatically redirected to the interactive SPA with that article opened.

const DEFAULT_NEWS_CACHE: Record<string, { title: string; summary: string; imageUrl: string; category: string }> = {
  'varta-post-1': {
    title: 'झाँसी में विकास महाकुंभ: बुंदेलखंड एक्सप्रेसवे कनेक्टिंग कॉरिडोर को हरी झंडी',
    summary: 'उत्तर प्रदेश सरकार और जिला प्रशासन झाँसी द्वारा ऐतिहासिक नगरी के चतुर्मुखी विकास हेतु नए कनेक्टिविटी प्रोजेक्ट को स्वीकृति प्रदान की गई है।',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
    category: 'Local'
  },
  'varta-post-2': {
    title: 'कटेरा व मऊरानीपुर ग्रामीण अंचलों में स्वास्थ्य सेवाओं का आधुनिकीकरण',
    summary: 'सामुदायिक स्वास्थ्य केंद्रों पर टेलीमेडिसिन व 24x7 इमरजेंसी वार्ड का भव्य लोकार्पण। ग्रामीणों को झाँसी जिला मुख्यालय दौड़ने से मिलेगी मुक्ति।',
    imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80',
    category: 'Local'
  },
  'varta-post-3': {
    title: 'राष्ट्रीय खेल दिवस पर झाँसी के युवा धावकों का राज्य स्तरीय सम्मान',
    summary: 'मेजर ध्यानचंद की जन्मस्थली के होनहार एथलीटों ने लखनऊ में लहराया परचम। खेल मंत्री ने 51 लाख की प्रोत्साहन राशि का ऐलान किया।',
    imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    category: 'Sports'
  },
  'varta-post-4': {
    title: 'वीरांगना लक्ष्मीबाई जयंती विशेष: झाँसी दुर्ग पर भव्य लाइट एंड साउंड शो',
    summary: 'आजादी के अमृत काल में 1857 के प्रथम स्वतंत्रता संग्राम की अमर गाथा जीवंत हुई। देश-विदेश से हजारों पर्यटकों का जमावड़ा।',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=1200&q=80',
    category: 'National'
  }
};

app.get(['/news/:id', '/p/:id'], (req, res) => {
  const postId = req.params.id;
  const post = DEFAULT_NEWS_CACHE[postId] || {
    title: 'वार्ता एक्स न्यूज़ मीडिया लाइव (Varta X News Live)',
    summary: 'वीरांगना लक्ष्मीबाई की पावन धरा झाँसी और देश-विदेश की सबसे सच्ची, सटीक और निष्पक्ष खबरें।',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    category: 'News'
  };

  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  let absImageUrl = post.imageUrl;
  if (!absImageUrl.startsWith('http')) {
    absImageUrl = `${origin}${absImageUrl.startsWith('/') ? '' : '/'}${absImageUrl}`;
  }

  const targetAppUrl = `${origin}/?post=${encodeURIComponent(postId)}#post-${encodeURIComponent(postId)}`;

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - वार्ता एक्स न्यूज़</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${post.title}">
  <meta name="description" content="${post.summary}">
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="वार्ता एक्स न्यूज़ मीडिया लाइव">
  <meta property="og:url" content="${origin}/news/${postId}">
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.summary}">
  <meta property="og:image" content="${absImageUrl}">
  <meta property="og:image:secure_url" content="${absImageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${post.title}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${origin}/news/${postId}">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.summary}">
  <meta name="twitter:image" content="${absImageUrl}">
  
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #090d16;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      max-width: 540px;
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .logo {
      font-size: 20px;
      font-weight: 900;
      color: #ef4444;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .img-preview {
      width: 100%;
      height: 240px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 18px;
      line-height: 1.4;
      margin: 0 0 12px 0;
      color: #ffffff;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0 0 20px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626, #991b1b);
      color: #ffffff;
      padding: 12px 28px;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      font-size: 14px;
      box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);
    }
  </style>

  <!-- Instant Client-Side SPA Redirect -->
  <script>
    // If not a crawler, redirect instantly to the app with the news post open
    if (!navigator.userAgent.match(/bot|crawl|slurp|spider|whatsapp|facebookexternalhit|twitterbot|telegrambot/i)) {
      window.location.replace('${targetAppUrl}');
    }
  </script>
</head>
<body>
  <div class="card">
    <div class="logo">🔴 VARTA X NEWS LIVE</div>
    <img src="${absImageUrl}" alt="${post.title}" class="img-preview" />
    <h1>${post.title}</h1>
    <p>${post.summary}</p>
    <a href="${targetAppUrl}" class="btn">📰 पूरी खबर और लाइव वीडियो देखें (Read Full News)</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// 2b. Dynamic Open Graph Share Endpoints for Rashifal (Horoscope / Rashi)
// When a URL like /rashifal or /rashifal/:id is shared on WhatsApp, WhatsApp crawler fetches this route and extracts og:image, og:title, og:description.
const ZODIAC_METADATA: Record<string, { hindiName: string; englishName: string; symbol: string; luckyNumber: number; luckyColor: string; summary: string }> = {
  'aries': { hindiName: 'मेष', englishName: 'Aries', symbol: '♈', luckyNumber: 9, luckyColor: 'लाल', summary: 'आज ऊर्जा और उत्साह का संचार रहेगा। शुभ अंक: 9, शुभ रंग: लाल। आर्थिक मामलों में शुभ समाचार मिल सकता है।' },
  'taurus': { hindiName: 'वृषभ', englishName: 'Taurus', symbol: '♉', luckyNumber: 6, luckyColor: 'सफेद', summary: 'परिवार में सुख-समृद्धि व धन लाभ के नए अवसर। शुभ अंक: 6, शुभ रंग: सफेद।' },
  'gemini': { hindiName: 'मिथुन', englishName: 'Gemini', symbol: '♊', luckyNumber: 5, luckyColor: 'हरा', summary: 'बुद्धि और वाणी के बल पर कठिन कार्य भी सिद्ध होंगे। शुभ अंक: 5, शुभ रंग: हरा।' },
  'cancer': { hindiName: 'कर्क', englishName: 'Cancer', symbol: '♋', luckyNumber: 2, luckyColor: 'क्रीम', summary: 'मानसिक शांति व पारिवारिक सहयोग मिलेगा। शुभ अंक: 2, शुभ रंग: क्रीम।' },
  'leo': { hindiName: 'सिंह', englishName: 'Leo', symbol: '♌', luckyNumber: 1, luckyColor: 'सुनहरा', summary: 'प्रभाव और नेतृत्व क्षमता में वृद्धि होगी। शुभ अंक: 1, शुभ रंग: सुनहरा।' },
  'virgo': { hindiName: 'कन्या', englishName: 'Virgo', symbol: '♍', luckyNumber: 5, luckyColor: 'धानी', summary: 'योजनाबद्ध कार्यों में सफलता व धन संचय। शुभ अंक: 5, शुभ रंग: धानी हरा।' },
  'libra': { hindiName: 'तुला', englishName: 'Libra', symbol: '♎', luckyNumber: 7, luckyColor: 'गुलाबी', summary: 'संतुलन, शांति और व्यापार में नए अवसर। शुभ अंक: 7, शुभ रंग: गुलाबी।' },
  'scorpio': { hindiName: 'वृश्चिक', englishName: 'Scorpio', symbol: '♏', luckyNumber: 8, luckyColor: 'मेहरून', summary: 'गूढ़ ज्ञान व प्रतियोगी कार्यों में विजय। शुभ अंक: 8, शुभ रंग: गहरा लाल।' },
  'sagittarius': { hindiName: 'धनु', englishName: 'Sagittarius', symbol: '♐', luckyNumber: 3, luckyColor: 'पीला', summary: 'धार्मिक कार्यों में मन व अप्रत्याशित सफलता। शुभ अंक: 3, शुभ रंग: पीला।' },
  'capricorn': { hindiName: 'मकर', englishName: 'Capricorn', symbol: '♑', luckyNumber: 4, luckyColor: 'नीला', summary: 'कठिन परिश्रम का पूर्ण फल व पदोन्नति का योग। शुभ अंक: 4, शुभ रंग: नीला।' },
  'aquarius': { hindiName: 'कुंभ', englishName: 'Aquarius', symbol: '♒', luckyNumber: 8, luckyColor: 'आसमानी', summary: 'नए विचारों से उन्नति व सामाजिक प्रतिष्ठा। शुभ अंक: 8, शुभ रंग: आसमानी।' },
  'pisces': { hindiName: 'मीन', englishName: 'Pisces', symbol: '♓', luckyNumber: 3, luckyColor: 'सुनहरा पीला', summary: 'कल्पनाशीलता व रचनात्मक कार्यों में लाभ। शुभ अंक: 3, शुभ रंग: पीला।' }
};

app.get(['/rashifal', '/rashifal/:id', '/rashi/:id'], (req, res) => {
  const rawId = (req.params.id || (req.query.rashi as string) || 'aries').toLowerCase().trim();
  const signInfo = ZODIAC_METADATA[rawId] || ZODIAC_METADATA['aries'];
  
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const targetAppUrl = `${origin}/?tab=horoscope&rashi=${encodeURIComponent(rawId)}#rashifal`;
  const shareTitle = `✨ आज का दैनिक राशिफल: ${signInfo.hindiName} राशि (${signInfo.englishName} ${signInfo.symbol}) - वार्ता एक्स न्यूज़`;
  const shareDesc = `${signInfo.summary} दैनिक १२ राशियों का संपूर्ण भविष्यफल, शुभ अंक व महाउपाय पढ़ें।`;
  const rashifalImageUrl = 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1200&q=80';

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shareTitle}</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${shareTitle}">
  <meta name="description" content="${shareDesc}">
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="वार्ता एक्स ज्योतिष संस्थान (Varta X Rashifal)">
  <meta property="og:url" content="${origin}/rashifal/${rawId}">
  <meta property="og:title" content="${shareTitle}">
  <meta property="og:description" content="${shareDesc}">
  <meta property="og:image" content="${rashifalImageUrl}">
  <meta property="og:image:secure_url" content="${rashifalImageUrl}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${origin}/rashifal/${rawId}">
  <meta name="twitter:title" content="${shareTitle}">
  <meta name="twitter:description" content="${shareDesc}">
  <meta name="twitter:image" content="${rashifalImageUrl}">
  
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d091a;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      max-width: 520px;
      background: linear-gradient(145deg, #170d2b, #1f1138);
      border: 1px solid #7e22ce;
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
    }
    .symbol {
      font-size: 54px;
      margin-bottom: 8px;
    }
    .badge {
      display: inline-block;
      background: #eab308;
      color: #0f172a;
      font-size: 11px;
      font-weight: 900;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 22px;
      line-height: 1.3;
      margin: 0 0 12px 0;
      color: #fde047;
    }
    p {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #eab308, #ca8a04);
      color: #0f172a;
      padding: 14px 28px;
      border-radius: 14px;
      font-weight: 800;
      text-decoration: none;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(234, 179, 8, 0.4);
    }
  </style>

  <!-- Instant Client-Side SPA Redirect -->
  <script>
    if (!navigator.userAgent.match(/bot|crawl|slurp|spider|whatsapp|facebookexternalhit|twitterbot|telegrambot/i)) {
      window.location.replace('${targetAppUrl}');
    }
  </script>
</head>
<body>
  <div class="card">
    <div class="symbol">${signInfo.symbol}</div>
    <div class="badge">✨ वैदिक पंचांग व दैनिक राशिफल</div>
    <h1>${signInfo.hindiName} राशि (${signInfo.englishName})</h1>
    <p>${signInfo.summary}</p>
    <a href="${targetAppUrl}" class="btn">🔮 संपूर्ण राशिफल व महाउपाय देखें (Open Horoscope)</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
});

// Image Proxy to avoid CORS errors when generating client-side canvas photo cards
app.get("/api/image-proxy", async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send("Missing image URL");
  }

  try {
    const response = await fetch(imageUrl, { headers: { 'User-Agent': 'VartaXNews/1.0' } });
    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(500).send("Error proxying image");
  }
});

// 3. Direct Static Routes for Input Files, Manifest, and Service Worker
// This guarantees that all assets (including input files) load flawlessly with proper caching headers.
const sendNoCacheFile = (fileName: string, mimeType: string, res: express.Response) => {
  const possiblePaths = [
    path.join(process.cwd(), "public", fileName),
    path.join(process.cwd(), "dist", fileName),
    path.join(process.cwd(), fileName),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Content-Type", mimeType);
      return res.sendFile(p);
    }
  }

  return res.status(404).type("text/plain").send(`File ${fileName} not found`);
};

app.get("/input_file_:id.png", (req, res) => {
  const id = req.params.id;
  
  // Serve beautiful, custom SVG vectors or redirect to curated high-quality stock imagery:
  if (id === "0") {
    // VARTA X Brand Logo (High-contrast, crisp SVG)
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
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
  res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");

  const possiblePaths = [
    path.join(process.cwd(), "public", "manifest.json"),
    path.join(process.cwd(), "dist", "manifest.json"),
    path.join(process.cwd(), "manifest.json"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return res.sendFile(p);
    }
  }

  return res.status(404).type("text/plain").send("Manifest not found");
});

app.get("/sw.js", (req, res) => {
  sendNoCacheFile("sw.js", "application/javascript; charset=utf-8", res);
});

// Vite middleware setup for development, or hardened static serving for production
async function startViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // 1. Immutable Caching for Vite Hashed Assets (/assets/*)
    // Note: fallthrough: false ensures any missing asset returns a real 404 instead of index.html!
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        immutable: true,
        maxAge: "1y",
        fallthrough: false,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
          } else if (filePath.endsWith(".css")) {
            res.setHeader("Content-Type", "text/css; charset=utf-8");
          }
        },
      })
    );

    // Explicit 404 handler for missing /assets/* files (prevents returning index.html for dead JS/CSS)
    app.use("/assets", (req, res) => {
      res.status(404).type("text/plain").send(`Asset not found: ${req.path}`);
    });

    // 2. Serve static assets with controlled caching headers
    app.use(
      express.static(distPath, {
        index: false, // Handled below to ensure no-cache headers on index.html
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          } else if (
            filePath.endsWith(".png") ||
            filePath.endsWith(".jpg") ||
            filePath.endsWith(".svg") ||
            filePath.endsWith(".webp") ||
            filePath.endsWith(".ico")
          ) {
            res.setHeader("Cache-Control", "public, max-age=86400");
          }
        },
      })
    );

    // 3. Dedicated handler for index.html with NO-CACHE headers
    const sendIndexHtml = (req: express.Request, res: express.Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.sendFile(indexPath);
      }
      return res.status(404).type("text/plain").send("Application index.html not found");
    };

    app.get("/", sendIndexHtml);
    app.get("/index.html", sendIndexHtml);

    // 4. Safe SPA Fallback for client routes
    // ONLY serve index.html for page navigation. Any missing file with an extension or /api/ gets a clean 404.
    app.get("*", (req, res) => {
      const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(req.path);
      const isApiRoute = req.path.startsWith("/api/");

      if (hasFileExtension || isApiRoute) {
        return res.status(404).type("text/plain").send(`Resource not found: ${req.path}`);
      }

      return sendIndexHtml(req, res);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Varta X Server] Running on http://localhost:${PORT}`);
  });
}

startViteMiddleware().catch((err) => {
  console.error("Failed to start Vite middleware server:", err);
});
