import { useEffect, useState } from 'react';

/**
 * Counts down from `seconds` to 0, ticking every second.
 *
 * It only reads `seconds` once, on mount — it does not react to `seconds` changing on later
 * renders. To restart the countdown (e.g. after a user resends an OTP), remount the component
 * that calls this hook by changing its `key` prop. See the README's "Resetting the countdown"
 * section for why this is the chosen pattern instead of watching `seconds` for changes.
 */
export function useCountdown(seconds: number, active = true): number {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return remaining;
}
