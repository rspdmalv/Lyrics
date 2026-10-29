/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ListMusic, Plus, Play, ChevronUp, ChevronDown, Trash2, X, Check, Edit2, AlertCircle } from 'lucide-react';
import { Setlist, Song } from '../types';
import { generateId } from '../utils/lyricsParser';

interface SetlistsViewProps {
  setlists: Setlist[];
  songs: Song[];
  activeSetlistId: string | null;
  onSaveSetlist: (setlist: Setlist) => void;
  onDeleteSetlist: (setlistId: string) => void;
  onStartRehearsal: (setlistId: string, startIndex?: number) => void;
}

export const SetlistsView: React.FC<SetlistsViewProps> = ({
  setlists,
  songs,
  activeSetlistId,
  onSaveSetlist,
  onDeleteSetlist,
  onStartRehearsal,
}) => {
  const [selectedSetlistId, setSelectedSetlistId] = useState<string>(
    setlists[0]?.id || ''
  );
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isAddingSongModal, setIsAddingSongModal] = useState(false);
  const [setlistToDelete, setSetlistToDelete] = useState<Setlist | null>(null);

  const currentSetlist = setlists.find(st => st.id === selectedSetlistId) || setlists[0];

  const handleCreateNew = () => {
    const newSetlist: Setlist = {
      id: generateId(),
      name: `Nuevo Setlist ${setlists.length + 1}`,
      description: 'Lista de temas para ensayo de banda',
      songIds: songs.slice(0, 3).map(s => s.id),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    onSaveSetlist(newSetlist);
    setSelectedSetlistId(newSetlist.id);
  };

  const handleOpenEditMeta = () => {
    if (!currentSetlist) return;
    setEditName(currentSetlist.name);
    setEditDesc(currentSetlist.description || '');
    setIsEditingMeta(true);
  };

  const handleSaveMeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSetlist || !editName.trim()) return;
    onSaveSetlist({
      ...currentSetlist,
      name: editName.trim(),
      description: editDesc.trim(),
      updatedAt: Date.now(),
    });
    setIsEditingMeta(false);
  };

  const handleMoveSong = (index: number, direction: 'up' | 'down') => {
    if (!currentSetlist) return;
    const ids = [...currentSetlist.songIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;

    const temp = ids[index];
    ids[index] = ids[targetIndex];
    ids[targetIndex] = temp;

    onSaveSetlist({
      ...currentSetlist,
      songIds: ids,
      updatedAt: Date.now(),
    });
  };

  const handleRemoveSong = (songIdToRemove: string) => {
    if (!currentSetlist) return;
    onSaveSetlist({
      ...currentSetlist,
      songIds: currentSetlist.songIds.filter(id => id !== songIdToRemove),
      updatedAt: Date.now(),
    });
  };

  const handleAddSongToSetlist = (songId: string) => {
    if (!currentSetlist) return;
    if (currentSetlist.songIds.includes(songId)) return;
    onSaveSetlist({
      ...currentSetlist,
      songIds: [...currentSetlist.songIds, songId],
      updatedAt: Date.now(),
    });
  };

  // Resolve songs in current setlist preserving order
  const currentSongsInOrder: (Song | null)[] = currentSetlist
    ? currentSetlist.songIds.map(id => songs.find(s => s.id === id) || null)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Setlists de Ensayo</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Organiza el orden de los temas y avanza la lista completa durante el ensayo
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear Setlist
        </button>
      </div>

      {setlists.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
          <ListMusic className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No hay setlists creados</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Crea tu primer setlist para encadenar las canciones de tu ensayo una tras otra sin interrupciones.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
          >
            Crear primer setlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Setlists Selector Tabs */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tus Setlists ({setlists.length})
            </h2>
            <div className="space-y-2">
              {setlists.map(st => {
                const isSelected = currentSetlist && currentSetlist.id === st.id;
                const isRehearsingNow = activeSetlistId === st.id;

                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedSetlistId(st.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/20 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white truncate">{st.name}</span>
                        {isRehearsingNow && (
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                            En curso
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                        <span>{st.songIds.length} canciones</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Setlist Detail & Songs Manager */}
          {currentSetlist && (
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                {/* Setlist Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white tracking-tight">
                        {currentSetlist.name}
                      </h2>
                      <button
                        onClick={handleOpenEditMeta}
                        className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                        title="Editar nombre y descripción"
                        aria-label="Editar datos"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {currentSetlist.description && (
                      <p className="text-sm text-slate-400 mt-1">{currentSetlist.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-mono">
                      <span>{currentSetlist.songIds.length} canciones en la lista</span>
                      {activeSetlistId === currentSetlist.id && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400 font-semibold">Setlist activo en el ensayo</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSetlistToDelete(currentSetlist)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                      title="Eliminar este setlist"
                      aria-label="Eliminar setlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onStartRehearsal(currentSetlist.id, 0)}
                      disabled={currentSetlist.songIds.length === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs sm:text-sm transition-colors shadow-sm"
                      title="Cargar la primera canción y abrir el panel de control con este setlist"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Iniciar Ensayo con este Set
                    </button>
                  </div>
                </div>

                {/* Songs Table / Reorder List */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Orden de canciones en el ensayo
                    </h3>
                    <button
                      onClick={() => setIsAddingSongModal(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar canción
                    </button>
                  </div>

                  {currentSongsInOrder.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <p className="text-sm text-slate-400">Este setlist aún no tiene canciones agregadas.</p>
                      <button
                        onClick={() => setIsAddingSongModal(true)}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Añadir canciones ahora
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentSongsInOrder.map((song, index) => {
                        if (!song) return null;
                        const isFirst = index === 0;
                        const isLast = index === currentSongsInOrder.length - 1;

                        return (
                          <div
                            key={song.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 text-center font-mono text-xs font-semibold text-slate-500 tabular-nums">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate">
                                  {song.title}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                                  <span>{song.artist}</span>
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
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => onStartRehearsal(currentSetlist.id, index)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                                title="Empezar ensayo desde esta canción"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </button>
                              <button
                                onClick={() => handleMoveSong(index, 'up')}
                                disabled={isFirst}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Subir canción"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveSong(index, 'down')}
                                disabled={isLast}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Bajar canción"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveSong(song.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-1"
                                title="Quitar de este setlist (no se borra de la biblioteca)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Metadata Modal */}
      {isEditingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Editar Datos del Setlist</h3>
            <form onSubmit={handleSaveMeta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre del Setlist
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción u observaciones
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Ej. Setlist para ensayo de domingo por la tarde"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingMeta(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Songs to Setlist Modal */}
      {isAddingSongModal && currentSetlist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Añadir Canciones al Setlist</h3>
              <button
                onClick={() => setIsAddingSongModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {songs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  No hay canciones creadas en la biblioteca.
                </p>
              ) : (
                songs.map(song => {
                  const alreadyIn = currentSetlist.songIds.includes(song.id);
                  return (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-white">{song.title}</h4>
                        <p className="text-xs text-slate-400 font-mono">{song.artist}</p>
                      </div>

                      {alreadyIn ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <Check className="w-3.5 h-3.5" /> Agregada
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSongToSetlist(song.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors"
                        >
                          Añadir
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAddingSongModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Setlist Confirmation */}
      {setlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Eliminar setlist?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Estás a punto de eliminar el setlist <strong className="text-white">&ldquo;{setlistToDelete.name}&rdquo;</strong>. Las canciones permanecerán intactas en tu biblioteca.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSetlistToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteSetlist(setlistToDelete.id);
                  setSetlistToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Sí, eliminar setlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
