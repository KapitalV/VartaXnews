import React, { useState, useEffect } from 'react';
import { NewsPost, VideoBulletin, TeamMember, PushNotification, LocalAd } from './types';
import { fetchPosts, subscribeToPosts, incrementPostViews, incrementPostLikes, createPost, deletePost } from './services/postService';
import { fetchTeamMembers, subscribeToTeam, saveTeamMembers } from './services/teamService';
import { fetchVideos, subscribeToVideos, createVideo, deleteVideo } from './services/videoService';
import { fetchActiveLocalAds, getStoredLocalAds } from './services/adService';
import { getStoredPosts, getStoredTeam, getStoredVideos } from './data';
import { resolveImageUrl } from './utils/imageHelper';

// Light Editorial Components
import { TopUtilityBar } from './components/TopUtilityBar';
import { MainHeader } from './components/MainHeader';
import { CategoryNavBar } from './components/CategoryNavBar';
import { BreakingTicker } from './components/BreakingTicker';
import { HeroLeadStory } from './components/HeroLeadStory';
import { LatestNewsFeed } from './components/LatestNewsFeed';
import { TrendingSidebar } from './components/TrendingSidebar';
import { NewsCard } from './components/NewsCard';
import { NewsDetailModal } from './components/NewsDetailModal';
import { ShareModal } from './components/ShareModal';
import { VideoSection } from './components/VideoSection';
import { TeamSection } from './components/TeamSection';
import ContactSection from './components/ContactSection';
import HoroscopeSection from './components/HoroscopeSection';
import AppDownloadSection from './components/AppDownloadSection';
import AdminPanel from './components/AdminPanel';
import { EditorialFooter } from './components/EditorialFooter';
import NotificationOverlay from './components/NotificationOverlay';

