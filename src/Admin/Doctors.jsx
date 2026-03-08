import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiStar, FiClock, FiDollarSign, FiFilter, FiX, FiChevronRight } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { RiStethoscopeLine, RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SPECIALISTS = [
  "All", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic",
  "Pediatrician", "Psychiatrist", "Gynecologist", "Urologist",
  "Gastroenterologist", "Pulmonologist", "Endocrinologist",
  "Ophthalmologist", "ENT", "Hepatologist", "Nephrologist",
  "Rheumatologist", "Oncologist", "General Physician",
  "Infectious Disease Specialist", "Allergist",
];

const SPECIALIST_ICONS = {
  "Cardiologist": "❤️", "Dermatologist": "✨", "Neurologist": "🧠",
  "Orthopedic": "🦴", "Pediatrician": "👶", "Psychiatrist": "🧘",
  "Gynecologist": "🌸", "Urologist": "💧", "Gastroenterologist": "🫃",
  "Pulmonologist": "🫁", "Endocrinologist": "⚗️", "Ophthalmologist": "👁️",
  "ENT": "👂", "Hepatologist": "🟤", "Nephrologist": "🫘",
  "Rheumatologist": "🦵", "Oncologist": "🎗️", "General Physician": "⚕️",
  "Infectious Disease Specialist": "🦠", "Allergist": "🌿",
};

export default function Doctors() {
  const [doctors, setDoctors]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeSpec, setActiveSpec] = useState("All");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [detailDoc, setDetailDoc]   = useState(null);
  const [flipped, setFlipped]       = useState({});
  const navigate = useNavigate();
  const pillsRef = useRef();

  const fetchDoctors = async (searchVal, specVal) => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (searchVal) params.search = searchVal;
      if (specVal && specVal !== "All") params.specialist = specVal;
      const res = await axios.get(`${API}/api/doctors`, { params });
      setDoctors(res.data.doctors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(search, activeSpec);
  }, [activeSpec]);

  useEffect(() => {
    if (search.length === 0) {
      fetchDoctors("", activeSpec);
      return;
    }
    // strip Dr. prefix before checking length
    const clean = search.trim().replace(/^Dr\.?\s*/i, '').trim();
    if (clean.length < 2 && search.length < 2) return;
    const t = setTimeout(() => fetchDoctors(search, activeSpec), 400);
    return () => clearTimeout(t);
  }, [search]);

  const toggleFlip = (id, e) => {
    e.stopPropagation();
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');

        .doctors-page {
          min-height: 100vh;
          background: #050d1a;
          color: #e2e8f0;
          font-family: 'Cabinet Grotesk', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Animated mesh background ── */
        .mesh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .mesh-bg::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%);
          top: -200px; left: -200px;
          animation: drift1 12s ease-in-out infinite alternate;
        }
        .mesh-bg::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          animation: drift2 15s ease-in-out infinite alternate;
        }
        @keyframes drift1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(80px, 60px) scale(1.2); }
        }
        @keyframes drift2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-60px, -80px) scale(1.15); }
        }

        .content-wrap { position: relative; z-index: 1; }

        /* ── Hero ── */
        .hero {
          padding: 120px 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.2);
          color: #00d4ff; font-size: 12px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 6px 16px; border-radius: 40px;
          margin-bottom: 24px;
          position: relative; z-index: 2;
        }
        .hero-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 700;
          line-height: 1.05;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #94a3b8 60%, #00d4ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative; z-index: 2;
        }
        .hero-sub {
          font-size: 16px; color: #64748b; max-width: 480px;
          margin: 0 0 40px 0;
          line-height: 1.7;
          position: relative; z-index: 2;
        }

        /* ── Search ── */
        .search-wrap {
          max-width: 560px;
          margin: 0 auto 48px;
          position: relative;
          z-index: 1;
        }
        .search-wrap input {
          width: 100%;
          padding: 18px 24px 18px 56px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          color: #e2e8f0;
          font-size: 15px;
          font-family: 'Cabinet Grotesk', sans-serif;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
          backdrop-filter: blur(12px);
        }
        .search-wrap input::placeholder { color: #475569; }
        .search-wrap input:focus {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.04);
          box-shadow: 0 0 0 4px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.3);
        }
        .search-icon {
          position: absolute; left: 20px; top: 50%;
          transform: translateY(-50%); color: #00d4ff; font-size: 18px;
        }

        /* ── Specialist Pills ── */
        .pills-scroll {
          display: flex; gap: 10px;
          overflow-x: auto; padding: 0 60px 32px;
          scrollbar-width: none;
        }
        .pills-scroll::-webkit-scrollbar { display: none; }
        .pill {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 40px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          transition: all 0.25s;
          font-family: 'Cabinet Grotesk', sans-serif;
        }
        .pill:hover {
          border-color: rgba(0,212,255,0.3);
          color: #00d4ff;
          background: rgba(0,212,255,0.05);
        }
        .pill.active {
          border-color: #00d4ff;
          background: rgba(0,212,255,0.1);
          color: #00d4ff;
          box-shadow: 0 0 20px rgba(0,212,255,0.15);
        }

        /* ── Grid ── */
        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 0 60px 80px;
        }

        /* ── Card ── */
        .doc-card-wrap {
          perspective: 1000px;
          height: 360px;
        }
        .doc-card-inner {
          position: relative;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
        }
        .doc-card-inner.flipped { transform: rotateY(180deg); }

        .doc-card-front,
        .doc-card-back {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          border-radius: 24px;
          overflow: hidden;
        }

        /* FRONT */
        .doc-card-front {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px);
          padding: 28px;
          display: flex; flex-direction: column;
          transition: border-color 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }
        .doc-card-front:hover {
          border-color: rgba(0,212,255,0.25);
          box-shadow: 0 0 40px rgba(0,212,255,0.08), 0 20px 60px rgba(0,0,0,0.4);
        }

        /* Glow dot top-right */
        .card-glow {
          position: absolute; top: 20px; right: 20px;
          width: 8px; height: 8px; border-radius: 50%;
        }
        .card-glow.online {
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2), 0 0 12px rgba(34,197,94,0.5);
          animation: pulse-green 2s ease-in-out infinite;
        }
        .card-glow.offline { background: #374151; }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34,197,94,0.2), 0 0 12px rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0.1), 0 0 20px rgba(34,197,94,0.6); }
        }

        /* Avatar */
        .doc-avatar-wrap {
          position: relative; width: 72px; height: 72px; margin-bottom: 16px;
        }
        .doc-avatar {
          width: 72px; height: 72px; border-radius: 20px;
          object-fit: cover;
          border: 2px solid rgba(0,212,255,0.2);
        }
        .doc-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          border: 2px solid rgba(0,212,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif;
          font-size: 26px; font-weight: 700; color: #00d4ff;
        }
        .verified-badge {
          position: absolute; bottom: -4px; right: -4px;
          background: #0ea5e9; border-radius: 50%;
          width: 22px; height: 22px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; border: 2px solid #050d1a;
        }

        .doc-name {
          font-family: 'Clash Display', sans-serif;
          font-size: 17px; font-weight: 600; color: #f1f5f9;
          margin-bottom: 4px;
        }
        .doc-spec-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.15);
          color: #00d4ff; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .doc-stats {
          display: flex; gap: 16px; margin-bottom: 18px;
        }
        .doc-stat {
          display: flex; flex-direction: column; gap: 2px;
        }
        .doc-stat-val {
          font-family: 'Clash Display', sans-serif;
          font-size: 16px; font-weight: 600; color: #f1f5f9;
        }
        .doc-stat-lbl { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Rating bar */
        .rating-wrap { margin-bottom: 20px; }
        .rating-bar-bg {
          height: 3px; background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }
        .rating-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #7c3aed);
          border-radius: 2px;
          transition: width 1s ease;
        }
        .rating-label {
          display: flex; justify-content: space-between;
          font-size: 11px; color: #475569; margin-bottom: 4px;
        }

        /* Card footer */
        .card-footer {
          margin-top: auto;
          display: flex; gap: 8px;
        }
        .btn-flip {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-flip:hover { border-color: rgba(255,255,255,0.2); color: #e2e8f0; }

        .btn-book {
          flex: 1; padding: 10px;
          border-radius: 12px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,212,255,0.25);
        }
        .btn-book:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0,212,255,0.4);
        }

        /* BACK */
        .doc-card-back {
          transform: rotateY(180deg);
          background: rgba(0,212,255,0.03);
          border: 1px solid rgba(0,212,255,0.15);
          backdrop-filter: blur(20px);
          padding: 24px;
          display: flex; flex-direction: column;
        }
        .back-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 13px; font-weight: 600; color: #00d4ff;
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .avail-days { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .avail-day {
          padding: 4px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.15);
          color: #00d4ff;
        }
        .avail-slots { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 16px; }
        .avail-slot {
          padding: 3px 9px; border-radius: 6px;
          font-size: 10.5px; font-weight: 500;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: #94a3b8;
        }
        .about-text {
          font-size: 12px; color: #64748b; line-height: 1.6;
          margin-bottom: 14px; flex: 1;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 3; -webkit-box-orient: vertical;
        }
        .back-footer { display: flex; gap: 8px; margin-top: auto; }
        .btn-back {
          width: 40px; height: 40px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; font-size: 14px;
        }
        .btn-back:hover { border-color: rgba(255,255,255,0.2); color: #e2e8f0; }
        .btn-book-now {
          flex: 1; padding: 10px;
          border-radius: 12px; border: none;
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.3);
        }
        .btn-book-now:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.5);
        }

        /* Skeleton */
        .skeleton-card {
          height: 360px; border-radius: 24px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden; position: relative;
        }
        .skeleton-card::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.04) 50%, transparent 75%);
          background-size: 200% 100%;
          animation: shimmer 1.8s infinite;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* Empty */
        .empty-state {
          grid-column: 1/-1;
          text-align: center; padding: 80px 20px;
        }
        .empty-icon {
          font-size: 56px; margin-bottom: 16px;
          opacity: 0.3;
        }
        .empty-text { font-size: 16px; color: #475569; }

        /* Divider line */
        .section-divider {
          display: flex; align-items: center; gap: 16px;
          padding: 0 60px 28px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .divider-text { font-size: 12px; color: #334155; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }

        @media (max-width: 768px) {
          .hero { padding: 60px 20px 32px; }
          .pills-scroll { padding: 0 20px 24px; }
          .doctors-grid { padding: 0 20px 60px; grid-template-columns: 1fr; }
          .section-divider { padding: 0 20px 20px; }
        }
      `}</style>

      <div className="doctors-page">
        <div className="mesh-bg" />

        <div className="content-wrap">

          {/* ── HERO ── */}
          <div className="hero">
            <div className="hero-eyebrow">
              <RiHeartPulseLine /> Find Your Doctor
            </div>
            <h1 className="hero-title">
              Expert Care,<br />At Your Fingertips
            </h1>
            <p className="hero-sub">
              Connect with verified specialists. Book appointments instantly and get the care you deserve.
            </p>

            {/* Search */}
            <div className="search-wrap">
              <FiSearch className="search-icon" />
              <input
                placeholder="Search by doctor name or specialty..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ── SPECIALIST PILLS ── */}
          <div className="pills-scroll" ref={pillsRef}>
            {SPECIALISTS.map(spec => (
              <button
                key={spec}
                className={`pill ${activeSpec === spec ? "active" : ""}`}
                onClick={() => setActiveSpec(spec)}
              >
                {spec !== "All" && <span>{SPECIALIST_ICONS[spec] || "⚕"}</span>}
                {spec}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="section-divider">
            <div className="divider-line" />
            <span className="divider-text">
              {loading ? "Loading..." : `${doctors.length} doctors found`}
            </span>
            <div className="divider-line" />
          </div>

          {/* ── DOCTOR GRID ── */}
          <div className="doctors-grid">
            {loading ? (
              [...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)
            ) : doctors.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">No doctors found. Try a different search.</div>
              </div>
            ) : (
              doctors.map(doc => (
                <div key={doc._id} className="doc-card-wrap">
                  <div className={`doc-card-inner ${flipped[doc._id] ? "flipped" : ""}`}>

                    {/* ── FRONT ── */}
                    <div className="doc-card-front">
                      <div className={`card-glow ${doc.isOnline ? "online" : "offline"}`} />

                      <div className="doc-avatar-wrap">
                        {doc.photo
                          ? <img src={doc.photo} alt={doc.name} className="doc-avatar" />
                          : <div className="doc-avatar-placeholder">{doc.name?.[0]?.toUpperCase() || "D"}</div>
                        }
                        <div className="verified-badge"><MdVerified /></div>
                      </div>

                      <div className="doc-name">Dr. {doc.name}</div>
                      <div className="doc-spec-tag">
                        {SPECIALIST_ICONS[doc.specialist] || "⚕"} {doc.specialist}
                      </div>

                      <div className="doc-stats">
                        <div className="doc-stat">
                          <span className="doc-stat-val">{doc.experience}+</span>
                          <span className="doc-stat-lbl">Yrs Exp</span>
                        </div>
                        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                        <div className="doc-stat">
                          <span className="doc-stat-val">৳{doc.consultationFee}</span>
                          <span className="doc-stat-lbl">Fee</span>
                        </div>
                        <div style={{ width: 1, background: "rgba(255,255,255,0.06)" }} />
                        <div className="doc-stat">
                          <span className="doc-stat-val" style={{ color: doc.isOnline ? "#22c55e" : "#475569" }}>
                            {doc.isOnline ? "Online" : "Offline"}
                          </span>
                          <span className="doc-stat-lbl">Status</span>
                        </div>
                      </div>

                      <div className="rating-wrap">
                        <div className="rating-label">
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#fbbf24" }}>
                            <FiStar /> {doc.rating || "4.5"}
                          </span>
                          <span>{doc.totalReviews || 0} reviews</span>
                        </div>
                        <div className="rating-bar-bg">
                          <div className="rating-bar-fill" style={{ width: `${((doc.rating || 4.5) / 5) * 100}%` }} />
                        </div>
                      </div>

                      <div className="card-footer">
                        <button className="btn-flip" onClick={(e) => toggleFlip(doc._id, e)} title="See availability">
                          <RiStethoscopeLine />
                        </button>
                        <button className="btn-book" onClick={() => navigate(`/appointments/book/${doc._id}`)}>
                          Book Appointment <FiChevronRight />
                        </button>
                      </div>
                    </div>

                    {/* ── BACK ── */}
                    <div className="doc-card-back">
                      <div className="back-title">Availability</div>

                      {doc.availability?.length > 0 ? (
                        <>
                          <div className="avail-days">
                            {doc.availability.map(a => (
                              <span key={a.day} className="avail-day">{a.day?.slice(0, 3)}</span>
                            ))}
                          </div>
                          <div className="back-title" style={{ marginBottom: 8 }}>Time Slots</div>
                          <div className="avail-slots">
                            {doc.availability.slice(0, 1).map(a =>
                              a.slots?.slice(0, 8).map(s => (
                                <span key={s.time} className="avail-slot">{s.time}</span>
                              ))
                            )}
                          </div>
                        </>
                      ) : (
                        <p style={{ fontSize: 12, color: "#475569", marginBottom: 12 }}>No availability set yet.</p>
                      )}

                      {doc.about && (
                        <>
                          <div className="back-title" style={{ marginBottom: 6 }}>About</div>
                          <p className="about-text">{doc.about}</p>
                        </>
                      )}

                      {doc.qualifications?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                          {doc.qualifications.map(q => (
                            <span key={q} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>{q}</span>
                          ))}
                        </div>
                      )}

                      <div className="back-footer">
                        <button className="btn-back" onClick={(e) => toggleFlip(doc._id, e)}>←</button>
                        <button className="btn-book-now" onClick={() => navigate(`/appointments/book/${doc._id}`)}>
                          Book Now <FiChevronRight />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}