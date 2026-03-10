import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FiSend, FiUser, FiMail, FiMessageSquare, FiMapPin, FiPhone, FiClock } from "react-icons/fi";
import { RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const INFO = [
  { icon: <FiMapPin />, label: "Address", value: "Dhanmondi, Dhaka-1205, Bangladesh", color: "#00d4ff" },
  { icon: <FiPhone />, label: "Phone", value: "+880 1700-000000", color: "#a78bfa" },
  { icon: <FiMail />, label: "Email", value: "support@medicareplus.com", color: "#f59e0b" },
  { icon: <FiClock />, label: "Hours", value: "Sat – Thu, 9AM – 9PM", color: "#22c55e" },
];

export default function Contact() {
  const [form, setForm]     = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState(null);
  const [focused, setFocused] = useState(null);
  const canvasRef = useRef(null);

  // Particle animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.opacity})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async () => {
    const { name, email, message } = form;
    if (!name.trim() || !email.trim() || !message.trim()) {
      return showToast("Please fill in all required fields.", "error");
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return showToast("Please enter a valid email address.", "error");
    }
    setLoading(true);
    try {
      await axios.post(`${API}/api/contact`, form);
      showToast("Message sent! We'll get back to you soon. ✅");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      showToast("Failed to send. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
    onFocus: () => setFocused(field),
    onBlur:  () => setFocused(null),
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ct-page {
          min-height: 100vh; background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif; color: #e2e8f0;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .ct-hero {
          position: relative; padding: 100px 24px 80px;
          text-align: center; overflow: hidden;
        }
        .ct-canvas {
          position: absolute; inset: 0; width: 100%; height: 100%;
          pointer-events: none;
        }
        .ct-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%);
        }
        .ct-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 18px; border-radius: 30px;
          background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(167,139,250,0.08));
          border: 1px solid rgba(0,212,255,0.15);
          font-size: 11px; font-weight: 800; color: #00d4ff;
          text-transform: uppercase; letter-spacing: 1.5px;
          margin-bottom: 24px; position: relative; z-index: 1;
          animation: fadeUp 0.7s ease both;
        }
        .ct-tag-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d4ff; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.7);opacity:0.5} }

        .ct-hero-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(40px, 6vw, 72px); font-weight: 700;
          line-height: 1.05; margin-bottom: 18px;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.1s ease both;
        }
        .ct-grad {
          background: linear-gradient(135deg, #00d4ff, #a78bfa, #f59e0b);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200%; animation: gradShift 4s ease infinite;
        }
        @keyframes gradShift { 0%,100%{background-position:0%} 50%{background-position:100%} }
        .ct-hero-sub {
          font-size: 16px; color: #475569; max-width: 500px;
          margin: 0 auto; line-height: 1.7;
          position: relative; z-index: 1;
          animation: fadeUp 0.7s 0.2s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

        /* ── MAIN CONTENT ── */
        .ct-content {
          max-width: 1100px; margin: 0 auto;
          padding: 0 24px 100px;
          display: grid; grid-template-columns: 1fr 1.4fr; gap: 28px;
          animation: fadeUp 0.8s 0.3s ease both;
        }
        @media(max-width: 768px) { .ct-content { grid-template-columns: 1fr; } }

        /* ── INFO SIDE ── */
        .ct-info-col { display: flex; flex-direction: column; gap: 14px; }

        .ct-info-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 22px;
          transition: all 0.3s;
        }
        .ct-info-card:hover { border-color: rgba(0,212,255,0.12); transform: translateY(-2px); }

        .ct-info-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .ct-info-item:last-child { border-bottom: none; padding-bottom: 0; }
        .ct-info-icon {
          width: 40px; height: 40px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .ct-info-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #334155; margin-bottom: 3px; }
        .ct-info-val { font-size: 14px; color: #94a3b8; font-weight: 500; }

        /* Map */
        .ct-map-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden;
          flex: 1; min-height: 200px;
        }
        .ct-map-placeholder {
          width: 100%; height: 100%; min-height: 200px;
          background: linear-gradient(135deg, #0a1628, #0f1e35);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px; color: #334155; position: relative;
        }
        .ct-map-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .ct-map-pin {
          position: relative; z-index: 1;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(0,212,255,0.1); border: 2px solid rgba(0,212,255,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #00d4ff; font-size: 18px;
          animation: pinBounce 2s ease-in-out infinite;
        }
        @keyframes pinBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .ct-map-rings {
          position: absolute; z-index: 0;
          width: 80px; height: 80px; border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.15);
          animation: ringExpand 2s ease-out infinite;
        }
        .ct-map-rings-2 { animation-delay: 1s; }
        @keyframes ringExpand { 0%{transform:scale(0.5);opacity:0.6} 100%{transform:scale(2);opacity:0} }
        .ct-map-label { position: relative; z-index: 1; font-size: 13px; font-weight: 600; color: #475569; }

        /* ── FORM ── */
        .ct-form-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px; padding: 32px;
        }
        .ct-form-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 22px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 6px; display: flex; align-items: center; gap: 10px;
        }
        .ct-form-title svg { color: #00d4ff; }
        .ct-form-sub { font-size: 13px; color: #475569; margin-bottom: 28px; }

        .ct-field { margin-bottom: 16px; }
        .ct-label {
          display: block; font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-bottom: 8px;
        }
        .ct-required { color: #f87171; margin-left: 3px; }

        .ct-input-wrap { position: relative; }
        .ct-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #334155; font-size: 15px; pointer-events: none; transition: color 0.2s;
        }
        .ct-input-icon.ta { top: 16px; transform: none; }
        .ct-input-icon.focused { color: #00d4ff; }

        .ct-input {
          width: 100%; padding: 12px 14px 12px 42px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 13px; color: #e2e8f0;
          font-size: 14px; font-family: inherit; outline: none;
          transition: all 0.25s;
        }
        .ct-input::placeholder { color: #334155; }
        .ct-input:focus {
          border-color: rgba(0,212,255,0.35);
          background: rgba(0,212,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.06);
        }
        .ct-textarea {
          width: 100%; padding: 12px 14px 12px 42px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 13px; color: #e2e8f0;
          font-size: 14px; font-family: inherit; outline: none;
          min-height: 140px; resize: vertical;
          transition: all 0.25s; line-height: 1.6;
        }
        .ct-textarea::placeholder { color: #334155; }
        .ct-textarea:focus {
          border-color: rgba(0,212,255,0.35);
          background: rgba(0,212,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.06);
        }

        .ct-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width: 500px) { .ct-row { grid-template-columns: 1fr; } }

        .ct-submit {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 15px; font-weight: 800;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all 0.3s; margin-top: 6px;
          box-shadow: 0 6px 24px rgba(0,212,255,0.25);
          letter-spacing: 0.3px;
        }
        .ct-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,212,255,0.4); }
        .ct-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .ct-submit-spin {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* ── TOAST ── */
        .ct-toast {
          position: fixed; top: 24px; right: 24px; z-index: 9999;
          padding: 13px 20px; border-radius: 14px;
          font-size: 13px; font-weight: 700;
          display: flex; align-items: center; gap: 9px;
          font-family: 'Cabinet Grotesk', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideIn 0.4s ease;
          max-width: 340px;
        }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {toast && (
        <div className="ct-toast" style={{
          background: toast.type === "success" ? "rgba(34,197,94,0.1)"  : "rgba(248,113,113,0.1)",
          border:     `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
          color:      toast.type === "success" ? "#22c55e" : "#f87171",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <div className="ct-page">

        {/* Hero */}
        <div className="ct-hero">
          <canvas ref={canvasRef} className="ct-canvas" />
          <div className="ct-hero-glow" />
          <div className="ct-hero-tag">
            <div className="ct-tag-dot" />
            Get In Touch
          </div>
          <h1 className="ct-hero-title">
            We'd Love To<br /><span className="ct-grad">Hear From You</span>
          </h1>
          <p className="ct-hero-sub">
            Have a question, feedback, or need support? Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        {/* Main */}
        <div className="ct-content">

          {/* Left — Info + Map */}
          <div className="ct-info-col">
            <div className="ct-info-card">
              {INFO.map(({ icon, label, value, color }) => (
                <div key={label} className="ct-info-item">
                  <div className="ct-info-icon" style={{ background: `${color}12`, color }}>
                    {icon}
                  </div>
                  <div>
                    <div className="ct-info-label">{label}</div>
                    <div className="ct-info-val">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="ct-map-card">
              <div className="ct-map-placeholder">
                <div className="ct-map-grid" />
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="ct-map-rings" />
                  <div className="ct-map-rings ct-map-rings-2" />
                  <div className="ct-map-pin"><FiMapPin /></div>
                </div>
                <div className="ct-map-label">Dhanmondi, Dhaka</div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="ct-form-card">
            <div className="ct-form-title">
              <RiHeartPulseLine /> Send a Message
            </div>
            <p className="ct-form-sub">Fill in the form below and our team will get back to you shortly.</p>

            <div className="ct-row">
              <div className="ct-field">
                <label className="ct-label">Name <span className="ct-required">*</span></label>
                <div className="ct-input-wrap">
                  <span className={`ct-input-icon ${focused === "name" ? "focused" : ""}`}><FiUser /></span>
                  <input className="ct-input" placeholder="Your full name" {...inp("name")} />
                </div>
              </div>
              <div className="ct-field">
                <label className="ct-label">Email <span className="ct-required">*</span></label>
                <div className="ct-input-wrap">
                  <span className={`ct-input-icon ${focused === "email" ? "focused" : ""}`}><FiMail /></span>
                  <input className="ct-input" placeholder="your@email.com" type="email" {...inp("email")} />
                </div>
              </div>
            </div>

            <div className="ct-field">
              <label className="ct-label">Subject</label>
              <div className="ct-input-wrap">
                <span className={`ct-input-icon ${focused === "subject" ? "focused" : ""}`}><FiMessageSquare /></span>
                <input className="ct-input" placeholder="What's this about?" {...inp("subject")} />
              </div>
            </div>

            <div className="ct-field">
              <label className="ct-label">Message <span className="ct-required">*</span></label>
              <div className="ct-input-wrap">
                <span className={`ct-input-icon ta ${focused === "message" ? "focused" : ""}`}><FiMessageSquare /></span>
                <textarea className="ct-textarea" placeholder="Write your message here..." {...inp("message")} />
              </div>
            </div>

            <button className="ct-submit" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="ct-submit-spin" /> Sending...</>
                : <><FiSend /> Send Message</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}