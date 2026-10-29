/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Espacio', description: 'Iniciar o pausar el desplazamiento automático' },
    { key: '↓', description: 'Avanzar / desplazar hacia abajo (+50 px)' },
    { key: '↑', description: 'Retroceder / desplazar hacia arriba (-50 px)' },
    { key: '+ / -', description: 'Aumentar o reducir el tamaño de letra en tiempo real' },
    { key: '] / [', description: 'Aumentar o reducir la velocidad de desplazamiento' },
    { key: 'Inicio (Home)', description: 'Regresar de inmediato al principio de la canción' },
    { key: 'N', description: 'Siguiente canción del setlist' },
    { key: 'P', description: 'Canción anterior del setlist' },
    { key: 'F', description: 'Alternar modo pantalla completa en la ventana activa' },
    { key: 'Escape', description: 'Salir del modo de pantalla completa' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Cerrar atajos"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h2 id="shortcuts-title" className="text-lg font-bold tracking-tight text-white">
              Atajos de Teclado del Ensayo
            </h2>
            <p className="text-xs text-slate-400">
              Controla el teleprompter al instante sin despegar las manos del teclado
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80 mb-6 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 px-1 text-sm">
              <span className="text-slate-300">{sc.description}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-amber-400 font-semibold shadow-xs shrink-0 ml-3">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 mb-4 italic">
          Nota: Los atajos se desactivan automáticamente mientras estás escribiendo en los campos del editor de canciones.
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
