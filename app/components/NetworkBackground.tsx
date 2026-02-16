"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

const THEMES = {
  default: {
    particle: ["rgba(45, 184, 249, 0.9)", "rgba(170, 48, 255, 0.3)"],
    glow: "rgba(123, 92, 250, 0.3)",
    line: ["rgba(45, 184, 249, ", "rgba(170, 48, 255, "],
  },
  report: {
    particle: ["rgba(243, 19, 19, 0.9)", "rgba(246, 236, 12, 0.4)"],
    glow: "rgba(248, 3, 212, 0.35)",
    line: ["rgba(243, 19, 19, ", "rgba(246, 236, 12, "],
  },
} as const;

export default function NetworkBackground({ variant = "default" }: { variant?: "default" | "report" }) {
    const theme = THEMES[variant];
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // パーティクルの初期化
        const particleCount = 80;
        const particles: Particle[] = [];
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
            });
        }
        particlesRef.current = particles;

        const maxDistance = 150;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // パーティクルの更新と描画
            particles.forEach((particle) => {
                // 移動
                particle.x += particle.vx;
                particle.y += particle.vy;

                // 境界でバウンス
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.vx *= -1;
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.vy *= -1;
                }

                // パーティクル描画
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 2
                );
                gradient.addColorStop(0, theme.particle[0]);
                gradient.addColorStop(1, theme.particle[1]);
                ctx.fillStyle = gradient;
                ctx.fill();

                // グロー効果
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
                const glowGradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.radius * 3
                );
                glowGradient.addColorStop(0, theme.glow);
                glowGradient.addColorStop(1, theme.glow.replace(/[\d.]+\)$/, "0)"));
                ctx.fillStyle = glowGradient;
                ctx.fill();
            });

            // パーティクル間の線を描画
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.5;
                        
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        const lineGradient = ctx.createLinearGradient(
                            particles[i].x, particles[i].y,
                            particles[j].x, particles[j].y
                        );
                        lineGradient.addColorStop(0, `${theme.line[0]}${opacity})`);
                        lineGradient.addColorStop(1, `${theme.line[1]}${opacity})`);
                        
                        ctx.strokeStyle = lineGradient;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
