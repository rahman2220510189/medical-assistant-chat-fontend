import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Typing effect hook ──
function useTyping(words, speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wi];
    let timeout;
    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setWi(p => (p + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      }, deleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wi]);
  return text;
}

// ── Animated counter ──
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 60;
      const t = setInterval(() => {
        start += step;
        if (start >= target) { setVal(target); clearInterval(t); }
        else setVal(Math.floor(start));
      }, 25);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Floating orb ──
function Orb({ style }) {
  return <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", ...style }} />;
}

export default function Home() {
  const navigate = useNavigate();
  const typed = useTyping(["Smarter.", "Faster.", "Better.", "With AI."]);
  const canvasRef = useRef(null);
  const [doctors, setDoctors] = useState([]);
  const [symptom, setSymptom] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    axios.get(`${API}/api/doctors?limit=6`)
      .then(r => setDoctors(r.data.doctors?.slice(0, 6) || []))
      .catch(() => {});
  }, []);

  // Mouse parallax
  useEffect(() => {
    const h = e => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Star field canvas
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.3 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach(s => {
        s.twinkle += 0.02;
        const opacity = s.o * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${opacity})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const parallaxX = (mousePos.x - 0.5) * 30;
  const parallaxY = (mousePos.y - 0.5) * 20;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #03070f;
          --surface: rgba(255,255,255,0.025);
          --border: rgba(255,255,255,0.07);
          --cyan: #00d4ff;
          --violet: #7c6fff;
          --amber: #f59e0b;
          --rose: #f43f5e;
          --text: #e8f0fe;
          --muted: #4a5568;
        }

        .hm { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        /* ─── HERO ─── */
        .hm-hero {
          min-height: 100vh; position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 24px 80px; overflow: hidden;
        }
        .hm-canvas { position: absolute; inset: 0; z-index: 0; }

        .hm-orbs { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

        /* Animated aurora ring */
        .hm-aurora {
          position: absolute; z-index: 0;
          width: 900px; height: 900px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0%, rgba(0,212,255,0.04) 25%, transparent 50%, rgba(124,111,255,0.04) 75%, transparent 100%);
          animation: auroraRotate 20s linear infinite;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        @keyframes auroraRotate { to { transform: translate(-50%, -50%) rotate(360deg); } }

        /* Scanline effect */
        .hm-scanlines {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,212,255,0.008) 3px, rgba(0,212,255,0.008) 4px);
        }

        /* Hero content */
        .hm-hero-inner { position: relative; z-index: 2; text-align: center; max-width: 900px; }

        .hm-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 8px 20px; border-radius: 100px;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.2);
          font-size: 11px; font-weight: 600; color: var(--cyan);
          text-transform: uppercase; letter-spacing: 2px;
          margin-bottom: 36px;
          animation: fadeUp 0.8s ease both;
        }
        .hm-eyebrow-pulse {
          width: 7px; height: 7px; border-radius: 50%; background: var(--cyan);
          animation: pulseGlow 1.5s ease-in-out infinite;
          box-shadow: 0 0 8px var(--cyan);
        }
        @keyframes pulseGlow { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.7);opacity:0.5} }

        .hm-h1 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(52px, 8.5vw, 110px);
          font-weight: 800; line-height: 0.95;
          letter-spacing: -3px;
          margin-bottom: 12px;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .hm-h1-line1 { display: block; color: var(--text); }
        .hm-h1-line2 {
          display: block;
          background: linear-gradient(120deg, var(--cyan) 0%, var(--violet) 50%, var(--amber) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200%; animation: gradFlow 4s ease infinite;
        }
        @keyframes gradFlow { 0%,100%{background-position:0%} 50%{background-position:100%} }

        .hm-typed-line {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 5vw, 68px);
          font-weight: 700; letter-spacing: -2px;
          color: rgba(255,255,255,0.15);
          min-height: 80px;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .hm-cursor {
          display: inline-block; width: 3px; height: 0.85em;
          background: var(--cyan); margin-left: 4px;
          vertical-align: middle; animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .hm-sub {
          font-size: clamp(15px, 2vw, 18px); color: #4a5a72;
          max-width: 560px; margin: 28px auto 0;
          line-height: 1.75;
          animation: fadeUp 0.8s 0.3s ease both;
        }

        .hm-hero-btns {
          display: flex; gap: 14px; justify-content: center;
          flex-wrap: wrap; margin-top: 44px;
          animation: fadeUp 0.8s 0.4s ease both;
        }
        .hm-btn-primary {
          padding: 16px 36px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, var(--cyan), #0284c7);
          color: white; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 40px rgba(0,212,255,0.3), 0 8px 24px rgba(0,0,0,0.4);
          transition: all 0.3s; letter-spacing: 0.3px;
          position: relative; overflow: hidden;
        }
        .hm-btn-primary::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15));
          opacity:0; transition:opacity 0.3s;
        }
        .hm-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 60px rgba(0,212,255,0.45), 0 16px 40px rgba(0,0,0,0.5); }
        .hm-btn-primary:hover::before { opacity:1; }

        .hm-btn-ghost {
          padding: 16px 36px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6); font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.3s; letter-spacing: 0.3px;
          backdrop-filter: blur(10px);
        }
        .hm-btn-ghost:hover { background: rgba(255,255,255,0.08); color: white; border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }

        /* ── Symptom quick check ── */
        .hm-quick {
          position: relative; z-index: 2;
          margin-top: 56px;
          animation: fadeUp 0.8s 0.5s ease both;
        }
        .hm-quick-bar {
          display: flex; align-items: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 20px; padding: 10px 10px 10px 20px;
          max-width: 560px; margin: 0 auto;
          backdrop-filter: blur(20px);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .hm-quick-bar:focus-within {
          border-color: rgba(0,212,255,0.35);
          box-shadow: 0 0 0 4px rgba(0,212,255,0.07), 0 20px 60px rgba(0,0,0,0.4);
        }
        .hm-quick-inp {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 14px; font-family: 'DM Sans', sans-serif;
        }
        .hm-quick-inp::placeholder { color: #2a3a50; }
        .hm-quick-btn {
          padding: 11px 22px; border-radius: 13px; border: none;
          background: linear-gradient(135deg, var(--cyan), #0284c7);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          white-space: nowrap; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(0,212,255,0.3);
        }
        .hm-quick-btn:hover { transform: scale(1.04); }

        /* ── Floating cards ── */
        .hm-float-cards {
          position: absolute; z-index: 1; inset: 0; pointer-events: none;
        }
        .hm-float {
          position: absolute;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 14px 18px;
          backdrop-filter: blur(20px);
          font-size: 12px; font-family: 'DM Sans', sans-serif;
          transition: transform 0.1s ease;
          pointer-events: none;
        }
        .hm-float-1 { top: 22%; left: 4%; animation: floatA 6s ease-in-out infinite; }
        .hm-float-2 { top: 35%; right: 4%; animation: floatB 8s ease-in-out infinite; }
        .hm-float-3 { bottom: 22%; left: 6%; animation: floatA 7s 1s ease-in-out infinite; }
        .hm-float-4 { bottom: 30%; right: 5%; animation: floatB 9s 0.5s ease-in-out infinite; }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px) rotate(1deg)} }
        .hm-float-icon { font-size: 20px; margin-bottom: 5px; }
        .hm-float-label { color: #4a5a72; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        .hm-float-val { color: var(--text); font-weight: 700; font-size: 14px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }

        /* ─── STATS BAR ─── */
        .hm-stats-bar {
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.01);
          padding: 0 24px;
        }
        .hm-stats-inner {
          max-width: 900px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4, 1fr);
        }
        .hm-stat {
          padding: 40px 20px; text-align: center; position: relative;
        }
        .hm-stat:not(:last-child)::after {
          content:''; position:absolute; right:0; top:25%; height:50%;
          width:1px; background:var(--border);
        }
        .hm-stat-num {
          font-family: 'Syne', sans-serif;
          font-size: clamp(34px, 4vw, 52px); font-weight: 800;
          line-height: 1; margin-bottom: 6px;
        }
        .hm-stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; font-weight: 600; }

        /* ─── HOW IT WORKS ─── */
        .hm-section { max-width: 1100px; margin: 0 auto; padding: 100px 24px; }
        .hm-section-tag {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 2px; padding: 5px 14px; border-radius: 100px;
          margin-bottom: 18px;
        }
        .hm-section-h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(34px, 5vw, 58px); font-weight: 800;
          letter-spacing: -2px; line-height: 1.05; color: var(--text);
          margin-bottom: 16px;
        }
        .hm-section-sub { font-size: 16px; color: var(--muted); line-height: 1.7; max-width: 500px; }

        /* Steps — horizontal timeline */
        .hm-steps {
          display: grid; grid-template-columns: repeat(5, 1fr);
          gap: 0; margin-top: 70px; position: relative;
        }
        .hm-steps::before {
          content:''; position:absolute; top:28px; left:10%; right:10%; height:1px;
          background: linear-gradient(90deg, var(--cyan), var(--violet), var(--amber), #22c55e, #f472b6);
          opacity:0.2;
        }
        .hm-step { text-align: center; padding: 0 12px; position: relative; }
        .hm-step-dot {
          width: 56px; height: 56px; border-radius: 18px;
          margin: 0 auto 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; position: relative; z-index: 1;
          transition: transform 0.3s;
        }
        .hm-step:hover .hm-step-dot { transform: translateY(-6px) scale(1.1); }
        .hm-step-num {
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
        }
        .hm-step-title { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .hm-step-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

        /* ─── DOCTORS ─── */
        .hm-docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px; margin-top: 54px;
        }
        .hm-doc-card {
          border-radius: 22px; overflow: hidden;
          background: var(--surface); border: 1px solid var(--border);
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          cursor: pointer;
        }
        .hm-doc-card:hover { transform: translateY(-8px) scale(1.02); border-color: rgba(0,212,255,0.2); box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.06); }
        .hm-doc-img-wrap { height: 180px; overflow: hidden; position: relative; }
        .hm-doc-img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
        .hm-doc-card:hover .hm-doc-img { transform: scale(1.08); }
        .hm-doc-ph {
          width:100%; height:100%;
          background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,111,255,0.12));
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:52px; font-weight:800; color:var(--cyan);
        }
        .hm-doc-body { padding: 14px 16px 18px; }
        .hm-doc-name { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:var(--text); margin-bottom:5px; }
        .hm-doc-spec {
          display:inline-flex; align-items:center;
          background:rgba(0,212,255,0.07); border:1px solid rgba(0,212,255,0.1);
          color:var(--cyan); font-size:10px; font-weight:700;
          padding:3px 10px; border-radius:100px; margin-bottom:10px;
          text-transform:uppercase; letter-spacing:0.8px;
        }
        .hm-doc-meta { display:flex; gap:12px; }
        .hm-doc-meta span { font-size:11px; color:var(--muted); }

        /* ─── TESTIMONIAL MARQUEE ─── */
        .hm-marquee-section {
          overflow: hidden; padding: 80px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: rgba(255,255,255,0.008);
          position: relative;
        }
        .hm-marquee-section::before, .hm-marquee-section::after {
          content:''; position:absolute; top:0; bottom:0; width:150px; z-index:2;
          pointer-events:none;
        }
        .hm-marquee-section::before { left:0; background:linear-gradient(90deg, var(--bg), transparent); }
        .hm-marquee-section::after  { right:0; background:linear-gradient(-90deg, var(--bg), transparent); }

        .hm-marquee-label {
          text-align:center; margin-bottom:36px;
          font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:3px; color:var(--muted);
        }
        .hm-marquee-track {
          display:flex; gap:16px;
          animation: marqueeScroll 40s linear infinite;
          width: max-content;
        }
        .hm-marquee-track:hover { animation-play-state: paused; }
        @keyframes marqueeScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .hm-tcard {
          flex-shrink:0; width:300px;
          background:var(--surface); border:1px solid var(--border);
          border-radius:20px; padding:22px;
          transition:border-color 0.3s;
        }
        .hm-tcard:hover { border-color:rgba(0,212,255,0.15); }
        .hm-tcard-stars { color:#f59e0b; font-size:13px; margin-bottom:10px; letter-spacing:2px; }
        .hm-tcard-text { font-size:13px; color:#4a5a72; line-height:1.65; margin-bottom:16px; }
        .hm-tcard-author { display:flex; align-items:center; gap:10px; }
        .hm-tcard-av {
          width:34px; height:34px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:13px; font-weight:800;
        }
        .hm-tcard-name { font-size:13px; font-weight:700; color:var(--text); }
        .hm-tcard-role { font-size:10px; color:var(--muted); }

        /* ─── FEATURE GRID ─── */
        .hm-feat-grid {
          display:grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap:14px; margin-top:54px;
        }
        .hm-feat {
          background:var(--surface); border:1px solid var(--border);
          border-radius:22px; padding:28px;
          transition:all 0.3s; position:relative; overflow:hidden;
        }
        .hm-feat:hover { transform:translateY(-4px); }
        .hm-feat:first-child { grid-column: span 2; }
        .hm-feat-icon { font-size:32px; margin-bottom:14px; }
        .hm-feat-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:var(--text); margin-bottom:8px; }
        .hm-feat-desc { font-size:13px; color:var(--muted); line-height:1.6; }
        .hm-feat-glow {
          position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none;
          width:200px; height:200px; bottom:-80px; right:-60px; opacity:0.08;
          transition:opacity 0.3s;
        }
        .hm-feat:hover .hm-feat-glow { opacity:0.18; }

        /* ─── CTA FINALE ─── */
        .hm-cta {
          margin: 0 24px 80px; max-width:1100px; margin-left:auto; margin-right:auto;
          border-radius:32px; overflow:hidden; position:relative;
          padding:80px 48px;
          background: linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(124,111,255,0.07) 50%, rgba(245,158,11,0.05) 100%);
          border:1px solid rgba(255,255,255,0.08);
        }
        .hm-cta-grid {
          position:absolute; inset:0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size:40px 40px;
        }
        .hm-cta-content { position:relative; z-index:1; text-align:center; }
        .hm-cta-title {
          font-family:'Syne',sans-serif;
          font-size:clamp(36px, 5vw, 64px); font-weight:800;
          letter-spacing:-2px; line-height:1.05; color:var(--text); margin-bottom:16px;
        }
        .hm-cta-sub { font-size:17px; color:var(--muted); margin-bottom:40px; }
        .hm-cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

        @media(max-width:900px) {
          .hm-steps { grid-template-columns:1fr 1fr; gap:32px; }
          .hm-steps::before { display:none; }
          .hm-feat-grid { grid-template-columns:1fr 1fr; }
          .hm-feat:first-child { grid-column:span 2; }
          .hm-stats-inner { grid-template-columns:repeat(2,1fr); }
          .hm-stat:nth-child(2)::after { display:none; }
          .hm-float-1,.hm-float-2,.hm-float-3,.hm-float-4 { display:none; }
        }
        @media(max-width:580px) {
          .hm-steps { grid-template-columns:1fr; }
          .hm-feat-grid { grid-template-columns:1fr; }
          .hm-feat:first-child { grid-column:span 1; }
          .hm-stats-inner { grid-template-columns:1fr 1fr; }
          .hm-cta { margin:0 12px 60px; padding:48px 24px; }
        }
      `}</style>

      <div className="hm">

        {/* ── HERO ── */}
        <section className="hm-hero">
          <canvas ref={canvasRef} className="hm-canvas" />
          <div className="hm-orbs">
            <Orb style={{ width:700,height:700,background:"radial-gradient(circle,rgba(0,212,255,0.08),transparent)",top:-200,left:-200, transform:`translate(${parallaxX*0.5}px,${parallaxY*0.5}px)` }} />
            <Orb style={{ width:600,height:600,background:"radial-gradient(circle,rgba(124,111,255,0.08),transparent)",bottom:-150,right:-150, transform:`translate(${-parallaxX*0.4}px,${-parallaxY*0.4}px)` }} />
            <Orb style={{ width:400,height:400,background:"radial-gradient(circle,rgba(245,158,11,0.06),transparent)",top:"40%",left:"40%", transform:`translate(${parallaxX*0.3}px,${parallaxY*0.3}px)` }} />
          </div>
          <div className="hm-aurora" />
          <div className="hm-scanlines" />

          {/* Floating status cards */}
          <div className="hm-float-cards">
            <div className="hm-float hm-float-1">
              <div className="hm-float-icon">🤖</div>
              <div className="hm-float-label">AI Accuracy</div>
              <div className="hm-float-val" style={{color:"#00d4ff"}}>99%</div>
            </div>
            <div className="hm-float hm-float-2">
              <div className="hm-float-icon">⚡</div>
              <div className="hm-float-label">Diagnosis Time</div>
              <div className="hm-float-val" style={{color:"#f59e0b"}}>&lt;3 sec</div>
            </div>
            <div className="hm-float hm-float-3">
              <div className="hm-float-icon">👨‍⚕️</div>
              <div className="hm-float-label">Verified Doctors</div>
              <div className="hm-float-val" style={{color:"#a78bfa"}}>12+</div>
            </div>
            <div className="hm-float hm-float-4">
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e"}} />
                <span style={{fontSize:10,color:"#22c55e",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Live Now</span>
              </div>
              <div className="hm-float-val">3 Consultations</div>
            </div>
          </div>

          <div className="hm-hero-inner">
            <div className="hm-eyebrow">
              <div className="hm-eyebrow-pulse" />
              AI-Powered Healthcare Platform
            </div>

            <h1 className="hm-h1">
              <span className="hm-h1-line1">Healthcare</span>
              <span className="hm-h1-line2">Reimagined.</span>
            </h1>

            <div className="hm-typed-line">
              {typed}<span className="hm-cursor" />
            </div>

            <p className="hm-sub">
              Describe your symptoms. Get an instant AI diagnosis. Connect with verified specialists via video call — all from your browser.
            </p>

            <div className="hm-hero-btns">
              <button className="hm-btn-primary" onClick={() => navigate("/chatbot")}>
                ✨ Try AI Diagnosis Free
              </button>
              <button className="hm-btn-ghost" onClick={() => navigate("/doctors")}>
                Browse Doctors →
              </button>
            </div>

            {/* Quick check bar */}
            <div className="hm-quick">
              <div className="hm-quick-bar">
                <input
                  className="hm-quick-inp"
                  placeholder="Describe a symptom quickly... e.g. 'I have a headache and fever'"
                  value={symptom}
                  onChange={e => setSymptom(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && navigate("/chatbot")}
                />
                <button className="hm-quick-btn" onClick={() => navigate("/chatbot")}>
                  Check Now →
                </button>
              </div>
              <div style={{fontSize:11,color:"#1e3347",marginTop:10,textAlign:"center"}}>
                Free • No account needed • Instant results
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="hm-stats-bar">
          <div className="hm-stats-inner">
            {[
              { num: 12,  suffix: "+", label: "Expert Doctors",      color: "#00d4ff" },
              { num: 248, suffix: "+", label: "Happy Patients",      color: "#7c6fff" },
              { num: 41,  suffix: "",  label: "Diseases Covered",    color: "#f59e0b" },
              { num: 99,  suffix: "%", label: "AI Accuracy",         color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="hm-stat">
                <div className="hm-stat-num" style={{color:s.color}}>
                  <Counter target={s.num} suffix={s.suffix} />
                </div>
                <div className="hm-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="hm-section">
          <div className="hm-section-tag" style={{background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.15)",color:"#00d4ff"}}>
            ⚡ How It Works
          </div>
          <h2 className="hm-section-h2">Five steps to<br />feeling better</h2>
          <p className="hm-section-sub">No waiting rooms. No commuting. Expert care from your device.</p>

          <div className="hm-steps">
            {[
              { n:"01", icon:"💬", color:"#00d4ff", bg:"rgba(0,212,255,0.08)", title:"Describe Symptoms", desc:"Tell our AI exactly how you feel in plain words." },
              { n:"02", icon:"🧠", color:"#7c6fff", bg:"rgba(124,111,255,0.08)", title:"AI Diagnosis",     desc:"ML model analyzes 131 symptoms across 41 diseases." },
              { n:"03", icon:"📅", color:"#f59e0b", bg:"rgba(245,158,11,0.08)", title:"Book Doctor",       desc:"Pick a specialist and pay securely with Stripe." },
              { n:"04", icon:"🎥", color:"#22c55e", bg:"rgba(34,197,94,0.08)",  title:"Video Call",        desc:"HD consultation from your home via WebRTC." },
              { n:"05", icon:"📋", color:"#f472b6", bg:"rgba(244,114,182,0.08)",title:"Get Prescription",  desc:"Download your PDF prescription instantly." },
            ].map(s => (
              <div key={s.n} className="hm-step">
                <div className="hm-step-dot" style={{background:s.bg,border:`1px solid ${s.color}20`}}>
                  <span style={{fontSize:24}}>{s.icon}</span>
                </div>
                <div className="hm-step-num" style={{color:s.color}}>Step {s.n}</div>
                <div className="hm-step-title">{s.title}</div>
                <div className="hm-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DOCTORS ── */}
        <div style={{borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"rgba(255,255,255,0.008)"}}>
          <div className="hm-section">
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
              <div>
                <div className="hm-section-tag" style={{background:"rgba(124,111,255,0.07)",border:"1px solid rgba(124,111,255,0.15)",color:"#7c6fff"}}>
                  👨‍⚕️ Our Doctors
                </div>
                <h2 className="hm-section-h2" style={{marginBottom:0}}>Meet the team<br />behind your care</h2>
              </div>
              <button className="hm-btn-ghost" onClick={() => navigate("/doctors")} style={{marginBottom:4}}>View All →</button>
            </div>

            <div className="hm-docs-grid">
              {doctors.length > 0 ? doctors.map(d => (
                <div key={d._id} className="hm-doc-card" onClick={() => navigate("/doctors")}>
                  <div className="hm-doc-img-wrap">
                    {d.photo
                      ? <img src={d.photo} alt={d.name} className="hm-doc-img" />
                      : <div className="hm-doc-ph">{d.name?.[0]?.toUpperCase()}</div>}
                  </div>
                  <div className="hm-doc-body">
                    <div className="hm-doc-name">Dr. {d.name}</div>
                    <div className="hm-doc-spec">{d.specialist}</div>
                    <div className="hm-doc-meta">
                      <span>⭐ {d.rating || "5.0"}</span>
                      <span>⏳ {d.experience}yr</span>
                      <span>৳{d.consultationFee}</span>
                    </div>
                  </div>
                </div>
              )) : [1,2,3,4,5,6].map(i => (
                <div key={i} className="hm-doc-card" style={{opacity:0.4}}>
                  <div style={{height:180,background:"rgba(255,255,255,0.04)"}} />
                  <div style={{padding:16}}>
                    <div style={{height:14,background:"rgba(255,255,255,0.05)",borderRadius:8,marginBottom:8,width:"70%"}} />
                    <div style={{height:10,background:"rgba(255,255,255,0.03)",borderRadius:8,width:"50%"}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="hm-section">
          <div className="hm-section-tag" style={{background:"rgba(245,158,11,0.07)",border:"1px solid rgba(245,158,11,0.15)",color:"#f59e0b"}}>
            🛡️ Why MediCarePlus
          </div>
          <h2 className="hm-section-h2">Built different.<br />Care delivered.</h2>

          <div className="hm-feat-grid">
            {[
              { icon:"🧠", title:"ML-Powered Diagnosis", desc:"Our Random Forest model trained on real medical data gives near-perfect accuracy. Backed by Groq AI for edge cases.", color:"#00d4ff", big:true },
              { icon:"🔒", title:"Encrypted & Private",  desc:"End-to-end encrypted video calls. Your health data never leaves securely.",color:"#22c55e" },
              { icon:"⚡", title:"Instant Results",      desc:"AI diagnosis in under 3 seconds. No loading, no delays.",color:"#f59e0b" },
              { icon:"💳", title:"Secure Payments",      desc:"Stripe-powered checkout with instant confirmation.",color:"#7c6fff" },
              { icon:"📱", title:"Works Everywhere",     desc:"Any device, any browser — mobile to desktop.",color:"#f472b6" },
            ].map((f,i) => (
              <div key={i} className="hm-feat" style={{borderColor:i===0?"rgba(0,212,255,0.1)":undefined}}>
                <div className="hm-feat-glow" style={{background:f.color}} />
                <div className="hm-feat-icon">{f.icon}</div>
                <div className="hm-feat-title">{f.title}</div>
                <div className="hm-feat-desc">{f.desc}</div>
                {i===0 && (
                  <button className="hm-btn-primary" style={{marginTop:20,fontSize:13,padding:"10px 22px"}} onClick={() => navigate("/chatbot")}>
                    Try It Free →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── MARQUEE TESTIMONIALS ── */}
        <div className="hm-marquee-section">
          <div className="hm-marquee-label">What patients say</div>
          <div style={{display:"flex",overflow:"hidden"}}>
            <div className="hm-marquee-track">
              {[...Array(2)].flatMap(() => [
                { text:"Got diagnosed within minutes. The AI was shockingly accurate. I booked a doctor the same day!", name:"Rahim U.", role:"Patient", av:"R", color:"#00d4ff" },
                { text:"The video call quality was perfect. Doctor was professional and my PDF prescription was ready instantly.", name:"Fatema B.", role:"Patient", av:"F", color:"#7c6fff" },
                { text:"Best telemedicine experience I've ever had. Clean interface and doctors are amazing.", name:"Nusrat J.", role:"Patient", av:"N", color:"#f59e0b" },
                { text:"I was skeptical but the AI symptom checker caught exactly what was wrong. Highly recommend!", name:"Karim H.", role:"Patient", av:"K", color:"#22c55e" },
                { text:"Booked an appointment in 2 minutes, had a video call in the evening. Healthcare made simple.", name:"Sumaiya A.", role:"Patient", av:"S", color:"#f472b6" },
                { text:"The prescription PDF feature is brilliant. My pharmacist was impressed by how professional it looked.", name:"Mizanur R.", role:"Patient", av:"M", color:"#fb923c" },
              ].map((t, i) => (
                <div key={i} className="hm-tcard">
                  <div className="hm-tcard-stars">★★★★★</div>
                  <div className="hm-tcard-text">"{t.text}"</div>
                  <div className="hm-tcard-author">
                    <div className="hm-tcard-av" style={{background:`${t.color}18`,color:t.color}}>{t.av}</div>
                    <div>
                      <div className="hm-tcard-name">{t.name}</div>
                      <div className="hm-tcard-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{maxWidth:1100,margin:"80px auto 80px",padding:"0 24px"}}>
          <div className="hm-cta">
            <div className="hm-cta-grid" />
            <Orb style={{width:500,height:500,background:"radial-gradient(circle,rgba(0,212,255,0.1),transparent)",top:-200,left:-100}} />
            <Orb style={{width:400,height:400,background:"radial-gradient(circle,rgba(124,111,255,0.1),transparent)",bottom:-150,right:-80}} />
            <div className="hm-cta-content">
              <div className="hm-section-tag" style={{background:"rgba(0,212,255,0.07)",border:"1px solid rgba(0,212,255,0.15)",color:"#00d4ff",margin:"0 auto 20px"}}>
                🚀 Get Started Today
              </div>
              <div className="hm-cta-title">
                Your health.<br />
                <span style={{background:"linear-gradient(120deg,#00d4ff,#7c6fff,#f59e0b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
                  Our mission.
                </span>
              </div>
              <p className="hm-cta-sub">Join thousands of patients getting smarter, faster healthcare.</p>
              <div className="hm-cta-btns">
                <button className="hm-btn-primary" onClick={() => navigate("/register")}>
                  Create Free Account →
                </button>
                <button className="hm-btn-ghost" onClick={() => navigate("/chatbot")}>
                  Try AI First
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}