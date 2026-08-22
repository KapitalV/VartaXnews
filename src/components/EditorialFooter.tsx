import React from 'react';
import { 
  Radio, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Smartphone, 
  Video, 
  Users,
  ChevronRight
} from 'lucide-react';

interface EditorialFooterProps {
  onNavigateTab: (tab: any) => void;
  onSelectCategory: (cat: string) => void;
  categories: string[];
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({
  onNavigateTab,
  onSelectCategory,
  categories
}) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t-4 border-red-600 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-gray-800">
          
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-xl shadow-md border border-red-500/40">
                <span>VX</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  वार्ता <span className="text-red-500">X</span> न्यूज़
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  डिजिटल मीडिया नेटवर्क
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              वार्ता X न्यूज़ भारत और उत्तर प्रदेश (विशेषकर बुंदेलखंड - झाँसी, कटेरा, मऊरानीपुर) का अग्रणी डिजिटल न्यूज़ नेटवर्क है। निष्पक्ष और निर्भीक पत्रकारिता हमारा ध्येय है।
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>प्रेस काउंसिल मानक एवं आचार संहिता अनुपालन</span>
            </div>
          </div>

          {/* Column 2: Regional Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1.5 border-b border-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>क्षेत्रीय कवरेज (Bureaus)</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('feed');
                      onSelectCategory(cat);
                    }}
                    className="hover:text-white hover:underline flex items-center gap-1.5 text-gray-400 transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-red-500" />
                    <span>{cat} समाचार</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1.5 border-b border-gray-800 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              <span>त्वरित लिंक (Quick Links)</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('videos')}
                  className="hover:text-white flex items-center gap-1.5 text-gray-400 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>वीडियो बुलेटिन (Video Desk)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('horoscope')}
                  className="hover:text-white flex items-center gap-1.5 text-gray-400 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>दैनिक वैदिक राशिफल (Horoscope)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('team')}
                  className="hover:text-white flex items-center gap-1.5 text-gray-400 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>संपादकीय मंडल (Editorial Board)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('contact')}
                  className="hover:text-white flex items-center gap-1.5 text-gray-400 transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>प्रेस कार्ड / रिपोर्टर सत्यापन</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('admin')}
                  className="hover:text-white flex items-center gap-1.5 text-red-400 font-semibold transition-colors"
                >
                  <ChevronRight className="w-3 h-3 text-red-500" />
                  <span>रिपोर्टर / एडमिन लॉगिन</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Bureau Headquarters & Helpline */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-1.5 border-b border-gray-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>मुख्यालय व हेल्पलाइन</span>
            </h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>मुख्य ब्यूरो कार्यालय: मोहल्ला गांधी नगर, कटेरा (झाँसी), उत्तर प्रदेश - 284205</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+916393874723" className="hover:text-white font-mono text-gray-300">
                  +91 6393874723
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:editor@vartaxnews.com" className="hover:text-white text-gray-300">
                  editor@vartaxnews.com
                </a>
              </div>

              <div className="pt-2">
                <span className="block text-[11px] text-gray-500">चैनल हेड व मुख्य संपादक:</span>
                <span className="text-xs font-bold text-white">हृद्यांश (अंश) गुप्ता</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Varta X News Media Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <span>गोपनीयता नीति</span>
            <span>•</span>
            <span>नियम व शर्तें</span>
            <span>•</span>
            <span>प्रेस शिकायत निवारण</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