import { 
  Flame, 
  MapPin, 
  Sparkles, 
  Radio, 
  Search, 
  ArrowRight, 
  Clock, 
  Tv, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export function App() {
  // Navigation & Screen State
  const [activeTab, setActiveTab] = useState<'feed' | 'videos' | 'team' | 'contact' | 'app' | 'horoscope' | 'admin'>('feed');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Channel Branding State
  const [channelLogo, setChannelLogo] = useState<string>('/input_file_0.png');
  const [anshPhoto, setAnshPhoto] = useState<string>('/input_file_6.png');

  // Core Data Models - Initialized instantly from persistent local cache for 0ms load lag
  const [posts, setPosts] = useState<NewsPost[]>(() => getStoredPosts());
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getStoredTeam());
  const [videos, setVideos] = useState<VideoBulletin[]>(() => getStoredVideos());
  const [localAds, setLocalAds] = useState<LocalAd[]>(() => getStoredLocalAds());
  
  // Modals & Overlays
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
  const [sharingPost, setSharingPost] = useState<NewsPost | null>(null);
  const [incomingNotification, setIncomingNotification] = useState<PushNotification | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialRashiSign, setInitialRashiSign] = useState<string>('aries');

  // Background Data Synchronization & Supabase Realtime Subscriptions
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [postsData, teamData, videosData, adsData] = await Promise.all([
          fetchPosts(),
          fetchTeamMembers(),
          fetchVideos(),
          fetchActiveLocalAds()
        ]);

        if (isMounted) {
          if (postsData && postsData.length > 0) setPosts(postsData);
          if (teamData && teamData.length > 0) setTeamMembers(teamData);
          if (videosData && videosData.length > 0) setVideos(videosData);
          if (adsData) setLocalAds(adsData);
        }
      } catch (err) {
        console.error('Error in background data sync:', err);
      }
    }

    loadData();

    const handleSupabaseReady = () => {
      loadData();
    };
    window.addEventListener('varta_supabase_ready', handleSupabaseReady);

    const handleAdsUpdated = (e: any) => {
      if (e.detail) {
        setLocalAds(e.detail);
      }
    };
    window.addEventListener('varta_ads_updated', handleAdsUpdated);

    // Check URL parameters for direct deep links (?post=123, ?tab=horoscope, ?rashi=leo)
    const urlParams = new URLSearchParams(window.location.search);
    const postParam = urlParams.get('post');
    const tabParam = urlParams.get('tab');
    const rashiParam = urlParams.get('rashi');
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    
    // Direct horoscope deep linking
    if (tabParam === 'horoscope' || rashiParam || pathname.startsWith('/rashifal') || pathname.startsWith('/rashi')) {
      setActiveTab('horoscope');
      if (rashiParam) {
        setInitialRashiSign(rashiParam.toLowerCase());
      } else if (pathname.startsWith('/rashifal/')) {
        const pathSign = pathname.replace('/rashifal/', '').trim().toLowerCase();
        if (pathSign) setInitialRashiSign(pathSign);
      }
    }

    const targetId = postParam || (hash && hash.startsWith('#post-') ? hash.replace('#post-', '') : null);

    if (targetId) {
      const existing = getStoredPosts().find(p => p.id === targetId);
      if (existing) {
        setSelectedPost(existing);
        incrementPostViews(targetId);
      }
    }

    // Subscribe to Realtime Supabase Events
    const unsubPosts = subscribeToPosts(async () => {
      const freshPosts = await fetchPosts();
      if (isMounted && freshPosts && freshPosts.length > 0) {
        setPosts(freshPosts);
        const latestBreaking = freshPosts.find(p => p.isBreaking);
        if (latestBreaking) {
          setIncomingNotification({
            id: latestBreaking.id,
            title: 'ब्रेकिंग न्यूज़ (Breaking Alert)',
            message: latestBreaking.title,
            timestamp: new Date().toISOString(),
            isRead: false
          });
        }
      }
    });

    const unsubTeam = subscribeToTeam(async () => {
      const freshTeam = await fetchTeamMembers();
      if (isMounted && freshTeam && freshTeam.length > 0) setTeamMembers(freshTeam);
    });

    const unsubVideos = subscribeToVideos(async () => {
      const freshVideos = await fetchVideos();
      if (isMounted && freshVideos && freshVideos.length > 0) setVideos(freshVideos);
    });

    return () => {
      isMounted = false;
      window.removeEventListener('varta_ads_updated', handleAdsUpdated);
      unsubPosts();
      unsubTeam();
      unsubVideos();
    };
  }, []);

  // Filter posts based on search and selected category
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      post.category?.toString().toLowerCase() === selectedCategory.toLowerCase() ||
      (post.district && post.district.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.district && post.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.authorName && post.authorName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Breaking news posts for the live ticker
  const breakingPosts = posts.filter(p => p.isBreaking);

  // Dynamic Categories extracted from actual Supabase posts
  const uniqueCategories = Array.from(
    new Set(posts.map(p => p.category?.toString() || 'उत्तर प्रदेश').filter(Boolean))
  );

  const navCategoryItems = uniqueCategories.map(cat => ({
    id: cat,
    name: cat,
    count: posts.filter(p => p.category === cat).length
  }));

  // Top Lead Story and Secondary Editorial Stories
  const heroStory = filteredPosts.find(p => p.isBreaking) || filteredPosts[0];
  const secondaryTopStories = filteredPosts.filter(p => p.id !== heroStory?.id).slice(0, 4);
  const remainingStories = filteredPosts.filter(p => p.id !== heroStory?.id && !secondaryTopStories.find(s => s.id === p.id));

  // Handlers
  const handleSelectPost = (post: NewsPost) => {
    setSelectedPost(post);
    incrementPostViews(post.id);
  };

  const handleLikePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    incrementPostLikes(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const handleAddPost = async (newPost: Omit<NewsPost, 'id' | 'createdAt' | 'views' | 'likes'>) => {
    const created = await createPost(newPost);
    setPosts(prev => [created, ...prev]);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
    }
  };

  const handleUpdateTeam = async (updatedTeam: TeamMember[]) => {
    setTeamMembers(updatedTeam);
    await saveTeamMembers(updatedTeam);
  };

  const handleAddVideo = async (newVideo: Omit<VideoBulletin, 'id' | 'createdAt' | 'views' | 'likes'>) => {
    const created = await createVideo(newVideo);
    setVideos(prev => [created, ...prev]);
  };

  const handleDeleteVideo = async (id: string) => {
    await deleteVideo(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#111827] flex flex-col antialiased">
      
      {/* 1. Top Utility Strip */}
      <TopUtilityBar onLiveClick={() => setActiveTab('videos')} />

      {/* 2. Main Channel Header & Masthead */}
      <MainHeader
        onSearch={(query) => {
          setSearchQuery(query);
          if (query) {
            setActiveTab('feed');
            setSelectedCategory('all');
          }
        }}
        searchQuery={searchQuery}
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenAppModal={() => setIsAppModalOpen(true)}
        onNavigateHome={() => {
          setActiveTab('feed');
          setSelectedCategory('all');
          setSearchQuery('');
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        activeTab={activeTab}
      />

      {/* 3. Sticky Category Navigation Bar */}
      <CategoryNavBar
        categories={navCategoryItems}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          setActiveTab('feed');
          setSearchQuery('');
        }}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
      />

      {/* 4. Live Breaking News Ticker */}
      {(breakingPosts.length > 0 || localAds.some(a => a.isActive && a.slot === 'ticker_top')) && activeTab === 'feed' && (
        <BreakingTicker 
          breakingPosts={breakingPosts}
          activeTickerAds={localAds.filter(a => a.isActive && a.slot === 'ticker_top')}
          onSelectPost={handleSelectPost}
        />
      )}

      {/* 5. Main Viewport / Dynamic Content Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Loading Skeleton */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-600">वार्ता X न्यूज़ लाइव अपडेट्स लोड हो रहे हैं...</p>
          </div>
        )}

        {/* FEED VIEW (HOMEPAGE & CATEGORY ARCHIVES) */}
        {!isLoading && activeTab === 'feed' && (
          <div className="space-y-10">
            
            {/* Search Header Banner if filtering by search */}
            {searchQuery && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">खोज परिणाम:</span>
                  <h2 className="text-lg font-bold text-gray-900">"{searchQuery}" ({filteredPosts.length} समाचार)</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  सभी समाचार देखें
                </button>
              </div>
            )}

            {/* Category Banner if filtered */}
            {selectedCategory !== 'all' && !searchQuery && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">{selectedCategory} विशेष समाचार</h2>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-full">
                    {filteredPosts.length} खबरें
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  मुख्य पृष्ठ पर जाएं
                </button>
              </div>
            )}

            {/* SECTION 1: EDITORIAL HERO LEAD & TOP STORIES GRID */}
            {filteredPosts.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lead Hero Story (7 cols) */}
                {heroStory && (
                  <div className="lg:col-span-7">
                    <HeroLeadStory
                      post={heroStory}
                      onSelectPost={handleSelectPost}
                      onLikePost={handleLikePost}
                      onShare={setSharingPost}
                    />
                  </div>
                )}

                {/* Secondary Top Stories Stack (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-red-50 text-red-600 rounded">
                          <Flame className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 leading-none">
                          प्रमुख सुर्खियाँ (Top Stories)
                        </h3>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">एडिटर्स चॉइस</span>
                    </div>

                    <div className="space-y-3.5">
                      {secondaryTopStories.map((post) => (
                        <article
                          key={post.id}
                          onClick={() => handleSelectPost(post)}
                          className="flex items-center gap-3 group cursor-pointer pb-3 last:pb-0 border-b last:border-0 border-gray-100"
                        >
                          <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img
                              src={resolveImageUrl(post.imageUrl)}
                              alt={post.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=300&auto=format&fit=crop&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-red-600 uppercase block mb-0.5">
                              {post.category?.toString() || 'समाचार'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' }) : 'आज'}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: 2-COLUMN DENSE EDITORIAL FEED (LATEST + TRENDING SIDEBAR) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 8 Cols: Stories Grid */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <span>{selectedCategory === 'all' ? 'मुख्य समाचार व ग्राउंड रिपोर्ट' : `${selectedCategory} खबरें`}</span>
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">कुल {filteredPosts.length} समाचार</span>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800 mb-1">कोई समाचार नहीं मिला</h3>
                    <p className="text-xs text-gray-500 mb-4">कृपया अन्य श्रेणी चुनें या खोज शब्द बदलें।</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      सभी समाचार देखें
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {(selectedCategory === 'all' && !searchQuery ? remainingStories : filteredPosts).map((post) => (
                      <NewsCard
                        key={post.id}
                        post={post}
                        onSelect={handleSelectPost}
                        onLike={handleLikePost}
                        onShare={setSharingPost}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right 4 Cols: Latest Wire & Trending Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <LatestNewsFeed 
                  posts={posts} 
                  onSelectPost={handleSelectPost} 
                />
                <TrendingSidebar 
                  posts={posts} 
                  onSelectPost={handleSelectPost} 
                />
              </div>

            </section>

            {/* SECTION 3: VIDEO BULLETINS SPOTLIGHT */}
            {videos.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <section className="bg-gray-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600 text-white rounded-xl shadow">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">वार्ता X वीडियो बुलेटिन</h3>
                      <p className="text-xs text-gray-400">ग्राउंड रिपोर्ट और वीडियो समाचार देखें</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('videos')}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-white transition-colors"
                  >
                    <span>सभी वीडियो देखें</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {videos.slice(0, 3).map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => setActiveTab('videos')}
                      className="bg-gray-800/80 rounded-2xl border border-gray-700/60 p-3 hover:border-red-500 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-3">
                        <img
                          src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&auto=format&fit=crop&q=80'}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Radio className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1">
                          {vid.category || 'वीडियो'}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                          {vid.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 4: HOROSCOPE & APP DOWNLOAD HIGHLIGHT */}
            {selectedCategory === 'all' && !searchQuery && (
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Vedic Horoscope Callout */}
                <div 
                  onClick={() => setActiveTab('horoscope')}
                  className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-3 border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>आज का वैदिक पंचांग व राशिफल</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                      दैनिक 12 राशियों का सटीक भविष्यफल
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      मेष से मीन तक सभी राशियों का आज का कैरियर, प्रेम, स्वास्थ्य, लकी नंबर, शुभ रंग एवं ज्योतिषीय महाउपाय पढ़ें।
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-800 group-hover:translate-x-1 transition-transform">
                    <span>अपना दैनिक राशिफल देखें</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Press Network Callout */}
                <div 
                  onClick={() => setActiveTab('team')}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold mb-3 border border-red-200">
                      <Radio className="w-3.5 h-3.5 text-red-600" />
                      <span>झाँसी • कटेरा • मऊरानीपुर मंडल</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      वार्ता X आधिकारिक पत्रकार व संवाददाता नेटवर्क
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      हमारे अधिकृत प्रेस संवाददाताओं और ब्यूरो प्रमुखों की सूची देखें एवं डिजिटल प्रेस कार्ड सत्यापन करें।
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                    <span>संपादकीय टीम से मिलें</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

              </section>
            )}

          </div>
        )}

        {/* VIDEOS PORTAL VIEW */}
        {activeTab === 'videos' && (
          <VideoSection videos={videos} />
        )}

        {/* EDITORIAL TEAM DIRECTORY VIEW */}
        {activeTab === 'team' && (
          <TeamSection 
            teamMembers={teamMembers} 
            onOpenContact={() => setActiveTab('contact')}
          />
        )}

        {/* CONTACT & HELPLINE VIEW */}
        {activeTab === 'contact' && (
          <ContactSection />
        )}

        {/* VEDIC HOROSCOPE VIEW */}
        {activeTab === 'horoscope' && (
          <HoroscopeSection initialSignId={initialRashiSign} />
        )}

        {/* APP DOWNLOAD VIEW */}
        {activeTab === 'app' && (
          <AppDownloadSection />
        )}

        {/* ADMIN BROADCAST STUDIO VIEW */}
        {activeTab === 'admin' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('feed')}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>समाचार मुख्य पृष्ठ पर लौटें (Back to Live News)</span>
              </button>
            </div>
            <AdminPanel 
              onAddPost={handleAddPost}
              posts={posts}
              onDeletePost={handleDeletePost}
              postsCount={posts.length}
              channelLogo={channelLogo}
              onUpdateChannelLogo={setChannelLogo}
              anshPhoto={anshPhoto}
              onUpdateAnshPhoto={setAnshPhoto}
              teamMembers={teamMembers}
              onUpdateTeam={handleUpdateTeam}
              videos={videos}
              onAddVideo={handleAddVideo}
              onDeleteVideo={handleDeleteVideo}
            />
          </div>
        )}

      </main>

      {/* 6. Editorial Footer */}
      <EditorialFooter
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('feed');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        categories={uniqueCategories}
      />

      {/* 7. Full Article Detail Modal */}
      {selectedPost && (
        <NewsDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLikePost={handleLikePost}
          onShare={setSharingPost}
          relatedPosts={posts.filter(p => p.id !== selectedPost.id && p.category === selectedPost.category)}
          onSelectRelatedPost={handleSelectPost}
          activeArticleAd={localAds.find(a => a.isActive && (a.slot === 'article_modal' || !a.slot))}
        />
      )}

      {/* 7b. Dedicated News Share Modal (Photo Card + Direct Social) */}
      <ShareModal 
        post={sharingPost} 
        isOpen={Boolean(sharingPost)} 
        onClose={() => setSharingPost(null)} 
      />

      {/* 8. Push Notification Banner Overlay */}
      {incomingNotification && (
        <NotificationOverlay
          incomingNotification={incomingNotification}
          onClearNotification={() => setIncomingNotification(null)}
          onNotificationClick={(id) => {
            const found = posts.find(p => p.id === id);
            if (found) handleSelectPost(found);
            setIncomingNotification(null);
          }}
        />
      )}

      {/* 9. PWA Mobile App Download Modal */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl border border-gray-200">
            <AppDownloadSection />
            <button
              type="button"
              onClick={() => setIsAppModalOpen(false)}
              className="mt-4 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
