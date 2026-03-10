import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  FiCheck, FiChevronLeft, FiChevronRight,
  FiUser, FiPhone, FiFileText, FiLock, FiCreditCard
} from "react-icons/fi";
import { MdVerified } from "react-icons/md";
import { RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const SPECIALIST_ICONS = {
  "Cardiologist":"❤️","Dermatologist":"✨","Neurologist":"🧠","Orthopedic":"🦴",
  "Pediatrician":"👶","Psychiatrist":"🧘","Gynecologist":"🌸","Urologist":"💧",
  "Gastroenterologist":"🫃","Pulmonologist":"🫁","Endocrinologist":"⚗️",
  "Ophthalmologist":"👁️","ENT":"👂","Hepatologist":"🟤","Nephrologist":"🫘",
  "Rheumatologist":"🦵","Oncologist":"🎗️","General Physician":"⚕️",
  "Infectious Disease Specialist":"🦠","Allergist":"🌿",
};

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function getDayName(year, month, day) {
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date(year, month, day).getDay()];
}
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d} ${MONTHS[parseInt(m)-1]} ${y}`;
};

// ── Stripe Payment Form ──
function PaymentForm({ doctor, selectedDate, selectedSlot, form, appointmentData, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError]   = useState("");
  const token = localStorage.getItem("access-token");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true); setError("");
    try {
      const intentRes = await axios.post(`${API}/api/payment/create-intent`, {
        doctorId: doctor._id,
        amount: doctor.consultationFee || 10,
      }, { headers: { Authorization: `Bearer ${token}` } });

      const { clientSecret, paymentIntentId } = intentRes.data;

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: form.name },
        },
      });

      if (stripeError) { setError(stripeError.message); setPaying(false); return; }

      if (paymentIntent.status === "succeeded") {
        await axios.post(`${API}/api/payment/confirm`, {
          paymentIntentId,
          appointmentData,
        }, { headers: { Authorization: `Bearer ${token}` } });
        onSuccess();
      }
    } catch (e) {
      setError(e.response?.data?.message || "Payment failed. Try again.");
    } finally { setPaying(false); }
  };

  return (
    <div>
      {/* Summary */}
      <div style={{ background:"rgba(0,212,255,0.04)", border:"1px solid rgba(0,212,255,0.12)", borderRadius:16, padding:16, marginBottom:20 }}>
        {[["Doctor",`Dr. ${doctor.name}`],["Date",formatDate(selectedDate)],["Time",selectedSlot],["Fee",`$${doctor.consultationFee||10}`]].map(([label,value]) => (
          <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:13 }}>
            <span style={{ color:"#475569" }}>{label}</span>
            <span style={{ color:label==="Fee"?"#00d4ff":"#e2e8f0", fontWeight:600 }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
          <FiCreditCard /> Card Details
        </div>
        <div style={{ padding:"14px 16px", background:"rgba(255,255,255,0.04)", border:"1.5px solid rgba(255,255,255,0.08)", borderRadius:14 }}>
          <CardElement options={{ style: { base: { fontSize:"15px", color:"#e2e8f0", fontFamily:"'Cabinet Grotesk',sans-serif", "::placeholder":{ color:"#334155" } }, invalid:{ color:"#f87171" } } }} />
        </div>
      </div>

      {error && (
        <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", fontSize:13, padding:"10px 14px", borderRadius:12, marginBottom:14 }}>
          {error}
        </div>
      )}

      <button onClick={handlePay} disabled={paying||!stripe}
        style={{ width:"100%", padding:"14px", borderRadius:14, border:"none", background:paying?"rgba(0,212,255,0.3)":"linear-gradient(135deg,#00d4ff,#0284c7)", color:"white", fontSize:14, fontWeight:700, cursor:paying?"not-allowed":"pointer", fontFamily:"'Cabinet Grotesk',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 20px rgba(0,212,255,0.25)" }}>
        <FiLock /> {paying ? "Processing..." : `Pay $${doctor.consultationFee||10} Securely`}
      </button>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginTop:10, fontSize:11, color:"#334155" }}>
        <FiLock /> Secured by Stripe · SSL Encrypted
      </div>
    </div>
  );
}

// ── Main ──
export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [step, setStep]                 = useState(1);
  const [calYear, setCalYear]           = useState(new Date().getFullYear());
  const [calMonth, setCalMonth]         = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots]   = useState([]);
  const [form, setForm]                 = useState({ name:"", phone:"", problem:"" });

  const token = localStorage.getItem("access-token");

  useEffect(() => {
    axios.get(`${API}/api/doctors/${doctorId}`)
      .then(res => setDoctor(res.data.doctor || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDate) return;
    axios.get(`${API}/api/appointments/my`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(res => {
        const booked = (res.data.appointments||[])
          .filter(a => a.doctorId===doctorId && new Date(a.appointmentDate).toISOString().slice(0,10)===selectedDate && ["Pending","Confirmed"].includes(a.status))
          .map(a => a.appointmentTime);
        setBookedSlots(booked);
      }).catch(() => setBookedSlots([]));
  }, [selectedDate]);

  const availableDays = doctor?.availability?.map(a => a.day) || [];

  const getSlotsForDate = (dateStr) => {
    if (!dateStr || !doctor?.availability) return [];
    const [y,m,d] = dateStr.split("-").map(Number);
    const dayName = getDayName(y, m-1, d);
    return doctor.availability.find(a => a.day===dayName)?.slots || [];
  };

  const slots  = getSlotsForDate(selectedDate);
  const today  = new Date(); today.setHours(0,0,0,0);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const offset = (getFirstDayOfMonth(calYear, calMonth) + 1) % 7;

  const isAvailableDay = (day) => {
    const dayName = getDayName(calYear, calMonth, day);
    return availableDays.includes(dayName) && new Date(calYear, calMonth, day) >= today;
  };

  const appointmentData = {
    doctorId, doctorName: doctor?.name,
    appointmentDate: selectedDate, appointmentTime: selectedSlot,
    patientName: form.name, patientPhone: form.phone, problem: form.problem,
  };

  if (loading) return <div style={{ minHeight:"100vh", background:"#050d1a", display:"flex", alignItems:"center", justifyContent:"center", color:"#00d4ff", fontFamily:"sans-serif" }}>Loading...</div>;
  if (!doctor)  return <div style={{ minHeight:"100vh", background:"#050d1a", display:"flex", alignItems:"center", justifyContent:"center", color:"#f87171", fontFamily:"sans-serif" }}>Doctor not found.</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
        .book-page{min-height:100vh;background:#050d1a;font-family:'Cabinet Grotesk',sans-serif;color:#e2e8f0;position:relative;overflow-x:hidden}
        .book-mesh{position:fixed;inset:0;z-index:0;pointer-events:none}
        .book-mesh::before{content:'';position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%);top:-100px;right:-100px;animation:bd1 14s ease-in-out infinite alternate}
        .book-mesh::after{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 70%);bottom:0;left:-100px;animation:bd2 16s ease-in-out infinite alternate}
        @keyframes bd1{from{transform:translate(0,0)}to{transform:translate(-60px,80px)}}
        @keyframes bd2{from{transform:translate(0,0)}to{transform:translate(60px,-60px)}}
        .book-wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:100px 24px 80px;display:grid;grid-template-columns:300px 1fr;gap:28px;align-items:start}
        .back-btn{position:fixed;top:90px;left:24px;z-index:10;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#64748b;font-size:13px;font-weight:600;padding:8px 16px;border-radius:40px;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;transition:all 0.2s}
        .back-btn:hover{color:#e2e8f0;border-color:rgba(255,255,255,0.2)}
        .doc-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:24px;padding:24px;backdrop-filter:blur(20px);position:sticky;top:100px}
        .doc-photo{width:76px;height:76px;border-radius:18px;object-fit:cover;border:2px solid rgba(0,212,255,0.25);margin-bottom:14px}
        .doc-ph{width:76px;height:76px;border-radius:18px;background:linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15));border:2px solid rgba(0,212,255,0.2);display:flex;align-items:center;justify-content:center;font-family:'Clash Display',sans-serif;font-size:26px;font-weight:700;color:#00d4ff;margin-bottom:14px}
        .doc-name{font-family:'Clash Display',sans-serif;font-size:17px;font-weight:700;color:#f1f5f9;display:flex;align-items:center;gap:6px;margin-bottom:5px}
        .doc-spec{display:inline-flex;align-items:center;gap:4px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.15);color:#00d4ff;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px}
        .doc-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
        .doc-stat{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:9px}
        .doc-stat-val{font-family:'Clash Display',sans-serif;font-size:15px;font-weight:700;color:#f1f5f9}
        .doc-stat-lbl{font-size:9px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px}
        .panel{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:24px;backdrop-filter:blur(20px);overflow:hidden}
        .stepper{display:flex;padding:20px 26px;border-bottom:1px solid rgba(255,255,255,0.05)}
        .sc{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:#475569;flex-shrink:0;font-family:'Clash Display',sans-serif;transition:all 0.3s}
        .sc.active{border-color:#00d4ff;background:rgba(0,212,255,0.1);color:#00d4ff;box-shadow:0 0 14px rgba(0,212,255,0.25)}
        .sc.done{border-color:#22c55e;background:rgba(34,197,94,0.1);color:#22c55e}
        .sl{font-size:10px;font-weight:700;margin-left:5px;color:#475569;text-transform:uppercase;letter-spacing:0.5px;white-space:nowrap}
        .sl.active{color:#00d4ff}.sl.done{color:#22c55e}
        .sline{flex:1;height:1px;background:rgba(255,255,255,0.06);margin:0 8px}
        .sline.done{background:rgba(34,197,94,0.3)}
        .sc-wrap{padding:26px}
        .st{font-family:'Clash Display',sans-serif;font-size:19px;font-weight:700;color:#f1f5f9;margin-bottom:4px}
        .ss{font-size:13px;color:#475569;margin-bottom:20px}
        .cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .cal-ml{font-family:'Clash Display',sans-serif;font-size:14px;font-weight:600;color:#f1f5f9}
        .cal-nav{width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s}
        .cal-nav:hover{border-color:rgba(0,212,255,0.3);color:#00d4ff}
        .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
        .cdl{text-align:center;font-size:9px;font-weight:700;color:#334155;text-transform:uppercase;padding:4px 0;letter-spacing:0.5px}
        .cd{aspect-ratio:1;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;cursor:default;color:#1e293b;transition:all 0.2s;border:1.5px solid transparent}
        .cd.avail{color:#e2e8f0;cursor:pointer;background:rgba(0,212,255,0.06);border-color:rgba(0,212,255,0.12)}
        .cd.avail:hover{background:rgba(0,212,255,0.12);border-color:rgba(0,212,255,0.3);color:#00d4ff}
        .cd.sel{background:rgba(0,212,255,0.15)!important;border-color:#00d4ff!important;color:#00d4ff!important;box-shadow:0 0 12px rgba(0,212,255,0.2)}
        .slots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(82px,1fr));gap:6px}
        .slot-btn{padding:9px 6px;border-radius:9px;border:1.5px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.03);color:#64748b;font-size:11px;font-weight:600;cursor:pointer;text-align:center;font-family:'Cabinet Grotesk',sans-serif;transition:all 0.2s}
        .slot-btn.avail{color:#e2e8f0;border-color:rgba(255,255,255,0.1)}
        .slot-btn.avail:hover{border-color:rgba(0,212,255,0.3);background:rgba(0,212,255,0.05);color:#00d4ff}
        .slot-btn.sel{border-color:#00d4ff!important;background:rgba(0,212,255,0.12)!important;color:#00d4ff!important;box-shadow:0 0 10px rgba(0,212,255,0.2)}
        .slot-btn.booked{color:#1e293b;cursor:not-allowed;text-decoration:line-through}
        .fg{margin-bottom:14px}
        .fl{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px}
        .fi,.fta{width:100%;padding:12px 14px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);border-radius:12px;color:#e2e8f0;font-size:13px;font-family:'Cabinet Grotesk',sans-serif;outline:none;transition:all 0.3s;box-sizing:border-box}
        .fi::placeholder,.fta::placeholder{color:#334155}
        .fi:focus,.fta:focus{border-color:rgba(0,212,255,0.4);background:rgba(0,212,255,0.03);box-shadow:0 0 0 3px rgba(0,212,255,0.07)}
        .fta{resize:none;height:85px}
        .btn-n{width:100%;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#00d4ff,#0284c7);color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.2s;box-shadow:0 4px 18px rgba(0,212,255,0.25);margin-top:20px}
        .btn-n:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 26px rgba(0,212,255,0.4)}
        .btn-n:disabled{opacity:0.4;cursor:not-allowed}
        .btn-p{background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);color:#64748b;font-size:13px;font-weight:600;padding:10px;border-radius:12px;cursor:pointer;font-family:'Cabinet Grotesk',sans-serif;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.2s;margin-top:8px;width:100%}
        .btn-p:hover{color:#e2e8f0;border-color:rgba(255,255,255,0.2)}
        .suc{padding:56px 26px;text-align:center;display:flex;flex-direction:column;align-items:center}
        .suc-icon{width:76px;height:76px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);display:flex;align-items:center;justify-content:center;font-size:34px;margin-bottom:20px;animation:pop 0.5s cubic-bezier(0.23,1,0.32,1);box-shadow:0 0 36px rgba(34,197,94,0.2)}
        @keyframes pop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}
        .suc-title{font-family:'Clash Display',sans-serif;font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:8px}
        .suc-sub{font-size:13px;color:#64748b;margin-bottom:26px;line-height:1.7}
        @media(max-width:768px){.book-wrap{grid-template-columns:1fr;padding:80px 16px 60px}.doc-card{position:static}}
      `}</style>

      <div className="book-page">
        <div className="book-mesh" />
        <button className="back-btn" onClick={() => navigate("/doctors")}><FiChevronLeft /> Back</button>

        <div className="book-wrap">
          {/* Doctor Card */}
          <div className="doc-card">
            {doctor.photo ? <img src={doctor.photo} alt={doctor.name} className="doc-photo" /> : <div className="doc-ph">{doctor.name?.[0]?.toUpperCase()}</div>}
            <div className="doc-name">Dr. {doctor.name} <MdVerified style={{ color:"#0ea5e9", fontSize:15 }} /></div>
            <div className="doc-spec">{SPECIALIST_ICONS[doctor.specialist]||"⚕"} {doctor.specialist}</div>
            <div className="doc-stats">
              {[{val:`${doctor.experience||0}+`,lbl:"Yrs Exp"},{val:`$${doctor.consultationFee||0}`,lbl:"Fee"},{val:doctor.rating||"4.5",lbl:"Rating"},{val:doctor.totalPatients||"0",lbl:"Patients"}].map(({val,lbl}) => (
                <div key={lbl} className="doc-stat">
                  <div className="doc-stat-val">{val}</div>
                  <div className="doc-stat-lbl">{lbl}</div>
                </div>
              ))}
            </div>
            {availableDays.length > 0 && (
              <div style={{ paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize:9, color:"#334155", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>Available Days</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {availableDays.map(d => <span key={d} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(0,212,255,0.08)", border:"1px solid rgba(0,212,255,0.15)", color:"#00d4ff", fontWeight:600 }}>{d.slice(0,3)}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Booking Panel */}
          <div className="panel">
            {step < 5 && (
              <div className="stepper">
                {[{n:1,l:"Date"},{n:2,l:"Time"},{n:3,l:"Info"},{n:4,l:"Pay"}].map(({n,l},i) => (
                  <React.Fragment key={n}>
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <div className={`sc ${step===n?"active":step>n?"done":""}`}>{step>n?<FiCheck />:n}</div>
                      <span className={`sl ${step===n?"active":step>n?"done":""}`}>{l}</span>
                    </div>
                    {i<3 && <div className={`sline ${step>n?"done":""}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Step 1 — Date */}
            {step===1 && (
              <div className="sc-wrap">
                <div className="st">Select a Date</div>
                <div className="ss">Available days highlighted in cyan</div>
                <div className="cal-header">
                  <button className="cal-nav" onClick={() => { calMonth===0?(setCalMonth(11),setCalYear(y=>y-1)):setCalMonth(m=>m-1) }}><FiChevronLeft /></button>
                  <div className="cal-ml">{MONTHS[calMonth]} {calYear}</div>
                  <button className="cal-nav" onClick={() => { calMonth===11?(setCalMonth(0),setCalYear(y=>y+1)):setCalMonth(m=>m+1) }}><FiChevronRight /></button>
                </div>
                <div className="cal-grid">
                  {["Sat","Sun","Mon","Tue","Wed","Thu","Fri"].map(d => <div key={d} className="cdl">{d}</div>)}
                  {[...Array(offset)].map((_,i) => <div key={`e${i}`} />)}
                  {[...Array(daysInMonth)].map((_,i) => {
                    const day=i+1;
                    const dateStr=`${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                    const avail=isAvailableDay(day);
                    const sel=selectedDate===dateStr;
                    return <div key={day} className={`cd ${avail?"avail":""} ${sel?"sel":""}`} onClick={() => avail&&(setSelectedDate(dateStr),setSelectedSlot(null))}>{day}</div>;
                  })}
                </div>
                <button className="btn-n" disabled={!selectedDate} onClick={() => setStep(2)}>Continue <FiChevronRight /></button>
              </div>
            )}

            {/* Step 2 — Time */}
            {step===2 && (
              <div className="sc-wrap">
                <div className="st">Select Time Slot</div>
                <div className="ss">{formatDate(selectedDate)}</div>
                {slots.length===0 ? <div style={{ color:"#475569", fontSize:13 }}>No slots available.</div> : (
                  <div className="slots-grid">
                    {slots.map(s => {
                      const isBooked=bookedSlots.includes(s.time);
                      const isSel=selectedSlot===s.time;
                      return <button key={s.time} className={`slot-btn ${isBooked?"booked":"avail"} ${isSel?"sel":""}`} disabled={isBooked} onClick={() => !isBooked&&setSelectedSlot(s.time)}>{s.time}</button>;
                    })}
                  </div>
                )}
                <button className="btn-n" disabled={!selectedSlot} onClick={() => setStep(3)}>Continue <FiChevronRight /></button>
                <button className="btn-p" onClick={() => setStep(1)}><FiChevronLeft /> Back</button>
              </div>
            )}

            {/* Step 3 — Info */}
            {step===3 && (
              <div className="sc-wrap">
                <div className="st">Your Details</div>
                <div className="ss">Fill in your information</div>
                <div className="fg"><div className="fl"><FiUser /> Full Name</div><input className="fi" placeholder="Enter your full name" value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></div>
                <div className="fg"><div className="fl"><FiPhone /> Phone Number</div><input className="fi" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} /></div>
                <div className="fg"><div className="fl"><FiFileText /> Problem / Symptoms</div><textarea className="fta" placeholder="Describe your symptoms..." value={form.problem} onChange={e => setForm({...form,problem:e.target.value})} /></div>
                <button className="btn-n" disabled={!form.name||!form.phone} onClick={() => setStep(4)}>Continue to Payment <FiChevronRight /></button>
                <button className="btn-p" onClick={() => setStep(2)}><FiChevronLeft /> Back</button>
              </div>
            )}

            {/* Step 4 — Payment */}
            {step===4 && (
              <div className="sc-wrap">
                <div className="st">Payment</div>
                <div className="ss">Complete your booking securely</div>
                <Elements stripe={stripePromise}>
                  <PaymentForm doctor={doctor} selectedDate={selectedDate} selectedSlot={selectedSlot} form={form} appointmentData={appointmentData} onSuccess={() => setStep(5)} />
                </Elements>
                <button className="btn-p" onClick={() => setStep(3)}><FiChevronLeft /> Back</button>
              </div>
            )}

            {/* Step 5 — Success */}
            {step===5 && (
              <div className="suc">
                <div className="suc-icon">✅</div>
                <div className="suc-title">Booking Confirmed!</div>
                <div className="suc-sub">
                  Appointment with <strong style={{ color:"#f1f5f9" }}>Dr. {doctor.name}</strong> booked.<br />
                  <span style={{ color:"#00d4ff" }}>{formatDate(selectedDate)}</span> at <span style={{ color:"#00d4ff" }}>{selectedSlot}</span><br />
                  <span style={{ color:"#34d399", fontSize:12 }}>Payment successful ✓</span>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={() => navigate("/appointments")} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#00d4ff,#0284c7)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cabinet Grotesk',sans-serif", boxShadow:"0 4px 16px rgba(0,212,255,0.3)" }}>My Appointments</button>
                  <button onClick={() => navigate("/doctors")} style={{ padding:"12px 18px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'Cabinet Grotesk',sans-serif" }}>Back to Doctors</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}