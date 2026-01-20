
export enum AppView {
  DASHBOARD = 'dashboard',
  LIVE = 'live',
  CREATOR = 'creator',
  TASKS = 'tasks',
  SYSTEM = 'system',
  HISTORY = 'history',
  LIBRARY = 'library',
  SOCIAL = 'social',
  CHAT = 'chat',
  SETTINGS = 'settings'
}

export type PermissionStatus = 'off' | 'temporary' | 'permanent';

export interface PermissionsState {
  camera: PermissionStatus;
  microphone: PermissionStatus;
  imageGen: PermissionStatus;
  videoGen: PermissionStatus;
  fileAccess: PermissionStatus;
  appAccess: PermissionStatus;
  systemControl: PermissionStatus;
  internetAccess: PermissionStatus;
}

// Added User interface to resolve missing export error
export interface User {
  id: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  time: string;
  category: 'work' | 'personal' | 'routine';
}

export interface LibraryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
  liked?: boolean;
}

export interface ChatMessage {
  role: 'User' | 'Leon';
  text: string;
  timestamp: number;
  attachment?: {
    name: string;
    type: string;
    url: string;
    data?: string; // base64
  };
  resultFile?: {
    name: string;
    url: string;
    type: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface SocialAccount {
  platform: 'Instagram' | 'Facebook' | 'WhatsApp' | 'X';
  connected: boolean;
  username: string;
  lastSync: number;
}

export interface AutoReplyConfig {
  enabled: boolean;
  delayMinutes: number;
  message: string;
}
