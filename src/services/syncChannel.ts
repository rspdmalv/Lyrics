/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlaybackState, Song, SyncMessage, SyncMessageType, VisualSettings } from '../types';

const CHANNEL_NAME = 'stagelyrics_sync_channel';
const STORAGE_SYNC_KEY = 'stagelyrics_storage_sync_event';
const STORAGE_SNAPSHOT_KEY = 'stagelyrics_latest_snapshot';

type MessageListener = (message: SyncMessage) => void;

class SyncChannelService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<MessageListener> = new Set();
  private windowId: string;
  private hasBroadcastChannel: boolean = false;

  constructor() {
    this.windowId = 'win_' + Math.random().toString(36).substring(2, 9);
    
    // Check if BroadcastChannel is supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.handleIncomingMessage(event.data);
        };
        this.hasBroadcastChannel = true;
      } catch (err) {
        console.warn('BroadcastChannel initialization error, falling back to storage sync:', err);
        this.hasBroadcastChannel = false;
      }
    }

    // Always attach storage listener as supplementary/fallback sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === STORAGE_SYNC_KEY && event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue) as SyncMessage;
            if (parsed && parsed.senderId !== this.windowId) {
              this.handleIncomingMessage(parsed);
            }
          } catch (e) {
            console.error('Error parsing storage sync message:', e);
          }
        }
      });
    }
  }

  public getWindowId(): string {
    return this.windowId;
  }

  public isBroadcastChannelSupported(): boolean {
    return this.hasBroadcastChannel;
  }

  private handleIncomingMessage(msg: SyncMessage): void {
    if (!msg || msg.senderId === this.windowId) return;
    this.listeners.forEach(cb => {
      try {
        cb(msg);
      } catch (e) {
        console.error('Error in sync listener:', e);
      }
    });
  }

  public subscribe(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public sendMessage(type: SyncMessageType, payload?: any): void {
    const msg: SyncMessage = {
      type,
      payload,
      timestamp: Date.now(),
      senderId: this.windowId,
    };

    // 1. Send via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (e) {
        console.warn('Error posting to BroadcastChannel:', e);
      }
    }

    // 2. Mirror via localStorage event for reliable multi-window / fallback support
    try {
      localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(msg));
    } catch (e) {
      // Storage quota or private mode warning
    }

    // If it's a full state sync, also update the latest persistent snapshot
    if (type === 'SYNC_FULL_STATE') {
      try {
        localStorage.setItem(STORAGE_SNAPSHOT_KEY, JSON.stringify(payload));
      } catch (e) {}
    }
  }

  /**
   * Retrieves the latest known snapshot if available (useful during page load/refresh)
   */
  public getLatestSnapshot(): {
    playback: PlaybackState;
    song: Song | null;
    settings: VisualSettings;
  } | null {
    try {
      const data = localStorage.getItem(STORAGE_SNAPSHOT_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return null;
  }
}

export const syncChannel = new SyncChannelService();
