/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlusCircle, Image, CheckCircle, ShieldAlert, Radio, HelpCircle, Trash2, MailOpen, User, Users, Edit2, Check, RefreshCw, Sparkles, Wand2, Video, Tv, Database, CloudUpload, Key, Link as LinkIcon, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { NewsPost, NewsCategory, TeamMember, VideoBulletin } from '../types';
import { resolveImageUrl } from '../utils/imageHelper';
import { AdminProfile, loginAdmin, logoutAdmin, getActiveSession } from '../services/authService';
import { checkMigrationStatus, syncLocalDataToSupabase, MigrationSummary } from '../services/migrationService';
import { isSupabaseConfigured, getSupabaseCredentials, saveSupabaseCredentials, testSupabaseConnection } from '../lib/supabase';
import { uploadMediaFile } from '../services/storageService';
import { fetchContactQueries, deleteContactQuery } from '../services/queryService';

interface AdminPanelProps {
  onAddPost: (newPost: Omit<NewsPost, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  postsCount: number;
  channelLogo: string;
  onUpdateChannelLogo: (logo: string) => void;
  anshPhoto: string;
  onUpdateAnshPhoto: (photo: string) => void;
  teamMembers: TeamMember[];
  onUpdateTeam: (team: TeamMember[]) => void;
  videos: VideoBulletin[];
  onAddVideo: (newVideo: Omit<VideoBulletin, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  onDeleteVideo: (id: string) => void;
}

const ASSET_PRESETS = [
  { label: 'VARTA X 3D लोगो (Default Official Logo)', value: '/input_file_0.png' },
  { label: 'हेमंत राजपूत जी (Hemant Rajput - कटेरा देहात)', value: '/input_file_4.png' },
  { label: 'अंकेश गुप्ता जी (Ankesh Gupta - कटेरा ग्राउंड)', value: '/input_file_5.png' },
  { label: 'हृदयांश गुप्ता जी (Hradyansh Gupta - चैनल हेड)', value: '/input_file_6.png' },
  { label: 'वार्ता एक्स न्यूज़ डेस्क टीम (Young Reporters Team)', value: '/input_file_2.png' },
  { label: 'महोत्सव कवरेज - परिवार (Festive Gathering coverage)', value: '/input_file_1.png' },
  { label: 'वार्ता एक्स पोस्टर (India Gate Banner Poster)', value: '/input_file_3.png' }
];

export default function AdminPanel({ 
  onAddPost, 
  postsCount, 
  channelLogo, 
  onUpdateChannelLogo, 
  anshPhoto, 
  onUpdateAnshPhoto,
  teamMembers,
  onUpdateTeam,
  videos,
  onAddVideo,
  onDeleteVideo
}: AdminPanelProps) {
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Supabase Migration & Database Connection State
  const [migrationStatus, setMigrationStatus] = useState<MigrationSummary | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Supabase Live Credentials Configuration
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseCredentials().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseCredentials().anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedSqlSchema, setCopiedSqlSchema] = useState(false);

  // Check active session on mount
  useEffect(() => {
    getActiveSession().then(profile => {
      if (profile) {
        setIsAuthenticated(true);
        setCurrentAdmin(profile);
      }
    });

    checkMigrationStatus().then(setMigrationStatus);
  }, []);

  const handleSaveAndTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestMsg(null);

    const cleanUrl = supabaseUrlInput.trim();
    const cleanKey = supabaseKeyInput.trim();

    saveSupabaseCredentials(cleanUrl, cleanKey);

    const res = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTestingSupabase(false);
    setSupabaseTestMsg({
      success: res.success,
      text: res.message
    });

    // Refresh migration stats
    const updatedStatus = await checkMigrationStatus();
    setMigrationStatus(updatedStatus);
  };

  const handleCopySchemaSql = () => {
    const sqlText = `-- Varta X News Media Live Database Schema
-- Run this in Supabase -> SQL Editor -> Run
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    author_name TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    author_role TEXT DEFAULT 'संवाददाता',
    is_breaking BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts public read" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Posts insert" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Posts update" ON public.posts FOR UPDATE USING (true);
CREATE POLICY "Posts delete" ON public.posts FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_card TEXT NOT NULL,
    joining_date TEXT NOT NULL,
    photo_url TEXT,
    bio TEXT,
    badge TEXT DEFAULT 'सत्यापित (Verified)',
    social_links JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team public read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team insert" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Team update" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Team delete" ON public.team_members FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    category TEXT DEFAULT 'Local',
    duration TEXT DEFAULT '03:15',
    author_name TEXT DEFAULT 'वार्ता एक्स रिपोर्टर',
    is_live BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos public read" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Videos insert" ON public.videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Videos update" ON public.videos FOR UPDATE USING (true);
CREATE POLICY "Videos delete" ON public.videos FOR DELETE USING (true);
`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSqlSchema(true);
    setTimeout(() => setCopiedSqlSchema(false), 4000);
  };

