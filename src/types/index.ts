/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectionType = 
  | 'intro'
  | 'verso'
  | 'pre-coro'
  | 'coro'
  | 'puente'
  | 'solo'
  | 'outro'
  | 'instrumental'
  | 'otro';

export const MUSICAL_KEYS = [
  'Sin especificar',
  'Do Mayor (C)',
  'Do menor (Cm)',
  'Do# / Reb Mayor (C# / Db)',
  'Do# menor (C#m)',
  'Re Mayor (D)',
  'Re menor (Dm)',
  'Re# / Mib Mayor (D# / Eb)',
  'Mib menor (Ebm)',
  'Mi Mayor (E)',
  'Mi menor (Em)',
  'Fa Mayor (F)',
  'Fa menor (Fm)',
  'Fa# / Solb Mayor (F# / Gb)',
  'Fa# menor (F#m)',
  'Sol Mayor (G)',
  'Sol menor (Gm)',
  'Sol# / Lab Mayor (G# / Ab)',
  'Sol# menor (G#m)',
  'La Mayor (A)',
  'La menor (Am)',
  'La# / Sib Mayor (A# / Bb)',
  'Sib menor (Bbm)',
  'Si Mayor (B)',
  'Si menor (Bm)',
] as const;

export function calculateSpeedFromBpm(bpm?: number): number {
  if (!bpm || bpm <= 0) return 8; // default comfortable speed on 1-20 scale
  // Scale BPM (e.g. 60 bpm -> speed 4, 120 bpm -> speed 8, 160 bpm -> speed 12, 200 bpm -> speed 16)
  const calculated = Math.round(bpm / 14);
  return Math.max(1, Math.min(20, calculated));
}

export interface SongSection {
  id: string;
  name: string; // e.g. "VERSO 1", "CORO", "PUENTE"
  type: SectionType;
  content: string; // line breaks preserved
}

export interface Song {
  id: string;
  userId?: string;
  title: string;
  artist: string;
  bpm?: number;
  musicalKey?: string;
  notes?: string;
  rawLyrics: string;
  sections: SongSection[];
  createdAt: number;
  updatedAt: number;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'register' | 'login' | 'email_verified' | 'song_create' | 'song_edit' | 'song_delete' | 'rehearsal_start';
  details: string;
  timestamp: string;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type TextMaxWidth = 'normal' | 'wide' | 'ultra' | 'full';

export interface VisualSettings {
  fontSize: number; // 24 to 96 px
  lineHeight: number; // 1.3 to 2.2
  textAlign: 'left' | 'center';
  maxWidth: TextMaxWidth;
  sidePadding: number; // 16 to 96 px
  viewMode: 'continuous' | 'blocks';
  showSongHeader: boolean;
  showSectionBadge: boolean;
  showProgressBar: boolean;
  discreteProgressPosition: 'top' | 'bottom';
  showNextSongAlert: boolean;
  uppercaseLyrics: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  speed: number; // 1 (muy lento) to 10 (muy rápido)
  currentSongId: string | null;
  currentSectionIndex: number;
  scrollPercent: number; // 0 to 100
  scrollTop: number; // in pixels
  activeSetlistId: string | null;
  currentSetlistIndex: number;
}

export type SyncMessageType =
  | 'SYNC_FULL_STATE'
  | 'COMMAND_PLAY'
  | 'COMMAND_PAUSE'
  | 'COMMAND_TOGGLE_PLAY'
  | 'COMMAND_SET_SPEED'
  | 'COMMAND_SCROLL_PERCENT'
  | 'COMMAND_SCROLL_PIXELS'
  | 'COMMAND_JUMP_SECTION'
  | 'COMMAND_CHANGE_SONG'
  | 'COMMAND_UPDATE_SETTINGS'
  | 'COMMAND_NUDGE'
  | 'COMMAND_RESET_SCROLL'
  | 'REQUEST_INITIAL_STATE'
  | 'STAGE_HEARTBEAT'
  | 'STAGE_CONNECTED'
  | 'STAGE_DISCONNECTED';

export interface SyncMessage {
  type: SyncMessageType;
  payload?: any;
  timestamp: number;
  senderId: string;
}

export interface AppDataBackup {
  version: string;
  exportedAt: string;
  songs: Song[];
  setlists: Setlist[];
  settings: VisualSettings;
}
