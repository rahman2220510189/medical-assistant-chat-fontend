import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STEPS = [
  { num: "01", title: "Describe Symptoms", desc: "Tell our AI chatbot your symptoms in plain language. No medical jargon needed.", icon: "💬", color: "#f59e0b" },
  { num: "02", title: "Get AI Diagnosis", desc: "Our ML model analyzes your symptoms and suggests possible conditions instantly.", icon: "🤖", color: "#00d4ff" },
  { num: "03", title: "Book a Doctor", desc: "Browse verified specialists and book an appointment at your convenience.", icon: "📅", color: "#a78bfa" },
  { num: "04", title: "Video Consultation", desc: "Meet your doctor face-to-face via secure video call from your home.", icon: "🎥", color: "#22c55e" },
  { num: "05", title: "Get Prescription", desc: "Receive your digital prescription and download it as a PDF anytime.", icon: "📋", color: "#f472b6" },
];

const TESTIMONIALS = [
  { name: "Rahim Uddin", role: "Patient", text: "Got diagnosed within minutes and booked a doctor the same day. Incredible experience!", avatar: "R", color: "#00d4ff" },
  { name: "Fatema Begum", role: "Patient", text: "The video call was crystal clear. The doctor was professional and the prescription PDF was perfect.", avatar: "F", color: "#a78bfa" },
  { name: "Karim Hassan", role: "Patient", text: "I was skeptical at first but the AI was shockingly accurate. Highly recommend!", avatar: "K", color: "#22c55e" },
  { name: "Nusrat Jahan", role: "Patient", text: "Best telemedicine platform I've used. Easy to navigate and doctors are amazing.", avatar: "N", color: "#f59e0b" },
];

