import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Compass, 
  Share2, 
  Star, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  HelpCircle,
  TrendingUp,
  Heart,
  Briefcase,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react';

export interface ZodiacSign {
  id: string;
  hindiName: string;
  englishName: string;
  symbol: string;
  dates: string;
  element: string;
  ruler: string;
  luckPercentage: number;
  luckyNumber: number;
  luckyColor: string;
  letters: string; // Hindi letters starting with this rashi
  generalPrediction: string;
  careerPrediction: string;
  healthPrediction: string;
  lovePrediction: string;
  remedy: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    hindiName: 'मेष',
    englishName: 'Aries',
    symbol: '♈',
    dates: '21 मार्च - 19 अप्रैल',
    element: 'अग्नि (Fire)',
    ruler: 'मंगल (Mars)',
    luckPercentage: 88,
    luckyNumber: 9,
    luckyColor: 'लाल (Red)',
    letters: 'अ, ल, च',
    generalPrediction: 'आज का दिन आपके लिए ऊर्जा और उत्साह से भरा रहेगा। लंबे समय से अटका कार्य पूरा होने की संभावना है। आर्थिक मामलों में शुभ समाचार मिल सकता है।',
    careerPrediction: 'कार्यक्षेत्र में उच्च अधिकारियों का मार्गदर्शन मिलेगा। नए प्रोजेक्ट की जिम्मेदारी मिल सकती है। व्यापार में निवेश का लाभ मिलेगा।',
    healthPrediction: 'ऊर्जा का स्तर ऊंचा रहेगा। संतुलित आहार लें और प्रातःकाल योग या व्यायाम अवश्य करें।',
    lovePrediction: 'जीवनसाथी के साथ सामंजस्य बना रहेगा। अविवाहितों के लिए नए रिश्ते का प्रस्ताव आ सकता है।',
    remedy: 'प्रातःकाल हनुमान चालीसा का पाठ करें और हनुमान जी को बूंदी अर्पित करें।'
  },
  {
    id: 'taurus',
    hindiName: 'वृषभ',
    englishName: 'Taurus',
    symbol: '♉',
    dates: '20 अप्रैल - 20 मई',
    element: 'पृथ्वी (Earth)',
    ruler: 'शुक्र (Venus)',
    luckPercentage: 82,
    luckyNumber: 6,
    luckyColor: 'सफेद व चमकीला (White)',
    letters: 'ई, ऊ, ए, ओ, वा, वी, वू, वे, वो',
    generalPrediction: 'आज परिवार में खुशहाली का माहौल रहेगा। धन संचय के नए अवसर मिलेंगे। कला और संगीत से जुड़े लोगों को मान-सम्मान मिलेगा।',
    careerPrediction: 'व्यापार में नई पार्टनरशिप से लाभ होगा। नौकरीपेशा लोगों को प्रमोशन या नई जिम्मेदारी मिल सकती है।',
    healthPrediction: 'गले व कान का ध्यान रखें। ठंडे पेय पदार्थों के अत्यधिक सेवन से बचें।',
    lovePrediction: 'दांपत्य जीवन में मधुरता रहेगी। पार्टनर के साथ किसी रमणीक स्थल की यात्रा का योग है।',
    remedy: 'मां लक्ष्मी को खीर का भोग लगाएं और छोटी कन्याओं को मिष्ठान प्रदान करें।'
  },
  {
    id: 'gemini',
    hindiName: 'मिथुन',
    englishName: 'Gemini',
    symbol: '♊',
    dates: '21 मई - 20 जून',
    element: 'वायु (Air)',
    ruler: 'बुध (Mercury)',
    luckPercentage: 79,
    luckyNumber: 5,
    luckyColor: 'हरा (Green)',
    letters: 'का, की, कू, घ, ङ, छ, के, को, हा',
    generalPrediction: 'आपकी वाणी और बुद्धि के बल पर कठिन कार्य भी सरलता से संपन्न होंगे। मित्रों का पूरा सहयोग मिलेगा। बौद्धिक चर्चाओं में सफलता मिलेगी।',
    careerPrediction: 'मीडिया, लेखन व आईटी क्षेत्र से जुड़े लोगों के लिए आज का दिन विशेष फलदायी है। नए संपर्क बनेंगे।',
    healthPrediction: 'मानसिक तनाव से बचें। पर्याप्त नींद लें और हल्का व सुपाच्य भोजन करें।',
    lovePrediction: 'प्रेम संबंधों में स्पष्टता रखें। पार्टनर के साथ संवाद बनाए रखने से गलतफहमियां दूर होंगी।',
    remedy: 'गणेश जी को दूर्वा (हरी घास) अर्पित करें और "ॐ गं गणपतये नमः" का जाप करें।'
  },
  {
    id: 'cancer',
    hindiName: 'कर्क',
    englishName: 'Cancer',
    symbol: '♋',
    dates: '21 जून - 22 जुलाई',
    element: 'जल (Water)',
    ruler: 'चंद्रमा (Moon)',
    luckPercentage: 85,
    luckyNumber: 2,
    luckyColor: 'चांदी जैसा व क्रीम (Cream)',
    letters: 'ही, हू, हे, हो, डा, डी, डू, डे, डो',
    generalPrediction: 'भावनात्मक रूप से मन शांत रहेगा। माता का पूर्ण स्नेह एवं सहयोग प्राप्त होगा। घर में मांगलिक कार्य की योजना बन सकती है।',
    careerPrediction: 'सरकारी कार्यों में सफलता मिलेगी। प्रॉपर्टी या रियल एस्टेट के लेन-देन में लाभ की संभावना है।',
    healthPrediction: 'मौसम के बदलाव से सावधान रहें। पर्याप्त जल का सेवन करें।',
    lovePrediction: 'परिवार के साथ खुशनुमा समय बीतेगा। जीवनसाथी का सहयोग आपको हिम्मत देगा।',
    remedy: 'शिवलिंग पर कच्चा दूध एवं जल अर्पित करें और "ॐ नमः शिवाय" का जाप करें।'
  },
  {
    id: 'leo',
    hindiName: 'सिंह',
    englishName: 'Leo',
    symbol: '♌',
    dates: '23 जुलाई - 22 अगस्त',
    element: 'अग्नि (Fire)',
    ruler: 'सूर्य (Sun)',
    luckPercentage: 92,
    luckyNumber: 1,
    luckyColor: 'सुनहरा व नारंगी (Golden / Orange)',
    letters: 'मा, मी, मू, मे, मो, टा, टी, टू, टे',
    generalPrediction: 'आपका प्रभाव और नेतृत्व क्षमता निखर कर आएगी। समाज में मान-प्रतिष्ठा बढ़ेगी। साहसिक निर्णय आपके पक्ष में रहेंगे।',
    careerPrediction: 'बिजनेस में बड़ा ऑर्डर मिल सकता है। नौकरी में आपके काम की सराहना होगी व अधिकारी प्रसन्न रहेंगे।',
    healthPrediction: 'स्वास्थ्य उत्तम रहेगा। दिन भर स्फूर्ति बनी रहेगी।',
    lovePrediction: 'प्रेम जीवन में नया उत्साह रहेगा। पार्टनर को कोई सरप्राइज गिफ्ट दे सकते हैं।',
    remedy: 'प्रातःकाल तांबे के लोटे से सूर्यदेव को अर्घ्य दें और आदित्य हृदय स्तोत्र का पाठ करें।'
  },
  {
    id: 'virgo',
    hindiName: 'कन्या',
    englishName: 'Virgo',
    symbol: '♍',
    dates: '23 अगस्त - 22 सितंबर',
    element: 'पृथ्वी (Earth)',
    ruler: 'बुध (Mercury)',
    luckPercentage: 80,
    luckyNumber: 5,
    luckyColor: 'धानी व हल्का हरा (Light Green)',
    letters: 'टो, पा, पी, पू, ष, ण, ठ, पे, पो',
    generalPrediction: 'योजनाबद्ध तरीके से काम करने से सफलता निश्चित है। पुराने कर्जों या लेन-देन से राहत मिलेगी। तर्कसंगत निर्णय लें।',
    careerPrediction: 'अकाउंट्स, बैंकिंग और रिसर्च से जुड़े लोगों को बड़ा फायदा होगा। सूक्ष्म विवरणों पर ध्यान दें।',
    healthPrediction: 'पाचन तंत्र का ध्यान रखें। बाहर के तीखे भोजन से परहेज करें।',
    lovePrediction: 'जीवनसाथी के साथ घरेलू विषयों पर सार्थक बातचीत होगी। आपसी समझ मजबूत होगी।',
    remedy: 'गाय को हरा चारा या पालक खिलाएं।'
  },
  {
    id: 'libra',
    hindiName: 'तुला',
    englishName: 'Libra',
    symbol: '♎',
    dates: '23 सितंबर - 22 अक्टूबर',
    element: 'वायु (Air)',
    ruler: 'शुक्र (Venus)',
    luckPercentage: 86,
    luckyNumber: 7,
    luckyColor: 'गुलाबी व नीला (Pink / Blue)',
    letters: 'रा, री, रू, रे, रो, ता, ती, तू, ते',
    generalPrediction: 'संतुलन और शांति बनी रहेगी। फैशन, डिजाइनिंग या कलात्मक गतिविधियों में रुचि बढ़ेगी। कानूनी मामलों में स्थिति अनुकूल रहेगी।',
    careerPrediction: 'व्यापार में लाभ के नए स्रोत खुलेंगे। कार्यस्थल पर वातावरण सुखद रहेगा।',
    healthPrediction: 'नियमित योग और ध्यान से मानसिक शांति मिलेगी। त्वचा का ध्यान रखें।',
    lovePrediction: 'दांपत्य जीवन में रोमांस और खुशहाली बढ़ेगी। एक-दूसरे के प्रति विश्वास गहरा होगा।',
    remedy: 'श्री सूक्त का पाठ करें और सफेद वस्तु (चावल या चीनी) का दान करें।'
  },
  {
    id: 'scorpio',
    hindiName: 'वृश्चिक',
    englishName: 'Scorpio',
    symbol: '♏',
    dates: '23 अक्टूबर - 21 नवंबर',
    element: 'जल (Water)',
    ruler: 'मंगल (Mars)',
    luckPercentage: 84,
    luckyNumber: 8,
    luckyColor: 'गहरा लाल व मेहरून (Maroon)',
    letters: 'तो, ना, नी, नू, ने, नो, या, यी, यू',
    generalPrediction: 'गूढ़ विषयों और अनुसंधान में सफलता मिलेगी। गुप्त शत्रुओं पर आपकी विजय होगी। आपका आत्मविश्वास चरम पर रहेगा।',
    careerPrediction: 'प्रतियोगी परीक्षा या नौकरी के साक्षात्कार में सफलता का योग है। निवेश के लिए शुभ समय।',
    healthPrediction: 'रक्तचाप और क्रोध पर नियंत्रण रखें। ध्यान (Meditation) अत्यंत लाभकारी रहेगा।',
    lovePrediction: 'पार्टनर से अपने दिल की बात साझा करें। भावनात्मक जुड़ाव और प्रगाढ़ होगा।',
    remedy: 'हनुमान जी के सम्मुख चमेली के तेल का दीपक जलाएं।'
  },
  {
    id: 'sagittarius',
    hindiName: 'धनु',
    englishName: 'Sagittarius',
    symbol: '♐',
    dates: '22 नवंबर - 21 दिसंबर',
    element: 'अग्नि (Fire)',
    ruler: 'बृहस्पति (Jupiter)',
    luckPercentage: 90,
    luckyNumber: 3,
    luckyColor: 'पीला व केसरिया (Yellow / Saffron)',
    letters: 'ये, यो, भा, भी, भू, धा, फा, ढा, भे',
    generalPrediction: 'धार्मिक व आध्यात्मिक कार्यों में मन लगेगा। किसी वरिष्ठ व्यक्ति या गुरु का मार्गदर्शन आपके जीवन में नया मोड़ ला सकता है।',
    careerPrediction: 'उच्च शिक्षा और विदेश से जुड़े कार्यों में अप्रत्याशित सफलता मिलेगी। बिजनेस यात्रा लाभदायक रहेगी।',
    healthPrediction: 'स्वास्थ्य बढ़िया रहेगा। नियमित प्राणायाम से ऊर्जा बनी रहेगी।',
    lovePrediction: 'परिवार के साथ मांगलिक यात्रा का प्लान बन सकता है। प्रेम में मधुरता रहेगी।',
    remedy: 'केसर का तिलक माथे पर लगाएं और विष्णु सहस्रनाम का पाठ करें।'
  },
  {
    id: 'capricorn',
    hindiName: 'मकर',
    englishName: 'Capricorn',
    symbol: '♑',
    dates: '22 दिसंबर - 19 जनवरी',
    element: 'पृथ्वी (Earth)',
    ruler: 'शनि (Saturn)',
    luckPercentage: 81,
    luckyNumber: 4,
    luckyColor: 'नीला व काला (Dark Blue)',
    letters: 'भो, जा, जी, खी, खू, खे, खो, गा, गी',
    generalPrediction: 'कठिन परिश्रम का पूर्ण फल मिलेगा। अनुशासन और धैर्य से आपके काम आसान होंगे। अचल संपत्ति से लाभ संभव है।',
    careerPrediction: 'नौकरी में पदोन्नति का योग है। नई जिम्मेदारी से आपकी कार्यकुशलता सिद्ध होगी।',
    healthPrediction: 'जोड़ों के दर्द या घुटनों का ध्यान रखें। सुबह हल्की सैर लाभदायक होगी।',
    lovePrediction: 'जीवनसाथी के प्रति समर्पित रहें। छोटी-मोटी बातों को अनदेखा करना श्रेयस्कर रहेगा।',
    remedy: 'शनिदेव के मंदिर में सरसों के तेल का दीपक जलाएं और "ॐ शं शनैश्चराय नमः" का जाप करें।'
  },
  {
    id: 'aquarius',
    hindiName: 'कुंभ',
    englishName: 'Aquarius',
    symbol: '♒',
    dates: '20 जनवरी - 18 फरवरी',
    element: 'वायु (Air)',
    ruler: 'शनि (Saturn)',
    luckPercentage: 83,
    luckyNumber: 8,
    luckyColor: 'बैंगनी व आसमानी (Sky Blue)',
    letters: 'गू, गे, गो, सा, सी, सू, से, सो, दा',
    generalPrediction: 'सामाजिक सरोकारों में आपकी सक्रियता बढ़ेगी। नए विचारों और आविष्कारों के प्रति रुझान रहेगा। आर्थिक स्थिति मजबूत होगी।',
    careerPrediction: 'टीम वर्क से बड़ी सफलता मिलेगी। नए प्रोजेक्ट में आपकी क्रिएटिविटी सराही जाएगी।',
    healthPrediction: 'आंखों की देखभाल करें। स्क्रीन टाइम सीमित रखें।',
    lovePrediction: 'मित्रों और जीवनसाथी के साथ हंसी-खुशी का समय बीतेगा। प्रेम संबंध प्रगाढ़ होंगे।',
    remedy: 'गरीबों को काले तिल या कंबलों का दान करें।'
  },
  {
    id: 'pisces',
    hindiName: 'मीन',
    englishName: 'Pisces',
    symbol: '♓',
    dates: '19 फरवरी - 20 मार्च',
    element: 'जल (Water)',
    ruler: 'बृहस्पति (Jupiter)',
    luckPercentage: 87,
    luckyNumber: 3,
    luckyColor: 'सुनहरा पीला (Golden Yellow)',
    letters: 'दी, दू, थ, झ, ञ, दे, दो, चा, ची',
    generalPrediction: 'आपकी अंतरात्मा और कल्पनाशीलता आपको सही दिशा दिखाएगी। दान-पुण्य के कार्यों में रुचि बढ़ेगी। धन लाभ के योग हैं।',
    careerPrediction: 'रचनात्मक कार्यों में उन्नति होगी। विदेश से संबंधित बिजनेस में बड़ा मुनाफा संभव है।',
    healthPrediction: 'मानसिक रूप से शांति महसूस होगी। पर्याप्त विश्राम लें।',
    lovePrediction: 'प्रेम संबंधों में प्रगाढ़ता आएगी। जीवनसाथी आपकी भावनाओं का सम्मान करेगा।',
    remedy: 'चने की दाल और गुड़ पीपल के वृक्ष के पास अर्पित करें अथवा गाय को खिलाएं।'
  }
];

