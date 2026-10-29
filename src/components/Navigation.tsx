/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Keyboard, Music2, LogIn, User as UserIcon, FileText, LogOut, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'inicio' | 'cancion' | 'library' | 'setlists' | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveSong: boolean;
  onOpenTvGuide: () => void;
  onOpenShortcuts: () => void;
  onOpenLogs?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  hasActiveSong,
  onOpenTvGuide,
  onOpenShortcuts,
  onOpenLogs,
}) => {
  const { user, emailVerified, openAuthModal, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);

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

        {/* Zone 3: Clean action icons & User Account */}
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

          {/* User Account Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                  {(user.displayName || user.email || 'U').charAt(0)}
                </div>
                <span className="hidden md:inline max-w-[120px] truncate text-slate-200">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {emailVerified ? (
                  <span title="Correo verificado">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </span>
                ) : (
                  <span title="Verificación pendiente">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 text-xs text-slate-200 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white truncate">{user.displayName || 'Músico'}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            emailVerified
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                          }`}
                        >
                          {emailVerified ? 'Cuenta confirmada' : 'Confirmación pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      {onOpenLogs && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenLogs();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-800/80 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-amber-400" />
                          <span>Ver Logs de Auditoría</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-red-950/40 rounded-lg text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-amber-400/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
