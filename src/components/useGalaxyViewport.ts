import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent, MouseEvent, KeyboardEvent } from 'react';

const MIN_ZOOM = .5;
const MAX_ZOOM = 3;
type Point = { x: number; y: number };

export default function useGalaxyViewport() {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [dragEnabled, setDragEnabled] = useState(true);
  const [dragging, setDragging] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const moved = useRef(false);
  const origin = useRef<Point>({x:0,y:0});
  const clientPoint = useCallback((x: number, y: number): Point => {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : {x, y};
  }, []);
  const scaleAt = useCallback((factor: number, from: Point = {x:550,y:440}, to = from) => {
    setView(v => {
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.zoom * factor));
      const ratio = zoom / v.zoom;
      return {zoom, x: to.x - 550 - (from.x - 550 - v.x) * ratio, y: to.y - 440 - (from.y - 440 - v.y) * ratio};
    });
  }, []);
  const pan = (x: number, y: number) => setView(v => ({...v,x:v.x+x,y:v.y+y}));
  const resetView = () => setView({x:0,y:0,zoom:1});
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.size) { moved.current = false; origin.current = {x:e.clientX,y:e.clientY}; }
    if (e.button !== 0 || (!dragEnabled && e.pointerType !== 'touch')) return;
    if ((e.target as Element).closest('[data-node]') && e.pointerType !== 'touch') return;
    pointers.current.set(e.pointerId, {x:e.clientX,y:e.clientY});
    if (!(e.target as Element).closest('[data-node]')) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    const before = [...pointers.current.values()];
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const after = [...pointers.current.values()];
    if (after.length >= 2) {
      const distance = (p:Point[]) => Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
      const mid = (p:Point[]) => clientPoint((p[0].x+p[1].x)/2,(p[0].y+p[1].y)/2);
      if (distance(before) > 0) scaleAt(distance(after)/distance(before),mid(before),mid(after));
      moved.current = true;
      setDragging(true);
    } else if (dragEnabled) {
      const a = clientPoint(previous.x,previous.y), b = clientPoint(e.clientX,e.clientY);
      if (moved.current || Math.hypot(e.clientX-origin.current.x,e.clientY-origin.current.y) > 5) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
        pan(b.x-a.x,b.y-a.y);
        moved.current = true;
        setDragging(true);
      }
    }
  };
  const up = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!pointers.current.size) setDragging(false);
  };
  const click = (e: MouseEvent<SVGSVGElement>) => {
    if (moved.current) { e.preventDefault(); e.stopPropagation(); moved.current = false; }
  };
  const keyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest('[data-node]')) return;
    const moves: Record<string, [number,number]> = {ArrowLeft:[-60,0],ArrowRight:[60,0],ArrowUp:[0,-60],ArrowDown:[0,60]};
    if (moves[e.key]) {e.preventDefault();pan(...moves[e.key]);}
    else if (e.key === '+' || e.key === '=') {e.preventDefault();scaleAt(1.2);}
    else if (e.key === '-') {e.preventDefault();scaleAt(1/1.2);}
    else if (e.key === '0') {e.preventDefault();resetView();}
  };
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      scaleAt(Math.exp(-Math.max(-100,Math.min(100,e.deltaY))*.003),clientPoint(e.clientX,e.clientY));
    };
    element.addEventListener('wheel',wheel,{passive:false});
    return () => element.removeEventListener('wheel',wheel);
  }, [scaleAt,clientPoint]);
  return {view,svg,dragEnabled,setDragEnabled,dragging,down,move,up,click,keyDown,scaleAt,pan,resetView,MIN_ZOOM,MAX_ZOOM};
}
