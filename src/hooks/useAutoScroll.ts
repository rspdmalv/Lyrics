/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef } from 'react';

// Speed level mapping for the 1 to 20 range
// Level 8 is the standard comfortable karaoke/rehearsal pace (~200 px/s)
// Level 1 is very slow, Level 20 is fast rock/punk pace (~800 px/s)
export const SPEED_MAP_20: Record<number, number> = {
  1: 25,
  2: 45,
  3: 65,
  4: 90,
  5: 115,
  6: 140,
  7: 170,
  8: 200, // Default comfortable tempo
  9: 235,
  10: 270,
  11: 310,
  12: 350,
  13: 395,
  14: 440,
  15: 490,
  16: 540,
  17: 600,
  18: 660,
  19: 720,
  20: 800,
};

export function getPixelsPerSecond(speedLevel: number): number {
  const clamped = Math.max(1, Math.min(20, Math.round(speedLevel)));
  return SPEED_MAP_20[clamped] || 200;
}

interface UseAutoScrollOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  isPlaying: boolean;
  speed: number; // 1 to 20
  onScrollUpdate?: (scrollTop: number, scrollPercent: number) => void;
  onReachEnd?: () => void;
}

export function useAutoScroll({
  containerRef,
  isPlaying,
  speed,
  onScrollUpdate,
  onReachEnd,
}: UseAutoScrollOptions) {
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  
  // Floating-point subpixel accumulator: CRITICAL for smooth rAF scrolling in browsers
  const scrollAccumulatorRef = useRef<number>(0);
  const isUserTouchingRef = useRef(false);
  const userTouchTimeoutRef = useRef<number | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      lastTimeRef.current = null; // reset timestamp on play
      if (containerRef.current) {
        scrollAccumulatorRef.current = containerRef.current.scrollTop;
      }
    }
  }, [isPlaying, containerRef]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Sync accumulator when user manually scrolls via mouse wheel or finger touch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onUserManualIntervention = () => {
      scrollAccumulatorRef.current = container.scrollTop;
      isUserTouchingRef.current = true;
      if (userTouchTimeoutRef.current) {
        window.clearTimeout(userTouchTimeoutRef.current);
      }
      userTouchTimeoutRef.current = window.setTimeout(() => {
        isUserTouchingRef.current = false;
        scrollAccumulatorRef.current = container.scrollTop;
      }, 180);
    };

    container.addEventListener('wheel', onUserManualIntervention, { passive: true });
    container.addEventListener('touchmove', onUserManualIntervention, { passive: true });

    return () => {
      container.removeEventListener('wheel', onUserManualIntervention);
      container.removeEventListener('touchmove', onUserManualIntervention);
      if (userTouchTimeoutRef.current) {
        window.clearTimeout(userTouchTimeoutRef.current);
      }
    };
  }, [containerRef]);

  const tick = useCallback(
    (currentTime: number) => {
      const container = containerRef.current;
      if (!container || !isPlayingRef.current) {
        animFrameIdRef.current = null;
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      let deltaSec = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Guard against huge delta leaps when browser tab was hidden or minimized
      if (deltaSec > 0.15) {
        deltaSec = 0.016; // clamp to standard 60fps frame
      }

      if (!isUserTouchingRef.current) {
        const pxPerSec = getPixelsPerSecond(speedRef.current);
        const scrollDelta = pxPerSec * deltaSec;

        const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);

        if (maxScroll > 0) {
          // Accumulate subpixels
          scrollAccumulatorRef.current += scrollDelta;

          // Check if bottom reached (ensure we have actually scrolled down significantly)
          if (scrollAccumulatorRef.current >= maxScroll - 4 && scrollAccumulatorRef.current > 60) {
            container.scrollTop = maxScroll;
            scrollAccumulatorRef.current = maxScroll;
            if (onScrollUpdate) {
              onScrollUpdate(maxScroll, 100);
            }
            if (onReachEnd) {
              onReachEnd();
            }
            animFrameIdRef.current = null;
            return;
          } else {
            container.scrollTop = scrollAccumulatorRef.current;
            const percent = (container.scrollTop / maxScroll) * 100;
            if (onScrollUpdate) {
              onScrollUpdate(container.scrollTop, percent);
            }
          }
        }
      }

      // Keep loop running continuously
      animFrameIdRef.current = requestAnimationFrame(tick);
    },
    [containerRef, onReachEnd, onScrollUpdate]
  );

  // Start or stop the animation loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      if (containerRef.current) {
        scrollAccumulatorRef.current = containerRef.current.scrollTop;
      }
      animFrameIdRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isPlaying, tick, containerRef]);

  // Programmatic scroll helpers
  const scrollToPercent = useCallback(
    (percent: number) => {
      const container = containerRef.current;
      if (!container) return;
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      const target = (Math.max(0, Math.min(100, percent)) / 100) * maxScroll;
      
      container.scrollTop = target;
      scrollAccumulatorRef.current = target;

      if (onScrollUpdate) {
        onScrollUpdate(target, percent);
      }
    },
    [containerRef, onScrollUpdate]
  );

  const scrollToPixels = useCallback(
    (pixels: number) => {
      const container = containerRef.current;
      if (!container) return;
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
      const target = Math.max(0, Math.min(maxScroll, pixels));
      
      container.scrollTop = target;
      scrollAccumulatorRef.current = target;

      const percent = maxScroll > 0 ? (target / maxScroll) * 100 : 0;
      if (onScrollUpdate) {
        onScrollUpdate(target, percent);
      }
    },
    [containerRef, onScrollUpdate]
  );

  const nudge = useCallback(
    (pixels: number) => {
      const container = containerRef.current;
      if (!container) return;
      scrollToPixels(container.scrollTop + pixels);
    },
    [containerRef, scrollToPixels]
  );

  const resetToTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTop = 0;
    scrollAccumulatorRef.current = 0;
    if (onScrollUpdate) {
      onScrollUpdate(0, 0);
    }
  }, [containerRef, onScrollUpdate]);

  return {
    scrollToPercent,
    scrollToPixels,
    nudge,
    resetToTop,
    scrollAccumulatorRef,
  };
}
