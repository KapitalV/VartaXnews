/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsPost, NewsCategory, TeamMember, VideoBulletin } from './types';

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-hemant',
    name: 'Hemant Rajput',
    role: 'कटेरा देहात रिपोर्टर (Katera Dehat Reporter)',
    imageUrl: '/input_file_4.png',
    bio: 'कटेरा देहात क्षेत्र से वार्ता एक्स न्यूज़ के समर्पित ग्राउंड रिपोर्टर। ग्रामीण समस्याओं एवं स्थानीय घटनाओं की लाइव कवरेज।',
    phone: '+91 9198879528',
    email: 'hemantrajpoota786@gmail.com'
  },
  {
    id: 'team-ankesh',
    name: 'Ankesh Gupta',
    role: 'कटेरा रिपोर्टर (Katera Reporter)',
    imageUrl: '/input_file_5.png',
    bio: 'कटेरा क्षेत्र से वार्ता एक्स न्यूज़ के ग्राउंड रिपोर्टर। स्थानीय खबरों और ताजा अपडेट्स की निष्पक्ष रिपोर्टिंग।',
    phone: '+91 9598857714',
    email: 'guptaankesh1979@gmail.com'
  },
  {
    id: 'team-1',
    name: 'Hradyansh Gupta',
    role: 'Channel Head & Chief Editor',
    imageUrl: '/input_file_6.png',
    bio: 'Visionary journalist leading Varta X News. Spearheading modern, digital-first grassroots journalism in Uttar Pradesh and nationwide.',
    phone: '+91 6393874723',
    email: 'uniqueansh2265@gmail.com'
  },
  {
    id: 'team-3',
    name: 'The Varta X Bureau Team',
    role: 'Editorial & Student Correspondents',
    imageUrl: '/input_file_2.png',
    bio: 'Our dynamic team of young, passionate journalists and news desk operators working 24/7 to compile true, precise, and objective headlines.',
    phone: '+91 6393874723',
    email: 'uniqueansh2265@gmail.com'
  }
];

export const INITIAL_POSTS: NewsPost[] = [
  {
    id: 'varta-post-1',
    title: 'झाँसी में विकास महाकुंभ: बुंदेलखंड एक्सप्रेसवे कनेक्टिंग कॉरिडोर को हरी झंडी',
    content: 'उत्तर प्रदेश सरकार और जिला प्रशासन झाँसी द्वारा ऐतिहासिक नगरी के चतुर्मुखी विकास हेतु नए कनेक्टिविटी प्रोजेक्ट को स्वीकृति प्रदान की गई है। इस परियोजना से झाँसी, मऊरानीपुर, कटेरा और आसपास के ग्रामीण अंचलों का सीधा संपर्क तीव्र गति से स्थापित होगा।\n\nग्राउंड रिपोर्ट के अनुसार, व्यापारियों और छात्र वर्ग में इस घोषणा से भारी उत्साह है। वार्ता एक्स न्यूज़ मीडिया टीम ने स्थानीय जनप्रतिनिधियों एवं नागरिकों से विशेष संवाद किया।',
    category: NewsCategory.LOCAL,
    imageUrl: '/input_file_1.png',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    views: 1240,
    likes: 95,
    authorName: 'हृद्यांश गुप्ता',
    authorRole: 'चैनल हेड व मुख्य संपादक',
    isBreaking: true
  },
  {
    id: 'varta-post-2',
    title: 'कटेरा देहात ग्राउंड कवरेज: किसानों की सिंचाई समस्याओं पर प्रशासन की त्वरित कार्यवाही',
    content: 'कटेरा देहात और समीपवर्ती गांवों में रबी फसल की सिंचाई हेतु विद्युत आपूर्ति एवं नहरों में पानी छोड़े जाने की मांग पर स्थानीय प्रशासन ने तत्काल संज्ञान लिया है।\n\nवार्ता एक्स न्यूज़ के कटेरा देहात रिपोर्टर हेमंत राजपूत ने मौके पर पहुंचकर किसानों की समस्याओं को प्रमुखता से उठाया था, जिसके पश्चात संबंधित विभागीय अधिकारियों ने मौके का मुआयना कर आवश्यक दिशा-निर्देश जारी किए।',
    category: NewsCategory.LOCAL,
    imageUrl: '/input_file_4.png',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    views: 890,
    likes: 68,
    authorName: 'हेमंत राजपूत',
    authorRole: 'कटेरा देहात रिपोर्टर',
    isBreaking: false
  },
  {
    id: 'varta-post-3',
    title: 'डिजिटल इंडिया मिशन: वीरांगना झाँसी में युवा नवाचार और आईटी हब की स्थापना',
    content: 'झाँसी के युवाओं को स्थानीय स्तर पर तकनीकी प्रशिक्षण एवं रोजगार के अवसर उपलब्ध कराने के उद्देश्य से आधुनिक डिजिटल सेंटर की शुरुआत हुई।\n\nइस पहल से बुंदेलखंड के युवाओं को महानगरों की ओर पलायन करने की बाध्यता कम होगी और स्थानीय स्तर पर आत्मनिर्भरता बढ़ेगी। रिपोर्ट: वार्ता एक्स ब्यूरो न्यूज़ डेस्क।',
    category: NewsCategory.NATIONAL,
    imageUrl: '/input_file_3.png',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 745,
    likes: 54,
    authorName: 'अंकेश गुप्ता',
    authorRole: 'कटेरा ग्राउंड रिपोर्टर',
    isBreaking: false
  }
];

