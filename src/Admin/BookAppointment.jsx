import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck, FiChevronLeft, FiChevronRight, FiUser, FiPhone, FiFileText, FiCalendar, FiClock, FiStar } from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DAYS_ORDER = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const SPECIALIST_ICONS = {
  "Cardiologist":"❤️","Dermatologist":"✨","Neurologist":"🧠","Orthopedic":"🦴",
  "Pediatrician":"👶","Psychiatrist":"🧘","Gynecologist":"🌸","Urologist":"💧",
  "Gastroenterologist":"🫃","Pulmonologist":"🫁","Endocrinologist":"⚗️",
  "Ophthalmologist":"👁️","ENT":"👂","Hepatologist":"🟤","Nephrologist":"🫘",
  "Rheumatologist":"🦵","Oncologist":"🎗️","General Physician":"⚕️",
  "Infectious Disease Specialist":"🦠","Allergist":"🌿",
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function getDayName(year, month, day) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(year, month, day).getDay()];
}

function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [step, setStep]           = useState(1); // 1=Date, 2=Time, 3=Info, 4=Success
  const [calYear, setCalYear]     = useState(new Date().getFullYear());
  const [calMonth, setCalMonth]   = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots]   = useState([]);
  const [form, setForm]           = useState({ name: "", phone: "", problem: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState("");

  const token = localStorage.getItem("access-token");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${API}/api/doctors/${doctorId}`);
        setDoctor(res.data.doctor || res.data);
      } catch { setError("Doctor not found."); }
      finally { setLoading(false); }
    };
    fetchDoctor();
  }, [doctorId]);

  // Fetch booked slots when date selected
  useEffect(() => {
    if (!selectedDate) return;
    const fetchBooked = async () => {
      try {
        const res = await axios.get(`${API}/api/doctors/${doctorId}/availability`, {
          params: { date: selectedDate }
        });
        setBookedSlots(res.data.bookedSlots || []);
      } catch { setBookedSlots([]); }
    };
    fetchBooked();
  }, [selectedDate]);

  // Get available days from doctor
  const availableDays = doctor?.availability?.map(a => a.day) || [];

  // Get slots for selected date's day
  const getSlotsForDate = (dateStr) => {
    if (!dateStr || !doctor?.availability) return [];
    const d = new Date(dateStr);
    const dayName = DAYS_ORDER[d.getDay() === 0 ? 0 : d.getDay()];
    const found = doctor.availability.find(a => a.day === getDayName(
      parseInt(dateStr.split("-")[0]),
      parseInt(dateStr.split("-")[1]) - 1,
      parseInt(dateStr.split("-")[2])
    ));
    return found?.slots || [];
  };

  const slots = getSlotsForDate(selectedDate);

  // Calendar helpers
  const today = new Date();
  today.setHours(0,0,0,0);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth); // 0=Sun
  // shift so week starts Saturday (6,0,1,2,3,4,5)
  const offset = (firstDay + 1) % 7;

  const isAvailableDay = (day) => {
    const dayName = getDayName(calYear, calMonth, day);
    const date = new Date(calYear, calMonth, day);
    return availableDays.includes(dayName) && date >= today;
  };

  const isPast = (day) => {
    const date = new Date(calYear, calMonth, day);
    return date < today;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d} ${MONTHS[parseInt(m)-1]} ${y}`;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) { setError("Name and phone are required."); return; }
    setSubmitting(true); setError("");
    try {
      await axios.post(`${API}/api/appointments`, {
        doctorId,
        doctorName: doctor.name,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        patientName: form.name,
        patientPhone: form.phone,
        problem: form.problem,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setStep(4);
    } catch (e) {
      setError(e.response?.data?.message || "Booking failed. Try again.");
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#00d4ff", fontFamily: "sans-serif" }}>Loading...</div>
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f87171", fontFamily: "sans-serif" }}>Doctor not found.</div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');

        .book-page {
          min-height: 100vh;
          background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }
        .book-mesh {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .book-mesh::before {
          content: ''; position: absolute;
          width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%);
          top: -100px; right: -100px;
          animation: bdrift1 14s ease-in-out infinite alternate;
        }
        .book-mesh::after {
          content: ''; position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%);
          bottom: 0; left: -100px;
          animation: bdrift2 16s ease-in-out infinite alternate;
        }
        @keyframes bdrift1 { from { transform: translate(0,0); } to { transform: translate(-60px,80px); } }
        @keyframes bdrift2 { from { transform: translate(0,0); } to { transform: translate(60px,-60px); } }

        .book-wrap {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: 100px 24px 80px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 28px;
          align-items: start;
        }

        /* ── Back button ── */
        .back-btn {
          position: fixed; top: 90px; left: 24px; z-index: 10;
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 40px;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          transition: all 0.2s;
        }
        .back-btn:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.2); }

        /* ── Doctor Card ── */
        .doc-info-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 28px;
          backdrop-filter: blur(20px);
          position: sticky; top: 100px;
        }
        .doc-photo {
          width: 80px; height: 80px; border-radius: 20px;
          object-fit: cover;
          border: 2px solid rgba(0,212,255,0.25);
          margin-bottom: 16px;
        }
        .doc-photo-placeholder {
          width: 80px; height: 80px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          border: 2px solid rgba(0,212,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif;
          font-size: 28px; font-weight: 700; color: #00d4ff;
          margin-bottom: 16px;
        }
        .doc-info-name {
          font-family: 'Clash Display', sans-serif;
          font-size: 20px; font-weight: 700; color: #f1f5f9;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 6px;
        }
        .doc-info-spec {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.15);
          color: #00d4ff; font-size: 11px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        .doc-info-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 20px;
        }
        .doc-info-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 12px;
        }
        .doc-info-stat-val {
          font-family: 'Clash Display', sans-serif;
          font-size: 17px; font-weight: 700; color: #f1f5f9;
        }
        .doc-info-stat-lbl { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

        .doc-about {
          font-size: 12.5px; color: #64748b; line-height: 1.7;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 16px; margin-top: 4px;
        }

        /* ── Booking Panel ── */
        .booking-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          overflow: hidden;
        }

        /* Stepper */
        .stepper {
          display: flex; padding: 24px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 0;
        }
        .step-item {
          display: flex; align-items: center; flex: 1;
        }
        .step-circle {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          color: #475569; flex-shrink: 0;
          font-family: 'Clash Display', sans-serif;
          transition: all 0.3s;
        }
        .step-circle.active {
          border-color: #00d4ff;
          background: rgba(0,212,255,0.1);
          color: #00d4ff;
          box-shadow: 0 0 16px rgba(0,212,255,0.25);
        }
        .step-circle.done {
          border-color: #22c55e;
          background: rgba(34,197,94,0.1);
          color: #22c55e;
        }
        .step-label {
          font-size: 11px; font-weight: 600; margin-left: 8px;
          color: #475569; text-transform: uppercase; letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .step-label.active { color: #00d4ff; }
        .step-label.done { color: #22c55e; }
        .step-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0 12px;
        }
        .step-line.done { background: rgba(34,197,94,0.3); }

        /* Step content */
        .step-content { padding: 28px; }

        .step-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 20px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 6px;
        }
        .step-sub { font-size: 13px; color: #475569; margin-bottom: 24px; }

        /* ── Calendar ── */
        .cal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .cal-month-label {
          font-family: 'Clash Display', sans-serif;
          font-size: 16px; font-weight: 600; color: #f1f5f9;
        }
        .cal-nav {
          width: 32px; height: 32px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748b; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .cal-nav:hover { border-color: rgba(0,212,255,0.3); color: #00d4ff; }
        .cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .cal-day-label {
          text-align: center; font-size: 10px; font-weight: 700;
          color: #334155; text-transform: uppercase;
          padding: 6px 0; letter-spacing: 0.5px;
        }
        .cal-day {
          aspect-ratio: 1; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 500;
          cursor: default; color: #1e293b;
          transition: all 0.2s;
          border: 1.5px solid transparent;
        }
        .cal-day.available {
          color: #e2e8f0; cursor: pointer;
          background: rgba(0,212,255,0.06);
          border-color: rgba(0,212,255,0.12);
        }
        .cal-day.available:hover {
          background: rgba(0,212,255,0.12);
          border-color: rgba(0,212,255,0.3);
          color: #00d4ff;
        }
        .cal-day.selected {
          background: rgba(0,212,255,0.15) !important;
          border-color: #00d4ff !important;
          color: #00d4ff !important;
          box-shadow: 0 0 16px rgba(0,212,255,0.2);
        }
        .cal-day.today-mark {
          border-color: rgba(124,58,237,0.3);
          color: #a78bfa;
        }
        .cal-day.past { color: #1e293b; }

        /* ── Time Slots ── */
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
          gap: 8px;
        }
        .slot-btn {
          padding: 10px 8px; border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #64748b; font-size: 12px; font-weight: 600;
          cursor: pointer; text-align: center;
          font-family: 'Cabinet Grotesk', sans-serif;
          transition: all 0.2s;
        }
        .slot-btn.available {
          color: #e2e8f0;
          border-color: rgba(255,255,255,0.1);
          cursor: pointer;
        }
        .slot-btn.available:hover {
          border-color: rgba(0,212,255,0.3);
          background: rgba(0,212,255,0.05);
          color: #00d4ff;
        }
        .slot-btn.selected {
          border-color: #00d4ff !important;
          background: rgba(0,212,255,0.12) !important;
          color: #00d4ff !important;
          box-shadow: 0 0 14px rgba(0,212,255,0.2);
        }
        .slot-btn.booked {
          color: #1e293b; cursor: not-allowed;
          text-decoration: line-through;
        }

        /* ── Form ── */
        .form-group { margin-bottom: 18px; }
        .form-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: #475569;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .form-input, .form-textarea {
          width: 100%; padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px; color: #e2e8f0;
          font-size: 14px; font-family: 'Cabinet Grotesk', sans-serif;
          outline: none; transition: all 0.3s;
          box-sizing: border-box;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #334155; }
        .form-input:focus, .form-textarea:focus {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.07);
        }
        .form-textarea { resize: none; height: 100px; }

        /* Booking summary */
        .summary-box {
          background: rgba(0,212,255,0.04);
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 16px; padding: 16px;
          margin-bottom: 20px;
        }
        .summary-row {
          display: flex; justify-content: space-between;
          align-items: center; padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-size: 13px;
        }
        .summary-row:last-child { border-bottom: none; }
        .summary-row span:first-child { color: #475569; }
        .summary-row span:last-child { color: #e2e8f0; font-weight: 600; }

        /* Error */
        .error-msg {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 13px;
          padding: 10px 14px; border-radius: 12px;
          margin-bottom: 16px;
        }

        /* Buttons */
        .btn-next {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(0,212,255,0.25);
          margin-top: 24px;
        }
        .btn-next:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0,212,255,0.4);
        }
        .btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-prev {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: #64748b; font-size: 14px; font-weight: 600;
          padding: 12px; border-radius: 14px;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.2s; margin-top: 12px; width: 100%;
        }
        .btn-prev:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.2); }

        /* Success */
        .success-wrap {
          padding: 60px 28px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }
        .success-icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(34,197,94,0.12);
          border: 2px solid rgba(34,197,94,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; margin-bottom: 24px;
          animation: pop 0.5s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 0 0 40px rgba(34,197,94,0.2);
        }
        @keyframes pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .success-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 26px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 10px;
        }
        .success-sub { font-size: 14px; color: #64748b; margin-bottom: 32px; line-height: 1.7; }
        .btn-goto {
          padding: 14px 32px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          box-shadow: 0 4px 20px rgba(0,212,255,0.3);
          transition: all 0.2s;
        }
        .btn-goto:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(0,212,255,0.4); }

        @media (max-width: 768px) {
          .book-wrap { grid-template-columns: 1fr; padding: 80px 16px 60px; }
          .doc-info-card { position: static; }
        }
      `}</style>

      <div className="book-page">
        <div className="book-mesh" />

        {/* Back button */}
        <button className="back-btn" onClick={() => navigate("/doctors")}>
          <FiChevronLeft /> Back to Doctors
        </button>

        <div className="book-wrap">

          {/* ── LEFT: Doctor Info ── */}
          <div className="doc-info-card">
            {doctor.photo
              ? <img src={doctor.photo} alt={doctor.name} className="doc-photo" />
              : <div className="doc-photo-placeholder">{doctor.name?.[0]?.toUpperCase() || "D"}</div>
            }
            <div className="doc-info-name">
              Dr. {doctor.name}
              <MdVerified style={{ color: "#0ea5e9", fontSize: 18 }} />
            </div>
            <div className="doc-info-spec">
              {SPECIALIST_ICONS[doctor.specialist] || "⚕"} {doctor.specialist}
            </div>

            <div className="doc-info-stats">
              {[
                { val: `${doctor.experience || 0}+`, lbl: "Yrs Exp" },
                { val: `৳${doctor.consultationFee || 0}`, lbl: "Fee" },
                { val: doctor.rating || "4.5", lbl: "Rating" },
                { val: doctor.totalPatients || "0", lbl: "Patients" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="doc-info-stat">
                  <div className="doc-info-stat-val">{val}</div>
                  <div className="doc-info-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>

            {doctor.qualifications?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                {doctor.qualifications.map(q => (
                  <span key={q} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>{q}</span>
                ))}
              </div>
            )}

            {doctor.about && (
              <div className="doc-about">{doctor.about}</div>
            )}

            {/* Available days */}
            {availableDays.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Available Days</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {availableDays.map(d => (
                    <span key={d} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff", fontWeight: 600 }}>
                      {d.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Booking Panel ── */}
          <div className="booking-panel">

            {step < 4 && (
              <div className="stepper">
                {[
                  { n: 1, label: "Date" },
                  { n: 2, label: "Time" },
                  { n: 3, label: "Details" },
                ].map(({ n, label }, i) => (
                  <React.Fragment key={n}>
                    <div className="step-item">
                      <div className={`step-circle ${step === n ? "active" : step > n ? "done" : ""}`}>
                        {step > n ? <FiCheck /> : n}
                      </div>
                      <span className={`step-label ${step === n ? "active" : step > n ? "done" : ""}`}>{label}</span>
                    </div>
                    {i < 2 && <div className={`step-line ${step > n ? "done" : ""}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* ── STEP 1: Date ── */}
            {step === 1 && (
              <div className="step-content">
                <div className="step-title">Select a Date</div>
                <div className="step-sub">Available days are highlighted in cyan</div>

                {/* Calendar */}
                <div className="cal-header">
                  <button className="cal-nav" onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}><FiChevronLeft /></button>
                  <div className="cal-month-label">{MONTHS[calMonth]} {calYear}</div>
                  <button className="cal-nav" onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}><FiChevronRight /></button>
                </div>

                <div className="cal-grid">
                  {["Sat","Sun","Mon","Tue","Wed","Thu","Fri"].map(d => (
                    <div key={d} className="cal-day-label">{d}</div>
                  ))}
                  {/* empty cells */}
                  {[...Array(offset)].map((_, i) => <div key={`e${i}`} />)}
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const avail = isAvailableDay(day);
                    const past  = isPast(day);
                    const sel   = selectedDate === dateStr;
                    const todayMark = new Date(calYear, calMonth, day).toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={day}
                        className={`cal-day ${avail ? "available" : ""} ${past && !avail ? "past" : ""} ${sel ? "selected" : ""} ${todayMark && !sel ? "today-mark" : ""}`}
                        onClick={() => avail && (setSelectedDate(dateStr), setSelectedSlot(null))}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn-next"
                  disabled={!selectedDate}
                  onClick={() => setStep(2)}
                >
                  Continue <FiChevronRight />
                </button>
              </div>
            )}

            {/* ── STEP 2: Time ── */}
            {step === 2 && (
              <div className="step-content">
                <div className="step-title">Select a Time Slot</div>
                <div className="step-sub">{formatDate(selectedDate)}</div>

                {slots.length === 0 ? (
                  <div style={{ color: "#475569", fontSize: 14, padding: "20px 0" }}>No time slots available for this day.</div>
                ) : (
                  <div className="slots-grid">
                    {slots.map(s => {
                      const isBooked = bookedSlots.includes(s.time);
                      const isSel = selectedSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          className={`slot-btn ${isBooked ? "booked" : "available"} ${isSel ? "selected" : ""}`}
                          disabled={isBooked}
                          onClick={() => !isBooked && setSelectedSlot(s.time)}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button className="btn-next" disabled={!selectedSlot} onClick={() => setStep(3)}>
                  Continue <FiChevronRight />
                </button>
                <button className="btn-prev" onClick={() => setStep(1)}>
                  <FiChevronLeft /> Back
                </button>
              </div>
            )}

            {/* ── STEP 3: Patient Info ── */}
            {step === 3 && (
              <div className="step-content">
                <div className="step-title">Your Details</div>
                <div className="step-sub">Almost there! Fill in your info</div>

                {/* Booking summary */}
                <div className="summary-box">
                  <div className="summary-row">
                    <span>Doctor</span>
                    <span>Dr. {doctor.name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Date</span>
                    <span>{formatDate(selectedDate)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Time</span>
                    <span>{selectedSlot}</span>
                  </div>
                  <div className="summary-row">
                    <span>Fee</span>
                    <span style={{ color: "#00d4ff" }}>৳{doctor.consultationFee || 0}</span>
                  </div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-group">
                  <div className="form-label"><FiUser /> Full Name</div>
                  <input className="form-input" placeholder="Enter your full name"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <div className="form-label"><FiPhone /> Phone Number</div>
                  <input className="form-input" placeholder="01XXXXXXXXX"
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <div className="form-label"><FiFileText /> Problem / Symptoms</div>
                  <textarea className="form-textarea" placeholder="Describe your symptoms or reason for visit..."
                    value={form.problem} onChange={e => setForm({ ...form, problem: e.target.value })} />
                </div>

                <button className="btn-next" disabled={submitting || !form.name || !form.phone} onClick={handleSubmit}>
                  {submitting ? "Booking..." : "Confirm Booking"} {!submitting && <FiCheck />}
                </button>
                <button className="btn-prev" onClick={() => setStep(2)}>
                  <FiChevronLeft /> Back
                </button>
              </div>
            )}

            {/* ── STEP 4: Success ── */}
            {step === 4 && (
              <div className="success-wrap">
                <div className="success-icon">✅</div>
                <div className="success-title">Booking Confirmed!</div>
                <div className="success-sub">
                  Your appointment with <strong style={{ color: "#f1f5f9" }}>Dr. {doctor.name}</strong> has been booked successfully.<br />
                  <span style={{ color: "#00d4ff" }}>{formatDate(selectedDate)}</span> at <span style={{ color: "#00d4ff" }}>{selectedSlot}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn-goto" onClick={() => navigate("/appointments")}>
                    My Appointments
                  </button>
                  <button
                    onClick={() => navigate("/doctors")}
                    style={{ padding: "14px 24px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    Back to Doctors
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default BookAppointment;