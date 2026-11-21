import React, { useRef, useEffect } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

const NODE_COLORS = [
  'rgba(0, 212, 255,',   // cyan
  'rgba(124, 58, 237,',  // violet
  'rgba(59, 130, 246,',  // blue
];

const NODE_COUNT = 55;
const CONNECTION_DISTANCE = 160;
const BASE_OPACITY = 0.08;

function createNode(w: number, h: number): Node {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: 2 + Math.random() * 3,
    color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
    opacity: 0.4 + Math.random() * 0.6,
    pulsePhase: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.02,
  };
}

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Regenerate nodes on resize
      nodesRef.current = Array.from({ length: NODE_COUNT }, () =>
        createNode(canvas.width, canvas.height)
      );
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      timeRef.current += 1;
      const nodes = nodesRef.current;

      // Update node positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulsePhase += node.pulseSpeed;

        // Soft boundary bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const proximity = 1 - dist / CONNECTION_DISTANCE;
            const lineOpacity = proximity * proximity * BASE_OPACITY * 1.8;

            // Gradient line
            const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            gradient.addColorStop(0, `${a.color}${(lineOpacity * a.opacity).toFixed(3)})`);
            gradient.addColorStop(1, `${b.color}${(lineOpacity * b.opacity).toFixed(3)})`);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = proximity * 1.2;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = 0.7 + 0.3 * Math.sin(node.pulsePhase);
        const r = node.radius * pulse;
        const alpha = node.opacity * BASE_OPACITY * 7 * pulse;

        // Outer glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 5);
        glow.addColorStop(0, `${node.color}${(alpha * 0.6).toFixed(3)})`);
        glow.addColorStop(1, `${node.color}0)`);

        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${node.color}${Math.min(alpha * 2.5, 0.9).toFixed(3)})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
};

export default AnimatedBackground;
