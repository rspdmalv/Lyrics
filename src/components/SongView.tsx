/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  SkipForward, 
  SkipBack, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Gauge,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { PlaybackState, Song, Setlist, VisualSettings } from '../types';
import { useAutoScroll } from '../hooks/useAutoScroll';

interface SongViewProps {
  song: Song | null;
  playback: PlaybackState;
  settings: VisualSettings;
  setlists: Setlist[];
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onClose: () => void;
}

export const SongView: React.FC<SongViewProps> = ({
  song,
  playback,
  settings,
  setlists,
  onTogglePlay,
  onSetSpeed,
  onNextSong,
  onPrevSong,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  // Auto-scroll engine hook
  const { scrollToPercent, resetToTop } = useAutoScroll({
    containerRef,
    isPlaying: playback.isPlaying,
    speed: playback.speed,
    onScrollUpdate: (scrollTop, percent) => {
      // Find active karaoke section based on scroll offset
      if (song && sectionRefs.current.length > 0) {
        let activeIdx = 0;
        for (let i = 0; i < sectionRefs.current.length; i++) {
          const secEl = sectionRefs.current[i];
          if (secEl && secEl.offsetTop <= scrollTop + 160) {
            activeIdx = i;
          }
        }
        setActiveSectionIdx(activeIdx);
      }
    },
    onReachEnd: () => {
      if (playback.isPlaying) {
        onTogglePlay();
      }
    },
  });

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard shortcut inside Song view (Space, Home, +/-, F, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'Home') {
        e.preventDefault();
        resetToTop();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'Equal' || e.code === 'BracketRight') {
        onSetSpeed(Math.min(20, playback.speed + 1));
      } else if (e.code === 'Minus' || e.code === 'BracketLeft') {
        onSetSpeed(Math.max(1, playback.speed - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, resetToTop, onSetSpeed, playback.speed]);

  // Playlist data
  const activeSetlist = setlists.find(st => st.id === playback.activeSetlistId);
  const hasSetlist = !!activeSetlist && activeSetlist.songIds.length > 0;
  const currentSetlistIdx = playback.currentSetlistIndex;

  // Max width class
  const getMaxWidthClass = () => {
    switch (settings.maxWidth) {
      case 'normal':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-5xl';
      case 'ultra':
        return 'max-w-7xl';
      case 'full':
      default:
        return 'max-w-none w-full';
    }
  };

  const sections = song?.sections || [];

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-[#000000] text-[#FFFFFF] select-none overflow-hidden font-sans flex flex-col">
      {/* =========================================================================
          BARRA SUPERIOR: CONTROLES DE REPRODUCCIÓN, VELOCIDAD (1-20), PLAYLIST, SALIR
         ========================================================================= */}
      <div className="w-full bg-neutral-950/95 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shadow-2xl shrink-0 z-30">
        {/* Left: Play/Pause, Reset, Speedometer (1-20) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
              playback.isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
            }`}
            title="Pausar o reanudar desplazamiento (Espacio)"
          >
            {playback.isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar</span>
              </>
            )}
          </button>

          <button
            onClick={resetToTop}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Volver al inicio (Home)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Controls: Rango de 1 a 20 con botones y slider */}
          <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1.5 px-3">
            <button
              onClick={() => onSetSpeed(Math.max(1, playback.speed - 1))}
              disabled={playback.speed <= 1}
              className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors cursor-pointer"
              title="Más lento"
            >
              <Minus className="w-4 h-4 text-amber-400" />
            </button>

            {/* Slider de velocidad 1 a 20 */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={playback.speed}
                onChange={e => onSetSpeed(parseInt(e.target.value, 10))}
                className="w-20 sm:w-28 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                title={`Velocidad: ${playback.speed} / 20`}
              />
              <span className="font-mono text-xs sm:text-sm font-black text-amber-400 min-w-[50px] text-center tabular-nums">
                {playback.speed} / 20
              </span>
            </div>

            <button
              onClick={() => onSetSpeed(Math.min(20, playback.speed + 1))}
              disabled={playback.speed >= 20}
              className="p-1 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors cursor-pointer"
              title="Más rápido"
            >
              <Plus className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Center: Song details & Playlist step */}
        <div className="hidden md:flex items-center gap-3 min-w-0 text-center">
          {hasSetlist && (
            <div className="flex items-center gap-1.5 mr-2 shrink-0">
              <button
                onClick={onPrevSong}
                disabled={currentSetlistIdx <= 0}
                className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                title="Canción anterior"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-neutral-400">
                {currentSetlistIdx + 1}/{activeSetlist.songIds.length}
              </span>
              <button
                onClick={onNextSong}
                disabled={currentSetlistIdx >= activeSetlist.songIds.length - 1}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 text-xs font-medium transition-colors cursor-pointer"
                title="Siguiente canción"
              >
                <span>Siguiente</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="truncate">
            <span className="text-base font-black text-white tracking-wide truncate">
              {song?.title || 'Canción'}
            </span>
            {song?.musicalKey && (
              <span className="text-xs text-amber-400 font-mono ml-2">
                [{song.musicalKey}]
              </span>
            )}
            {song?.bpm && (
              <span className="text-xs text-neutral-400 font-mono ml-2">
                [{song.bpm} BPM]
              </span>
            )}
          </div>
        </div>

        {/* Right: Fullscreen and Exit/Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Pantalla Completa (F)"
            aria-label="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950 text-neutral-300 hover:text-rose-400 border border-neutral-800 hover:border-rose-800 transition-colors text-xs font-semibold cursor-pointer"
            title="Volver a Inicio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      </div>

      {/* Discrete Progress Bar */}
      {settings.showProgressBar && (
        <div className="w-full h-1 bg-neutral-900 shrink-0">
          <div
            className="h-full bg-amber-400 transition-all duration-150 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, playback.scrollPercent))}%` }}
          />
        </div>
      )}

      {/* =========================================================================
          KARAOKE SCROLL CONTAINER: FONDO NEGRO PURO, TEXTO GRANDE Y AUTO-SCROLL
         ========================================================================= */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar"
        style={{
          paddingLeft: `${settings.sidePadding}px`,
          paddingRight: `${settings.sidePadding}px`,
        }}
      >
        {/* Top spacer so song begins comfortably */}
        <div className="h-[20vh]" />

        <div className={`mx-auto ${getMaxWidthClass()}`}>
          {/* Song Header Title / Key / BPM */}
          {song && (
            <div className="mb-14 border-b border-neutral-900 pb-6 text-center">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase">
                {song.title}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm sm:text-base font-medium text-neutral-400 mt-3 font-mono">
                <span>{song.artist}</span>
                {song.musicalKey && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-amber-400 font-semibold">Tono: {song.musicalKey}</span>
                  </>
                )}
                {song.bpm && (
                  <>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-neutral-300">{song.bpm} BPM</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Karaoke Lyrics Sections */}
          {!song ? (
            <div className="py-20 text-center text-neutral-500 font-mono text-xl">
              No hay canción cargada actualmente.
            </div>
          ) : (
            <div className="space-y-16">
              {sections.map((section, idx) => {
                const isCurrent = activeSectionIdx === idx;
                return (
                  <div
                    key={section.id || idx}
                    ref={el => {
                      sectionRefs.current[idx] = el;
                    }}
                    className={`section-block transition-all duration-300 ${
                      settings.textAlign === 'center' ? 'text-center' : 'text-left'
                    } ${isCurrent ? 'opacity-100 scale-[1.01]' : 'opacity-85'}`}
                  >
                    {/* Section Badge (Optional) */}
                    {settings.showSectionBadge && section.name && (
                      <div className="mb-4">
                        <span className={`inline-block text-xs sm:text-sm font-bold tracking-widest uppercase font-mono px-3.5 py-1 rounded-md border ${
                          isCurrent
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-md shadow-amber-500/10'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                        }`}>
                          {section.name}
                        </span>
                      </div>
                    )}

                    {/* Lyrics Text in Crisp White Karaoke Style */}
                    <div
                      className={`font-bold tracking-wide ${
                        settings.uppercaseLyrics ? 'uppercase' : ''
                      } ${isCurrent ? 'text-white drop-shadow-sm' : 'text-neutral-200'}`}
                      style={{
                        fontSize: `${settings.fontSize}px`,
                        lineHeight: settings.lineHeight,
                        wordBreak: 'break-word',
                        textWrap: 'balance',
                      }}
                    >
                      {section.content.split('\n').map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className={line.trim() === '' ? 'h-6' : 'min-h-[1.2em] py-0.5'}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom padding to allow full scroll through final lines */}
        <div className="h-[75vh]" />
      </div>
    </div>
  );
};
