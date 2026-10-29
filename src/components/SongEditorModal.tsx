/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Music2, Sparkles, AlertCircle, PlusCircle, Check } from 'lucide-react';
import { Song, SongSection } from '../types';
import { generateId, parseRawLyrics, getSectionBadgeStyle } from '../utils/lyricsParser';

interface SongEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: Song) => void;
  songToEdit?: Song | null;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  songToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [bpm, setBpm] = useState<string>('');
  const [musicalKey, setMusicalKey] = useState('');
  const [notes, setNotes] = useState('');
  const [rawLyrics, setRawLyrics] = useState('');
  const [parsedSections, setParsedSections] = useState<SongSection[]>([]);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (songToEdit) {
      setTitle(songToEdit.title);
      setArtist(songToEdit.artist);
      setBpm(songToEdit.bpm ? String(songToEdit.bpm) : '');
      setMusicalKey(songToEdit.musicalKey || '');
      setNotes(songToEdit.notes || '');
      setRawLyrics(songToEdit.rawLyrics);
      setParsedSections(songToEdit.sections);
    } else {
      setTitle('');
      setArtist('');
      setBpm('');
      setMusicalKey('');
      setNotes('');
      setRawLyrics(
        `[INTRO]\n(Acordes de inicio y conteo)\n\n[VERSO 1]\nEscribe o pega aquí la primera estrofa\nLínea por línea con tus saltos de compás\n\n[CORO]\n¡Este es el estribillo principal!\nTodo el poder en esta parte\n\n[OUTRO]\nFinal en acorde sostenido`
      );
      setParsedSections([]);
    }
    setError(null);
  }, [songToEdit, isOpen]);

  // Update parsed sections whenever rawLyrics changes
  useEffect(() => {
    const sections = parseRawLyrics(rawLyrics);
    setParsedSections(sections);
  }, [rawLyrics]);

  if (!isOpen) return null;

  const handleInsertTag = (tag: string) => {
    const addition = `\n\n[${tag}]\n`;
    setRawLyrics(prev => prev + addition);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor indica el título de la canción.');
      return;
    }
    if (!rawLyrics.trim()) {
      setError('Por favor ingresa la letra de la canción.');
      return;
    }

    const sections = parseRawLyrics(rawLyrics);
    const finalSong: Song = {
      id: songToEdit ? songToEdit.id : generateId(),
      title: title.trim(),
      artist: artist.trim() || 'Artista no especificado',
      bpm: bpm ? parseInt(bpm, 10) || undefined : undefined,
      musicalKey: musicalKey.trim() || undefined,
      notes: notes.trim() || undefined,
      rawLyrics: rawLyrics,
      sections: sections,
      createdAt: songToEdit ? songToEdit.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSave(finalSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 my-8 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="song-editor-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="song-editor-title" className="text-lg font-bold text-white">
                {songToEdit ? 'Editar Canción' : 'Nueva Canción para el Teleprompter'}
              </h2>
              <p className="text-xs text-slate-400">
                Pega la letra completa y el reconocedor separará automáticamente las secciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Título de la Canción *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Noche Eléctrica"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Banda / Artista
              </label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Ej. Mi Banda"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  BPM
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={bpm}
                  onChange={e => setBpm(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tonalidad
                </label>
                <input
                  type="text"
                  value={musicalKey}
                  onChange={e => setMusicalKey(e.target.value)}
                  placeholder="Em / C"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notas para el Ensayo (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. El baterista cuenta 4 compases. Solo con fuzz después del segundo coro."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Quick Tag Inserters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Insertar etiqueta de sección
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'editor' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Editor de Letra
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'preview' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Estructura ({parsedSections.length})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['INTRO', 'VERSO 1', 'VERSO 2', 'PRE-CORO', 'CORO', 'PUENTE', 'SOLO', 'OUTRO'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1 border border-slate-700/60"
                >
                  <PlusCircle className="w-3 h-3 text-amber-400" />
                  [{tag}]
                </button>
              ))}
            </div>
          </div>

          {/* Editor / Preview Content */}
          {activeTab === 'editor' ? (
            <div>
              <textarea
                required
                rows={12}
                value={rawLyrics}
                onChange={e => setRawLyrics(e.target.value)}
                placeholder="Pega o escribe aquí la letra de la canción..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-500 transition-colors resize-y"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Usa corchetes como <code className="text-amber-400 font-mono">[CORO]</code> o <code className="text-amber-400 font-mono">[VERSO]</code> para delimitar secciones que podrás saltar durante el ensayo.
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[340px] overflow-y-auto">
              {parsedSections.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Aún no hay secciones detectadas.</p>
              ) : (
                parsedSections.map((sec, idx) => {
                  const badge = getSectionBadgeStyle(sec.type);
                  return (
                    <div
                      key={sec.id || idx}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold uppercase ${badge.bg} ${badge.text} border ${badge.border}`}>
                          {sec.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {sec.content.split('\n').filter(Boolean).length} líneas
                        </span>
                      </div>
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap font-sans">
                        {sec.content || <span className="text-slate-600 italic">(Sección instrumental o vacía)</span>}
                      </pre>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              <Check className="w-4 h-4" />
              Guardar Canción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
