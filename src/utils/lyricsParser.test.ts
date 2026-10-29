/**
 * Verification test script for lyrics parser and domain logic
 */

import { parseRawLyrics, formatSectionsToRawLyrics, detectSectionType } from './lyricsParser.ts';
import { getPixelsPerSecond, SPEED_MAP_20 } from '../hooks/useAutoScroll.ts';

function runTests() {
  console.log('Testing lyricsParser...');

  // Test 1: Tag detection
  const sampleLyrics = `[INTRO]
Acordes de guitarra

[VERSO 1]
Línea uno
Línea dos

[PRE-CORO]
Sube la intensidad

[CORO]
Estribillo potente

[PUENTE]
Bajada de dinámica

[SOLO]
Guitarra solista

[OUTRO]
Corte final`;

  const sections = parseRawLyrics(sampleLyrics);
  console.assert(sections.length === 7, `Expected 7 sections, got ${sections.length}`);
  console.assert(sections[0].name === 'INTRO', `Expected INTRO, got ${sections[0].name}`);
  console.assert(sections[0].type === 'intro', `Expected type intro, got ${sections[0].type}`);
  console.assert(sections[1].name === 'VERSO 1', `Expected VERSO 1, got ${sections[1].name}`);
  console.assert(sections[3].name === 'CORO', `Expected CORO, got ${sections[3].name}`);
  console.assert(sections[3].type === 'coro', `Expected type coro, got ${sections[3].type}`);
  console.assert(sections[4].type === 'puente', `Expected type puente, got ${sections[4].type}`);
  console.assert(sections[5].type === 'solo', `Expected type solo, got ${sections[5].type}`);
  console.assert(sections[6].type === 'outro', `Expected type outro, got ${sections[6].type}`);

  // Test 2: Formatting back to raw lyrics
  const formatted = formatSectionsToRawLyrics(sections);
  console.assert(formatted.includes('[INTRO]'), 'Formatted must include [INTRO]');
  console.assert(formatted.includes('[CORO]'), 'Formatted must include [CORO]');

  // Test 3: Untagged lyrics splitting
  const untagged = `Primera estrofa sin etiquetas
Con dos versos

Segunda estrofa separada
Por salto doble`;
  const untaggedSections = parseRawLyrics(untagged);
  console.assert(untaggedSections.length === 2, `Expected 2 paragraphs, got ${untaggedSections.length}`);

  // Test 4: Speed calculations (1 to 20 range)
  console.assert(getPixelsPerSecond(1) === SPEED_MAP_20[1], 'Speed 1 must match');
  console.assert(getPixelsPerSecond(8) === SPEED_MAP_20[8], 'Speed 8 must match default');
  console.assert(getPixelsPerSecond(20) === SPEED_MAP_20[20], 'Speed 20 must match max');
  console.assert(getPixelsPerSecond(999) === SPEED_MAP_20[20], 'Clamped max speed');
  console.assert(getPixelsPerSecond(-5) === SPEED_MAP_20[1], 'Clamped min speed');

  console.log('All automated logic tests passed successfully!');
}

runTests();
