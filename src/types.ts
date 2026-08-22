/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum NewsCategory {
  BREAKING = 'Breaking',
  NATIONAL = 'National',
  LOCAL = 'Local',
  SPORTS = 'Sports',
  ENTERTAINMENT = 'Entertainment',
  CRIME = 'Crime'
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  category: NewsCategory | string;
  imageUrl: string;
  createdAt: string;
  views: number;
  likes: number;
  authorName: string;
  authorRole: string;
  isBreaking: boolean;
  district?: string;
  summary?: string;
}

// Backward compatibility alias for Post
export type Post = NewsPost;

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  phone?: string;
  email?: string;
  designation?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message?: string;
  body?: string;
  category?: string;
  timestamp: string | number;
  isRead?: boolean;
}

// Backward compatibility alias for AppNotification
export type AppNotification = PushNotification;

export interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  category?: string;
  location?: string;
}

export interface VideoBulletin {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Direct video or Youtube iframe embed source
  youtube_url?: string;
  thumbnail_url?: string;
  views: number;
  likes: number;
  createdAt: string;
  category: string;
  duration: string;
  authorName: string;
  author?: string;
  isLive?: boolean;
}

// Backward compatibility alias for Video
export type Video = VideoBulletin;

export interface CommentItem {
  id?: string;
  name: string;
  text: string;
  date: string;
}

export type Comment = CommentItem;
