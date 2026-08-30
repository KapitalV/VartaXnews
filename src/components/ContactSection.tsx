import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { submitContactQuery } from '../services/queryService';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'news_tip',
    location: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitContactQuery({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: `[श्रेणी: ${formData.category} | स्थान: ${formData.location}] ${formData.message}`
      });
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'news_tip',
        location: '',
        message: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Contact Masthead */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-3 border border-red-200">
            <Phone className="w-3.5 h-3.5 text-red-600" />
            <span>प्रेस संपर्क व पाठक हेल्पलाइन (24x7 Helpline)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
            वार्ता <span className="text-red-600">X</span> न्यूज़ डेस्क से संपर्क करें
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            खबर की सूचना देने, विज्ञापन, रिपोर्टर बनने के लिए आवेदन, या अपनी समस्या / जन-मुद्दा साझा करने के लिए नीचे दिए गए फॉर्म का उपयोग करें।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Headquarters & Official Bureau Details */}
        <div className="space-y-6">
          
          {/* Main Bureau Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <span>मुख्य ब्यूरो कार्यालय</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900 block">वार्ता X न्यूज़ मीडिया</span>
                  <span>मोहल्ला गांधी नगर, कटेरा, तहसील मऊरानीपुर, जनपद झाँसी (उ.प्र.) - 284205</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">संपादकीय हेल्पलाइन:</span>
                  <a href="tel:+916393874723" className="font-bold font-mono text-gray-900 hover:text-red-600 text-sm">
                    +91 6393874723
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-gray-400 block text-[10px]">ईमेल:</span>
                  <a href="mailto:editor@vartaxnews.com" className="font-bold text-gray-900 hover:text-red-600">
                    editor@vartaxnews.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>न्यूज़रूम समय: 24 घंटे • 7 दिन उपलब्ध</span>
              </div>
            </div>
          </div>

          {/* Press Verification Badge */}
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 text-xs text-red-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <span>डिजिटल पत्रकारिता सुरक्षा व सत्यता</span>
            </div>
            <p className="text-red-800 text-[11px] leading-relaxed">
              आपकी पहचान व भेजी गई गोपनीय खबरों की सत्यता की सुरक्षा वार्ता X न्यूज़ की सर्वोच्च प्राथमिकता है।
            </p>
          </div>
        </div>

        {/* Right 2 Cols: News / Complaint / Inquiry Submission Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">खबर / सूचना या संदेश भेजें</h3>
              <p className="text-xs text-gray-500">सीधे हमारे मुख्य संपादक डेस्क पर सूचना पहुंचेगी।</p>
            </div>
            <Send className="w-5 h-5 text-red-600" />
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">संदेश सफलतापूर्वक प्राप्त हुआ!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                धन्यवाद! आपका संदेश वार्ता X न्यूज़ संपादकीय टीम के पास सुरक्षित पहुँच गया है। आवश्यक होने पर हमारी टीम आपसे संपर्क करेगी।
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                अन्य संदेश भेजें
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    आपका नाम (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="अपना पूरा नाम दर्ज करें"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    मोबाइल नंबर (Phone) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10 अंकों का मोबाइल नंबर"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ईमेल (Email ID)
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com (वैकल्पिक)"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    विषय / श्रेणी (Subject Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="news_tip">🔴 खबर / घटना की जानकारी देना</option>
                    <option value="reporter_apply">👤 रिपोर्टर बनने हेतु आवेदन</option>
                    <option value="complaint">⚖️ जन-समस्या / शिकायत</option>
                    <option value="advertisement">📢 विज्ञापन / स्पॉन्सरशिप</option>
                    <option value="general">✉️ सामान्य सुझाव / अन्य</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  स्थान / गाँव / शहर (Location) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="जैसे: कटेरा, झाँसी / मऊरानीपुर / लखनऊ"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पूरा विवरण / समाचार सामग्री (Detailed Message) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="घटना, समाचार का पूरा विवरण, दिनांक, समय और महत्वपूर्ण तथ्य यहाँ लिखें..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'भेजा जा रहा है...' : 'न्यूज़ डेस्क को संदेश भेजें'}</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
export default ContactSection;
