import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('@/lib/analytics', () => ({ capture: vi.fn() }));

import * as analytics from '@/lib/analytics';
import { fireXpExposure, useXpExposure } from './exposure';

// modal_actions_r1 excluded — concluded 2026-10-29, no longer fires exposures.
const EXPERIMENTS = [
  'header_btn_r2',
  'home_proof_r1',
  'upload_area_r1',
] as const;

let captureIO: IntersectionObserverCallback | null = null;

beforeEach(() => {
  // Pin the clock to the test date so isExperimentActive() returns true.
  vi.useFakeTimers({ now: new Date('2026-10-20T12:00:00Z') });

  // Use real jsdom sessionStorage / localStorage — clear between tests.
  sessionStorage.clear();
  localStorage.setItem('preferred-language', 'es');

  captureIO = null;
  vi.mocked(analytics.capture).mockClear();

  // Not in holdout; return variant B for all experiment attributes.
  vi.spyOn(document.documentElement, 'getAttribute').mockImplementation((attr) => {
    if (attr === 'data-xp-holdout') return null;
    if (attr.startsWith('data-xp-')) return 'B';
    return null;
  });

  const IOStub = vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
    captureIO = cb;
    return { observe: vi.fn(), disconnect: vi.fn() };
  });
  vi.stubGlobal('IntersectionObserver', IOStub);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function triggerIO(ratio: number) {
  if (!captureIO) return;
  captureIO(
    [{ intersectionRatio: ratio, isIntersecting: ratio >= 0.5 } as IntersectionObserverEntry],
    {} as IntersectionObserver,
  );
}

// ─── fireXpExposure ───────────────────────────────────────────────────────────

describe('fireXpExposure', () => {
  it.each(EXPERIMENTS)('fires experiment_exposure for %s with required props', (id) => {
    fireXpExposure(id);
    expect(vi.mocked(analytics.capture)).toHaveBeenCalledOnce();
    const [event, rawProps] = vi.mocked(analytics.capture).mock.calls[0];
    const props = rawProps as { experiment?: string; variant?: string; layer?: string };
    expect(event).toBe('experiment_exposure');
    expect(props?.experiment).toBe(id);
    expect(props?.variant).not.toBeNull();
    expect(props?.layer).not.toBeNull();
  });

  it('is idempotent — second call in same session is a no-op', () => {
    fireXpExposure('header_btn_r2');
    fireXpExposure('header_btn_r2');
    expect(vi.mocked(analytics.capture)).toHaveBeenCalledOnce();
  });

  it('passes extra props (placement) to the event', () => {
    fireXpExposure('header_btn_r2', { placement: 'mobile' });
    const [, rawPropsExtra] = vi.mocked(analytics.capture).mock.calls[0];
    const propsExtra = rawPropsExtra as { placement?: string };
    expect(propsExtra?.placement).toBe('mobile');
  });
});

// ─── useXpExposure ────────────────────────────────────────────────────────────

function TestComponent({ experimentId, extraPropsFn }: {
  experimentId: string;
  extraPropsFn?: () => { placement?: 'desktop' | 'mobile' };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useXpExposure(ref, experimentId, extraPropsFn);
  return <div ref={ref}>test</div>;
}

describe('useXpExposure', () => {
  it.each(EXPERIMENTS)('fires exactly one experiment_exposure for %s', (id) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(<TestComponent experimentId={id} />);
    });

    triggerIO(0.6);
    act(() => { vi.advanceTimersByTime(1100); });

    const calls = vi.mocked(analytics.capture).mock.calls.filter(([e]) => e === 'experiment_exposure');
    expect(calls).toHaveLength(1);
    const props = calls[0][1] as { experiment?: string; variant?: string; layer?: string };
    expect(props?.experiment).toBe(id);
    expect(props?.variant).toBeTruthy();
    expect(props?.layer).toBeTruthy();

    document.body.removeChild(container);
  });

  it('does not fire if element disappears before 1 s', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(<TestComponent experimentId="header_btn_r2" />);
    });

    triggerIO(0.6);
    act(() => { vi.advanceTimersByTime(500); });
    triggerIO(0.0);
    act(() => { vi.advanceTimersByTime(700); });

    expect(vi.mocked(analytics.capture)).not.toHaveBeenCalled();
    document.body.removeChild(container);
  });

  it('passes placement from callback', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(
        <TestComponent experimentId="header_btn_r2" extraPropsFn={() => ({ placement: 'desktop' })} />,
      );
    });

    triggerIO(0.6);
    act(() => { vi.advanceTimersByTime(1100); });

    const [, rawPropsDt] = vi.mocked(analytics.capture).mock.calls[0];
    const propsDt = rawPropsDt as { placement?: string };
    expect(propsDt?.placement).toBe('desktop');
    document.body.removeChild(container);
  });
});
