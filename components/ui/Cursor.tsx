'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const curRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse   = useRef({ x: 0, y: 0 });
  const ring    = useRef({ x: 0, y: 0 });
  const rafId   = useRef<number>(0);

  useEffect(() => {
    const dot  = curRef.current;
    const halo = ringRef.current;
    if (!dot || !halo) return;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`;
    };

    const onDown = () => halo.classList.add('clicked');
    const onUp   = () => halo.classList.remove('clicked');

    const loop = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.11;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.11;
      halo.style.transform = `translate(${ring.current.x - 18}px, ${ring.current.y - 18}px)`;
      rafId.current = requestAnimationFrame(loop);
    };

    const addHover = () => {
      document.querySelectorAll<HTMLElement>(
        'button, a, .pillar, .step, .price-card, .blog-card, .proto-item'
      ).forEach((el) => {
        el.addEventListener('mouseenter', () => halo.classList.add('hovered'));
        el.addEventListener('mouseleave', () => halo.classList.remove('hovered'));
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);
    rafId.current = requestAnimationFrame(loop);

    // Run after paint so dynamic elements are present
    setTimeout(addHover, 800);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      <div ref={curRef}  className="cursor" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
