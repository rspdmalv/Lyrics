/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ActivityLog, Song } from '../types';
import { generateId, parseRawLyrics } from '../utils/lyricsParser';

/**
 * Creates an activity log entry under /users/{userId}/logs/{logId}
 */
export async function addActivityLog(
  userId: string,
  userEmail: string,
  action: ActivityLog['action'],
  details: string
): Promise<void> {
  const logId = `log_${Date.now()}_${generateId().slice(0, 6)}`;
  const logPath = `users/${userId}/logs/${logId}`;
  const logData = {
    id: logId,
    userId,
    userEmail: userEmail || 'anónimo',
    action,
    details: details.slice(0, 1000),
    timestamp: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'users', userId, 'logs', logId), logData);
  } catch (error) {
    // If not verified yet or permission fails, log error non-destructively
    console.warn('No se pudo guardar el log de auditoría en Firestore:', error);
  }
}

/**
 * Fetches recent activity logs for a user
 */
export async function getUserLogs(userId: string): Promise<ActivityLog[]> {
  const path = `users/${userId}/logs`;
  try {
    const q = query(collection(db, 'users', userId, 'logs'), orderBy('timestamp', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as ActivityLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Subscribes to real-time changes to the user's songs collection
 */
export function subscribeToUserSongs(
  userId: string,
  onSongsChanged: (songs: Song[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `users/${userId}/songs`;
  const colRef = collection(db, 'users', userId, 'songs');

  const unsubscribe = onSnapshot(
    colRef,
    snapshot => {
      const songs: Song[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const rawLyrics = data.lyrics || '';
        return {
          id: docSnap.id,
          userId: data.userId || userId,
          title: data.title || 'Sin título',
          artist: data.artist || 'Artista',
          bpm: typeof data.bpm === 'number' ? data.bpm : undefined,
          musicalKey: data.key || undefined,
          notes: data.notes || '',
          rawLyrics,
          sections: parseRawLyrics(rawLyrics),
          createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt).getTime() : Date.now(),
          updatedAt: typeof data.updatedAt === 'string' ? new Date(data.updatedAt).getTime() : Date.now(),
        };
      });

      // Sort by updatedAt descending
      songs.sort((a, b) => b.updatedAt - a.updatedAt);
      onSongsChanged(songs);
    },
    error => {
      console.error('Error escuchando canciones de Firestore:', error);
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Saves a song to Firestore under /users/{userId}/songs/{songId}
 */
export async function saveSongToFirestore(userId: string, song: Song, userEmail: string): Promise<void> {
  const songId = song.id || `song_${Date.now()}`;
  const path = `users/${userId}/songs/${songId}`;

  const payload: Record<string, any> = {
    id: songId,
    userId,
    title: (song.title || 'Sin título').trim().slice(0, 150),
    lyrics: (song.rawLyrics || '').slice(0, 50000),
    createdAt: new Date(song.createdAt || Date.now()).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (song.musicalKey && song.musicalKey.trim()) {
    payload.key = song.musicalKey.trim().slice(0, 10);
  }
  if (typeof song.bpm === 'number' && !isNaN(song.bpm) && song.bpm > 0) {
    payload.bpm = song.bpm;
  }

  try {
    await setDoc(doc(db, 'users', userId, 'songs', songId), payload);
    await addActivityLog(
      userId,
      userEmail,
      song.createdAt === song.updatedAt ? 'song_create' : 'song_edit',
      `Canción guardada: "${payload.title}" (${payload.key || 'Sin tonalidad'}, ${payload.bpm ? payload.bpm + ' BPM' : 'Sin BPM'})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a song from Firestore
 */
export async function deleteSongFromFirestore(userId: string, songId: string, songTitle: string, userEmail: string): Promise<void> {
  const path = `users/${userId}/songs/${songId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'songs', songId));
    await addActivityLog(userId, userEmail, 'song_delete', `Canción eliminada: "${songTitle}" (ID: ${songId})`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Synchronizes local songs into user's Firestore cloud storage
 */
export async function syncLocalSongsToFirestore(userId: string, userEmail: string, localSongs: Song[]): Promise<number> {
  let count = 0;
  for (const song of localSongs) {
    try {
      await saveSongToFirestore(userId, song, userEmail);
      count++;
    } catch (e) {
      console.warn(`No se pudo sincronizar la canción "${song.title}":`, e);
    }
  }
  return count;
}