  // Password management state
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPhoneInput, setNewPhoneInput] = useState(() => localStorage.getItem('varta_x_admin_phone') || '6393874723');
  const [passChangeSuccess, setPassChangeSuccess] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  // Video bulletin form state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoCategory, setVideoCategory] = useState('Local');
  const [videoDuration, setVideoDuration] = useState('03:15');
  const [videoAuthor, setVideoAuthor] = useState('अंश गुप्ता (चैनल हेड)');
  const [videoIsLive, setVideoIsLive] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState(false);

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoDescription || !videoUrlInput) return;

    onAddVideo({
      title: videoTitle,
      description: videoDescription,
      videoUrl: videoUrlInput,
      category: videoCategory,
      duration: videoDuration,
      authorName: videoAuthor,
      isLive: videoIsLive
    });

    setVideoTitle('');
    setVideoDescription('');
    setVideoUrlInput('');
    setVideoIsLive(false);
    setVideoSuccess(true);
    setTimeout(() => setVideoSuccess(false), 3000);
  };

  // Post form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.LOCAL);
  const [imageUrl, setImageUrl] = useState('/input_file_0.png');
  const [authorName, setAuthorName] = useState('Hradyansh Gupta');
  const [authorRole, setAuthorRole] = useState('चैनल हेड');
  const [isBreaking, setIsBreaking] = useState(false);
  const [customImage, setCustomImage] = useState('');
  const [success, setSuccess] = useState(false);
  const [queries, setQueries] = useState<any[]>([]);

  // Team Management Form State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberBio, setMemberBio] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberImageUrl, setMemberImageUrl] = useState('');
  const [memberPhotoUploading, setMemberPhotoUploading] = useState(false);
  const [memberSuccess, setMemberSuccess] = useState(false);
  const [memberWarning, setMemberWarning] = useState('');
  
  // Custom uploaded file variables
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState(false);
  const [anshUploading, setAnshUploading] = useState(false);
  const [anshSuccess, setAnshSuccess] = useState(false);

  // AI news generator state variables
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState<NewsCategory>(NewsCategory.LOCAL);
  const [aiIsBreaking, setAiIsBreaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [aiError, setAiError] = useState('');

  // AI News Generator Handler Function
  const handleGenerateAINews = async () => {
    setIsGenerating(true);
    setAiError('');
    setAiSuccess(false);

    try {
      const response = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          category: aiCategory,
          isBreaking: aiIsBreaking
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'एआई रिस्पॉन्स प्राप्त करने में असमर्थ।');
      }

      const generatedPost = data.post;
      
      // Update form fields
      setTitle(generatedPost.title);
      setContent(generatedPost.content);
      setCategory(generatedPost.category as NewsCategory);
      setIsBreaking(generatedPost.isBreaking);
      setAuthorName(generatedPost.authorName);
      setAuthorRole(generatedPost.authorRole);
      
      if (generatedPost.imageUrl) {
        setCustomImage(generatedPost.imageUrl);
        setImageUrl(generatedPost.imageUrl);
      }

      setAiSuccess(true);
      setAiPrompt('');
      
      // Auto scroll down to the main editor
      setTimeout(() => {
        const el = document.getElementById('news-form-start');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        setAiSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error('Error generating AI news:', err);
      setAiError(err.message || 'एआई समाचार तैयार करने में असमर्थ। कृपया पुनः प्रयास करें।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load user inquiries
  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem('varta_x_queries');
      if (stored) {
        setQueries(JSON.parse(stored));
      }
    }
  }, [isAuthenticated]);

  const handleDeleteQuery = (id: string) => {
    const updated = queries.filter(q => q.id !== id);
    setQueries(updated);
    localStorage.setItem('varta_x_queries', JSON.stringify(updated));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomImage(reader.result as string);
      setThumbnailUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateChannelLogo(reader.result as string);
      setLogoUploading(false);
      setLogoSuccess(true);
      setTimeout(() => setLogoSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleAnshPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnshUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateAnshPhoto(reader.result as string);
      setAnshUploading(false);
      setAnshSuccess(true);
      setTimeout(() => setAnshSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMemberPhotoUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMemberImageUrl(reader.result as string);
      setMemberPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) {
      setMemberWarning('कृपया नाम और पद (Role) अवश्य दर्ज करें।');
      return;
    }

    if (editingMemberId) {
      // Edit existing
      const updated = teamMembers.map(m => {
        if (m.id === editingMemberId) {
          return {
            ...m,
            name: memberName,
            role: memberRole,
            bio: memberBio,
            phone: memberPhone,
            email: memberEmail,
            imageUrl: memberImageUrl || m.imageUrl
          };
        }
        return m;
      });
      onUpdateTeam(updated);
      
      // Special check: If editing leader (Ansh Gupta / team-1), also sync his main photo state
      if (editingMemberId === 'team-1' && memberImageUrl) {
        onUpdateAnshPhoto(memberImageUrl);
      }
      
      setEditingMemberId(null);
    } else {
      // Create new
      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        name: memberName,
        role: memberRole,
        bio: memberBio,
        phone: memberPhone,
        email: memberEmail,
        imageUrl: memberImageUrl || '/input_file_0.png'
      };
      onUpdateTeam([...teamMembers, newMember]);
    }

    // Reset form
    setMemberName('');
    setMemberRole('');
    setMemberBio('');
    setMemberPhone('');
    setMemberEmail('');
    setMemberImageUrl('');
    setMemberWarning('');
    setMemberSuccess(true);
    setTimeout(() => setMemberSuccess(false), 3000);
  };

  const handleEditMemberClick = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberBio(member.bio);
    setMemberPhone(member.phone || '');
    setMemberEmail(member.email || '');
    setMemberImageUrl(member.imageUrl);
    // Scroll form into view gently
    const el = document.getElementById('team-form-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteMember = (id: string) => {
    if (id === 'team-1') {
      setMemberWarning('चैनल हेड अंश गुप्ता को हटाया नहीं जा सकता!');
      setTimeout(() => setMemberWarning(''), 4000);
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    onUpdateTeam(updated);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setMemberName('');
    setMemberRole('');
    setMemberBio('');
    setMemberPhone('');
    setMemberEmail('');
    setMemberImageUrl('');
    setMemberWarning('');
  };

  // Strict reporter credential verification gate with Supabase Auth
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = adminPhone.trim();
    const trimmedPassword = adminPassword.trim();

    if (!trimmedPhone || !trimmedPassword || isLoggingIn) {
      setErrorMsg('कृपया रिपोर्टर आईडी एवं प्रेस पासवर्ड दोनों अनिवार्य रूप से दर्ज करें!');
      return;
    }

    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      const res = await loginAdmin(trimmedPhone, trimmedPassword);
      if (res.success) {
        setIsAuthenticated(true);
        if (res.profile) {
          setCurrentAdmin(res.profile);
        }
        setErrorMsg('');
      } else {
        setErrorMsg(res.error || 'गलत रिपोर्टर आईडी या प्रेस पासवर्ड! (Incorrect Reporter ID or Press Password!)');
      }
    } catch (err: any) {
      setErrorMsg('लॉगिन में समस्या आई। पुनः प्रयास करें।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError('');
    setPassChangeSuccess('');

    const storedPassword = localStorage.getItem('varta_x_admin_password') || 'Ansh@2012';

    if (oldPasswordInput !== storedPassword && oldPasswordInput !== 'Ansh@2012') {
      setPassChangeError('वर्तमान पुराना पासवर्ड गलत है! (Current password is incorrect)');
      return;
    }

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setPassChangeError('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए! (New password must be at least 4 chars)');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPassChangeError('नया पासवर्ड और पुष्टि पासवर्ड आपस में मेल नहीं खाते! (Passwords do not match)');
      return;
    }

    // Save to localStorage permanently
    localStorage.setItem('varta_x_admin_password', newPasswordInput);
    if (newPhoneInput.trim()) {
      localStorage.setItem('varta_x_admin_phone', newPhoneInput.trim());
    }

    setPassChangeSuccess('🎉 वेब पोर्टल पासवर्ड व रिपोर्टर आईडी सफलतापूर्वक बदल दिया गया है! भविष्य में इसी नए पासवर्ड से लॉगिन करें।');
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => setPassChangeSuccess(''), 6000);
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    setAdminPhone('');
    setAdminPassword('');
  };

  const handleRunMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await syncLocalDataToSupabase();
      if (res.success) {
        setMigrationResult({
          success: true,
          message: `✅ माइग्रेशन सफल! ${res.syncedPosts} समाचार, ${res.syncedTeam} टीम सदस्य, और ${res.syncedVideos} वीडियो Supabase PostgreSQL पर सुरक्षित हो गए।`
        });
        const updatedStatus = await checkMigrationStatus();
        setMigrationStatus(updatedStatus);
      } else {
        setMigrationResult({
          success: false,
          message: `❌ माइग्रेशन विफल: ${res.error}`
        });
      }
    } catch (err: any) {
      setMigrationResult({
        success: false,
        message: `त्रुटि: ${err.message}`
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !authorName) {
      alert("कृपया सभी आवश्यक फ़ील्ड भरें! (Please fill all fields)");
      return;
    }

    const finalImage = customImage ? customImage : imageUrl;

    onAddPost({
      title,
      content,
      category,
      imageUrl: finalImage,
      authorName,
      authorRole,
      isBreaking
    });

    setSuccess(true);
    // Reset form fields
    setTitle('');
    setContent('');
    setCustomImage('');
    setIsBreaking(false);

    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl shadow-2xl border border-slate-200 p-7 sm:p-9 relative overflow-hidden text-slate-800">
        {/* Visual Border accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700"></div>
        <div className="text-center mb-7">
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl w-fit mx-auto mb-3.5 border border-red-200 shadow-sm">
            <Radio className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">वार्ता एक्स ब्रॉडकास्ट स्टूडियो</h2>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            समाचार पोस्ट करने व लाइव अलर्ट भेजने के लिए क्रेडेंशियल दर्ज करें
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              रिपोर्टर आईडी / मोबाइल नंबर
            </label>
            <input 
              type="text" 
              placeholder="रिपोर्टर आईडी या मोबाइल नंबर दर्ज करें" 
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all text-slate-900 font-semibold font-mono shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              प्रेस पासवर्ड (Press Password)
            </label>
            <input 
              type="password" 
              placeholder="प्रेस पासवर्ड दर्ज करें" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white transition-all text-slate-900 font-semibold font-mono shadow-xs"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-sm font-bold text-white py-3.5 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-[0.99] border border-red-700/30"
          >
            रिपोर्टर पोर्टल में प्रवेश करें &rarr;
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-9 relative my-6 text-slate-800">
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-t-3xl"></div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5 mb-7">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5 tracking-tight">
            <PlusCircle className="h-6 w-6 text-red-600" />
            नवीन समाचार प्रकाशित करें (Publish News Report)
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            सभी विवरण दर्ज कर लाइव फ़ीड और पुश अधिसूचना प्रसारित करें।
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-red-50 text-red-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-red-200 flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            कार्यरत रिपोर्टर: अंश गुप्ता
          </div>
          <button 
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
            title="लॉगआउट करें"
          >
            लॉगआउट
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-center gap-3 shadow-sm animate-[fadeIn_0.3s_ease-out]">
          <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-950">समाचार सफलतापूर्वक प्रसारित हो गया है!</p>
            <p className="text-xs text-emerald-700 mt-0.5 font-medium">
              सभी सक्रीय दर्शकों को पुश और इन-ऐप लाइव अलर्ट भेज दिया गया है।
            </p>
          </div>
        </div>
      )}

      {/* VARTA X AI AUTOMATIC NEWS GENERATOR CARD */}
      <div className="mb-8 p-6 bg-gradient-to-br from-red-50/80 via-white to-orange-50/60 border border-red-200/80 rounded-2xl relative shadow-sm overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="p-2.5 bg-red-600 text-white rounded-xl shadow-xs flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              वार्ता एक्स एआई न्यूज़ रूम (Varta X AI News Room)
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-300 uppercase tracking-wider">AI Active</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              कीवर्ड या घटना का नाम दर्ज करें, एआई तुरंत संपूर्ण हिन्दी समाचार लेख (markdown समेत) ड्राफ्ट कर देगा।
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              खबर का संकेत / मुख्य विचार (Topic / Headline Outline)
            </label>
            <textarea 
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="जैसे: 'झाँसी किले में उमड़ा पर्यटकों का जनसैलाब' या 'झाँसी में नया बाईपास हाईवे स्वीकृत'। खाली छोड़ने पर एआई स्वचालित रूप से ताज़ा रोमांचक खबर चुनेगा..."
              className="w-full text-xs px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 font-medium leading-relaxed transition shadow-xs"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                इच्छित श्रेणी (Preferred Category)
              </label>
              <select 
                value={aiCategory}
                onChange={(e) => setAiCategory(e.target.value as NewsCategory)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 cursor-pointer focus:outline-none focus:border-red-600 font-semibold shadow-xs"
              >
                {Object.values(NewsCategory).map(cat => (
                  <option key={cat} value={cat} className="bg-white text-slate-800">{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6 pl-1">
              <input 
                type="checkbox" 
                id="aiIsBreaking" 
                checked={aiIsBreaking}
                onChange={(e) => setAiIsBreaking(e.target.checked)}
                className="h-4.5 w-4.5 text-red-600 focus:ring-red-500 border-slate-300 rounded cursor-pointer accent-red-600"
              />
              <label htmlFor="aiIsBreaking" className="ml-2 block text-xs font-bold text-red-700 uppercase tracking-wide cursor-pointer flex items-center gap-1">
                🔴 ब्रेकिंग न्यूज़ के रूप में ड्राफ्ट करें? (Breaking News draft?)
              </label>
            </div>
          </div>

          {aiError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-600" />
              <span className="font-semibold">{aiError}</span>
            </div>
          )}

          {aiSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span className="font-semibold">✓ एआई ने शानदार समाचार ड्राफ्ट कर नीचे के संपादक फॉर्म में भर दिया है! कृपया नीचे स्क्रॉल कर समीक्षा करें और ब्रॉडकास्ट करें।</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateAINews}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition duration-200 cursor-pointer ${
                isGenerating 
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-600/20 active:scale-98'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin text-red-600" />
                  <span>वार्ता एक्स एआई न्यूज़ रूम खबर लिख रहा है...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4.5 w-4.5" />
                  <span>🪄 वार्ता एक्स एआई से तुरंत समाचार ड्राफ्ट करें (Generate News Draft)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <form id="news-form-start" onSubmit={handleSubmit} className="space-y-6 text-slate-800 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Author & Categorization details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                शीर्षक (News Title) *
              </label>
              <input 
                type="text" 
                required
                placeholder="समाचार का आकर्षक मुख्य शीर्षक दर्ज करें..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white font-bold shadow-xs transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  रिपोर्टर का नाम (Reporter Name)
                </label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  list="reporters-list"
                  placeholder="उदा. Hemant Rajput, Ankush Gupta..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-semibold shadow-xs transition"
                />
                <datalist id="reporters-list">
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.role}</option>
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {teamMembers.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setAuthorName(m.name);
                        setAuthorRole(m.role);
                      }}
                      className="text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg transition font-medium cursor-pointer"
                    >
                      + {m.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  रिपोर्टर की भूमिका (Role)
                </label>
                <input 
                  type="text" 
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white font-semibold shadow-xs transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  श्रेणी (Category)
                </label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 cursor-pointer focus:outline-none focus:border-red-600 focus:bg-white font-semibold shadow-xs"
                >
                  {Object.values(NewsCategory).map(cat => (
                    <option key={cat} value={cat} className="bg-white text-slate-800">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-8 pl-2">
                <input 
                  type="checkbox" 
                  id="isBreaking" 
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="h-4.5 w-4.5 text-red-600 focus:ring-red-500 border-slate-300 rounded cursor-pointer accent-red-600"
                />
                <label htmlFor="isBreaking" className="ml-2 block text-xs font-bold text-red-700 uppercase tracking-wide cursor-pointer flex items-center gap-1">
                  🔴 ब्रेकिंग न्यूज़ अलर्ट (Send Push?)
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Media select */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span>थंबनेल छवि चुनें (Choose Thumbnail Asset)</span>
                <span className="text-[10px] text-slate-500 font-normal">चैनल के वास्तविक चित्र</span>
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                {ASSET_PRESETS.map((preset) => (
                  <label 
                    key={preset.value}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${imageUrl === preset.value && !customImage ? 'bg-red-50 border-red-300 text-red-800 font-semibold shadow-xs' : 'hover:bg-white border-transparent text-slate-700'}`}
                  >
                    <input 
                      type="radio" 
                      name="presetImg"
                      value={preset.value}
                      checked={imageUrl === preset.value && !customImage}
                      onChange={() => {
                        setImageUrl(preset.value);
                        setCustomImage('');
                      }}
                      className="accent-red-600"
                    />
                    <img 
                      src={preset.value} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded-md shadow-xs shrink-0 border border-slate-200" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate">{preset.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Image className="h-4 w-4 text-red-600" />
                  या स्वयं की थंबनेल फोटो अपलोड करें (Upload News Photo)
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  स्थानीय फाइल
                </span>
              </label>

              <div className="flex flex-col gap-2">
                <div className="relative group border-2 border-dashed border-slate-300 hover:border-red-400 rounded-xl p-3.5 bg-slate-50 hover:bg-white flex items-center justify-between gap-3 text-xs transition duration-200 cursor-pointer shadow-xs">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 bg-red-50 rounded-lg border border-red-200 text-red-600">
                      <Image className="h-4 w-4" />
                    </span>
                    <span className="text-slate-700 font-bold">
                      {thumbnailUploading ? 'प्रोसेसिंग...' : customImage ? '✓ नयी थंबनेल चयनित है' : 'गैलरी / फाइल से फोटो चुनें'}
                    </span>
                  </div>
                  <button type="button" className="bg-red-600 hover:bg-red-700 text-[11px] text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition">
                    फ़ाइल खोजें (Browse)
                  </button>
                </div>

                {customImage && (
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <img 
                      src={customImage} 
                      alt="Thumbnail Preview" 
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-300" 
                    />
                    <div className="flex-1 text-xs">
                      <span className="text-emerald-800 block font-bold">✓ फोटो सफलतापूर्वक लोड हो गयी है</span>
                      <button 
                        type="button" 
                        onClick={() => setCustomImage('')}
                        className="text-red-600 hover:underline font-bold cursor-pointer text-[11px] mt-0.5"
                      >
                        हटाएं (Remove Image)
                      </button>
                    </div>
                  </div>
                )}

                <input 
                  type="text" 
                  placeholder="अथवा इंटरनेट से कोई अन्य छवि लिंक डालें (Optional URL)"
                  value={customImage.startsWith('data:') ? '' : customImage}
                  onChange={(e) => setCustomImage(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white shadow-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            विस्तृत खबर का विवरण (News Body Content) *
          </label>
          <textarea 
            required
            rows={5}
            placeholder="मुख्य समाचार का पूरा ब्यौरा यहाँ हिन्दी या अंग्रेजी में लिखें..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-medium leading-relaxed shadow-xs"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="button"
            onClick={() => setIsAuthenticated(false)}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
          >
            साइन आउट (Sign out)
          </button>
          <button 
            type="submit"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-xs font-bold text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2 border border-red-700/30"
          >
            🚀 लाइव न्यूज़ ब्रॉडकास्ट करें &amp; अलर्ट भेजें
          </button>
        </div>
      </form>

      {/* CHANNEL LOGO & BRANDING CUSTOMIZER CARD */}
      <div className="mt-8 pt-8 border-t border-slate-200 space-y-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100">
              <Radio className="h-5 w-5 animate-pulse text-red-600" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">चैनल मुख्य लोगो सेटिंग्स (Channel Branding Settings)</h3>
              <p className="text-xs text-slate-500">वेबसाइट का मुख्य लोगो व आइकॉन यहाँ से कभी भी बदलें</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            
            {/* Current Active logo info */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <img 
                src={resolveImageUrl(channelLogo)} 
                alt="Active Channel Logo" 
                className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">सक्रिय मुख्य लोगो (Active)</span>
                <span className="text-xs text-slate-900 font-extrabold font-mono block truncate max-w-[150px]">
                  {channelLogo.startsWith('data:') ? 'कस्टम अपलोडेड लोगो' : 'Varta X डिफ़ॉल्ट'}
                </span>
                {channelLogo.startsWith('data:') && (
                  <button 
                    type="button"
                    onClick={() => {
                      onUpdateChannelLogo('/input_file_0.png');
                      localStorage.removeItem('varta_channel_logo');
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold mt-1 cursor-pointer block underline"
                  >
                    रीसेट करें (Reset to Default)
                  </button>
                )}
              </div>
            </div>

            {/* Upload form area */}
            <div className="relative group border border-dashed border-slate-300 hover:border-red-500 rounded-xl p-3.5 bg-slate-50 hover:bg-red-50/20 flex items-center justify-between gap-3 text-xs transition duration-200">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-100 rounded-lg text-red-600">
                  <Image className="h-4 w-4" />
                </span>
                <span className="text-slate-700 font-bold text-xs">
                  {logoUploading ? 'लोड़ हो रहा है...' : 'नया मुख्य लोगो अपलोड करें'}
                </span>
              </div>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 shadow-sm transition">
                अपलोड
              </button>
            </div>

          </div>

          {logoSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>✓ बधाई हो! वार्ता एक्स न्यूज़ का मुख्य लोगो सफलतापूर्वक बदल दिया गया है और पूरे पोर्टल पर लागू हो गया है।</span>
            </div>
          )}

        </div>
      </div>

      {/* ANSH GUPTA PROFILE PHOTO CUSTOMIZER CARD */}
      <div className="mt-8 pt-8 border-t border-slate-200 space-y-4">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100">
              <User className="h-5 w-5 text-red-600" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">हृदयांश गुप्ता (चैनल हेड) प्रोफाइल फोटो (Hradyansh Gupta Team Photo Settings)</h3>
              <p className="text-xs text-slate-500">हृदयांश गुप्ता (चैनल हेड) की प्रोफाइल फोटो को यहाँ से बदलें (टीम पेज पर दिखाई देगी)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            
            {/* Current Active Photo Info */}
            <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <img 
                src={resolveImageUrl(anshPhoto)} 
                alt="हृदयांश गुप्ता" 
                className="h-16 w-16 object-cover object-top rounded-xl border border-slate-200 p-0.5 bg-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">सक्रिय प्रोफाइल फोटो (Active)</span>
                <span className="text-xs text-slate-900 font-extrabold font-mono block truncate max-w-[150px]">
                  {anshPhoto.startsWith('data:') ? 'कस्टम अपलोडेड फोटो' : 'हृदयांश गुप्ता डिफ़ॉल्ट'}
                </span>
                {anshPhoto.startsWith('data:') && (
                  <button 
                    type="button"
                    onClick={() => {
                      onUpdateAnshPhoto('/input_file_6.png');
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-bold mt-1 cursor-pointer block underline"
                  >
                    रीसेट करें (Reset to Default)
                  </button>
                )}
              </div>
            </div>

            {/* Upload Form Area */}
            <div className="relative group border border-dashed border-slate-300 hover:border-red-500 rounded-xl p-3.5 bg-slate-50 hover:bg-red-50/20 flex items-center justify-between gap-3 text-xs transition duration-200">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAnshPhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-100 rounded-lg text-red-600">
                  <Image className="h-4 w-4" />
                </span>
                <span className="text-slate-700 font-bold text-xs">
                  {anshUploading ? 'अपलोड हो रही है...' : 'नई टीम फोटो अपलोड करें'}
                </span>
              </div>
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 shadow-sm transition">
                अपलोड
              </button>
            </div>

          </div>

          {anshSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>✓ बधाई हो! हृदयांश गुप्ता की प्रोफाइल फोटो सफलतापूर्वक बदल दी गई है और टीम पेज पर लागू हो गई है।</span>
            </div>
          )}

        </div>
      </div>

      {/* TEAM MANAGEMENT SYSTEM */}
      <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
        <div id="team-form-anchor" className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100">
                <Users className="h-5 w-5 text-red-600" />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  {editingMemberId ? 'टीम सदस्य संपादित करें (Edit Team Member)' : 'हमारी टीम का प्रबंधन (Team Management)'}
                </h3>
                <p className="text-xs text-slate-500">वेबसाइट पर टीम के सदस्यों को यहाँ से जोड़ें, संपादित करें या हटाएं</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAddOrUpdateMember} className="space-y-4 text-xs bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">सदस्य का नाम (Member Name) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="उदा. अंश गुप्ता"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">पद / डेजिग्नेशन (Role / Designation) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="उदा. चैनल हेड / सीनियर रिपोर्टर"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">मोबाइल नंबर (Phone Number - Optional)</label>
                <input 
                  type="text" 
                  placeholder="उदा. +91 6393874723"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">ईमेल पता (Email Address - Optional)</label>
                <input 
                  type="email" 
                  placeholder="उदा. uniqueansh2265@gmail.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">परिचय / जीवनी (Bio Description)</label>
              <textarea 
                rows={2}
                placeholder="सदस्य के बारे में कुछ पंक्तियाँ लिखें..."
                value={memberBio}
                onChange={(e) => setMemberBio(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-semibold"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">फोटो यूआरएल या कस्टम छवि (Photo URL / Link)</label>
                <input 
                  type="text" 
                  placeholder="अथवा छवि का इंटरनेट लिंक डालें"
                  value={memberImageUrl.startsWith('data:') ? '' : memberImageUrl}
                  onChange={(e) => setMemberImageUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">फोटो अपलोड करें (Upload Photo)</label>
                <div className="relative border border-dashed border-slate-300 hover:border-red-500 rounded-xl p-2 bg-white flex items-center justify-between text-xs transition">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleMemberPhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span className="text-slate-500 pl-2">
                    {memberPhotoUploading ? 'लोड हो रहा है...' : 'फाइल चुनें (Choose File)'}
                  </span>
                  <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    अपलोड
                  </span>
                </div>
              </div>
            </div>

            {memberImageUrl && (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                <img 
                  src={memberImageUrl} 
                  alt="Preview" 
                  className="h-12 w-12 object-cover object-top rounded-lg border border-slate-200"
                />
                <div>
                  <span className="text-xs text-emerald-700 block font-bold">✓ फोटो सफलतापूर्वक लोड हो गयी है</span>
                  {memberImageUrl.startsWith('data:') && (
                    <button 
                      type="button" 
                      onClick={() => setMemberImageUrl('')}
                      className="text-red-600 hover:underline font-bold text-[10px] mt-0.5 cursor-pointer block"
                    >
                      हटाएं (Remove Image)
                    </button>
                  )}
                </div>
              </div>
            )}

            {memberWarning && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                ⚠️ {memberWarning}
              </div>
            )}

            {memberSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>✓ बधाई हो! टीम विवरण सफलतापूर्वक अद्यतन (Updated) कर दिया गया है।</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              {editingMemberId && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-bold cursor-pointer transition text-xs"
                >
                  रद्द करें (Cancel)
                </button>
              )}
              <button 
                type="submit"
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm cursor-pointer transition flex items-center gap-1.5 text-xs"
              >
                {editingMemberId ? (
                  <>
                    <Check className="h-4 w-4" />
                    विवरण सुरक्षित करें (Save Changes)
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    नया सदस्य जोड़ें (Add Member)
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Active Members Grid */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">वर्तमान टीम के सदस्य (Current Team Members)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamMembers.map((member) => (
                <div 
                  key={member.id} 
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs transition"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img 
                      src={resolveImageUrl(member.imageUrl || '/input_file_0.png')} 
                      alt={member.name} 
                      className="h-11 w-11 object-cover object-top rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-slate-900 truncate">{member.name}</h5>
                      <p className="text-[11px] text-red-600 font-semibold truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleEditMemberClick(member)}
                      className="p-2 bg-white hover:bg-slate-200 rounded-lg text-slate-700 transition cursor-pointer border border-slate-200 shadow-xs"
                      title="संपादित करें"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {member.id !== 'team-1' && (
                      <button 
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 transition cursor-pointer shadow-xs"
                        title="हटाएं"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VARTA X VIDEO BULLETIN UPLOAD CENTER */}
      <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100">
            <Video className="h-5 w-5 text-red-600" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              वीडियो बुलेटिन स्टूडियो (Varta X Video Broadcast Studio)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              यहाँ से आप लाइव टीवी कवरेज, यूट्यूब समाचार कड़ियां या धार्मिक अनुष्ठान के सीधे प्रसारण वार्ता एक्स पर अपलोड कर सकते हैं।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <form onSubmit={handleAddVideoSubmit} className="lg:col-span-2 bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2.5 mb-2">
              नया वीडियो ब्रॉडकास्ट पोस्ट करें (Publish Video Broadcast)
            </h4>

            {videoSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span className="font-semibold">✓ वीडियो बुलेटिन सफलता पूर्वक वार्ता एक्स लाइव टीवी पर ब्रॉडकास्ट कर दिया गया है!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">वीडियो का शीर्षक (Video Title)</label>
                <input 
                  type="text" 
                  required
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="जैसे: श्रीजी मंदिर में विशेष दीपदान उत्सव..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">यूट्यूब एम्बेड अथवा वीडियो लिंक (YouTube Embed/Video URL)</label>
                <input 
                  type="url" 
                  required
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="जैसे: https://www.youtube.com/embed/5U77FcozYpA"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">संक्षिप्त विवरण (Video Description)</label>
              <textarea 
                rows={2}
                required
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="खबर या अनुष्ठान के बारे में संक्षिप्त में लिखे जो दर्शकों को नीचे दिखेगा..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">श्रेणी (Category)</label>
                <select 
                  value={videoCategory}
                  onChange={(e) => setVideoCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 cursor-pointer font-semibold"
                >
                  <option value="Local">स्थानीय (Local)</option>
                  <option value="National">राष्ट्रीय (National)</option>
                  <option value="Sports">खेल (Sports)</option>
                  <option value="Entertainment">मनोरंजन (Entertainment)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">अवधि (Duration)</label>
                <input 
                  type="text" 
                  required
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="03:45"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase text-slate-700 tracking-wider">रिपोर्टर (Reporter Name)</label>
                <input 
                  type="text" 
                  required
                  value={videoAuthor}
                  onChange={(e) => setVideoAuthor(e.target.value)}
                  placeholder="अंश गुप्ता (चैनल हेड)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-red-600 font-semibold"
                />
              </div>

              <div className="flex items-center pt-6 pl-2">
                <input 
                  type="checkbox" 
                  id="videoIsLive" 
                  checked={videoIsLive}
                  onChange={(e) => setVideoIsLive(e.target.checked)}
                  className="h-4.5 w-4.5 text-red-600 border-slate-300 rounded cursor-pointer accent-red-600"
                />
                <label htmlFor="videoIsLive" className="ml-2 text-[11px] font-bold text-slate-700 uppercase tracking-wider cursor-pointer">
                  🔴 लाइव टीवी (Live badge)
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition duration-150 cursor-pointer flex items-center justify-center gap-2"
              >
                <Tv className="h-4 w-4" />
                <span>वीडियो बुलेटिन प्रकाशित करें (Broadcast Video)</span>
              </button>
            </div>
          </form>

          {/* Current Videos List */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2.5">
                लाइव टीवी आर्काइव ({videos.length} वीडियो)
              </h4>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {videos.map((vid) => (
                  <div key={vid.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="overflow-hidden space-y-1">
                      <h5 className="font-bold text-slate-900 truncate">{vid.title}</h5>
                      <p className="text-[11px] text-slate-500 font-mono tracking-wider">
                        ⏱ {vid.duration} • {vid.category} • {vid.views} विचार
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => onDeleteVideo(vid.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-600 transition shrink-0 cursor-pointer"
                      title="हटाएं"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-200 text-center mt-4">
              💡 यूट्यूब एम्बेड लिंक का उपयोग करें।
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries Inbox Manager */}
      <div className="mt-10 pt-8 border-t border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MailOpen className="h-4.5 w-4.5 text-red-600" />
              हेड ऑफिस रिसीव्ड इनबॉक्स (Inquiries &amp; Tips Ink)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              वार्ता एक्स न्यूज़ ऐप के संपर्क फ़ॉर्म से आए हुए सन्देश और भर्ती आवेदन यहाँ दिखेंगे।
            </p>
          </div>
          <span className="bg-red-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-full w-fit shadow-xs">
            {queries.length} प्राप्त विवरण
          </span>
        </div>

        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {queries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-2xl font-mono">
              इनबॉक्स अभी खाली है। दर्शक जब 'मुख्यालय संपर्क' पृष्ठ से विवरण भेजेंगे तो वे यहाँ सूचीबद्ध होंगे।
            </div>
          ) : (
            queries.map((q: any) => (
              <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl text-xs space-y-2.5 select-text hover:shadow-sm transition-all text-slate-700">
                <div className="flex justify-between items-center text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{q.name}</span>
                    <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                      प्रस्ताव/खबर
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span>
                      {new Date(q.createdAt).toLocaleDateString('hi-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <button 
                      onClick={() => handleDeleteQuery(q.id)}
                      className="p-1 px-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                      title="हटायें"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-slate-700">
                  <div><strong>📞 संपर्क:</strong> <a href={`tel:${q.phone}`} className="text-red-600 underline font-bold">{q.phone}</a></div>
                  <div><strong>✉️ ईमेल:</strong> <a href={`mailto:${q.email}`} className="text-red-600 underline">{q.email}</a></div>
                </div>

                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium leading-relaxed whitespace-pre-line text-xs">
                  {q.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Supabase Cloud Database & Storage Manager */}
      <div className="mt-10 pt-8 border-t border-slate-200 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-6">
          
          {/* Header & Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 shadow-xs">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                    ⚡ Supabase Live PostgreSQL डेटाबेस व लाइव ब्रॉडकास्ट
                  </h3>
                  {isSupabaseConfigured() ? (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      🟢 डेटाबेस लाइव कनेक्टेड (Connected)
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-xs">
                      🟡 लोकल कैश मोड (Offline / Local Cache)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  जब आप यहाँ समाचार पोस्ट करेंगे, वह सीधे <strong>Supabase PostgreSQL</strong> डेटाबेस में सुरक्षित होगा और लाइव वेबसाइट पर सभी पाठकों को तुरंत दिखेगा।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopySchemaSql}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                {copiedSqlSchema ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">SQL स्कीमा कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-blue-600" />
                    <span>SQL स्कीमा कॉपी करें</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRunMigration}
                disabled={isMigrating}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>सिंक हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    <span>1-Click डेटाबेस सिंक (Local to Cloud)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Database Credentials Form */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Key className="h-4 w-4 text-amber-500" />
                <span>Supabase API क्रेडेंशियल्स (Database Credentials)</span>
              </h4>
              <span className="text-xs text-slate-500">
                (Supabase Dashboard &gt; Project Settings &gt; API)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                  Project URL (https://xxxx.supabase.co)
                </label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 text-slate-900 font-mono text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-600" />
                  Anon Public Key (eyJhbGciOi...)
                </label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 rounded-lg p-2.5 text-slate-900 font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndTestSupabase}
                  disabled={isTestingSupabase}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {isTestingSupabase ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>कनेक्ट व टेस्ट हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>क्रेडेंशियल सेव व टेस्ट करें (Save & Connect)</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1">
                <span>💡 क्रेडेंशियल सीधे ब्राउज़र और डेटाबेस सर्विस दोनों में सुरक्षित सेव होते हैं।</span>
              </div>
            </div>

            {supabaseTestMsg && (
              <div className={`p-3 rounded-lg text-xs font-bold border flex items-center gap-2 ${
                supabaseTestMsg.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {supabaseTestMsg.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{supabaseTestMsg.text}</span>
              </div>
            )}
          </div>

          {migrationResult && (
            <div className={`p-3.5 rounded-xl text-xs font-bold border ${
              migrationResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {migrationResult.message}
            </div>
          )}

          {/* Counts and Sync status */}
          {migrationStatus && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">समाचार (Posts)</span>
                <div className="font-mono text-slate-900 font-bold flex items-center justify-between text-xs">
                  <span>स्थानीय: {migrationStatus.localPostsCount}</span>
                  <span className="text-blue-600">क्लाउड: {migrationStatus.remotePostsCount}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">टीम (Team)</span>
                <div className="font-mono text-slate-900 font-bold flex items-center justify-between text-xs">
                  <span>स्थानीय: {migrationStatus.localTeamCount}</span>
                  <span className="text-blue-600">क्लाउड: {migrationStatus.remoteTeamCount}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">वीडियो (Videos)</span>
                <div className="font-mono text-slate-900 font-bold flex items-center justify-between text-xs">
                  <span>स्थानीय: {migrationStatus.localVideosCount}</span>
                  <span className="text-blue-600">क्लाउड: {migrationStatus.remoteVideosCount}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">डेटाबेस स्थिति</span>
                <div className="font-mono text-emerald-700 font-bold text-xs">
                  {isSupabaseConfigured() ? '✅ रीयल-टाइम सक्रिय' : '🟡 लोकल सुरक्षित'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Security & Password Change Manager */}
      <div className="mt-10 pt-8 border-t border-slate-200 space-y-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                🔐 वेब पोर्टल पासवर्ड बदलें (Change Portal Password)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                सुरक्षा हेतु अपना रिपोर्टर आईडी व प्रेस पासवर्ड बदलें। नया पासवर्ड तुरंत प्रभाव से लागू हो जाएगा।
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  रिपोर्टर आईडी (Reporter ID / Phone)
                </label>
                <input 
                  type="text" 
                  value={newPhoneInput}
                  onChange={(e) => setNewPhoneInput(e.target.value)}
                  placeholder="6393874723"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  वर्तमान पुराना पासवर्ड (Current Password) *
                </label>
                <input 
                  type="password" 
                  required
                  value={oldPasswordInput}
                  onChange={(e) => setOldPasswordInput(e.target.value)}
                  placeholder="पुराना पासवर्ड दर्ज करें"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  नया पासवर्ड (New Password) *
                </label>
                <input 
                  type="password" 
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="नया पासवर्ड दर्ज करें (कम से कम 4 अक्षर)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  नए पासवर्ड की पुष्टि करें (Confirm New Password) *
                </label>
                <input 
                  type="password" 
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="नया पासवर्ड पुनः दर्ज करें"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {passChangeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-600" />
                <span>{passChangeError}</span>
              </div>
            )}

            {passChangeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{passChangeSuccess}</span>
              </div>
            )}

            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>नया पासवर्ड सुरक्षित करें (Save New Password)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
