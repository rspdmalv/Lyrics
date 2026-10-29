/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectionType, SongSection } from '../types';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function detectSectionType(tagText: string): SectionType {
  const normalized = tagText.toLowerCase().trim();
  
  if (normalized.includes('intro')) return 'intro';
  if (normalized.includes('pre-coro') || normalized.includes('precoro') || normalized.includes('pre-chorus') || normalized.includes('prechorus')) {
    return 'pre-coro';
  }
  if (normalized.includes('coro') || normalized.includes('chorus') || normalized.includes('estribillo')) {
    return 'coro';
  }
  if (normalized.includes('puente') || normalized.includes('bridge')) {
    return 'puente';
  }
  if (normalized.includes('solo') || normalized.includes('guitar')) {
    return 'solo';
  }
  if (normalized.includes('outro') || normalized.includes('final') || normalized.includes('coda')) {
    return 'outro';
  }
  if (normalized.includes('verso') || normalized.includes('verse') || normalized.includes('estrofa')) {
    return 'verso';
  }
  if (normalized.includes('instrumental') || normalized.includes('riff')) {
    return 'instrumental';
  }
  return 'otro';
}

/**
 * Parses raw pasted lyrics with section tags like:
 * [INTRO]
 * Acordes de inicio
 * 
 * [VERSO 1]
 * Línea 1
 * Línea 2
 * 
 * [CORO]
 * Estribillo
 */
export function parseRawLyrics(rawText: string): SongSection[] {
  if (!rawText || !rawText.trim()) {
    return [
      {
        id: generateId(),
        name: 'VERSO 1',
        type: 'verso',
        content: '',
      },
    ];
  }

  const lines = rawText.split(/\r?\n/);
  const sections: SongSection[] = [];
  
  // Tag regex: matches [INTRO], [VERSO 1], (CORO), or VERSO 1: at start of line
  const bracketTagRegex = /^\s*\[([A-Z0-9\sáéíóúÁÉÍÓÚ\-_/]+)\]\s*$/i;
  const colonTagRegex = /^\s*(INTRO|VERSO\s*\d*|VERSE\s*\d*|PRE-CORO|PRECORO|PRE-CHORUS|CORO|CHORUS|ESTRIBILLO|PUENTE|BRIDGE|SOLO|OUTRO|FINAL|INSTRUMENTAL)\s*:\s*$/i;

  let currentName = '';
  let currentType: SectionType = 'verso';
  let currentLines: string[] = [];
  let foundAnyTag = false;

  const commitSection = () => {
    const content = currentLines.join('\n').trim();
    if (content.length > 0 || currentName) {
      sections.push({
        id: generateId(),
        name: currentName || `VERSO ${sections.length + 1}`,
        type: currentType,
        content: content,
      });
    }
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bracketMatch = line.match(bracketTagRegex);
    const colonMatch = line.match(colonTagRegex);

    if (bracketMatch || colonMatch) {
      foundAnyTag = true;
      const rawTag = (bracketMatch ? bracketMatch[1] : colonMatch![1]).trim();
      
      // Commit previous section if exists
      if (currentName || currentLines.length > 0) {
        commitSection();
      }

      currentName = rawTag.toUpperCase();
      currentType = detectSectionType(rawTag);
    } else {
      currentLines.push(line);
    }
  }

  // Commit last section
  if (currentName || currentLines.length > 0) {
    commitSection();
  }

  // If no tags were detected at all, split by double line breaks (paragraphs)
  if (!foundAnyTag && sections.length <= 1) {
    const paragraphs = rawText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length > 1) {
      return paragraphs.map((p, idx) => ({
        id: generateId(),
        name: `VERSO ${idx + 1}`,
        type: 'verso',
        content: p,
      }));
    }
  }

  // Guarantee at least one section
  if (sections.length === 0) {
    sections.push({
      id: generateId(),
      name: 'VERSO 1',
      type: 'verso',
      content: rawText.trim(),
    });
  }

  return sections;
}

/**
 * Re-serializes sections back into standard formatted raw lyrics text with [TAGS]
 */
export function formatSectionsToRawLyrics(sections: SongSection[]): string {
  return sections
    .map(sec => {
      const header = `[${sec.name.toUpperCase()}]`;
      return `${header}\n${sec.content.trim()}`;
    })
    .join('\n\n');
}

/**
 * Human readable color / badge helper for section types
 */
export function getSectionBadgeStyle(type: SectionType): { bg: string; text: string; border: string } {
  switch (type) {
    case 'coro':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'pre-coro':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'puente':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'solo':
    case 'instrumental':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'intro':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'outro':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'verso':
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' };
  }
}
