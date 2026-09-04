/*
  background.js
  Minimal drifting particle field — a quiet signal of life behind
  the content. Monochrome, slow, and paused for anyone who has
  asked for reduced motion.
*/

(() => {

  const canvas = document.getElementById("bg-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, dpr;
  let particles = [];

  const DENSITY = 16000;      // px^2 per particle — lower = more dots
  const MAX_PARTICLES = 70;
  const LINK_DIST = 120;      // max distance to draw a connecting thread
  const SPEED = 0.035;        // px per ms, very slow

  function resize() {

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(
      MAX_PARTICLES,
      Math.round((width * height) / DENSITY)
    );

    particles = Array.from({ length: count }, () => makeParticle());
  }

  function makeParticle() {

    const angle = Math.random() * Math.PI * 2;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * SPEED,
      vy: Math.sin(angle) * SPEED,
      r: Math.random() * 1.1 + 0.4,
      o: Math.random() * 0.22 + 0.12
    };
  }

  function step(dt) {

    for (const p of particles) {

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    }
  }

  function draw() {

    ctx.clearRect(0, 0, width, height);

    // Faint connecting threads between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {

        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINK_DIST) {

          ctx.strokeStyle =
            `rgba(31,26,18,${0.035 * (1 - dist / LINK_DIST)})`;

          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Dots
    for (const p of particles) {

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(31,26,18,${p.o})`;
      ctx.fill();
    }
  }

  let last = performance.now();

  function frame(now) {

    const dt = Math.min(now - last, 50);
    last = now;

    step(dt);
    draw();

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);

  resize();

  if (reduceMotion) {

    // Draw one static frame only — no ongoing animation.
    draw();

  } else {

    requestAnimationFrame(frame);
  }

})();
