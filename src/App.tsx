/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab, Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { SongView } from './components/SongView';
import { LibraryView } from './components/LibraryView';
import { SetlistsView } from './components/SetlistsView';
import { SettingsView } from './components/SettingsView';
import { SongEditorModal } from './components/SongEditorModal';
import { TvGuideModal } from './components/TvGuideModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PlaybackState, Setlist, Song, VisualSettings, calculateSpeedFromBpm } from './types';
import { storageService, DEFAULT_VISUAL_SETTINGS } from './services/storage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  // App Navigation tab: 'inicio' | 'cancion' | 'library' | 'setlists' | 'settings'
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  // Core domain states
  const [songs, setSongs] = useState<Song[]>(() => storageService.getSongs());
  const [setlists, setSetlists] = useState<Setlist[]>(() => storageService.getSetlists());
  const [settings, setSettings] = useState<VisualSettings>(() => storageService.getSettings());

  const [activeSongId, setActiveSongId] = useState<string | null>(() => {
    const list = storageService.getSongs();
    return list.length > 0 ? list[0].id : null;
  });

  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: true,
    speed: 8, // Standard comfortable speed on 1-20 scale
    currentSongId: null,
    currentSectionIndex: 0,
    scrollPercent: 0,
    scrollTop: 0,
    activeSetlistId: null,
    currentSetlistIndex: 0,
  });

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<Song | null>(null);
  const [isTvGuideOpen, setIsTvGuideOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Find active song object
  const activeSong = songs.find(s => s.id === activeSongId) || (songs.length > 0 ? songs[0] : null);

  // Keep playback currentSongId synced
  useEffect(() => {
    if (activeSong && playback.currentSongId !== activeSong.id) {
      setPlayback(prev => ({
        ...prev,
        currentSongId: activeSong.id,
      }));
    }
  }, [activeSong, playback.currentSongId]);

  // Main in-app launcher: switches to the 'cancion' section directly inside the app!
  const handleLaunchSong = (song: Song, initialSpeed?: number) => {
    // 1. Save and persist song
    const updated = storageService.saveSong(song);
    storageService.saveActiveSong(song);
    setSongs(updated);
    setActiveSongId(song.id);

    // 2. Compute speed on 1 to 20 scale
    const targetSpeed = initialSpeed || (song.bpm ? calculateSpeedFromBpm(song.bpm) : playback.speed || 8);

    setPlayback(prev => ({
      ...prev,
      currentSongId: song.id,
      speed: targetSpeed,
      isPlaying: true, // Auto-start scrolling immediately!
      scrollPercent: 0,
      scrollTop: 0,
      currentSectionIndex: 0,
    }));

    // 3. Switch directly to the 'cancion' section in the same app
    setActiveTab('cancion');
  };

  const handleTogglePlay = () => {
    setPlayback(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSetSpeed = (newSpeed: number) => {
    const clamped = Math.max(1, Math.min(20, newSpeed));
    setPlayback(prev => ({ ...prev, speed: clamped }));
  };

  const handleSelectSong = (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    setActiveSongId(song.id);
    const speed = song.bpm ? calculateSpeedFromBpm(song.bpm) : playback.speed;
    setPlayback(prev => ({
      ...prev,
      currentSongId: song.id,
      speed,
      currentSectionIndex: 0,
      scrollPercent: 0,
      scrollTop: 0,
    }));
    setActiveTab('inicio');
  };

  const handleNextSong = () => {
    const activeSetlist = setlists.find(st => st.id === playback.activeSetlistId);
    if (activeSetlist) {
      const nextIndex = playback.currentSetlistIndex + 1;
      if (nextIndex < activeSetlist.songIds.length) {
        const nextSongId = activeSetlist.songIds[nextIndex];
        const nextSong = songs.find(s => s.id === nextSongId);
        if (nextSong) {
          setActiveSongId(nextSong.id);
          const speed = nextSong.bpm ? calculateSpeedFromBpm(nextSong.bpm) : playback.speed;
          setPlayback(prev => ({
            ...prev,
            currentSongId: nextSong.id,
            currentSetlistIndex: nextIndex,
            speed,
            currentSectionIndex: 0,
            scrollPercent: 0,
            scrollTop: 0,
            isPlaying: true,
          }));
        }
      }
    } else {
      const currIdx = songs.findIndex(s => s.id === activeSongId);
      if (currIdx >= 0 && currIdx < songs.length - 1) {
        const nextSong = songs[currIdx + 1];
        setActiveSongId(nextSong.id);
        const speed = nextSong.bpm ? calculateSpeedFromBpm(nextSong.bpm) : playback.speed;
        setPlayback(prev => ({
          ...prev,
          currentSongId: nextSong.id,
          speed,
          currentSectionIndex: 0,
          scrollPercent: 0,
          scrollTop: 0,
          isPlaying: true,
        }));
      }
    }
  };

  const handlePrevSong = () => {
    const activeSetlist = setlists.find(st => st.id === playback.activeSetlistId);
    if (activeSetlist) {
      const prevIndex = playback.currentSetlistIndex - 1;
      if (prevIndex >= 0) {
        const prevSongId = activeSetlist.songIds[prevIndex];
        const prevSong = songs.find(s => s.id === prevSongId);
        if (prevSong) {
          setActiveSongId(prevSong.id);
          const speed = prevSong.bpm ? calculateSpeedFromBpm(prevSong.bpm) : playback.speed;
          setPlayback(prev => ({
            ...prev,
            currentSongId: prevSong.id,
            currentSetlistIndex: prevIndex,
            speed,
            currentSectionIndex: 0,
            scrollPercent: 0,
            scrollTop: 0,
            isPlaying: true,
          }));
        }
      }
    } else {
      const currIdx = songs.findIndex(s => s.id === activeSongId);
      if (currIdx > 0) {
        const prevSong = songs[currIdx - 1];
        setActiveSongId(prevSong.id);
        const speed = prevSong.bpm ? calculateSpeedFromBpm(prevSong.bpm) : playback.speed;
        setPlayback(prev => ({
          ...prev,
          currentSongId: prevSong.id,
          speed,
          currentSectionIndex: 0,
          scrollPercent: 0,
          scrollTop: 0,
          isPlaying: true,
        }));
      }
    }
  };

  const handleUpdateSettings = (newSettings: VisualSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleSaveSong = (song: Song) => {
    const updated = storageService.saveSong(song);
    setSongs(updated);
    setActiveSongId(song.id);
  };

  const handleDeleteSong = (songId: string) => {
    const updated = storageService.deleteSong(songId);
    setSongs(updated);
    setSetlists(storageService.getSetlists());
    if (activeSongId === songId) {
      const nextSongId = updated.length > 0 ? updated[0].id : null;
      setActiveSongId(nextSongId);
    }
  };

  const handleDuplicateSong = (songId: string) => {
    const res = storageService.duplicateSong(songId);
    setSongs(res.songs);
    if (res.newSong) {
      setActiveSongId(res.newSong.id);
      setActiveTab('inicio');
    }
  };

  const handleStartRehearsal = (setlistId: string, startIndex: number = 0) => {
    const targetSetlist = setlists.find(st => st.id === setlistId);
    if (!targetSetlist || targetSetlist.songIds.length === 0) return;

    const validIndex = Math.max(0, Math.min(targetSetlist.songIds.length - 1, startIndex));
    const targetSongId = targetSetlist.songIds[validIndex];
    const targetSong = songs.find(s => s.id === targetSongId);

    if (targetSong) {
      setActiveSongId(targetSong.id);
      const speed = targetSong.bpm ? calculateSpeedFromBpm(targetSong.bpm) : 8;
      setPlayback(prev => ({
        ...prev,
        activeSetlistId: targetSetlist.id,
        currentSetlistIndex: validIndex,
        currentSongId: targetSong.id,
        speed,
        currentSectionIndex: 0,
        scrollPercent: 0,
        scrollTop: 0,
        isPlaying: true,
      }));
      // Switch directly to Canción in the same app!
      setActiveTab('cancion');
    }
  };

  const handleResetDemoSongs = () => {
    const res = storageService.resetDemoSongs();
    setSongs(res.songs);
    setSetlists(res.setlists);
    setSettings(DEFAULT_VISUAL_SETTINGS);
    storageService.saveSettings(DEFAULT_VISUAL_SETTINGS);
    if (res.songs.length > 0) {
      setActiveSongId(res.songs[0].id);
    }
  };

  const handleClearAllData = () => {
    const res = storageService.clearAllData();
    setSongs(res.songs);
    setSetlists(res.setlists);
    setActiveSongId(null);
  };

  const handleRefreshData = () => {
    setSongs(storageService.getSongs());
    setSetlists(storageService.getSetlists());
    setSettings(storageService.getSettings());
  };

  // Keyboard shortcuts integration
  useKeyboardShortcuts(
    {
      onTogglePlay: handleTogglePlay,
      onSpeedUp: () => handleSetSpeed(playback.speed + 1),
      onSpeedDown: () => handleSetSpeed(playback.speed - 1),
      onNextSong: handleNextSong,
      onPrevSong: handlePrevSong,
      onToggleFullscreen: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      },
    },
    !isEditorOpen
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation: Clean, with Canción tab when active, and NO Teleprompter button */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveSong={!!activeSong}
        onOpenTvGuide={() => setIsTvGuideOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {/* Sección Inicio: Formulario + Vista Previa + Botón Play Amarillo */}
        {activeTab === 'inicio' && (
          <HomeView
            activeSong={activeSong}
            settings={settings}
            onSaveToLibrary={handleSaveSong}
            onLaunchTeleprompter={handleLaunchSong}
            songs={songs}
            onSelectExistingSong={handleSelectSong}
          />
        )}

        {/* Sección Canción: Karaoke de pantalla completa en la misma app, fondo negro puro, velocidad 1-20 */}
        {activeTab === 'cancion' && (
          <SongView
            song={activeSong}
            playback={playback}
            settings={settings}
            setlists={setlists}
            onTogglePlay={handleTogglePlay}
            onSetSpeed={handleSetSpeed}
            onNextSong={handleNextSong}
            onPrevSong={handlePrevSong}
            onClose={() => setActiveTab('inicio')}
          />
        )}

        {/* Sección Biblioteca: Repertorio con buscador, botón Ensayar que va a Canción */}
        {activeTab === 'library' && (
          <LibraryView
            songs={songs}
            activeSongId={activeSongId}
            onSelectSong={handleSelectSong}
            onPlaySong={handleLaunchSong}
            onEditSong={song => {
              setSongToEdit(song);
              setIsEditorOpen(true);
            }}
            onDuplicateSong={handleDuplicateSong}
            onDeleteSong={handleDeleteSong}
            onNewSong={() => {
              setSongToEdit(null);
              setIsEditorOpen(true);
            }}
            onResetDemoSongs={handleResetDemoSongs}
          />
        )}

        {/* Sección Setlists: Gestión de listas de temas */}
        {activeTab === 'setlists' && (
          <SetlistsView
            setlists={setlists}
            songs={songs}
            activeSetlistId={playback.activeSetlistId}
            onSaveSetlist={st => {
              const updated = storageService.saveSetlist(st);
              setSetlists(updated);
            }}
            onDeleteSetlist={stId => {
              const updated = storageService.deleteSetlist(stId);
              setSetlists(updated);
            }}
            onStartRehearsal={handleStartRehearsal}
          />
        )}

        {/* Sección Ajustes: Tipografía, interlineado, márgenes y copias de seguridad */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetDemoSongs={handleResetDemoSongs}
            onClearAllData={handleClearAllData}
            onOpenTvGuide={() => setIsTvGuideOpen(true)}
            onRefreshData={handleRefreshData}
          />
        )}
      </main>

      {/* Modals */}
      <SongEditorModal
        isOpen={isEditorOpen}
        songToEdit={songToEdit}
        onClose={() => {
          setIsEditorOpen(false);
          setSongToEdit(null);
        }}
        onSave={handleSaveSong}
      />

      <TvGuideModal
        isOpen={isTvGuideOpen}
        onClose={() => setIsTvGuideOpen(false)}
        onOpenStageWindow={() => setActiveTab('cancion')}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
