import { createHoldTimer } from './holdTimer';

describe('createHoldTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires once after duration', () => {
    const onComplete = jest.fn();
    const timer = createHoldTimer(2000, onComplete);
    timer.start();
    expect(onComplete).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cancel prevents fire', () => {
    const onComplete = jest.fn();
    const timer = createHoldTimer(2000, onComplete);
    timer.start();
    jest.advanceTimersByTime(1000);
    timer.cancel();
    jest.advanceTimersByTime(2000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('second start clears prior timer', () => {
    const onComplete = jest.fn();
    const timer = createHoldTimer(2000, onComplete);
    timer.start();
    jest.advanceTimersByTime(1500);
    timer.start();
    jest.advanceTimersByTime(1500);
    expect(onComplete).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
