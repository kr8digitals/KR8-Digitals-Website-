import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  color: string;
}

export default function HeroInteractiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = [
      "rgba(236, 72, 153, ", // pink-500
      "rgba(168, 85, 247, ", // purple-500
      "rgba(192, 132, 252, ", // purple-400
      "rgba(244, 114, 182, ", // pink-400
      "rgba(255, 255, 255, ", // white
    ];

    const particleCount = Math.min(Math.floor((width * height) / 22000), 45);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.08, // gentle upward drift
        size: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Render quiet particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Mouse gentle interaction
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 0.8;
          p.y -= (dy / dist) * force * 0.8;
        }

        // Draw particle with gentle breathing opacity
        const pulse = Math.sin(time + i) * 0.12;
        const alpha = Math.max(0.05, Math.min(0.7, p.baseAlpha + pulse));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + alpha + ")";
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color + "0.6)";
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby particles quietly
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist2 / 110) * 0.14;
            ctx.strokeStyle = `rgba(236, 72, 153, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* Dynamic Quiet Stardust Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />

      {/* Floating Quiet 3D / Glass Artistic Objects */}
      {/* 1. Top Left Floating Soft Glowing Orb */}
      <div
        className="animate-float-slow absolute -top-12 -left-12 h-72 w-72 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-600/15 to-transparent blur-3xl pointer-events-none"
        style={{ animationDuration: "9s" }}
      />

      {/* 2. Top Right Floating Luminous Mesh */}
      <div
        className="animate-float-reverse absolute top-10 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-purple-500/15 via-pink-600/10 to-transparent blur-3xl pointer-events-none"
        style={{ animationDuration: "12s" }}
      />

      {/* 3. Floating Glass Diamond / Prism (Top Left area) */}
      <div
        className="animate-float-slow absolute top-1/4 left-[5%] hidden md:flex items-center justify-center pointer-events-none"
        style={{ animationDuration: "10s", animationDelay: "1s" }}
      >
        <div className="relative h-14 w-14 rotate-12 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/[0.02] p-2.5 backdrop-blur-md shadow-xl shadow-pink-500/10">
          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 text-white shadow-inner">
            <span className="text-sm font-black tracking-widest text-pink-200">✦</span>
          </div>
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-pink-400 blur-sm" />
        </div>
      </div>

      {/* 4. Floating Glass Creative Pill (Right side background) */}
      <div
        className="animate-float-reverse absolute top-[16%] right-[6%] hidden lg:flex items-center gap-2 rounded-full border border-pink-500/25 bg-black/40 px-3.5 py-1.5 backdrop-blur-lg shadow-xl shadow-purple-900/20 pointer-events-none"
        style={{ animationDuration: "11s", animationDelay: "2s" }}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
        </span>
        <span className="text-[11px] font-bold tracking-wider uppercase text-pink-200">
          Think It. KR8 It
        </span>
      </div>

      {/* 5. Floating Glass Sphere / Torus (Bottom Left of hero) */}
      <div
        className="animate-float-horizontal absolute bottom-12 left-[10%] hidden sm:flex items-center justify-center pointer-events-none"
        style={{ animationDuration: "13s", animationDelay: "0.5s" }}
      >
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-purple-400/30 bg-purple-950/40 backdrop-blur-md shadow-lg shadow-pink-500/10">
          <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-pink-500/40 to-purple-400/40 blur-sm" />
          <span className="absolute text-xs font-bold text-pink-300">⚡</span>
        </div>
      </div>

      {/* 6. Floating Creative Sparkle (Bottom Right) */}
      <div
        className="animate-float-slow absolute bottom-20 right-[12%] hidden md:flex items-center justify-center pointer-events-none"
        style={{ animationDuration: "8s", animationDelay: "3s" }}
      >
        <div className="flex h-11 w-11 -rotate-6 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] backdrop-blur-md shadow-lg">
          <span className="text-base">🎨</span>
        </div>
      </div>
    </div>
  );
}
