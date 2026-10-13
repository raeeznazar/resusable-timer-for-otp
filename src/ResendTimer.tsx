import React from 'react';
import { Pressable, Text, type StyleProp, type TextStyle } from 'react-native';

import { useCountdown } from './useCountdown';

export interface ResendTimerProps {
  /** Seconds to count down from before the resend action becomes available. */
  cooldownSeconds: number;
  /** Called when the user presses resend. Only reachable once the countdown reaches 0. */
  onResend: () => void;
  /** Disables the resend press target — e.g. while a resend request is in flight. */
  disabled?: boolean;
  /** Formats the remaining time (already "MM:SS") into the countdown's label. */
  formatCountdownLabel?: (time: string) => string;
  /** Label shown on the pressable once the countdown reaches 0. */
  resendLabel?: string;
  /** Replace the countdown's rendering entirely. Receives the formatted "MM:SS" string. */
  renderCountdown?: (time: string) => React.ReactNode;
  /** Replace the resend button's rendering entirely. Receives a `press` callback that fires `onResend`. */
  renderResend?: (press: () => void) => React.ReactNode;
  /** Style applied to the default `Text` renderers (ignored if `renderCountdown`/`renderResend` are used). */
  style?: StyleProp<TextStyle>;
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Shows a live "Resend in MM:SS" countdown, then swaps to a pressable resend action once it
 * reaches 0. Ships with plain defaults (unstyled `Text`, English copy) — pass `formatCountdownLabel`
 * / `resendLabel` for your own copy, or `renderCountdown` / `renderResend` to fully replace the UI
 * with your app's own design system.
 */
export function ResendTimer({
  cooldownSeconds,
  onResend,
  disabled = false,
  formatCountdownLabel = (time) => `Resend in ${time}`,
  resendLabel = 'Resend code',
  renderCountdown,
  renderResend,
  style,
}: ResendTimerProps): React.JSX.Element {
  const remaining = useCountdown(cooldownSeconds);

  if (remaining > 0) {
    const time = formatTime(remaining);
    if (renderCountdown) return <>{renderCountdown(time)}</>;
    return <Text style={style}>{formatCountdownLabel(time)}</Text>;
  }

  if (renderResend) return <>{renderResend(onResend)}</>;

  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onResend} hitSlop={8}>
      <Text style={style}>{resendLabel}</Text>
    </Pressable>
  );
}
