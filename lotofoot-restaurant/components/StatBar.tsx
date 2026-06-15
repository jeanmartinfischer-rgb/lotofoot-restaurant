'use client';

import { useEffect, useState } from 'react';

export default function StatBar({ value, label, color }: { value: number; label: string; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-chalk/60">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-pitch overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: w + '%', background: color, transition: 'width 1s ease-out' }}
        />
      </div>
    </div>
  );
}
