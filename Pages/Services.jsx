import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SERVICES = [
  {
    id: "ai",
    icon: "🤖",
    title: "AI Symptom Checker",
    desc: "Describe your symptoms in plain language. Our ML model — trained on 41 diseases and 131 symptoms — gives you an instant, accurate diagnosis.",
    tag: "Powered by ML",
    color: "#00d4ff",
    accent: "#0284c7",
    cta: "Try Now →",
    link: "/chatbot",
    size: "large",
    stats: [{ val: "41", label: "Diseases" }, { val: "131", label: "Symptoms" }, { val: "99%", label: "Accuracy" }],
    visual: "brain",
  },
  {
    id: "video",
    icon: "🎥",
    title: "Video Consultation",
    desc: "Face-to-face HD video calls with verified doctors — no commuting, no waiting rooms.",
    tag: "WebRTC Powered",
    color: "#a78bfa",
    accent: "#7c3aed",
    cta: "Book Now →",
    link: "/doctors",
    size: "medium",
    visual: "video",
  },
  {
    id: "appointment",
    icon: "📅",
    title: "Smart Booking",
    desc: "Browse specialists, pick a time slot, pay securely — in under 2 minutes.",
    tag: "Instant Confirm",
    color: "#f59e0b",
    accent: "#d97706",
    cta: "Book →",
    link: "/doctors",
    size: "small",
    visual: "calendar",
  },
  {
    id: "prescription",
    icon: "📋",
    title: "Digital Prescription",
    desc: "Get your prescription as a professional PDF — accessible anytime, anywhere.",
    tag: "PDF Ready",
    color: "#22c55e",
    accent: "#16a34a",
    cta: "Learn More →",
    link: "/doctors",
    size: "small",
    visual: "doc",
  },
  {
    id: "support",
    icon: "💬",
    title: "24/7 AI Support",
    desc: "Our AI chatbot is always available — ask health questions, get guidance, and stay informed round the clock.",
    tag: "Always Online",
    color: "#f472b6",
    accent: "#db2777",
    cta: "Chat Now →",
    link: "/chatbot",
    size: "medium",
    visual: "chat",
  },
  {
    id: "specialists",
    icon: "🩺",
    title: "Specialist Doctors",
    desc: "From cardiologists to dermatologists — connect with the right expert for your condition.",
    tag: "10+ Specialties",
    color: "#fb923c",
    accent: "#ea580c",
    cta: "Browse →",
    link: "/doctors",
    size: "medium",
    visual: "doctors",
  },
  {
    id: "secure",
    icon: "🔒",
    title: "Secure & Private",
    desc: "End-to-end encrypted calls, HIPAA-aligned data handling. Your health data stays yours.",
    tag: "Encrypted",
    color: "#34d399",
    accent: "#059669",
    cta: null,
    link: null,
    size: "small",
    visual: "lock",
  },
];

// Animated visual components inside cards
function BrainVisual({ color }) {
  return (
    <svg viewBox="0 0 120 80" style={{ width: "100%", maxWidth: 180, opacity: 0.18 }}>
      <circle cx="60" cy="40" r="30" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="60" cy="40" r="20" fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 4" />
      <circle cx="60" cy="40" r="10" fill={color} opacity="0.3" />
      {[0,60,120,180,240,300].map((a,i) => (
        <line key={i}
          x1={60 + 10*Math.cos(a*Math.PI/180)} y1={40 + 10*Math.sin(a*Math.PI/180)}
          x2={60 + 30*Math.cos(a*Math.PI/180)} y2={40 + 30*Math.sin(a*Math.PI/180)}
          stroke={color} strokeWidth="0.8" />
      ))}
    </svg>
  );
}

