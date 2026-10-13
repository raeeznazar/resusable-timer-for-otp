# otp-resend-timer

A tiny countdown hook (`useCountdown`) and a prop-driven resend-timer component (`ResendTimer`)
for OTP screens in React Native. No bundled UI opinions, no i18n library required — you pass in
your own copy and (optionally) your own styled components.

- Zero runtime dependencies. `react` and `react-native` are peer dependencies only.
- Works with any navigation/state setup — it has no idea your app has OTP screens at all, it just
  counts down and tells you when it's done.

## Install

This is a private package, distributed via git (not published to npm):

```bash
npm install github:raeeznazar/otp-resend-timer
```

(Replace the GitHub path with wherever you push this repo. Pin to a commit or tag instead of the
default branch once you want a version to stop moving under you — e.g.
`github:raeeznazar/otp-resend-timer#v0.1.0`.)

## Quick start

```tsx
import { ResendTimer } from 'otp-resend-timer';

function OtpScreen() {
  const [resendCount, setResendCount] = useState(0);

  const handleResend = () => {
    // ...call your own resend-OTP API here...
    setResendCount((count) => count + 1); // see "Resetting the countdown" below
  };

  return (
    <ResendTimer
      key={resendCount}
      cooldownSeconds={300}
      onResend={handleResend}
      formatCountdownLabel={(time) => `Resend in ${time}`}
      resendLabel="Resend code"
    />
  );
}
```

That's the whole integration: while the countdown is running it shows `"Resend in 04:59"` (ticking
every second); once it hits zero it swaps to a pressable `"Resend code"`.

## Using just the hook

If you want to build your own UI instead of using `<ResendTimer>`, use `useCountdown` directly:

```tsx
import { useCountdown } from 'otp-resend-timer';

function MyCustomTimer({ cooldownSeconds }: { cooldownSeconds: number }) {
  const remaining = useCountdown(cooldownSeconds);
  return remaining > 0 ? <Text>{remaining}s left</Text> : <Text>Ready</Text>;
}
```

`useCountdown(seconds, active = true)` returns the number of seconds remaining, ticking down to 0
once per second. Passing `active={false}` pauses it without resetting `remaining`.

## Resetting the countdown

`useCountdown` only reads its `seconds` argument **once**, when the component using it first
mounts — it does not watch for `seconds` changing later. This is deliberate: a countdown tied to
props changing via `useEffect` adds a render + effect round-trip and extra edge cases (what if it
changes mid-tick?) for something that's simpler solved another way.

**The reset mechanism is React's `key` prop**, not a prop change. Give `<ResendTimer>` a `key` that
changes every time you want to restart the countdown — typically a counter you bump after a
successful resend:

```tsx
const [resendCount, setResendCount] = useState(0);

<ResendTimer key={resendCount} cooldownSeconds={300} onResend={handleResend} />

// after a successful resend:
setResendCount((count) => count + 1);
```

When `key` changes, React unmounts the old `<ResendTimer>` (running its cleanup — the old interval
is cleared, nothing leaks) and mounts a brand new instance, whose `useCountdown` starts fresh from
`cooldownSeconds`. No part of the old instance's state carries over — this is what makes `key` a
reliable reset, not just a visual refresh.

If you're using the bare `useCountdown` hook yourself (not through `<ResendTimer>`), apply the same
`key` trick to whatever component calls it.

## API

### `useCountdown(seconds: number, active?: boolean): number`

| Param | Default | Description |
|---|---|---|
| `seconds` | — | Starting value. Only read on mount (see "Resetting the countdown"). |
| `active` | `true` | While `false`, the countdown doesn't tick (but keeps its current value). |

Returns the current remaining seconds, down to `0`.

### `<ResendTimer />`

| Prop | Default | Description |
|---|---|---|
| `cooldownSeconds` | — | Required. Starting countdown value. |
| `onResend` | — | Required. Called when the resend action is pressed. |
| `disabled` | `false` | Disables the resend press target (e.g. while a request is in flight). |
| `formatCountdownLabel` | `(time) => \`Resend in ${time}\`` | Formats the "MM:SS" string into the countdown's label. |
| `resendLabel` | `"Resend code"` | Label shown once the countdown reaches 0. |
| `renderCountdown` | — | Fully replace the countdown's rendering. Receives the "MM:SS" string. Overrides `formatCountdownLabel`/`style`. |
| `renderResend` | — | Fully replace the resend button's rendering. Receives a `press` callback to call `onResend`. Overrides `resendLabel`/`style`. |
| `style` | — | Style applied to the default `Text` renderers. Ignored if `renderCountdown`/`renderResend` are used. |

## Using your own design system

Default rendering is plain `react-native` `Text`/`Pressable` with no styling. To match your app's
components instead, use the render props:

```tsx
<ResendTimer
  cooldownSeconds={300}
  onResend={handleResend}
  renderCountdown={(time) => (
    <Text variant="small" tone="muted">
      {t('otp.resendIn', { time })}
    </Text>
  )}
  renderResend={(press) => (
    <Pressable onPress={press}>
      <Text variant="small" tone="link" className="font-jakarta-bold">
        {t('otp.resend')}
      </Text>
    </Pressable>
  )}
/>
```

This is exactly how you'd wire it into an app that already has its own `Text` component and i18n
setup (like one using `i18next`) — the package itself never imports either.

## What this package deliberately does *not* include

- **No OTP error handling.** Mapping a backend's error codes (e.g. `"OTP_EXPIRED"`) to a UI state
  is specific to each backend's response shape, so it belongs in your app, not here.
- **No OTP input UI.** Just the countdown/resend piece.
- **No i18n.** You always pass in your own strings or render props.

Keeping these out is what makes the package genuinely reusable across projects with different
backends, design systems, and languages — only the countdown *logic* is shared.
