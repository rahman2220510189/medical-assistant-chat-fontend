import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar, FiClock, FiX, FiCheck, FiFileText,
  FiVideo, FiChevronRight, FiAlertTriangle
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SPECIALIST_ICONS = {
  "Cardiologist":"❤️","Dermatologist":"✨","Neurologist":"🧠","Orthopedic":"🦴",
  "Pediatrician":"👶","Psychiatrist":"🧘","Gynecologist":"🌸","Urologist":"💧",
  "Gastroenterologist":"🫃","Pulmonologist":"🫁","Endocrinologist":"⚗️",
  "Ophthalmologist":"👁️","ENT":"👂","Hepatologist":"🟤","Nephrologist":"🫘",
  "Rheumatologist":"🦵","Oncologist":"🎗️","General Physician":"⚕️",
  "Infectious Disease Specialist":"🦠","Allergist":"🌿",
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const STATUS_CONFIG = {
  Pending:   { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.2)",   label: "Pending" },
  Confirmed: { color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.2)",   label: "Confirmed" },
  Completed: { color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.2)",   label: "Completed" },
  Cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.2)",  label: "Cancelled" },
};

function CancelModal({ appt, onConfirm, onClose }) {
  return ReactDOM.createPortal(
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 2147483647,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div style={{
        background: "#0d1728", border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: 24, padding: "36px 32px", maxWidth: 400, width: "100%",
        fontFamily: "'Cabinet Grotesk', sans-serif",
      }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>
          <FiAlertTriangle style={{ color: "#f87171" }} />
        </div>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Cancel Appointment?</div>
        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 24 }}>
          Are you sure you want to cancel your appointment with <strong style={{ color: "#e2e8f0" }}>Dr. {appt.doctorName}</strong> on <strong style={{ color: "#e2e8f0" }}>{fmt(appt.appointmentDate)}</strong>?
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Keep it
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling]     = useState(false);
  const [toast, setToast]               = useState(null);
  const navigate = useNavigate();

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/appointments/my`, { headers });
      setAppointments(res.data.appointments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axios.patch(`${API}/api/appointments/${cancelTarget._id}/cancel`, {}, { headers });
      showToast("Appointment cancelled.");
      setCancelTarget(null);
      fetchAppointments();
    } catch {
      showToast("Cancel failed. Try again.", "error");
    } finally {
      setCancelling(false); }
  };

  const filtered = filter === "All"
    ? appointments
    : appointments.filter(a => a.status === filter);

  const stats = {
    total:     appointments.length,
    upcoming:  appointments.filter(a => ["Pending","Confirmed"].includes(a.status)).length,
    completed: appointments.filter(a => a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  const FILTERS = ["All","Pending","Confirmed","Completed","Cancelled"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');

        .appt-page {
          min-height: 100vh;
          background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }
        .appt-mesh {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .appt-mesh::before {
          content: ''; position: absolute;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%);
          top: -200px; left: -200px;
          animation: am1 14s ease-in-out infinite alternate;
        }
        .appt-mesh::after {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
          bottom: 0; right: -100px;
          animation: am2 16s ease-in-out infinite alternate;
        }
        @keyframes am1 { from{transform:translate(0,0)} to{transform:translate(60px,80px)} }
        @keyframes am2 { from{transform:translate(0,0)} to{transform:translate(-60px,-60px)} }

        .appt-wrap {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 100px 24px 80px;
        }

        /* Header */
        .appt-header { margin-bottom: 32px; }
        .appt-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.2);
          color: #00d4ff; font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          padding: 5px 14px; border-radius: 40px;
          margin-bottom: 14px;
        }
        .appt-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 32px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 4px;
        }
        .appt-sub { font-size: 14px; color: #475569; }

        /* Stats */
        .appt-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 12px; margin-bottom: 28px;
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 18px;
          backdrop-filter: blur(12px);
        }
        .stat-val {
          font-family: 'Clash Display', sans-serif;
          font-size: 28px; font-weight: 700;
        }
        .stat-lbl { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

        /* Filter tabs */
        .filter-tabs {
          display: flex; gap: 6px; margin-bottom: 24px;
          overflow-x: auto; padding-bottom: 4px;
          scrollbar-width: none;
        }
        .filter-tabs::-webkit-scrollbar { display: none; }
        .filter-tab {
          padding: 8px 18px; border-radius: 40px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #475569; transition: all 0.2s;
          font-family: 'Cabinet Grotesk', sans-serif;
        }
        .filter-tab:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.2); }
        .filter-tab.active {
          border-color: #00d4ff;
          background: rgba(0,212,255,0.1);
          color: #00d4ff;
          box-shadow: 0 0 16px rgba(0,212,255,0.15);
        }

        /* Appointment Card */
        .appt-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 22px;
          backdrop-filter: blur(20px);
          padding: 24px;
          margin-bottom: 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;
        }
        .appt-card:hover {
          border-color: rgba(0,212,255,0.15);
          box-shadow: 0 0 30px rgba(0,212,255,0.05), 0 10px 40px rgba(0,0,0,0.3);
        }

        /* Doctor avatar */
        .appt-doc-avatar {
          width: 64px; height: 64px; border-radius: 18px;
          object-fit: cover;
          border: 2px solid rgba(0,212,255,0.2);
          flex-shrink: 0;
        }
        .appt-doc-placeholder {
          width: 64px; height: 64px; border-radius: 18px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          border: 2px solid rgba(0,212,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif;
          font-size: 22px; font-weight: 700; color: #00d4ff;
          flex-shrink: 0;
        }

        /* Card info */
        .appt-doc-name {
          font-family: 'Clash Display', sans-serif;
          font-size: 16px; font-weight: 700; color: #f1f5f9;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 4px;
        }
        .appt-spec {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; color: #00d4ff; font-weight: 600;
          margin-bottom: 10px;
        }
        .appt-meta {
          display: flex; align-items: center; gap: 16px;
          flex-wrap: wrap;
        }
        .appt-meta-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: #64748b;
        }
        .appt-problem {
          font-size: 12px; color: #475569;
          margin-top: 8px; line-height: 1.5;
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 1; -webkit-box-orient: vertical;
        }

        /* Status + Actions */
        .appt-right {
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 10px;
        }
        .status-badge {
          padding: 4px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          white-space: nowrap;
        }
        .appt-actions { display: flex; flex-direction: column; gap: 6px; }
        .action-btn {
          padding: 8px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 5px;
          font-family: 'Cabinet Grotesk', sans-serif;
          transition: all 0.2s; white-space: nowrap;
          border: none;
        }
        .btn-cancel {
          background: rgba(248,113,113,0.08);
          border: 1.5px solid rgba(248,113,113,0.2) !important;
          color: #f87171;
        }
        .btn-cancel:hover { background: rgba(248,113,113,0.15) !important; }
        .btn-join {
          background: linear-gradient(135deg, #7c3aed, #0ea5e9);
          color: white;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
        }
        .btn-join:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.4); }
        .btn-prescription {
          background: rgba(52,211,153,0.08);
          border: 1.5px solid rgba(52,211,153,0.2) !important;
          color: #34d399;
        }
        .btn-prescription:hover { background: rgba(52,211,153,0.15) !important; }

        /* Empty state */
        .empty-state {
          text-align: center; padding: 80px 20px;
        }
        .empty-glow {
          width: 100px; height: 100px; border-radius: 50%;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 40px; margin: 0 auto 24px;
        }
        .empty-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 20px; font-weight: 700; color: #1e293b;
          margin-bottom: 8px;
        }
        .empty-sub { font-size: 14px; color: #334155; margin-bottom: 24px; }
        .btn-find {
          padding: 12px 28px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          box-shadow: 0 4px 16px rgba(0,212,255,0.25);
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .btn-find:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,212,255,0.4); }

        /* Skeleton */
        .skeleton-appt {
          height: 120px; border-radius: 22px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 14px; overflow: hidden; position: relative;
        }
        .skeleton-appt::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.03) 50%, transparent 75%);
          background-size: 200% 100%;
          animation: shimmer 1.8s infinite;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }

        /* Toast */
        .toast {
          position: fixed; top: 20px; right: 20px; z-index: 2147483646;
          padding: 12px 20px; border-radius: 14px;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Cabinet Grotesk', sans-serif;
          animation: slideIn 0.3s ease;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        @keyframes slideIn {
          from { transform: translateY(-16px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 640px) {
          .appt-stats { grid-template-columns: repeat(2, 1fr); }
          .appt-card { grid-template-columns: auto 1fr; }
          .appt-right { flex-direction: row; align-items: center; grid-column: 1/-1; }
        }
      `}</style>

      <div className="appt-page">
        <div className="appt-mesh" />

        {/* Toast */}
        {toast && (
          <div className="toast" style={{
            background: toast.type === "success" ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
            color: toast.type === "success" ? "#34d399" : "#f87171",
          }}>
            {toast.type === "success" ? <FiCheck /> : <FiX />} {toast.msg}
          </div>
        )}

        {/* Cancel Modal */}
        {cancelTarget && (
          <CancelModal
            appt={cancelTarget}
            onClose={() => setCancelTarget(null)}
            onConfirm={handleCancel}
          />
        )}

        <div className="appt-wrap">

          {/* Header */}
          <div className="appt-header">
            <div className="appt-eyebrow"><RiHeartPulseLine /> My Appointments</div>
            <h1 className="appt-title">Your Appointments</h1>
            <p className="appt-sub">Track and manage all your bookings in one place</p>
          </div>

          {/* Stats */}
          <div className="appt-stats">
            {[
              { val: stats.total,     lbl: "Total",     color: "#00d4ff" },
              { val: stats.upcoming,  lbl: "Upcoming",  color: "#fbbf24" },
              { val: stats.completed, lbl: "Completed", color: "#34d399" },
              { val: stats.cancelled, lbl: "Cancelled", color: "#f87171" },
            ].map(({ val, lbl, color }) => (
              <div key={lbl} className="stat-card">
                <div className="stat-val" style={{ color }}>{val}</div>
                <div className="stat-lbl">{lbl}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="skeleton-appt" />)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-glow">📅</div>
              <div className="empty-title">No appointments found</div>
              <div className="empty-sub">
                {filter === "All"
                  ? "You haven't booked any appointments yet."
                  : `No ${filter.toLowerCase()} appointments.`}
              </div>
              <button className="btn-find" onClick={() => navigate("/doctors")}>
                Find a Doctor <FiChevronRight />
              </button>
            </div>
          ) : (
            filtered.map(appt => {
              const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.Pending;
              return (
                <div key={appt._id} className="appt-card">

                  {/* Avatar */}
                  {appt.doctor?.photo
                    ? <img src={appt.doctor.photo} alt={appt.doctor?.name} className="appt-doc-avatar" />
                    : <div className="appt-doc-placeholder">{appt.doctor?.name?.[0]?.toUpperCase() || appt.doctorName?.[0]?.toUpperCase() || "D"}</div>
                  }

                  {/* Info */}
                  <div>
                    <div className="appt-doc-name">
                      Dr. {appt.doctor?.name || appt.doctorName}
                      <MdVerified style={{ color: "#0ea5e9", fontSize: 15 }} />
                    </div>
                    <div className="appt-spec">
                      {SPECIALIST_ICONS[appt.doctor?.specialist || appt.doctorSpecialist] || "⚕"} {appt.doctor?.specialist || appt.doctorSpecialist || "Specialist"}
                    </div>
                    <div className="appt-meta">
                      <div className="appt-meta-item">
                        <FiCalendar style={{ color: "#00d4ff" }} />
                        {fmt(appt.appointmentDate)}
                      </div>
                      <div className="appt-meta-item">
                        <FiClock style={{ color: "#00d4ff" }} />
                        {appt.appointmentTime || "—"}
                      </div>
                    </div>
                    {appt.problem && (
                      <div className="appt-problem">💬 {appt.problem}</div>
                    )}
                  </div>

                  {/* Status + Actions */}
                  <div className="appt-right">
                    <span className="status-badge" style={{
                      background: sc.bg,
                      border: `1px solid ${sc.border}`,
                      color: sc.color,
                    }}>
                      {sc.label}
                    </span>

                    <div className="appt-actions">
                      {/* Pending or Confirmed → Cancel */}
                      {["Pending","Confirmed"].includes(appt.status) && (
                        <button
                          className="action-btn btn-cancel"
                          style={{ border: "none" }}
                          onClick={() => setCancelTarget(appt)}
                        >
                          <FiX /> Cancel
                        </button>
                      )}

                      {/* Confirmed → Join Call */}
                      {appt.status === "Confirmed" && (
                        <button
                          className="action-btn btn-join"
                          onClick={() => navigate(`/call/${appt._id}`)}
                        >
                          <FiVideo /> Join Call
                        </button>
                      )}

                      {/* Completed → Prescription */}
                     {(appt.status === "Confirmed" || appt.status === "Completed") && (
  <button
    className="action-btn btn-prescription"
    style={{ border: "none" }}
    onClick={() => navigate(`/prescription/${appt._id}`)}
  >
    <FiFileText /> Prescription
  </button>
)}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}