/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDataBackup, Setlist, Song, VisualSettings } from '../types';
import { generateId, parseRawLyrics } from '../utils/lyricsParser';

const STORAGE_KEYS = {
  SONGS: 'stagelyrics_songs_v1',
  SETLISTS: 'stagelyrics_setlists_v1',
  SETTINGS: 'stagelyrics_settings_v1',
  LAST_PLAYBACK: 'stagelyrics_last_playback_v1',
  ACTIVE_SONG: 'stagelyrics_active_song_v1',
  INITIALIZED: 'stagelyrics_initialized_v1',
};

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  fontSize: 54, // large readable teleprompter font
  lineHeight: 1.6,
  textAlign: 'center',
  maxWidth: 'wide',
  sidePadding: 48,
  viewMode: 'continuous',
  showSongHeader: true,
  showSectionBadge: true,
  showProgressBar: true,
  discreteProgressPosition: 'bottom',
  showNextSongAlert: true,
  uppercaseLyrics: false,
};

// Original demo songs for band rehearsal (original lyrics, no copyrighted content)
export const DEMO_SONGS: Song[] = [
  {
    id: 'demo-song-1',
    title: 'Noche Eléctrica',
    artist: 'La Frecuencia 99',
    bpm: 128,
    musicalKey: 'Mi menor (Em)',
    notes: 'Entrada con riff de guitarra con fuzz. En el segundo coro sube la dinámica de la batería.',
    rawLyrics: `[INTRO]
(Riff de guitarra principal con distorsión y bajo pesado)
(Entra la batería en el compás 5 a 128 BPM)

[VERSO 1]
Luces de neón cortando la ciudad
El motor ruge con ganas de escapar
Llevo en la mochila cables y un pedal
Esta noche el asfalto nos va a escuchar
Dejamos las dudas en el retrovisor
Buscando el volumen que calma el dolor

[PRE-CORO]
Sube el máster, préndelo otra vez
Que la señal empiece a arder
Tres, dos, uno...

[CORO]
Noche eléctrica, no mires atrás
El eco del bombo nos hace vibrar
Grita con fuerza hasta ver amanecer
Si el mundo se apaga, lo haremos arder
¡Noche eléctrica en la tempestad!

[VERSO 2]
El humo en el escenario empieza a subir
Cuatro corazones con un mismo latir
Las cuerdas gastadas afinadas en re
La melodía nunca nos va a perder
Miradas cruzadas, listos para entrar
No hay marcha atrás, es hora de tocar

[PRE-CORO]
Sube el máster, préndelo otra vez
Que la señal empiece a arder
Tres, dos, uno...

[CORO]
Noche eléctrica, no mires atrás
El eco del bombo nos hace vibrar
Grita con fuerza hasta ver amanecer
Si el mundo se apaga, lo haremos arder
¡Noche eléctrica en la tempestad!

[SOLO]
(Solo de guitarra melódico a dos tiempos)
(Cambio de tono a Sol mayor en compás 8)

[PUENTE]
Y cuando el silencio quiera regresar
Tendremos el fuego para iluminar
Nada se detiene
Nada nos frena hoy

[CORO]
Noche eléctrica, no mires atrás
El eco del bombo nos hace vibrar
Grita con fuerza hasta ver amanecer
Si el mundo se apaga, lo haremos arder
¡Noche eléctrica en la tempestad!

[OUTRO]
Hasta que las luces vuelvan a caer
Hasta que la voz no pueda sostener
Acorde final sostenido en Mi menor
Corte seco con platillo`,
    sections: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'demo-song-2',
    title: 'Ecos en la Niebla',
    artist: 'Aurora Rock',
    bpm: 88,
    musicalKey: 'La menor (Am)',
    notes: 'Balada rock atmosférica. Dejar sonar el teclado y platos con escobillas en verso 1.',
    rawLyrics: `[INTRO]
(Arpegio limpio en guitarra acústica y pad ambiental de sintetizador)

[VERSO 1]
Caminé por el muelle desierto al caer el sol
Buscando en las olas un viejo recuerdo de amor
Las huellas de ayer se las llevó la marea
Pero aún sigue viva esta dulce quimera

[PRE-CORO]
El viento del norte susurra un compás
Dime si volverás
Dime si estás allá

[CORO]
Ecos en la niebla que nunca se van
Voces que me llaman al otro lado del mar
Aunque el tiempo pase y borre el dolor
En cada guitarra vive tu canción

[VERSO 2]
Se encienden los faros lejanos contra el vendaval
Marcando el sendero que nadie se atreve a cruzar
Guardo tus palabras como un amuleto
Esperando el acorde perfecto y secreto

[CORO]
Ecos en la niebla que nunca se van
Voces que me llaman al otro lado del mar
Aunque el tiempo pase y borre el dolor
En cada guitarra vive tu canción

[PUENTE]
No es el final de nuestro viaje
Es solo un cambio de paisaje
La marea vuelve a subir
Estamos listos para resistir

[SOLO]
(Solo con mucho sustain y delay estéreo)

[CORO]
Ecos en la niebla que nunca se van
Voces que me llaman al otro lado del mar
Aunque el tiempo pase y borre el dolor
En cada guitarra vive tu canción

[OUTRO]
Ecos... en la niebla...
Solo queda respirar...
Fade out lento con arpegio de piano`,
    sections: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'demo-song-3',
    title: 'Fuego y Horizonte',
    artist: 'Los Pasajeros del Sur',
    bpm: 114,
    musicalKey: 'Re mayor (D)',
    notes: 'Ritmo con groove funk-rock. Mucha dinámica en el puente.',
    rawLyrics: `[INTRO]
(Bajo con slap y charles cerrado)
(Un, dos, tres, va!)

[VERSO 1]
Arrancamos el camino sin mapa ni destino
El tanque medio lleno y el horizonte fino
El polvo del camino tiñe las ventanas
Dejando atrás las dudas de todas las semanas

[PRE-CORO]
Siento el calor subiendo por los pies
Este ritmo no falla esta vez

[CORO]
Fuego y horizonte, vamos a acelerar
Que la ruta sea libre para cantar
Si nos perdemos no importa el lugar
Siempre hay un motivo para recomenzar
¡Fuego y horizonte!

[VERSO 2]
Una radio vieja sintoniza la señal
Esa melodía que no suena nada mal
Gente en los pueblos saluda al pasar
Somos una banda que vino a tocar

[CORO]
Fuego y horizonte, vamos a acelerar
Que la ruta sea libre para cantar
Si nos perdemos no importa el lugar
Siempre hay un motivo para recomenzar
¡Fuego y horizonte!

[PUENTE]
(Baja toda la instrumentación a solo bombo y palmas)
Pisa fuerte, siente el compás
Nadie nos dice cómo terminar
Un golpe más...
¡Entra con todo!

[SOLO]
(Solo enérgico de bajo seguido por guitarra rítmica)

[CORO]
Fuego y horizonte, vamos a acelerar
Que la ruta sea libre para cantar
Si nos perdemos no importa el lugar
Siempre hay un motivo para recomenzar
¡Fuego y horizonte!

[OUTRO]
Acelerando hacia el final...
Golpe al unísono en Re sostenido a Re mayor`,
    sections: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: 'demo-song-4',
    title: 'Ruta Infinita',
    artist: 'La Frecuencia 99',
    bpm: 140,
    musicalKey: 'Sol mayor (G)',
    notes: 'Canción rápida para cerrar el setlist con energía máxima.',
    rawLyrics: `[INTRO]
(Conteo con baquetas: 1, 2, 3, 4!)
(Riff rápido en quintas)

[VERSO 1]
Kilómetro cero marcando el reloj
La noche es testigo de nuestra canción
El viento en la cara borrando el temor
Ruedas girando con todo el fervor

[CORO]
Ruta infinita, no mires el fin
Tenemos la fuerza para resistir
Canta más alto que el ruido exterior
La carretera es nuestro mejor escenario hoy

[VERSO 2]
Curvas cerradas bajo el resplandor
El eco en el valle despierta el valor
No hay equipaje que pueda frenar
Lo que esta noche vinimos a dar

[CORO]
Ruta infinita, no mires el fin
Tenemos la fuerza para resistir
Canta más alto que el ruido exterior
La carretera es nuestro mejor escenario hoy

[PUENTE]
(Parada súbita)
Solo la voz...
Ruta infinita...
(Crescendo de redoble de batería)
¡Vamos!

[CORO]
Ruta infinita, no mires el fin
Tenemos la fuerza para resistir
Canta más alto que el ruido exterior
La carretera es nuestro mejor escenario hoy

[OUTRO]
¡Ruta infinita!
¡Ruta infinita!
Final explosivo con crash triple`,
    sections: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    updatedAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

// Initialize sections for demo songs
DEMO_SONGS.forEach(song => {
  song.sections = parseRawLyrics(song.rawLyrics);
});

export const DEMO_SETLISTS: Setlist[] = [
  {
    id: 'demo-setlist-1',
    name: 'Ensayo General de Viernes',
    description: 'Setlist completo de ensayo con dinámica de inicio a cierre',
    songIds: ['demo-song-1', 'demo-song-2', 'demo-song-3', 'demo-song-4'],
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

export const storageService = {
  // --- Songs ---
  getSongs(): Song[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SONGS);
      if (!data) {
        this.saveSongs(DEMO_SONGS);
        return DEMO_SONGS;
      }
      const parsed = JSON.parse(data) as Song[];
      // ensure sections exist
      return parsed.map(s => ({
        ...s,
        sections: (s.sections && s.sections.length > 0) ? s.sections : parseRawLyrics(s.rawLyrics || ''),
      }));
    } catch (e) {
      console.error('Error reading songs from localStorage:', e);
      return DEMO_SONGS;
    }
  },

  saveSongs(songs: Song[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    } catch (e) {
      console.error('Error saving songs to localStorage:', e);
    }
  },

  saveSong(song: Song): Song[] {
    const songs = this.getSongs();
    const index = songs.findIndex(s => s.id === song.id);
    let updated: Song[];
    if (index >= 0) {
      updated = [...songs];
      updated[index] = { ...song, updatedAt: Date.now() };
    } else {
      updated = [{ ...song, id: song.id || generateId(), createdAt: Date.now(), updatedAt: Date.now() }, ...songs];
    }
    this.saveSongs(updated);
    this.saveActiveSong(song);
    return updated;
  },

  saveActiveSong(song: Song): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SONG, JSON.stringify(song));
    } catch (e) {
      console.error('Error saving active song:', e);
    }
  },

  getActiveSong(): Song | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SONG);
      if (!data) return null;
      const parsed = JSON.parse(data) as Song;
      if (parsed && parsed.title) {
        return {
          ...parsed,
          sections: (parsed.sections && parsed.sections.length > 0)
            ? parsed.sections
            : parseRawLyrics(parsed.rawLyrics || ''),
        };
      }
    } catch (e) {
      console.error('Error getting active song:', e);
    }
    return null;
  },

  deleteSong(songId: string): Song[] {
    const songs = this.getSongs().filter(s => s.id !== songId);
    this.saveSongs(songs);
    // Also remove from setlists
    const setlists = this.getSetlists().map(st => ({
      ...st,
      songIds: st.songIds.filter(id => id !== songId),
    }));
    this.saveSetlists(setlists);
    return songs;
  },

  duplicateSong(songId: string): { songs: Song[]; newSong: Song | null } {
    const songs = this.getSongs();
    const original = songs.find(s => s.id === songId);
    if (!original) return { songs, newSong: null };

    const newSong: Song = {
      ...original,
      id: generateId(),
      title: `${original.title} (Copia)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sections: original.sections.map(sec => ({ ...sec, id: generateId() })),
    };
    const updated = [newSong, ...songs];
    this.saveSongs(updated);
    return { songs: updated, newSong };
  },

  resetDemoSongs(): { songs: Song[]; setlists: Setlist[] } {
    this.saveSongs(DEMO_SONGS);
    this.saveSetlists(DEMO_SETLISTS);
    return { songs: DEMO_SONGS, setlists: DEMO_SETLISTS };
  },

  clearAllData(): { songs: Song[]; setlists: Setlist[] } {
    this.saveSongs([]);
    this.saveSetlists([]);
    return { songs: [], setlists: [] };
  },

  // --- Setlists ---
  getSetlists(): Setlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETLISTS);
      if (!data) {
        this.saveSetlists(DEMO_SETLISTS);
        return DEMO_SETLISTS;
      }
      return JSON.parse(data) as Setlist[];
    } catch (e) {
      console.error('Error reading setlists from localStorage:', e);
      return DEMO_SETLISTS;
    }
  },

  saveSetlists(setlists: Setlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETLISTS, JSON.stringify(setlists));
    } catch (e) {
      console.error('Error saving setlists to localStorage:', e);
    }
  },

  saveSetlist(setlist: Setlist): Setlist[] {
    const setlists = this.getSetlists();
    const index = setlists.findIndex(st => st.id === setlist.id);
    let updated: Setlist[];
    if (index >= 0) {
      updated = [...setlists];
      updated[index] = { ...setlist, updatedAt: Date.now() };
    } else {
      updated = [...setlists, { ...setlist, id: setlist.id || generateId(), createdAt: Date.now(), updatedAt: Date.now() }];
    }
    this.saveSetlists(updated);
    return updated;
  },

  deleteSetlist(setlistId: string): Setlist[] {
    const setlists = this.getSetlists().filter(st => st.id !== setlistId);
    this.saveSetlists(setlists);
    return setlists;
  },

  // --- Visual Settings ---
  getSettings(): VisualSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_VISUAL_SETTINGS;
      return { ...DEFAULT_VISUAL_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      console.error('Error reading settings from localStorage:', e);
      return DEFAULT_VISUAL_SETTINGS;
    }
  },

  saveSettings(settings: VisualSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage:', e);
    }
  },

  // --- Export & Import Backup ---
  exportBackupJson(): string {
    const backup: AppDataBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      songs: this.getSongs(),
      setlists: this.getSetlists(),
      settings: this.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  validateAndImportBackup(jsonString: string): { success: boolean; message: string; data?: AppDataBackup } {
    try {
      const parsed = JSON.parse(jsonString) as Partial<AppDataBackup>;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'El archivo JSON no tiene un formato válido.' };
      }
      if (!Array.isArray(parsed.songs)) {
        return { success: false, message: 'El archivo no contiene un listado de canciones válido ("songs").' };
      }

      // Sanitize songs
      const sanitizedSongs: Song[] = parsed.songs.map((s: any, idx: number) => ({
        id: typeof s.id === 'string' && s.id ? s.id : generateId(),
        title: typeof s.title === 'string' && s.title.trim() ? s.title.trim() : `Canción importada ${idx + 1}`,
        artist: typeof s.artist === 'string' ? s.artist.trim() : 'Artista',
        bpm: typeof s.bpm === 'number' ? s.bpm : undefined,
        musicalKey: typeof s.musicalKey === 'string' ? s.musicalKey : undefined,
        notes: typeof s.notes === 'string' ? s.notes : undefined,
        rawLyrics: typeof s.rawLyrics === 'string' ? s.rawLyrics : '',
        sections: Array.isArray(s.sections) && s.sections.length > 0 
          ? s.sections 
          : parseRawLyrics(s.rawLyrics || ''),
        createdAt: typeof s.createdAt === 'number' ? s.createdAt : Date.now(),
        updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : Date.now(),
      }));

      const sanitizedSetlists: Setlist[] = Array.isArray(parsed.setlists)
        ? parsed.setlists.map((st: any, idx: number) => ({
            id: typeof st.id === 'string' && st.id ? st.id : generateId(),
            name: typeof st.name === 'string' && st.name.trim() ? st.name.trim() : `Setlist ${idx + 1}`,
            description: typeof st.description === 'string' ? st.description : '',
            songIds: Array.isArray(st.songIds) ? st.songIds.filter((id: any) => typeof id === 'string') : [],
            createdAt: typeof st.createdAt === 'number' ? st.createdAt : Date.now(),
            updatedAt: typeof st.updatedAt === 'number' ? st.updatedAt : Date.now(),
          }))
        : [];

      const mergedSettings: VisualSettings = {
        ...DEFAULT_VISUAL_SETTINGS,
        ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}),
      };

      const finalBackup: AppDataBackup = {
        version: parsed.version || '1.0.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        songs: sanitizedSongs,
        setlists: sanitizedSetlists,
        settings: mergedSettings,
      };

      // Save to localStorage
      this.saveSongs(finalBackup.songs);
      this.saveSetlists(finalBackup.setlists);
      this.saveSettings(finalBackup.settings);

      return {
        success: true,
        message: `Importación completada: ${finalBackup.songs.length} canciones y ${finalBackup.setlists.length} setlists importados con éxito.`,
        data: finalBackup,
      };
    } catch (e: any) {
      return { success: false, message: `Error al procesar el archivo: ${e?.message || 'JSON inválido'}` };
    }
  },
};
