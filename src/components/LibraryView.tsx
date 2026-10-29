/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Plus, Play, Edit3, Copy, Trash2, Music2, RotateCcw } from 'lucide-react';
import { Song } from '../types';

interface LibraryViewProps {
  songs: Song[];
  activeSongId: string | null;
  onSelectSong: (songId: string) => void;
  onPlaySong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDuplicateSong: (songId: string) => void;
  onDeleteSong: (songId: string) => void;
  onNewSong: () => void;
  onResetDemoSongs: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  activeSongId,
  onSelectSong,
  onPlaySong,
  onEditSong,
  onDuplicateSong,
  onDeleteSong,
  onNewSong,
  onResetDemoSongs,
}) => {
  const [search, setSearch] = useState('');
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);

  const filtered = songs.filter(s => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
  });

  const confirmDelete = () => {
    if (songToDelete) {
      onDeleteSong(songToDelete.id);
      setSongToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Biblioteca de Canciones</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {songs.length} {songs.length === 1 ? 'canción guardada' : 'canciones guardadas'} listas para teleprompter
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNewSong}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Canción
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o artista..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {songs.length === 0 && (
          <button
            onClick={onResetDemoSongs}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer canciones de ejemplo
          </button>
        )}
      </div>

      {/* Songs Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Music2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No se encontraron canciones</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {search
              ? 'Prueba con otro término de búsqueda o limpia el filtro.'
              : 'Tu repertorio está vacío. Puedes crear una nueva canción o cargar las canciones de demostración.'}
          </p>
          {songs.length === 0 ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onResetDemoSongs}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
              >
                Cargar canciones de ejemplo
              </button>
              <button
                onClick={onNewSong}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors"
              >
                Crear canción
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(song => {
            const isActive = song.id === activeSongId;
            const sectionCount = song.sections?.length || 1;

            return (
              <div
                key={song.id}
                className={`relative rounded-2xl p-5 bg-slate-900 border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                      {song.title}
                    </h3>
                    {isActive && (
                      <span className="text-[11px] font-semibold font-mono text-amber-400 uppercase tracking-wider shrink-0">
                        Canción activa
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 font-medium line-clamp-1 mb-3">
                    {song.artist}
                  </p>

                  {/* Clean unboxed metadata with bullet separators (anti-slop) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4 font-mono">
                    <span>{sectionCount} {sectionCount === 1 ? 'sección' : 'secciones'}</span>
                    {song.bpm && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{song.bpm} BPM</span>
                      </>
                    )}
                    {song.musicalKey && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{song.musicalKey}</span>
                      </>
                    )}
                  </div>

                  {song.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2 mb-4">
                      {song.notes}
                    </p>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onPlaySong(song)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
                    title="Iniciar canción en modo karaoke con desplazamiento automático"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Ensayar
                  </button>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => onSelectSong(song.id)}
                      className="px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Ver y editar en Inicio"
                    >
                      Cargar en Inicio
                    </button>
                    <button
                      onClick={() => onEditSong(song)}
                      className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Editar letra y datos"
                      aria-label="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateSong(song.id)}
                      className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Duplicar canción"
                      aria-label="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSongToDelete(song)}
                      className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Eliminar canción"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {songToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar canción?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Estás a punto de eliminar <strong className="text-white">&ldquo;{songToDelete.title}&rdquo;</strong>. Esta acción no se puede deshacer y también se retirará de los setlists donde esté incluida.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSongToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-sm"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
