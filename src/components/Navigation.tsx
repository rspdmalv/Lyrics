/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Keyboard, Music2 } from 'lucide-react';

export type ActiveTab = 'inicio' | 'cancion' | 'library' | 'setlists' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveSong: boolean;
  onOpenTvGuide: () => void;
  onOpenShortcuts: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  hasActiveSong,
  onOpenTvGuide,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('inicio')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm tracking-tighter">
              SL
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
              StageLyrics
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => onSelectTab('inicio')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inicio'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Inicio
          </button>

          {/* Módulo Canción: visible cuando hayamos hecho click en INICIAR LETRA o Ensayar */}
          {(hasActiveSong || activeTab === 'cancion') && (
            <button
              onClick={() => onSelectTab('cancion')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'cancion'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-semibold'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Canción</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('library')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Biblioteca
          </button>

          <button
            onClick={() => onSelectTab('setlists')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'setlists'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Setlists
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Ajustes
          </button>
        </nav>

        {/* Zone 3: Clean action icons (NO Teleprompter button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenShortcuts}
            title="Ver atajos de teclado"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Atajos de teclado"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenTvGuide}
            title="Guía para conectar TV por HDMI"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Guía TV HDMI"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