function PulseRing({ color }) {
  return (
    <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `1px solid ${color}`,
          animation: `ringOut 2.4s ${i*0.6}s ease-out infinite`,
          opacity: 0,
        }} />
      ))}
      <div style={{
        position: "absolute", inset: "25%", borderRadius: "50%",
        background: `${color}20`, border: `1.5px solid ${color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
      }}>🎥</div>
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  const [visible, setVisible] = useState({});
  const cardRefs = useRef({});

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.dataset.id]: true }));
      });
    }, { threshold: 0.15 });
    Object.values(cardRefs.current).forEach(r => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sv-page {
          min-height: 100vh; background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif; color: #e2e8f0;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .sv-hero {
          padding: 110px 24px 70px; text-align: center;
          position: relative; overflow: hidden;
        }
        .sv-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,212,255,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 80% 30%, rgba(167,139,250,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 50% 90%, rgba(245,158,11,0.05) 0%, transparent 60%);
        }
        .sv-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .sv-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 18px; border-radius: 30px;
          background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(167,139,250,0.08));
          border: 1px solid rgba(0,212,255,0.18);
          font-size: 11px; font-weight: 800; color: #00d4ff;
          text-transform: uppercase; letter-spacing: 1.5px;
          margin-bottom: 26px; position: relative; z-index: 1;
          animation: fadeUp 0.6s ease both;
        }
        .sv-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4ff; animation: blink 1.4s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .sv-hero-h1 {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(44px, 7vw, 80px); font-weight: 700;
          line-height: 1.05; margin-bottom: 20px;
          position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .sv-grad {
          background: linear-gradient(120deg, #00d4ff 0%, #a78bfa 35%, #f59e0b 70%, #f472b6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200%; animation: gShift 5s ease infinite;
        }
        @keyframes gShift { 0%,100%{background-position:0%} 50%{background-position:100%} }
        .sv-hero-sub {
          font-size: 17px; color: #475569; max-width: 520px; margin: 0 auto;
          line-height: 1.7; position: relative; z-index: 1;
          animation: fadeUp 0.6s 0.2s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        /* ── BENTO GRID ── */
        .sv-grid {
          max-width: 1120px; margin: 0 auto;
          padding: 0 20px 100px;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: minmax(90px, auto);
          gap: 14px;
        }

        /* Card base */
        .sv-card {
          border-radius: 24px; padding: 28px;
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          position: relative; overflow: hidden;
          cursor: pointer; transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
          opacity: 0; transform: translateY(30px);
        }
        .sv-card.visible { opacity: 1; transform: translateY(0); }
        .sv-card:hover { transform: translateY(-6px) scale(1.01); }

        /* Grid placement */
        .sv-card-ai          { grid-column: span 7; grid-row: span 3; }
        .sv-card-video       { grid-column: span 5; grid-row: span 2; }
        .sv-card-appointment { grid-column: span 3; grid-row: span 2; }
        .sv-card-prescription{ grid-column: span 2; grid-row: span 2; }
        .sv-card-support     { grid-column: span 5; grid-row: span 2; }
        .sv-card-specialists { grid-column: span 4; grid-row: span 2; }
        .sv-card-secure      { grid-column: span 3; grid-row: span 1; }

        @media(max-width: 900px) {
          .sv-grid { grid-template-columns: repeat(6, 1fr); }
          .sv-card-ai          { grid-column: span 6; }
          .sv-card-video       { grid-column: span 6; }
          .sv-card-appointment { grid-column: span 3; }
          .sv-card-prescription{ grid-column: span 3; }
          .sv-card-support     { grid-column: span 6; }
          .sv-card-specialists { grid-column: span 6; }
          .sv-card-secure      { grid-column: span 6; }
        }
        @media(max-width: 520px) {
          .sv-grid { grid-template-columns: 1fr; }
          .sv-card-ai,.sv-card-video,.sv-card-appointment,
          .sv-card-prescription,.sv-card-support,
          .sv-card-specialists,.sv-card-secure { grid-column: span 1; }
        }

        /* Card glow on hover */
        .sv-card::before {
          content:''; position:absolute; inset:0; border-radius:24px;
          opacity:0; transition:opacity 0.4s;
          pointer-events:none;
        }
        .sv-card:hover::before { opacity:1; }

        /* Noise texture overlay */
        .sv-card::after {
          content:''; position:absolute; inset:0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          border-radius:24px; pointer-events:none; opacity:0.4;
        }

        .sv-tag {
          display: inline-flex; align-items: center;
          padding: 4px 11px; border-radius: 20px;
          font-size: 10px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .sv-icon { font-size: 36px; margin-bottom: 12px; line-height: 1; }
        .sv-card-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 22px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 10px; line-height: 1.2;
        }
        .sv-card-desc { font-size: 14px; color: #475569; line-height: 1.65; }

        /* Stats row (AI card) */
        .sv-stats { display: flex; gap: 20px; margin-top: 22px; flex-wrap: wrap; }
        .sv-stat-box {
          padding: 12px 18px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center; min-width: 72px;
        }
        .sv-stat-val { font-family: 'Clash Display', sans-serif; font-size: 24px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .sv-stat-lbl { font-size: 10px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }

        .sv-cta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 20px; padding: 10px 20px; border-radius: 12px;
          border: none; font-size: 13px; font-weight: 800;
          cursor: pointer; font-family: inherit;
          transition: all 0.25s; letter-spacing: 0.3px;
        }
        .sv-cta-btn:hover { transform: translateX(4px); }

        /* Decorative floating elements */
        .sv-deco {
          position: absolute; border-radius: 50%;
          pointer-events: none; filter: blur(40px);
        }

        /* Chat bubbles visual */
        .sv-chat-bubbles { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
        .sv-bubble {
          padding: 8px 14px; border-radius: 14px;
          font-size: 12px; font-weight: 500; max-width: 80%;
          animation: bubbleIn 0.4s ease both;
        }
        @keyframes bubbleIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        .sv-bubble.left { align-self: flex-start; }
        .sv-bubble.right { align-self: flex-end; }

        /* Doctor avatars */
        .sv-doc-avatars { display: flex; margin-top: 16px; }
        .sv-doc-av {
          width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif; font-size: 15px; font-weight: 700;
          border: 2px solid #050d1a; margin-left: -10px; first-child:margin-left:0;
          flex-shrink: 0;
        }
        .sv-doc-av:first-child { margin-left: 0; }
        .sv-doc-more {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.06); border: 2px solid #050d1a;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #475569; margin-left: -10px;
          flex-shrink: 0;
        }

        /* Lock icon animation */
        .sv-lock-anim { font-size: 48px; text-align: center; animation: lockBounce 3s ease-in-out infinite; }
        @keyframes lockBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }

        @keyframes ringOut {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ── BOTTOM CTA STRIP ── */
        .sv-bottom {
          margin: 0 20px 60px; max-width: 1120px; margin-left: auto; margin-right: auto;
          border-radius: 28px; padding: 56px 48px;
          background: linear-gradient(135deg, rgba(0,212,255,0.07), rgba(167,139,250,0.07), rgba(245,158,11,0.05));
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 24px;
        }
        .sv-bottom-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(26px, 3vw, 40px); font-weight: 700; color: #f1f5f9;
          margin-bottom: 8px;
        }
        .sv-bottom-sub { font-size: 15px; color: #475569; }
        .sv-bottom-btn {
          padding: 15px 36px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: inherit; white-space: nowrap;
          box-shadow: 0 8px 30px rgba(0,212,255,0.3);
          transition: all 0.3s;
        }
        .sv-bottom-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 40px rgba(0,212,255,0.45); }
      `}</style>

      <div className="sv-page">
        {/* Hero */}
        <div className="sv-hero">
          <div className="sv-hero-mesh" />
          <div className="sv-hero-grid" />
          <div className="sv-badge"><div className="sv-badge-dot" /> Our Services</div>
          <h1 className="sv-hero-h1">
            Everything You Need<br />
            <span className="sv-grad">For Better Health</span>
          </h1>
          <p className="sv-hero-sub">
            From AI-powered diagnosis to real doctor consultations — all your healthcare needs in one platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="sv-grid">

          {/* AI — LARGE */}
          <div
            className={`sv-card sv-card-ai ${visible["ai"] ? "visible" : ""}`}
            ref={r => cardRefs.current["ai"] = r}
            data-id="ai"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(2,132,199,0.04))",
              border: hoveredId === "ai" ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(0,212,255,0.1)",
              transition: "all 0.35s",
            }}
            onMouseEnter={() => setHoveredId("ai")}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate("/chatbot")}
          >
            <div className="sv-deco" style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent)", top: -80, right: -80 }} />
            <div className="sv-tag" style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.15)" }}>✨ Powered by ML</div>
            <div className="sv-icon">🤖</div>
            <div className="sv-card-title">AI Symptom<br />Checker</div>
            <div className="sv-card-desc" style={{ maxWidth: 360 }}>
              Describe your symptoms in plain language. Our machine learning model — trained on 41 diseases and 131 symptoms — gives you an instant, accurate diagnosis with Groq AI fallback.
            </div>
            <div className="sv-stats">
              {[{ val: "41", label: "Diseases" }, { val: "131", label: "Symptoms" }, { val: "99%", label: "Accuracy" }].map(s => (
                <div key={s.label} className="sv-stat-box">
                  <div className="sv-stat-val" style={{ color: "#00d4ff" }}>{s.val}</div>
                  <div className="sv-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
            <button className="sv-cta-btn" style={{ background: "linear-gradient(135deg,#00d4ff,#0284c7)", color: "white" }}>
              Try AI Diagnosis →
            </button>
            <div style={{ position: "absolute", bottom: 24, right: 24, opacity: 0.12 }}>
              <BrainVisual color="#00d4ff" />
            </div>
          </div>

          {/* VIDEO */}
          <div
            className={`sv-card sv-card-video ${visible["video"] ? "visible" : ""}`}
            ref={r => cardRefs.current["video"] = r}
            data-id="video"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(124,58,237,0.04))",
              border: hoveredId === "video" ? "1px solid rgba(167,139,250,0.35)" : "1px solid rgba(167,139,250,0.1)",
              transitionDelay: "0.05s",
            }}
            onMouseEnter={() => setHoveredId("video")}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate("/doctors")}
          >
            <div className="sv-deco" style={{ width: 200, height: 200, background: "radial-gradient(circle, rgba(167,139,250,0.15), transparent)", top: -50, right: -50 }} />
            <div className="sv-tag" style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.15)" }}>🎥 WebRTC</div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div className="sv-card-title">Video<br />Consultation</div>
                <div className="sv-card-desc">HD video calls with verified doctors. No commuting, no waiting rooms — just care.</div>
              </div>
              <PulseRing color="#a78bfa" />
            </div>
            <button className="sv-cta-btn" style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.2)" }}>
              Book a Call →
            </button>
          </div>

          {/* APPOINTMENT */}
          <div
            className={`sv-card sv-card-appointment ${visible["appointment"] ? "visible" : ""}`}
            ref={r => cardRefs.current["appointment"] = r}
            data-id="appointment"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(217,119,6,0.03))",
              border: hoveredId === "appointment" ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(245,158,11,0.1)",
              transitionDelay: "0.1s",
            }}
            onMouseEnter={() => setHoveredId("appointment")}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate("/doctors")}
          >
            <div className="sv-deco" style={{ width: 150, height: 150, background: "radial-gradient(circle, rgba(245,158,11,0.18), transparent)", bottom: -40, right: -40 }} />
            <div className="sv-tag" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.15)" }}>⚡ Instant</div>
            <div className="sv-icon">📅</div>
            <div className="sv-card-title">Smart Booking</div>
            <div className="sv-card-desc">Pick a specialist, choose a slot, pay with Stripe — done in 2 minutes.</div>
            <button className="sv-cta-btn" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
              Book →
            </button>
          </div>

          {/* PRESCRIPTION */}
          <div
            className={`sv-card sv-card-prescription ${visible["prescription"] ? "visible" : ""}`}
            ref={r => cardRefs.current["prescription"] = r}
            data-id="prescription"
            style={{
              background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(22,163,74,0.03))",
              border: hoveredId === "prescription" ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(34,197,94,0.1)",
              transitionDelay: "0.15s",
            }}
            onMouseEnter={() => setHoveredId("prescription")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="sv-tag" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.15)" }}>📄 PDF</div>
            <div className="sv-icon">📋</div>
            <div className="sv-card-title">Digital Rx</div>
            <div className="sv-card-desc" style={{ fontSize: 13 }}>Download your prescription as a professional PDF — anytime.</div>
          </div>

          {/* SUPPORT */}
          <div
            className={`sv-card sv-card-support ${visible["support"] ? "visible" : ""}`}
            ref={r => cardRefs.current["support"] = r}
            data-id="support"
            style={{
              background: "linear-gradient(135deg, rgba(244,114,182,0.06), rgba(219,39,119,0.03))",
              border: hoveredId === "support" ? "1px solid rgba(244,114,182,0.35)" : "1px solid rgba(244,114,182,0.1)",
              transitionDelay: "0.2s",
            }}
            onMouseEnter={() => setHoveredId("support")}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate("/chatbot")}
          >
            <div className="sv-deco" style={{ width: 180, height: 180, background: "radial-gradient(circle, rgba(244,114,182,0.15), transparent)", top: -40, left: -40 }} />
            <div className="sv-tag" style={{ background: "rgba(244,114,182,0.1)", color: "#f472b6", border: "1px solid rgba(244,114,182,0.15)" }}>🕐 24/7</div>
            <div className="sv-card-title">Always-On<br />AI Support</div>
            <div className="sv-chat-bubbles">
              {[
                { text: "I have a headache and fever...", side: "left", color: "rgba(244,114,182,0.12)", delay: "0s" },
                { text: "It might be viral fever. Let me analyze...", side: "right", color: "rgba(255,255,255,0.06)", delay: "0.3s" },
                { text: "Recommend seeing a doctor 🩺", side: "right", color: "rgba(255,255,255,0.06)", delay: "0.6s" },
              ].map((b, i) => (
                <div key={i} className={`sv-bubble ${b.side}`} style={{ background: b.color, color: b.side === "left" ? "#f472b6" : "#94a3b8", animationDelay: b.delay }}>
                  {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* SPECIALISTS */}
          <div
            className={`sv-card sv-card-specialists ${visible["specialists"] ? "visible" : ""}`}
            ref={r => cardRefs.current["specialists"] = r}
            data-id="specialists"
            style={{
              background: "linear-gradient(135deg, rgba(251,146,60,0.06), rgba(234,88,12,0.03))",
              border: hoveredId === "specialists" ? "1px solid rgba(251,146,60,0.35)" : "1px solid rgba(251,146,60,0.1)",
              transitionDelay: "0.25s",
            }}
            onMouseEnter={() => setHoveredId("specialists")}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate("/doctors")}
          >
            <div className="sv-tag" style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.15)" }}>🩺 10+ Specialties</div>
            <div className="sv-card-title">Expert<br />Specialists</div>
            <div className="sv-card-desc" style={{ marginBottom: 0 }}>Board-certified doctors across all major specialties.</div>
            <div className="sv-doc-avatars">
              {[
                { letter: "C", bg: "#00d4ff20", color: "#00d4ff" },
                { letter: "N", bg: "#a78bfa20", color: "#a78bfa" },
                { letter: "D", bg: "#f59e0b20", color: "#f59e0b" },
                { letter: "O", bg: "#22c55e20", color: "#22c55e" },
              ].map((a, i) => (
                <div key={i} className="sv-doc-av" style={{ background: a.bg, color: a.color }}>{a.letter}</div>
              ))}
              <div className="sv-doc-more">+8</div>
            </div>
            <button className="sv-cta-btn" style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>
              Browse Doctors →
            </button>
          </div>

          {/* SECURE */}
          <div
            className={`sv-card sv-card-secure ${visible["secure"] ? "visible" : ""}`}
            ref={r => cardRefs.current["secure"] = r}
            data-id="secure"
            style={{
              background: "linear-gradient(135deg, rgba(52,211,153,0.06), rgba(5,150,105,0.03))",
              border: hoveredId === "secure" ? "1px solid rgba(52,211,153,0.35)" : "1px solid rgba(52,211,153,0.1)",
              display: "flex", flexDirection: "row", alignItems: "center", gap: 16,
              transitionDelay: "0.3s",
            }}
            onMouseEnter={() => setHoveredId("secure")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="sv-lock-anim">🔒</div>
            <div>
              <div style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: 16, color: "#f1f5f9", marginBottom: 4 }}>End-to-End Encrypted</div>
              <div style={{ fontSize: 12, color: "#475569" }}>Your health data is always private & secure.</div>
            </div>
            <div className="sv-tag" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.15)", marginBottom: 0, marginLeft: "auto", flexShrink: 0 }}>HIPAA ✓</div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="sv-bottom">
          <div>
            <div className="sv-bottom-title">Ready to get started?</div>
            <div className="sv-bottom-sub">Join thousands of patients already using MediCarePlus.</div>
          </div>
          <button className="sv-bottom-btn" onClick={() => navigate("/register")}>
            Get Started Free →
          </button>
        </div>

      </div>
    </>
  );
}