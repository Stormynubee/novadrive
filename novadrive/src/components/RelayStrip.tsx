import { User, Smartphone, Phone } from 'lucide-react';

export function RelayStrip({ active = 2 }: { active?: 1 | 2 | 3 }) {
  const steps = [
    { icon: User, label: 'Victim' },
    { icon: Smartphone, label: 'Bystander' },
    { icon: Phone, label: '108' },
  ];
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface-2)] p-4">
      {steps.map((s, i) => {
        const on = i + 1 <= active;
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                on
                  ? 'border-[var(--nova-cyan)] bg-[var(--nova-cyan)]/15 text-[var(--nova-cyan)]'
                  : 'border-[var(--nova-border)] text-[var(--nova-muted)]'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <span className={`text-xs font-medium ${on ? 'text-[var(--nova-text)]' : 'text-[var(--nova-muted)]'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className="absolute hidden"
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
