/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  Sliders, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Tv, 
  Check, 
  AlertCircle, 
  Eye,
  Database,
  Cloud,
  FileText,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { TextMaxWidth, VisualSettings } from '../types';
import { DEFAULT_VISUAL_SETTINGS, storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  settings: VisualSettings;
  onUpdateSettings: (newSettings: VisualSettings) => void;
  onResetDemoSongs: () => void;
  onClearAllData: () => void;
  onOpenTvGuide: () => void;
  onRefreshData: () => void;
  onOpenLogs?: () => void;
  onSyncLocalToCloud?: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDemoSongs,
  onClearAllData,
  onOpenTvGuide,
  onRefreshData,
  onOpenLogs,
  onSyncLocalToCloud,
}) => {
  const { user, emailVerified, openAuthModal, logout, refreshVerification } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);


  const handleSettingChange = <K extends keyof VisualSettings>(key: K, value: VisualSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1500);
  };

  const handleExport = () => {
    const jsonStr = storageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `stagelyrics-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = storageService.validateAndImportBackup(content);
      setImportStatus(res);
      if (res.success && res.data) {
        onUpdateSettings(res.data.settings);
        onRefreshData();
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be reselected if needed
    e.target.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-amber-400" />
            Configuración y Preferencias
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personaliza la legibilidad del teleprompter en el televisor y gestiona respaldos locales
          </p>
        </div>

        {savedBadge && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5" /> Cambios sincronizados
          </div>
        )}
      </div>

      {/* Cloud Database & Account Group */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          Base de Datos en la Nube y Cuenta de Usuario
        </h2>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">Google Cloud Firestore Conectado</span>
              </div>
              <p className="text-xs text-slate-400">
                Almacenamiento seguro en la nube para canciones individuales por usuario y logs de auditoría.
              </p>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-xl text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Crear Cuenta
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 block">Usuario Conectado</span>
                <span className="font-semibold text-white truncate block">{user.displayName || 'Músico'}</span>
                <span className="text-slate-400 text-[11px] truncate block">{user.email}</span>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-400 block">Estado del Correo</span>
                <div className="flex items-center gap-1.5">
                  {emailVerified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Confirmado y Habilitado</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-amber-400">Verificación Pendiente</span>
                    </>
                  )}
                </div>
                {!emailVerified && (
                  <button
                    onClick={refreshVerification}
                    className="mt-1 text-[11px] text-amber-300 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Comprobar confirmación
                  </button>
                )}
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between gap-2">
                <span className="text-slate-400 block">Herramientas de Auditoría</span>
                <div className="flex flex-wrap gap-2">
                  {onOpenLogs && (
                    <button
                      onClick={onOpenLogs}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Ver Logs ({user.email?.split('@')[0]})
                    </button>
                  )}
                  {onSyncLocalToCloud && (
                    <button
                      onClick={async () => {
                        setSyncingCloud(true);
                        setSyncSuccess(null);
                        try {
                          await onSyncLocalToCloud();
                          setSyncSuccess('Canciones sincronizadas con tu cuenta en la nube.');
                          setTimeout(() => setSyncSuccess(null), 3500);
                        } finally {
                          setSyncingCloud(false);
                        }
                      }}
                      disabled={syncingCloud}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      <Cloud className={`w-3.5 h-3.5 text-blue-400 ${syncingCloud ? 'animate-bounce' : ''}`} />
                      {syncingCloud ? 'Sincronizando...' : 'Subir canciones locales'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-white font-medium">Modo Local Activo</p>
                <p className="text-slate-400 leading-relaxed">
                  Estás utilizando el almacenamiento local del navegador. Crea una cuenta gratuita con tu correo y contraseña para guardar tus canciones en la base de datos y tenerlas disponibles en cualquier computador.
                </p>
              </div>
            </div>
          )}

          {syncSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Settings Group */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Tipografía y Lectura en el Escenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Tamaño de Fuente en TV</label>
              <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                {settings.fontSize} px
              </span>
            </div>
            <input
              type="range"
              min="28"
              max="96"
              step="2"
              value={settings.fontSize}
              onChange={e => handleSettingChange('fontSize', parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>28px (Monitor chico)</span>
              <span>54px (TV 50&quot;)</span>
              <span>96px (TV 4K gigante)</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white">Interlineado (Espaciado)</label>
              <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">
                {settings.lineHeight.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="1.3"
              max="2.2"
              step="0.1"
              value={settings.lineHeight}
              onChange={e => handleSettingChange('lineHeight', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>1.3 (Compacto)</span>
              <span>1.6 (Recomendado)</span>
              <span>2.2 (Muy separado)</span>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white block">Alineación del Texto</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSettingChange('textAlign', 'center')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  settings.textAlign === 'center'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Centrado (Clásico teleprompter)
              </button>
              <button
                type="button"
                onClick={() => handleSettingChange('textAlign', 'left')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  settings.textAlign === 'left'
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Alineado a la Izquierda
              </button>
            </div>
          </div>

          {/* Max Width */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white block">Ancho del Bloque de Letra</label>
            <div className="grid grid-cols-4 gap-2">
              {(['normal', 'wide', 'ultra', 'full'] as TextMaxWidth[]).map(mw => (
                <button
                  key={mw}
                  type="button"
                  onClick={() => handleSettingChange('maxWidth', mw)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize transition-colors text-center ${
                    settings.maxWidth === mw
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mw === 'normal' ? 'Medio' : mw === 'wide' ? 'Ancho' : mw === 'ultra' ? 'Ultra' : 'Total'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Elements Visibility */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Elementos Visuales en el Modo Escenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white block">Título y Artista</span>
              <span className="text-xs text-slate-400">Mostrar cabecera discreta con nombre del tema</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showSongHeader}
              onChange={e => handleSettingChange('showSongHeader', e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white block">Etiquetas de Sección</span>
              <span className="text-xs text-slate-400">Mostrar nombres de sección ([CORO], [VERSO])</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showSectionBadge}
              onChange={e => handleSettingChange('showSectionBadge', e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white block">Barra Discreta de Progreso</span>
              <span className="text-xs text-slate-400">Línea delgada para ver el avance del tema</span>
            </div>
            <input
              type="checkbox"
              checked={settings.showProgressBar}
              onChange={e => handleSettingChange('showProgressBar', e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer">
            <div>
              <span className="text-sm font-semibold text-white block">Letras en Mayúsculas</span>
              <span className="text-xs text-slate-400">Forzar todo el texto en mayúsculas estilo teleprompter</span>
            </div>
            <input
              type="checkbox"
              checked={settings.uppercaseLyrics}
              onChange={e => handleSettingChange('uppercaseLyrics', e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Respaldos y Persistencia Local
        </h2>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <p className="text-sm text-slate-400">
            Tus canciones y setlists se guardan automáticamente en este navegador. Puedes exportar una copia de seguridad en JSON para transferirla a otro equipo o guardar un respaldo antes de un concierto.
          </p>

          {importStatus && (
            <div
              className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {importStatus.success ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Exportar Respaldo JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              Importar Archivo JSON
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json,application/json"
              className="hidden"
            />

            <button
              onClick={onResetDemoSongs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer Canciones de Ejemplo
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              ¿Quieres borrar toda la biblioteca para empezar desde cero?
            </span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar biblioteca completa
            </button>
          </div>
        </div>
      </div>

      {/* TV Guide Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Tv className="w-5 h-5 text-amber-400" />
            ¿Cómo conectar tu televisor mediante HDMI?
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Consulta el paso a paso para extender tu escritorio y colocar el teleprompter en pantalla completa en el monitor externo.
          </p>
        </div>
        <button
          onClick={onOpenTvGuide}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors shrink-0"
        >
          Ver Guía HDMI
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Vaciar toda la biblioteca?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Esta acción eliminará todas las canciones y setlists guardados en este navegador. Se recomienda descargar un respaldo JSON antes de continuar.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onClearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Sí, vaciar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
