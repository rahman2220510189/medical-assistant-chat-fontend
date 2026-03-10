import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { RiHeartPulseLine, RiStethoscopeLine } from "react-icons/ri";
import { MdLocalHospital } from "react-icons/md";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API}/api/doctor/login`, form);
      const { token, doctor } = res.data;

      localStorage.setItem("doctor-token", token);
      localStorage.setItem("doctor-info", JSON.stringify(doctor));

      navigate("/doctor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');

        .dl-page {
          min-height: 100vh;
          background: #050d1a;
          font-family: 'Cabinet Grotesk', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Mesh background */
        .dl-mesh {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .dl-mesh::before {
          content: '';
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%);
          top: -150px; right: -150px;
          animation: dm1 14s ease-in-out infinite alternate;
        }
        .dl-mesh::after {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
          bottom: -100px; left: -100px;
          animation: dm2 16s ease-in-out infinite alternate;
        }
        @keyframes dm1 { from{transform:translate(0,0)} to{transform:translate(-80px,100px)} }
        @keyframes dm2 { from{transform:translate(0,0)} to{transform:translate(80px,-80px)} }

        /* Floating icons */
        .dl-float {
          position: fixed;
          z-index: 0;
          opacity: 0.04;
          color: #00d4ff;
          font-size: 120px;
          pointer-events: none;
          animation: dfloat 8s ease-in-out infinite alternate;
        }
        .dl-float:nth-child(1) { top: 10%; left: 5%; font-size: 80px; animation-delay: 0s; }
        .dl-float:nth-child(2) { top: 60%; right: 5%; font-size: 100px; animation-delay: 2s; }
        .dl-float:nth-child(3) { bottom: 10%; left: 30%; font-size: 60px; animation-delay: 4s; }
        @keyframes dfloat { from{transform:translateY(0) rotate(0deg)} to{transform:translateY(-30px) rotate(10deg)} }

        /* Grid lines */
        .dl-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* Card */
        .dl-wrap {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 24px;
        }

        .dl-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 44px 40px;
          backdrop-filter: blur(24px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          animation: cardIn 0.6s cubic-bezier(0.23,1,0.32,1);
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo */
        .dl-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }
        .dl-logo-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          border: 1px solid rgba(0,212,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #00d4ff;
          box-shadow: 0 0 20px rgba(0,212,255,0.15);
        }
        .dl-logo-text {
          font-family: 'Clash Display', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1.2;
        }
        .dl-logo-sub {
          font-size: 11px;
          color: #475569;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* Header */
        .dl-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .dl-sub {
          font-size: 13px;
          color: #475569;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        /* Badge */
        .dl-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.18);
          color: #00d4ff;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 20px;
          animation: pulse 2.5s ease-in-out infinite;
        }
        .dl-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00d4ff;
          animation: blink 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,212,255,0)} 50%{box-shadow:0 0 0 6px rgba(0,212,255,0.05)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Form */
        .dl-group {
          margin-bottom: 16px;
        }
        .dl-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 8px;
        }
        .dl-input-wrap {
          position: relative;
        }
        .dl-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: #334155;
          font-size: 15px;
          pointer-events: none;
          transition: color 0.3s;
        }
        .dl-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 13px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'Cabinet Grotesk', sans-serif;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
        }
        .dl-input::placeholder { color: #334155; }
        .dl-input:focus {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.03);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.07);
        }
        .dl-input:focus + .dl-input-icon,
        .dl-input-wrap:focus-within .dl-input-icon {
          color: #00d4ff;
        }
        .dl-eye {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #334155;
          cursor: pointer;
          font-size: 15px;
          transition: color 0.2s;
          background: none;
          border: none;
          padding: 0;
        }
        .dl-eye:hover { color: #00d4ff; }

        /* Error */
        .dl-error {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Submit button */
        .dl-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Cabinet Grotesk', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(0,212,255,0.3);
          margin-top: 8px;
          position: relative;
          overflow: hidden;
        }
        .dl-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .dl-btn:hover::before { opacity: 1; }
        .dl-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,212,255,0.45);
        }
        .dl-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Spinner */
        .dl-spin {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .dl-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }
        .dl-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }
        .dl-divider-text {
          font-size: 11px;
          color: #334155;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Footer */
        .dl-footer {
          text-align: center;
          font-size: 12px;
          color: #334155;
          margin-top: 20px;
        }
        .dl-footer a {
          color: #00d4ff;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .dl-footer a:hover { opacity: 0.7; }

        /* Security note */
        .dl-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 11px;
          color: #1e3a4a;
          margin-top: 16px;
        }

        @media (max-width: 480px) {
          .dl-card { padding: 32px 24px; }
        }
      `}</style>

      <div className="dl-page">
        <div className="dl-mesh" />
        <div className="dl-grid" />

        {/* Floating decorative icons */}
        <div className="dl-float"><RiHeartPulseLine /></div>
        <div className="dl-float"><RiStethoscopeLine /></div>
        <div className="dl-float"><MdLocalHospital /></div>

        <div className="dl-wrap">
          <div className="dl-card">

            {/* Logo */}
            <div className="dl-sb-logo">
  <div className="dl-sb-logo-icon"><RiHeartPulseLine /></div>
  <div>
    <div className="dl-sb-logo-name">
      Medi<span style={{ color: "#ffffff", fontWeight: 800 }}>Care</span><span style={{ color: "#00d4ff", fontWeight: 800 }}>Plus</span>
    </div>
    <div className="dl-sb-logo-role">
      <span style={{ 
        display: "inline-block", 
        width: 7, height: 7, 
        borderRadius: "50%", 
        background: "#22c55e",
        boxShadow: "0 0 6px rgba(34,197,94,0.6)",
        marginRight: 6 
      }}></span>
      Doctor Portal
    </div>
  </div>
</div>
            {/* Badge */}
            <div className="dl-badge">
              <div className="dl-badge-dot" />
              <RiStethoscopeLine />
              Doctor Access
            </div>

            {/* Title */}
            <div className="dl-title">Welcome, Doctor</div>
            <div className="dl-sub">Sign in to your dashboard to manage appointments and patients.</div>

            {/* Error */}
            {error && (
              <div className="dl-error">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin}>
              <div className="dl-group">
                <div className="dl-label"><FiMail /> Email Address</div>
                <div className="dl-input-wrap">
                  <input
                    className="dl-input"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                  <FiMail className="dl-input-icon" />
                </div>
              </div>

              <div className="dl-group">
                <div className="dl-label"><FiLock /> Password</div>
                <div className="dl-input-wrap">
                  <input
                    className="dl-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <FiLock className="dl-input-icon" />
                  <button
                    type="button"
                    className="dl-eye"
                    onClick={() => setShowPass(p => !p)}
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="dl-btn"
                disabled={loading || !form.email || !form.password}
              >
                {loading ? (
                  <><div className="dl-spin" /> Signing in...</>
                ) : (
                  <>Sign In <FiArrowRight /></>
                )}
              </button>
            </form>

            <div className="dl-divider">
              <div className="dl-divider-line" />
              <div className="dl-divider-text">Secure Portal</div>
              <div className="dl-divider-line" />
            </div>

            <div className="dl-secure">
              <FiLock /> Doctor credentials are managed by admin
            </div>

            <div className="dl-footer">
              Not a doctor? <a onClick={() => navigate("/login")}>Patient Login</a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}