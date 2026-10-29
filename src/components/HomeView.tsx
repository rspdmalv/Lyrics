/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, BookmarkPlus, Check, Music2, Gauge, KeyRound, Sparkles } from 'lucide-react';
import { Song, VisualSettings, MUSICAL_KEYS, calculateSpeedFromBpm } from '../types';
import { generateId, parseRawLyrics } from '../utils/lyricsParser';

interface HomeViewProps {
  activeSong: Song | null;
  settings: VisualSettings;
  onSaveToLibrary: (song: Song) => void;
  onLaunchTeleprompter: (song: Song, initialSpeed?: number) => void;
  songs: Song[];
  onSelectExistingSong: (songId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  activeSong,
  settings,
  onSaveToLibrary,
  onLaunchTeleprompter,
  songs,
  onSelectExistingSong,
}) => {
  const [title, setTitle] = useState(activeSong?.title || '');
  const [musicalKey, setMusicalKey] = useState(activeSong?.musicalKey || 'Sin especificar');
  const [bpm, setBpm] = useState<string>(activeSong?.bpm ? String(activeSong.bpm) : '');
  const [rawLyrics, setRawLyrics] = useState(activeSong?.rawLyrics || '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state if activeSong changes from outside (e.g. from Library or Setlists)
  useEffect(() => {
    if (activeSong) {
      setTitle(activeSong.title);
      setMusicalKey(activeSong.musicalKey || 'Sin especificar');
      setBpm(activeSong.bpm ? String(activeSong.bpm) : '');
      setRawLyrics(activeSong.rawLyrics);
    }
  }, [activeSong]);

  const parsedBpm = bpm ? parseInt(bpm, 10) || undefined : undefined;
  const estimatedSpeed = calculateSpeedFromBpm(parsedBpm);

  const handleClearForm = () => {
    setTitle('');
    setMusicalKey('Sin especificar');
    setBpm('');
    setRawLyrics('');
  };

  // Build current song object from inputs
  const getCurrentSongObject = (): Song => {
    const finalTitle = title.trim() || 'Canción sin título';
    const finalKey = musicalKey === 'Sin especificar' ? undefined : musicalKey;
    const finalSections = parseRawLyrics(rawLyrics.trim() || '(Sin letra ingresada)');

    // If activeSong exists and matches current title, keep its ID; otherwise assign new UUID
    const isSameSong = activeSong && activeSong.title.trim().toLowerCase() === finalTitle.toLowerCase();
    const targetId = isSameSong ? activeSong.id : generateId();

    return {
      id: targetId,
      title: finalTitle,
      artist: activeSong && isSameSong ? activeSong.artist : 'Banda',
      bpm: parsedBpm,
      musicalKey: finalKey,
      notes: activeSong && isSameSong ? activeSong.notes : undefined,
      rawLyrics: rawLyrics,
      sections: finalSections,
      createdAt: (activeSong && isSameSong ? activeSong.createdAt : undefined) || Date.now(),
      updatedAt: Date.now(),
    };
  };

  const handlePlay = () => {
    const song = getCurrentSongObject();
    onLaunchTeleprompter(song, estimatedSpeed);
  };

  const handleSave = () => {
    const song = getCurrentSongObject();
    onSaveToLibrary(song);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            COLUMN 1 (LEFT): NUEVA CANCIÓN / ENTRADA DE DATOS
           ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Music2 className="w-5 h-5 text-amber-400" />
                  Nueva canción
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ingresa los datos y la letra para comenzar
                </p>
              </div>

              {/* Quick load existing song selector & New song button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                  title="Limpiar campos para escribir una canción desde cero"
                >
                  + Vaciar / Nueva
                </button>

                {songs.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 hidden sm:inline">Cargar:</span>
                    <select
                      value={activeSong?.id || ''}
                      onChange={e => onSelectExistingSong(e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">Seleccionar guardada...</option>
                      {songs.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Input 1: Inserte nombre de la canción */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Inserte nombre de la canción
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Noche Eléctrica"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-base font-semibold focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
            </div>

            {/* Row with Input 2 (Tonalidad dropdown) and Input 3 (BPM) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Input 2: Tonalidad (Opcional) Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Tonalidad (Opcional)
                </label>
                <select
                  value={musicalKey}
                  onChange={e => setMusicalKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer transition-colors"
                >
                  {MUSICAL_KEYS.map(k => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input 3: BPM Opcional */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  BPM (Opcional)
                </label>
                <input
                  type="number"
                  min="30"
                  max="260"
                  value={bpm}
                  onChange={e => setBpm(e.target.value)}
                  placeholder="Ej. 120"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                {parsedBpm ? (
                  <p className="text-[11px] text-amber-400/90 font-mono">
                    Velocidad calculada: nivel {estimatedSpeed} / 10
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-mono">
                    Velocidad por defecto: nivel 4
                  </p>
                )}
              </div>
            </div>

            {/* Input Grande: Inserte aquí la letra de la canción */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Inserte aquí la letra de la canción:
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {rawLyrics.split('\n').filter(Boolean).length} líneas escritas
                </span>
              </div>
              <textarea
                rows={16}
                value={rawLyrics}
                onChange={e => setRawLyrics(e.target.value)}
                placeholder="Pega o escribe aquí la letra completa de la canción...

Puedes usar etiquetas opcionales como:
[INTRO]
[VERSO 1]
[CORO]
[PUENTE]
[OUTRO]"
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-500 transition-colors resize-y shadow-inner"
              />
            </div>

            {/* Action button: Save in library */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Guarda esta versión en tu repertorio para próximos ensayos
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors border border-slate-700"
              >
                {savedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4 text-amber-400" />
                    <span>Guardar en Biblioteca</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            COLUMN 2 (RIGHT): VISTA PREVIA DE LA LETRA + BOTÓN PLAY AMARILLO
           ========================================================================= */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
            {/* Header: Title + Big Yellow PLAY button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black tracking-wider uppercase text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  VISTA PREVIA DE LA LETRA
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fondo negro de alta legibilidad para el televisor
                </p>
              </div>

              {/* Botón de PLAY color amarillo grande para iniciar la canción */}
              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base transition-all transform active:scale-95 shadow-lg shadow-amber-400/25 shrink-0 cursor-pointer"
                title="Iniciar canción con desplazamiento automático"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>INICIAR LETRA</span>
              </button>
            </div>

            {/* Song Meta Preview Tag */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 py-3">
              <span className="font-semibold text-white truncate">
                {title.trim() || 'Canción sin título'}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {musicalKey !== 'Sin especificar' && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                    {musicalKey}
                  </span>
                )}
                {parsedBpm && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {parsedBpm} BPM (Vel. {estimatedSpeed})
                  </span>
                )}
              </div>
            </div>

            {/* Pure Black Teleprompter Preview Screen */}
            <div className="w-full bg-[#000000] border border-neutral-800 rounded-2xl p-6 sm:p-8 min-h-[520px] max-h-[660px] overflow-y-auto no-scrollbar shadow-2xl relative select-none">
              {rawLyrics.trim() ? (
                <div
                  className={`space-y-6 ${
                    settings.textAlign === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {/* Optional Title in preview */}
                  {settings.showSongHeader && title.trim() && (
                    <div className="border-b border-neutral-800 pb-4 mb-6">
                      <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                        {title.trim()}
                      </h3>
                      {musicalKey !== 'Sin especificar' && (
                        <p className="text-xs text-neutral-400 font-mono mt-1">
                          Tonalidad: {musicalKey} {parsedBpm ? `· ${parsedBpm} BPM` : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Lyrics Text Rendered in Crisp White */}
                  <div
                    className={`font-semibold text-[#FFFFFF] tracking-wide whitespace-pre-wrap ${
                      settings.uppercaseLyrics ? 'uppercase' : ''
                    }`}
                    style={{
                      fontSize: `${Math.max(16, Math.round(settings.fontSize * 0.42))}px`,
                      lineHeight: settings.lineHeight,
                    }}
                  >
                    {rawLyrics}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[460px] text-center text-neutral-500 space-y-3">
                  <Music2 className="w-10 h-10 text-neutral-700" />
                  <p className="text-sm font-mono">
                    La vista previa aparecerá aquí en tiempo real a medida que ingreses la letra a la izquierda.
                  </p>
                  <p className="text-xs text-neutral-600">
                    Pulsa el botón amarillo de PLAY para proyectarla en el televisor.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-3 text-center">
              Fondo negro puro (#000000) y tipografía de alto contraste para máxima visibilidad en el ensayo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