export default function About() {
  const navigate = useNavigate();
  const [doctors, setDoctors]   = useState([]);
  const [stats, setStats]       = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [counts, setCounts]     = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [activeTest, setActiveTest] = useState(0);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/doctors?limit=4`)
      .then(res => setDoctors(res.data.doctors?.slice(0, 4) || []))
      .catch(() => {});

    axios.get(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access-token")}` }
    })
    .then(res => {
      const s = res.data.stats;
      setStats({ doctors: s.totalDoctors || 12, patients: s.totalPatients || 248, appointments: s.totalAppointments || 520 });
    })
    .catch(() => {
      setStats({ doctors: 12, patients: 248, appointments: 520 });
    });
  }, []);

  // Counter animation
  useEffect(() => {
    if (!statsVisible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        doctors:      Math.round(stats.doctors * ease),
        patients:     Math.round(stats.patients * ease),
        appointments: Math.round(stats.appointments * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible, stats]);

  // Intersection observer for stats
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTest(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');

        .ab-page {
          min-height: 100vh;
          background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .ab-hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 80px 24px 60px;
          position: relative;
          overflow: hidden;
        }

        .ab-hero-bg {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
        }
        .ab-blob {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.15;
        }
        .ab-blob-1 { width: 600px; height: 600px; background: radial-gradient(circle, #00d4ff, transparent); top: -200px; left: -200px; animation: blobFloat1 12s ease-in-out infinite alternate; }
        .ab-blob-2 { width: 500px; height: 500px; background: radial-gradient(circle, #a78bfa, transparent); bottom: -100px; right: -100px; animation: blobFloat2 15s ease-in-out infinite alternate; }
        .ab-blob-3 { width: 400px; height: 400px; background: radial-gradient(circle, #f59e0b, transparent); top: 40%; left: 30%; animation: blobFloat3 10s ease-in-out infinite alternate; }
        @keyframes blobFloat1 { from{transform:translate(0,0) scale(1)} to{transform:translate(80px,60px) scale(1.1)} }
        @keyframes blobFloat2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-60px,-80px) scale(1.15)} }
        @keyframes blobFloat3 { from{transform:translate(0,0) scale(1)} to{transform:translate(40px,-40px) scale(0.9)} }

        .ab-grid-lines {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .ab-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 18px; border-radius: 30px;
          background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(167,139,250,0.1));
          border: 1px solid rgba(0,212,255,0.2);
          font-size: 12px; font-weight: 700; color: #00d4ff;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 28px; position: relative; z-index: 1;
          animation: fadeUp 0.8s ease both;
        }
        .ab-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #00d4ff; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .ab-hero-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(42px, 7vw, 82px);
          font-weight: 700; line-height: 1.05;
          margin-bottom: 24px;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .ab-grad-text {
          background: linear-gradient(135deg, #00d4ff 0%, #a78bfa 40%, #f59e0b 80%, #f472b6 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          background-size: 200% 200%; animation: gradShift 4s ease infinite;
        }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        .ab-hero-sub {
          font-size: clamp(15px, 2vw, 19px); color: #64748b;
          max-width: 600px; line-height: 1.7;
          margin: 0 auto 40px; position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.2s ease both;
        }

        .ab-hero-btns {
          display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
          position: relative; z-index: 1;
          animation: fadeUp 0.8s 0.3s ease both;
        }
        .ab-btn-primary {
          padding: 14px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.3s;
          box-shadow: 0 6px 30px rgba(0,212,255,0.35);
        }
        .ab-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,212,255,0.5); }
        .ab-btn-secondary {
          padding: 14px 32px; border-radius: 14px;
          border: 1.5px solid rgba(167,139,250,0.3);
          background: rgba(167,139,250,0.06);
          color: #a78bfa; font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.3s;
        }
        .ab-btn-secondary:hover { background: rgba(167,139,250,0.12); transform: translateY(-2px); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        /* ── STATS ── */
        .ab-stats-section {
          padding: 80px 24px;
          background: linear-gradient(135deg, rgba(0,212,255,0.03), rgba(167,139,250,0.03));
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ab-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; max-width: 900px; margin: 0 auto; }
        .ab-stat-item {
          text-align: center; padding: 40px 20px;
          position: relative;
        }
        .ab-stat-item:not(:last-child)::after {
          content: ''; position: absolute; right: 0; top: 20%; height: 60%;
          width: 1px; background: rgba(255,255,255,0.06);
        }
        .ab-stat-num {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(48px, 6vw, 72px); font-weight: 700; line-height: 1;
          margin-bottom: 8px;
        }
        .ab-stat-label { font-size: 13px; color: #475569; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .ab-stat-icon { font-size: 28px; margin-bottom: 12px; }

        /* ── SECTION COMMON ── */
        .ab-section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
        .ab-section-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;
          padding: 5px 14px; border-radius: 20px; margin-bottom: 16px;
        }
        .ab-section-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(32px, 4vw, 52px); font-weight: 700; line-height: 1.1;
          margin-bottom: 16px; color: #f1f5f9;
        }
        .ab-section-sub { font-size: 16px; color: #475569; line-height: 1.7; max-width: 560px; }

        /* ── HOW IT WORKS ── */
        .ab-steps { display: flex; flex-direction: column; gap: 0; margin-top: 60px; position: relative; }
        .ab-steps::before {
          content: ''; position: absolute; left: 32px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, #00d4ff, #a78bfa, #f59e0b, #22c55e, #f472b6);
          opacity: 0.3;
        }
        .ab-step {
          display: flex; align-items: flex-start; gap: 24px;
          padding: 28px 28px 28px 0; position: relative;
          transition: transform 0.3s;
        }
        .ab-step:hover { transform: translateX(8px); }
        .ab-step-num {
          width: 64px; height: 64px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; flex-shrink: 0; position: relative; z-index: 1;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ab-step-content { flex: 1; padding-top: 8px; }
        .ab-step-num-label {
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .ab-step-title { font-family: 'Clash Display', sans-serif; font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .ab-step-desc { font-size: 14px; color: #475569; line-height: 1.6; }

        /* ── DOCTORS ── */
        .ab-doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-top: 50px; }
        .ab-doctor-card {
          border-radius: 20px; overflow: hidden;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s; cursor: pointer;
        }
        .ab-doctor-card:hover { transform: translateY(-6px); border-color: rgba(0,212,255,0.2); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .ab-doctor-photo-wrap { height: 200px; overflow: hidden; position: relative; }
        .ab-doctor-photo { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .ab-doctor-card:hover .ab-doctor-photo { transform: scale(1.05); }
        .ab-doctor-ph {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(167,139,250,0.1));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif; font-size: 52px; font-weight: 700; color: #00d4ff;
        }
        .ab-doctor-info { padding: 16px 18px 18px; }
        .ab-doctor-name { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .ab-doctor-spec {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(0,212,255,0.08); border: 1px solid rgba(0,212,255,0.12);
          color: #00d4ff; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px; margin-bottom: 10px;
        }
        .ab-doctor-meta { display: flex; gap: 10px; flex-wrap: wrap; }
        .ab-doctor-meta span { font-size: 12px; color: #475569; }

        /* ── TESTIMONIALS ── */
        .ab-test-section { padding: 100px 24px; background: linear-gradient(135deg, rgba(167,139,250,0.03), rgba(0,212,255,0.03)); border-top: 1px solid rgba(255,255,255,0.04); }
        .ab-test-inner { max-width: 800px; margin: 0 auto; text-align: center; }
        .ab-test-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px; padding: 40px;
          margin: 40px 0 30px;
          transition: all 0.5s; position: relative; overflow: hidden;
        }
        .ab-test-card::before {
          content: '"'; position: absolute; top: -10px; left: 20px;
          font-size: 120px; font-family: 'Clash Display', sans-serif;
          color: rgba(0,212,255,0.06); line-height: 1; pointer-events: none;
        }
        .ab-test-text { font-size: 18px; line-height: 1.7; color: #94a3b8; font-style: italic; margin-bottom: 24px; position: relative; z-index: 1; }
        .ab-test-author { display: flex; align-items: center; justify-content: center; gap: 12px; }
        .ab-test-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: white;
        }
        .ab-test-name { font-weight: 700; color: #f1f5f9; font-size: 15px; }
        .ab-test-role { font-size: 12px; color: #475569; }
        .ab-test-dots { display: flex; gap: 8px; justify-content: center; }
        .ab-test-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.1); cursor: pointer; transition: all 0.3s; }
        .ab-test-dot.active { background: #00d4ff; width: 24px; border-radius: 4px; }

        /* ── CTA ── */
        .ab-cta-section {
          padding: 100px 24px; text-align: center;
          background: linear-gradient(135deg, rgba(0,212,255,0.05), rgba(167,139,250,0.05), rgba(245,158,11,0.05));
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .ab-cta-title { font-family: 'Clash Display', sans-serif; font-size: clamp(32px, 5vw, 56px); font-weight: 700; color: #f1f5f9; margin-bottom: 16px; }
        .ab-cta-sub { font-size: 16px; color: #475569; margin-bottom: 36px; }

        @media(max-width: 640px) {
          .ab-stats-grid { grid-template-columns: 1fr; }
          .ab-stat-item::after { display: none; }
          .ab-steps::before { left: 24px; }
          .ab-step-num { width: 48px; height: 48px; font-size: 20px; }
        }
      `}</style>

      <div className="ab-page">

        {/* ── HERO ── */}
        <section className="ab-hero">
          <div className="ab-hero-bg">
            <div className="ab-blob ab-blob-1" />
            <div className="ab-blob ab-blob-2" />
            <div className="ab-blob ab-blob-3" />
            <div className="ab-grid-lines" />
          </div>

          <div className="ab-hero-badge">
            <div className="ab-badge-dot" />
            AI-Powered Healthcare Platform
          </div>

          <h1 className="ab-hero-title">
            Healthcare That<br />
            <span className="ab-grad-text">Comes To You</span>
          </h1>

          <p className="ab-hero-sub">
            MediCarePlus combines cutting-edge AI with experienced doctors to deliver fast, accurate, and affordable healthcare — from your phone or laptop.
          </p>

          <div className="ab-hero-btns">
            <button className="ab-btn-primary" onClick={() => navigate("/chatbot")}>
              Try AI Diagnosis Free →
            </button>
            <button className="ab-btn-secondary" onClick={() => navigate("/doctors")}>
              Meet Our Doctors
            </button>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="ab-stats-section" ref={statsRef}>
          <div className="ab-stats-grid">
            {[
              { icon: "🩺", num: counts.doctors, suffix: "+", label: "Expert Doctors", color: "#00d4ff" },
              { icon: "👥", num: counts.patients, suffix: "+", label: "Happy Patients", color: "#a78bfa" },
              { icon: "📅", num: counts.appointments, suffix: "+", label: "Appointments Done", color: "#f59e0b" },
            ].map(({ icon, num, suffix, label, color }) => (
              <div key={label} className="ab-stat-item">
                <div className="ab-stat-icon">{icon}</div>
                <div className="ab-stat-num" style={{ color }}>{num}{suffix}</div>
                <div className="ab-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <div className="ab-section">
          <div className="ab-section-tag" style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff" }}>
            ⚡ How It Works
          </div>
          <h2 className="ab-section-title">From Symptoms to<br />Prescription in Minutes</h2>
          <p className="ab-section-sub">No waiting rooms. No commuting. Just fast, expert care when you need it most.</p>

          <div className="ab-steps">
            {STEPS.map((step, i) => (
              <div key={i} className="ab-step">
                <div className="ab-step-num" style={{ background: `${step.color}15`, borderColor: `${step.color}25` }}>
                  {step.icon}
                </div>
                <div className="ab-step-content">
                  <div className="ab-step-num-label" style={{ color: step.color }}>Step {step.num}</div>
                  <div className="ab-step-title">{step.title}</div>
                  <div className="ab-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DOCTORS ── */}
        <div style={{ background: "rgba(255,255,255,0.01)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="ab-section">
            <div className="ab-section-tag" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.15)", color: "#a78bfa" }}>
              👨‍⚕️ Our Team
            </div>
            <h2 className="ab-section-title">Meet Our Expert<br />Doctors</h2>
            <p className="ab-section-sub">Board-certified specialists ready to help you with compassionate, evidence-based care.</p>

            <div className="ab-doctors-grid">
              {doctors.length > 0 ? doctors.map(doc => (
                <div key={doc._id} className="ab-doctor-card" onClick={() => navigate("/doctors")}>
                  <div className="ab-doctor-photo-wrap">
                    {doc.photo
                      ? <img src={doc.photo} alt={doc.name} className="ab-doctor-photo" />
                      : <div className="ab-doctor-ph">{doc.name?.[0]?.toUpperCase()}</div>
                    }
                  </div>
                  <div className="ab-doctor-info">
                    <div className="ab-doctor-name">Dr. {doc.name}</div>
                    <div className="ab-doctor-spec">⚕ {doc.specialist}</div>
                    <div className="ab-doctor-meta">
                      <span>⏳ {doc.experience}y exp</span>
                      <span>⭐ {doc.rating}</span>
                      <span>৳ {doc.consultationFee}</span>
                    </div>
                  </div>
                </div>
              )) : [1,2,3,4].map(i => (
                <div key={i} className="ab-doctor-card">
                  <div style={{ height: 200, background: "rgba(255,255,255,0.03)", animation: "fadeUp 1s ease infinite alternate" }} />
                  <div style={{ padding: 16 }}>
                    <div style={{ height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 8 }} />
                    <div style={{ height: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button className="ab-btn-secondary" onClick={() => navigate("/doctors")}>
                View All Doctors →
              </button>
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <section className="ab-test-section">
          <div className="ab-test-inner">
            <div className="ab-section-tag" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", color: "#f59e0b", margin: "0 auto 16px" }}>
              ❤️ Patient Stories
            </div>
            <h2 className="ab-section-title">What Our Patients Say</h2>

            <div className="ab-test-card">
              <p className="ab-test-text">"{TESTIMONIALS[activeTest].text}"</p>
              <div className="ab-test-author">
                <div className="ab-test-avatar" style={{ background: `${TESTIMONIALS[activeTest].color}20`, color: TESTIMONIALS[activeTest].color }}>
                  {TESTIMONIALS[activeTest].avatar}
                </div>
                <div>
                  <div className="ab-test-name">{TESTIMONIALS[activeTest].name}</div>
                  <div className="ab-test-role">{TESTIMONIALS[activeTest].role}</div>
                </div>
              </div>
            </div>

            <div className="ab-test-dots">
              {TESTIMONIALS.map((_, i) => (
                <div key={i} className={`ab-test-dot ${i === activeTest ? "active" : ""}`} onClick={() => setActiveTest(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ab-cta-section">
          <h2 className="ab-cta-title">
            Ready to Take Control<br />of Your <span className="ab-grad-text">Health?</span>
          </h2>
          <p className="ab-cta-sub">Join thousands of patients who trust MediCarePlus for their healthcare needs.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="ab-btn-primary" onClick={() => navigate("/register")}>
              Get Started Free →
            </button>
            <button className="ab-btn-secondary" onClick={() => navigate("/chatbot")}>
              Try AI Chatbot
            </button>
          </div>
        </section>

      </div>
    </>
  );
}