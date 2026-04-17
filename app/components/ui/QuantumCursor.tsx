'use client';

import { useEffect, useRef } from 'react';

export default function QuantumCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    const onMove = (e: MouseEvent) => {
      dot.style.transform  = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
      ring.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    };

    const onEnter = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"]')) {
        ring.style.opacity = '0.65';
      }
    };
    const onLeave = () => { ring.style.opacity = '0'; };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout',  onLeave);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout',  onLeave);
    };
  }, []);

  const base: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0,
    pointerEvents: 'none', zIndex: 99999,
    borderRadius: '50%',
  };

  return (
    <>
      <div ref={dotRef} style={{ ...base, width: 6, height: 6, background: '#d4a853' }} />
      <div ref={ringRef} style={{
        ...base,
        width: 20, height: 20,
        border: '1px solid #d4a853',
        opacity: 0,
        transition: 'opacity 0.18s',
      }} />
    </>
  );
}