export default function HoroscopeSection() {
  const [selectedSignId, setSelectedSignId] = useState<string>('aries');
  const [nameInput, setNameInput] = useState<string>('');
  const [discoveredSign, setDiscoveredSign] = useState<ZodiacSign | null>(null);
  
  // Dynamic AI Horoscope Overrides Map
  const [aiHoroscopes, setAiHoroscopes] = useState<Record<string, Partial<ZodiacSign>>>({});
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string>('');
  const [aiErrorMsg, setAiErrorMsg] = useState<string>('');

  const baseSign = ZODIAC_SIGNS.find(s => s.id === selectedSignId) || ZODIAC_SIGNS[0];
  
  // Merge base sign data with dynamic AI horoscope data if available
  const activeSign: ZodiacSign = {
    ...baseSign,
    ...(aiHoroscopes[selectedSignId] || {})
  };

  const handleGenerateAiHoroscope = async () => {
    setIsGeneratingAi(true);
    setAiSuccessMsg('');
    setAiErrorMsg('');
    try {
      const res = await fetch('/api/ai/generate-horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signId: selectedSignId })
      });
      const data = await res.json();
      if (data.success && data.horoscope) {
        setAiHoroscopes(prev => ({
          ...prev,
          [selectedSignId]: {
            luckPercentage: data.horoscope.luckPercentage,
            luckyNumber: data.horoscope.luckyNumber,
            luckyColor: data.horoscope.luckyColor,
            generalPrediction: data.horoscope.generalPrediction,
            careerPrediction: data.horoscope.careerPrediction,
            healthPrediction: data.horoscope.healthPrediction,
            lovePrediction: data.horoscope.lovePrediction,
            remedy: data.horoscope.remedy
          }
        }));
        setAiSuccessMsg(`✨ ${activeSign.hindiName} राशि का राशिफल Gemini AI द्वारा सफलतापूर्वक अपडेट किया गया!`);
        setTimeout(() => setAiSuccessMsg(''), 5000);
      } else {
        setAiErrorMsg(data.error || 'AI राशिफल प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।');
        setTimeout(() => setAiErrorMsg(''), 5000);
      }
    } catch (err: any) {
      setAiErrorMsg('सर्वर कनेक्टिविटी समस्या: ' + (err.message || 'AI जनरेशन में समस्या आई।'));
      setTimeout(() => setAiErrorMsg(''), 5000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Helper function to search Rashi by first letter of name
  const handleFindRashiByName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const firstChar = nameInput.trim().charAt(0);
    // Find matching sign based on Hindi letters
    const match = ZODIAC_SIGNS.find(s => 
      s.letters.split(',').some(letter => letter.trim().startsWith(firstChar) || firstChar.includes(letter.trim()))
    );

    if (match) {
      setDiscoveredSign(match);
      setSelectedSignId(match.id);
    } else {
      // Default to first letter mapping heuristic
      const charCode = firstChar.charCodeAt(0);
      const signIndex = Math.abs(charCode) % 12;
      const fallback = ZODIAC_SIGNS[signIndex];
      setDiscoveredSign(fallback);
      setSelectedSignId(fallback.id);
    }
  };

  const handleShareWhatsApp = (sign: ZodiacSign) => {
    const text = `*वार्ता एक्स दैनिक राशिफल - ${sign.hindiName} राशि (${sign.englishName})*\n\n` +
      `✨ *भाग्य प्रतिशत:* ${sign.luckPercentage}%\n` +
      `🔢 *शुभ अंक:* ${sign.luckyNumber} | 🎨 *शुभ रंग:* ${sign.luckyColor}\n\n` +
      `🔮 *आज का भाग्यफल:* ${sign.generalPrediction}\n\n` +
      `💼 *करियर:* ${sign.careerPrediction}\n` +
      `❤️ *प्रेम व परिवार:* ${sign.lovePrediction}\n` +
      `🚩 *आज का महाउपाय:* ${sign.remedy}\n\n` +
      `पूरी ज्योतिष गणना व दैनिक पंचांग पढ़ें *वार्ता एक्स न्यूज़* पर!`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const todayDateStr = new Date().toLocaleDateString('hi-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-red-950 border border-purple-800/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 rounded-full px-3.5 py-1 text-purple-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-spin" />
              <span>वार्ता एक्स ज्योतिष संस्थान • दैनिक राशिफल</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              आज का संपूर्ण <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400">राशिफल एवं पंचांग</span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-xl font-medium leading-relaxed">
              ग्रह-नक्षत्रों की सटीक चाल पर आधारित आज की १२ राशियों का संपूर्ण भविष्यफल, शुभ अंक, शुभ रंग एवं अचूक वैदिक महाउपाय।
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-gray-300">
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-bold">
                <Calendar className="h-3.5 w-3.5 text-yellow-400" />
                {todayDateStr}
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-bold">
                <Sun className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                सूर्योदय: 05:42 AM | सूर्यास्त: 07:12 PM
              </span>
            </div>
          </div>

          {/* Rashi Finder Box */}
          <div className="bg-black/60 border border-purple-500/30 rounded-2xl p-4 sm:p-5 text-white max-w-xs w-full shadow-2xl backdrop-blur-md shrink-0">
            <h3 className="text-xs font-black text-yellow-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <HelpCircle className="h-4 w-4 text-purple-400" />
              अपनी राशि खोजें (Rashi Finder)
            </h3>
            <p className="text-[11px] text-gray-300 mb-3 font-semibold">
              अपने नाम का पहला अक्षर दर्ज करें और अपनी राशि जानें:
            </p>
            <form onSubmit={handleFindRashiByName} className="space-y-2">
              <input 
                type="text" 
                placeholder="जैसे: अंश, हेमंत, राहुल..." 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-purple-500/30 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5" />
                राशि देखें
              </button>
            </form>
            {discoveredSign && (
              <div className="mt-3 p-2 bg-purple-950/60 border border-purple-500/40 rounded-xl text-center text-xs">
                <span className="text-gray-300">आपकी संभावित राशि: </span>
                <span className="font-extrabold text-yellow-300">{discoveredSign.hindiName} ({discoveredSign.englishName}) {discoveredSign.symbol}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TODAY'S PANCHANG QUICK BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#111111] p-4 rounded-2xl border border-white/5 shadow-xl text-xs text-white">
        <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
            <Sun className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase">तिथि व पक्ष</span>
            <span className="font-extrabold text-amber-300 text-xs">द्वितीया, शुक्ल पक्ष</span>
          </div>
        </div>

        <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase">नक्षत्र व चंद्र</span>
            <span className="font-extrabold text-blue-300 text-xs">पूर्वाफाल्गुनी (सिंह)</span>
          </div>
        </div>

        <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase">राहुकाल (वर्जित)</span>
            <span className="font-extrabold text-red-400 text-xs">09:15 AM - 10:55 AM</span>
          </div>
        </div>

        <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] text-gray-400 font-bold uppercase">अभिजित मुहूर्त</span>
            <span className="font-extrabold text-emerald-400 text-xs">11:58 AM - 12:52 PM</span>
          </div>
        </div>
      </div>

      {/* 12 RASHI SELECTOR TABS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            अपनी राशि चुनें (Select Zodiac Sign)
          </h2>
          <span className="text-xs text-gray-400 font-medium">कुल १२ राशियाँ</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {ZODIAC_SIGNS.map(sign => {
            const isSelected = sign.id === selectedSignId;
            return (
              <button 
                key={sign.id}
                onClick={() => setSelectedSignId(sign.id)}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center border group ${
                  isSelected 
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-xl scale-105' 
                    : 'bg-[#141414] hover:bg-[#1f1f1f] text-gray-300 border-white/5'
                }`}
              >
                <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">{sign.symbol}</span>
                <span className={`text-xs font-black ${isSelected ? 'text-slate-950' : 'text-white'}`}>{sign.hindiName}</span>
                <span className={`text-[9px] font-semibold ${isSelected ? 'text-slate-900' : 'text-gray-400'}`}>{sign.englishName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DETAILED ACTIVE HOROSCOPE CARD */}
      <div className="bg-[#111111] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Background Ambient Aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg text-slate-950 font-black shrink-0">
              {activeSign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{activeSign.hindiName} राशि ({activeSign.englishName})</h2>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                  {activeSign.element}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                स्वामी ग्रह: <span className="text-amber-300 font-bold">{activeSign.ruler}</span> | नामाक्षर: <span className="text-white font-mono">{activeSign.letters}</span> | समयावधि: {activeSign.dates}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="bg-[#181818] p-3 rounded-2xl border border-white/5 text-center px-4">
              <span className="block text-[9px] text-gray-400 font-black uppercase">आज का भाग्य</span>
              <span className="text-xl font-black text-amber-400">{activeSign.luckPercentage}%</span>
            </div>

            <button 
              onClick={handleGenerateAiHoroscope}
              disabled={isGeneratingAi}
              className="bg-gradient-to-r from-purple-700 to-amber-600 hover:from-purple-800 hover:to-amber-700 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 text-yellow-300 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'AI गणना जारी...' : '✨ AI ताज़ा राशिफल'}</span>
            </button>

            <button 
              onClick={() => handleShareWhatsApp(activeSign)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-3 rounded-2xl transition shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="h-4 w-4" />
              <span>शेयर करें</span>
            </button>
          </div>
        </div>

        {aiSuccessMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{aiSuccessMsg}</span>
          </div>
        )}

        {aiErrorMsg && (
          <div className="bg-red-950/80 border border-red-500/50 text-red-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{aiErrorMsg}</span>
          </div>
        )}

        {/* Lucky Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-white">
          <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-gray-400 font-bold">शुभ अंक:</span>
            <span className="font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">{activeSign.luckyNumber}</span>
          </div>
          <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-gray-400 font-bold">शुभ रंग:</span>
            <span className="font-extrabold text-amber-300">{activeSign.luckyColor}</span>
          </div>
          <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-gray-400 font-bold">ग्रह स्वामी:</span>
            <span className="font-extrabold text-purple-300">{activeSign.ruler}</span>
          </div>
          <div className="p-3 bg-[#181818] rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-gray-400 font-bold">तत्व:</span>
            <span className="font-extrabold text-emerald-300">{activeSign.element}</span>
          </div>
        </div>

        {/* Prediction Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* General Prediction */}
          <div className="p-5 bg-[#161616] rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              आज का सामान्य भाग्यफल
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              {activeSign.generalPrediction}
            </p>
          </div>

          {/* Career & Business */}
          <div className="p-5 bg-[#161616] rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-sm font-extrabold text-blue-400 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-400" />
              कार्यक्षेत्र एवं व्यापार
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              {activeSign.careerPrediction}
            </p>
          </div>

          {/* Health & Energy */}
          <div className="p-5 bg-[#161616] rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              स्वास्थ्य व ऊर्जा
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              {activeSign.healthPrediction}
            </p>
          </div>

          {/* Love & Relationships */}
          <div className="p-5 bg-[#161616] rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-sm font-extrabold text-rose-400 flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-400" />
              प्रेम एवं पारिवारिक जीवन
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              {activeSign.lovePrediction}
            </p>
          </div>

        </div>

        {/* Today's Remedy Box */}
        <div className="bg-gradient-to-r from-amber-950/40 via-red-950/30 to-amber-950/40 p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shrink-0">
            <Flame className="h-6 w-6 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">आज का अचूक वैदिक महाउपाय (Daily Remedy)</h4>
            <p className="text-xs text-gray-200 font-semibold leading-relaxed">
              {activeSign.remedy}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
