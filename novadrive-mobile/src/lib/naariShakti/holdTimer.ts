export const NAARI_HOLD_MS = 2000;

export interface HoldTimer {
  start: () => void;
  cancel: () => void;
}

export function createHoldTimer(durationMs: number, onComplete: () => void): HoldTimer {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const cancel = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const start = () => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      onComplete();
    }, durationMs);
  };

  return { start, cancel };
}