export function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    console.warn(`Storage quota warning for key "${key}":`, e);
    return false;
  }
}

export function getStoredPosts(): NewsPost[] {
  const stored = localStorage.getItem('varta_x_posts');
  if (stored) {
    try {
      const parsed: NewsPost[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored posts', e);
    }
  }
  safeStorageSet('varta_x_posts', JSON.stringify(INITIAL_POSTS));
  return INITIAL_POSTS;
}

export function savePosts(posts: NewsPost[]): void {
  safeStorageSet('varta_x_posts', JSON.stringify(posts));
}

export function getStoredTeam(): TeamMember[] {
  const stored = localStorage.getItem('varta_x_team');
  if (stored) {
    try {
      let parsed: TeamMember[] = JSON.parse(stored);
      // Filter out Ramesh Dubey completely
      parsed = parsed.filter(m => !m.name.toLowerCase().includes('ramesh') && m.id !== 'team-2');

      // Migrate Ansh Gupta to Hradyansh Gupta & update default contact numbers and emails if missing
      parsed = parsed.map(m => {
        if (m.name.toLowerCase().includes('hradyansh') || (m.name.toLowerCase().includes('ansh gupta') && !m.name.toLowerCase().includes('ankush') && !m.name.toLowerCase().includes('ankesh'))) {
          return { ...m, name: 'Hradyansh Gupta', imageUrl: m.imageUrl || '/input_file_6.png', phone: m.phone || '+91 6393874723', email: m.email || 'uniqueansh2265@gmail.com' };
        }
        if (m.name.toLowerCase().includes('hemant')) {
          return { ...m, name: 'Hemant Rajput', role: m.role || 'कटेरा देहात रिपोर्टर (Katera Dehat Reporter)', imageUrl: m.imageUrl || '/input_file_4.png', phone: m.phone || '+91 9198879528', email: m.email || 'hemantrajpoota786@gmail.com' };
        }
        if (m.name.toLowerCase().includes('ankush') || m.name.toLowerCase().includes('ankesh')) {
          return { ...m, name: 'Ankesh Gupta', role: m.role || 'कटेरा रिपोर्टर (Katera Reporter)', imageUrl: m.imageUrl || '/input_file_5.png', phone: m.phone || '+91 9598857714', email: m.email || 'guptaankesh1979@gmail.com' };
        }
        return m;
      });

      const hasHemant = parsed.some(m => m.name.toLowerCase().includes('hemant'));
      const hasAnkesh = parsed.some(m => m.name.toLowerCase().includes('ankesh') || m.name.toLowerCase().includes('ankush'));
      
      let updated = [...parsed];
      if (!hasHemant) {
        updated.unshift(INITIAL_TEAM[0]);
      }
      if (!hasAnkesh) {
        updated.splice(1, 0, INITIAL_TEAM[1]);
      }
      
      safeStorageSet('varta_x_team', JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error parsing stored team', e);
    }
  }
  safeStorageSet('varta_x_team', JSON.stringify(INITIAL_TEAM));
  return INITIAL_TEAM;
}

export function saveTeam(team: TeamMember[]): void {
  safeStorageSet('varta_x_team', JSON.stringify(team));
}

export const INITIAL_VIDEOS: VideoBulletin[] = [
  {
    id: 'vid-varta-1',
    title: 'झाँसी विकास कॉरिडोर ग्राउंड रिपोर्टिंग | लाइव कवरेज',
    description: 'वार्ता एक्स न्यूज़ मीडिया की विशेष ग्राउंड कवरेज। ऐतिहासिक झाँसी नगरी से ताज़ा हलचल और विकास कार्यों का प्रत्यक्ष जायजा।',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 1420,
    likes: 89,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    category: 'Local',
    duration: '04:15',
    authorName: 'हृद्यांश गुप्ता',
    isLive: true
  },
  {
    id: 'vid-varta-2',
    title: 'कटेरा देहात: ग्रामीण क्षेत्र में पानी और सड़क परियोजनाओं का ग्राउंड रिव्यू',
    description: 'हेमंत राजपूत (कटेरा देहात रिपोर्टर) द्वारा सीधी बातचीत ग्रामीणों के साथ। समस्याओं के त्वरित निस्तारण पर विशेष फोकस।',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    views: 980,
    likes: 64,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    category: 'Breaking',
    duration: '03:40',
    authorName: 'हेमंत राजपूत',
    isLive: false
  }
];

export function getStoredVideos(): VideoBulletin[] {
  const stored = localStorage.getItem('varta_x_videos');
  if (stored) {
    try {
      const parsed: VideoBulletin[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored videos', e);
    }
  }
  safeStorageSet('varta_x_videos', JSON.stringify(INITIAL_VIDEOS));
  return INITIAL_VIDEOS;
}

export function saveVideos(videos: VideoBulletin[]): void {
  safeStorageSet('varta_x_videos', JSON.stringify(videos));
}
