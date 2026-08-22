import React from 'react';
import { TeamMember } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { 
  Users, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface TeamSectionProps {
  teamMembers: TeamMember[];
  onOpenContact?: () => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ 
  teamMembers,
  onOpenContact
}) => {
  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-3 border border-red-200">
            <ShieldCheck className="w-4 h-4 text-red-600" />
            <span>अधिकृत संपादकीय मंडल (Official Editorial Board)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-2">
            वार्ता <span className="text-red-600">X</span> न्यूज़ पत्रकार व संवाददाता टीम
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            हमारे समर्पित पत्रकार और जमीनी संवाददाता बुंदेलखंड, उत्तर प्रदेश और पूरे देश से निष्पक्ष, त्वरित और सटीक खबरें आप तक पहुँचाने के लिए 24 घंटे तत्पर हैं।
          </p>
        </div>
      </div>

      {/* Journalists & Reporters Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => {
          const designation = (member as any).designation || member.role || 'संवाददाता';
          const memberImg = (member as any).image_url || member.imageUrl;
          const isChief = idx === 0 || designation.includes('चैनल हेड') || designation.includes('संपादक') || designation.includes('Chief') || designation.includes('Head');

          return (
            <div 
              key={member.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                isChief 
                  ? 'border-red-200 shadow-md ring-1 ring-red-500/20' 
                  : 'border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="p-6">
                {/* Profile Avatar with Direct Storage Resolution */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img 
                      src={resolveImageUrl(memberImg)} 
                      alt={member.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
                    />
                    <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-mono font-bold rounded">
                        ID: {member.id.toUpperCase()}
                      </span>
                      {isChief && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded">
                          मुख्य
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-red-600 line-clamp-1">
                      {designation}
                    </p>
                  </div>
                </div>

                {/* Bio / Beat Description */}
                {member.bio && (
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {member.bio}
                  </p>
                )}

                {/* Contact & Bureau metadata */}
                <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a href={`tel:${member.phone}`} className="hover:text-gray-900 font-mono font-medium">
                        {member.phone}
                      </a>
                    </div>
                  )}

                  {member.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <a href={`mailto:${member.email}`} className="hover:text-gray-900 truncate">
                        {member.email}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>झाँसी / कटेरा मंडल ब्यूरो</span>
                  </div>
                </div>
              </div>

              {/* Card Footer status */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-medium">प्रेस आईडी सत्यापित</span>
                <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                  सक्रिय रिपोर्टर
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Become a Reporter / Onboarding Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-bold">क्या आप भी वार्ता X न्यूज़ के साथ रिपोर्टर बनना चाहते हैं?</h3>
          <p className="text-xs text-red-100">
            अपने गाँव, कस्बे या शहर से सटीक खबरें भेजें और आधिकारिक डिजिटल प्रेस आईडी कार्ड प्राप्त करें।
          </p>
        </div>
        {onOpenContact && (
          <button
            type="button"
            onClick={onOpenContact}
            className="px-6 py-3 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl shadow-lg transition-colors whitespace-nowrap"
          >
            आवेदन फॉर्म भरें
          </button>
        )}
      </div>
    </div>
  );
};
