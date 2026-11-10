import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/** Transform only the wrapper: labels and avatars remain upright, with no frame renders. */
export default function OrbitMotion({ rx, ry, phase, period, paused = false, children }: {
  rx: number; ry: number; phase: number; period: number; paused?: boolean; children: ReactNode;
}) {
  const ref = useRef<SVGGElement>(null);
  const elapsed = useRef(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    const tick = (time: number) => {
      const delta = last ? Math.min(time - last, 64) : 0;
      last = time;
      if (!paused && !document.hidden && !node.matches(':hover, :focus-within')) elapsed.current += delta;
      const t = reduced.matches ? 0 : elapsed.current / 1000;
      const a = phase + t * Math.PI * 2 / period;
      const bob = reduced.matches ? 0 : Math.sin(t * .65 + phase) * 2;
      node.setAttribute('transform', `translate(${(Math.cos(a) * rx).toFixed(3)} ${(Math.sin(a) * ry + bob).toFixed(3)})`);
      if (!reduced.matches) frame = requestAnimationFrame(tick);
    };
    const restart = () => { cancelAnimationFrame(frame); last = 0; frame = requestAnimationFrame(tick); };
    restart();
    reduced.addEventListener('change', restart);
    return () => { cancelAnimationFrame(frame); reduced.removeEventListener('change', restart); };
  }, [rx, ry, phase, period, paused]);
  return <g ref={ref} className="galaxy-orbit-motion" transform={`translate(${Math.cos(phase) * rx} ${Math.sin(phase) * ry})`}>{children}</g>;
}
