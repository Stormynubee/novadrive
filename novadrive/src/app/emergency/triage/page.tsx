'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProgressRail } from '@/components/ProgressRail';
import { SeverityChip } from '@/components/SeverityChip';
import {
  applyAnswer,
  getQuestion,
  initialState,
  type FSMContext,
} from '@/lib/startTriageFSM';
import type { TriageColor, TriageState } from '@/lib/types';
import { loadSession, saveSession } from '@/lib/session-store';

export default function TriagePage() {
  const router = useRouter();
  const [state, setState] = useState<TriageState>(initialState);
  const [ctx, setCtx] = useState<FSMContext>({});
  const [result, setResult] = useState<TriageColor | null>(null);
  const [step, setStep] = useState(0);

  const q = result ? null : getQuestion(state);

  function answer(value: Partial<FSMContext>) {
    const { next, result: r, ctx: c } = applyAnswer(state, ctx, value);
    setCtx(c);
    setStep((s) => s + 1);
    if (r) {
      setResult(r);
      const session = loadSession();
      saveSession({ ...session, triage: r });
      return;
    }
    setState(next);
  }

  function goRoute() {
    if (result === 'BLACK') {
      router.push('/emergency/packet');
      return;
    }
    router.push('/emergency/route');
  }

  return (
    <AppShell backHref="/emergency/locate" title="Triage">
      <ProgressRail current="Triage" />
      <div aria-live="polite" className="flex flex-1 flex-col">
        {result ? (
          <div className="flex flex-1 flex-col gap-6">
            <SeverityChip triage={result} large />
            <p className="text-sm text-[var(--nova-muted)]">
              {result === 'BLACK'
                ? 'Focus on notifying 108 and police. Routing to hospital is not the primary path.'
                : 'Facility list will match trauma tier for this severity.'}
            </p>
            <button type="button" onClick={goRoute} className="nova-btn-primary mt-auto">
              {result === 'BLACK' ? 'Build notify packet' : 'Find facilities'}
            </button>
          </div>
        ) : (
          q && (
            <>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--nova-amber)]">
                Step {step + 1} · START protocol
              </p>
              <h2 className="mb-2 text-xl font-semibold font-[family-name:var(--font-display)] leading-snug">
                {q.prompt}
              </h2>
              <p className="mb-6 text-sm text-[var(--nova-muted)]">{q.promptHi}</p>
              <div className="flex flex-col gap-3">
                {q.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="answer-pill w-full min-h-[56px]"
                    onClick={() => answer(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="nova-btn-ghost mt-6 inline-flex items-center justify-center gap-2"
                aria-label="Hold to speak (demo)"
              >
                <Mic className="h-4 w-4" aria-hidden />
                Hold to speak
              </button>
            </>
          )
        )}
      </div>
    </AppShell>
  );
}
