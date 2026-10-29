/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Monitor, Tv, X, ExternalLink, Copy, Check, Cable } from 'lucide-react';

interface TvGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStageWindow: () => void;
}

export const TvGuideModal: React.FC<TvGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenStageWindow,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const stageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=stage`
    : '';

  const handleCopyLink = () => {
    if (stageUrl) {
      navigator.clipboard.writeText(stageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tv-guide-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Cerrar guía"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 id="tv-guide-title" className="text-xl font-bold tracking-tight text-white">
              Conexión al televisor o monitor de ensayo
            </h2>
            <p className="text-sm text-slate-400">
              Configura tu sistema de doble pantalla para ensayar sin cables raros ni programas extra
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-mono font-semibold flex items-center justify-center text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Cable className="w-4 h-4 text-slate-400" /> Conecta tu televisor mediante cable HDMI
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Conecta el computador a la pantalla o televisor del local de ensayo con un cable HDMI o adaptador DisplayPort/USB-C.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-mono font-semibold flex items-center justify-center text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-slate-400" /> Configura &ldquo;Extender pantalla&rdquo;
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                En Windows presiona <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-200">Win + P</kbd> y elige <strong className="text-slate-200">Extender</strong>. En Mac ve a <strong className="text-slate-200">Ajustes &gt; Pantallas &gt; Extender pantalla</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 font-mono font-semibold flex items-center justify-center text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" /> Abre la ventana del Modo Escenario
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Haz clic en el botón inferior para abrir la ventana de escenario. Arrástrala al televisor y pulsa la tecla <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-200">F</kbd> para activar la pantalla completa.
              </p>
            </div>
          </div>
        </div>

        {/* Link box */}
        <div className="mb-6 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="font-mono text-slate-400 truncate select-all">{stageUrl}</span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '¡Copiado!' : 'Copiar URL'}
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Entendido
          </button>
          <button
            onClick={() => {
              onOpenStageWindow();
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Modo Escenario Ahora
          </button>
        </div>
      </div>
    </div>
  );
};
