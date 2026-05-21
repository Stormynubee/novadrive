'use client';

import type { Facility } from '@/lib/types';
import { Phone, MapPin, Clock } from 'lucide-react';

export function FacilityCard({
  facility,
  selected,
  onSelect,
}: {
  facility: Facility;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`nova-card w-full p-4 text-left transition ${
        selected ? 'ring-2 ring-[var(--nova-amber)]' : ''
      } ${facility.recommended ? 'border-[var(--nova-amber)]/50' : ''}`}
    >
      {facility.recommended && (
        <span className="mb-2 inline-block rounded-md bg-[var(--nova-amber)]/20 px-2 py-0.5 text-xs font-bold text-[var(--nova-amber)]">
          RECOMMENDED
        </span>
      )}
      <h3 className="text-lg font-semibold">{facility.name}</h3>
      <p className="mt-1 text-sm capitalize text-[var(--nova-muted)]">
        {facility.type.replace('_', ' ')} · Tier {facility.traumaTier}
      </p>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--nova-muted)]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden />
          {facility.distanceKm} km
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-4 w-4" aria-hidden />
          ~{facility.etaMinutes} min
        </span>
        <span className="inline-flex items-center gap-1">
          <Phone className="h-4 w-4" aria-hidden />
          {facility.phone}
        </span>
      </div>
    </button>
  );
}
