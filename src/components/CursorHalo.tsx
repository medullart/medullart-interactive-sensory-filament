import { useEffect, useRef, useState } from 'react';

export function CursorHalo() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Smooth animation loop
    const animate = () => {
      // Smooth interpolation
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;

      setPosition({
        x: currentRef.current.x,
        y: currentRef.current.y
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div data-ev-id="ev_21a5487d8d"
    className="fixed pointer-events-none z-[9999]"
    style={{
      left: position.x,
      top: position.y,
      transform: 'translate(-50%, -50%)'
    }}>

      {/* Outer glow halo */}
      <div data-ev-id="ev_65fbdf0292"
      className="absolute rounded-full"
      style={{
        width: 30,
        height: 30,
        left: -15,
        top: -15,
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)',
        filter: 'blur(2px)'
      }} />

      {/* Inner bright core */}
      <div data-ev-id="ev_e4d76f0f9e"
      className="absolute rounded-full"
      style={{
        width: 6,
        height: 6,
        left: -3,
        top: -3,
        background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 60%, transparent 100%)'
      }} />

    </div>);

}