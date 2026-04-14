// src/hooks/useDebounce.js
import { useEffect, useRef } from 'react';

/**
 * Calls `fn` after `delay` ms of silence.
 * Resets the timer every time `value` changes.
 */
export function useDebounce(fn, value, delay = 800) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const timer = setTimeout(() => fnRef.current(), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
}
