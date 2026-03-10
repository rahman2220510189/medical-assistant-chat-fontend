import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiPhone, FiSave, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { getDoctorToken, getDoctorInfo } from "./DoctorDashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function DoctorProfile() {
  const token    = getDoctorToken();
  const navigate = useNavigate();
  const fileRef  = useRef();

  const [doctor, setDoctor]         = useState(getDoctorInfo());
  const [form, setForm]             = useState({ name: "", phone: "", about: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const [pwForm, setPwForm]         = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [pwSaving, setPwSaving]     = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/doctor/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const d = res.data.doctor;
        setDoctor(d);
        setForm({ name: d.name || "", phone: d.phone || "", about: d.about || "" });
        setPhotoPreview(d.photo || null);
      })
      .catch(e => { if (e.response?.status === 403) navigate("/doctor/login"); });
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("about", form.about);
      if (photoFile) fd.append("photo", photoFile);

      await axios.put(`${API}/api/doctors/${doctor._id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      // Update localStorage
      const updated = { ...doctor, ...form, photo: photoPreview };
      localStorage.setItem("doctor-info", JSON.stringify(updated));
      showToast("Profile updated!");
    } catch { showToast("Update failed", "error"); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return showToast("Passwords don't match", "error");
    if (pwForm.newPw.length < 6) return showToast("Min 6 characters", "error");
    setPwSaving(true);
    try {
      await axios.patch(`${API}/api/doctor/change-password`,
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Password changed!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setPwSaving(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 12, color: "#e2e8f0",
    fontSize: 13, fontFamily: "Cabinet Grotesk, sans-serif",
    outline: "none", boxSizing: "border-box",
  };
  const lbl = {
    fontSize: 11, fontWeight: 700, color: "#475569",
    textTransform: "uppercase", letterSpacing: "0.8px",
    marginBottom: 7, display: "block",
  };

  return (
    <>
      <style>{`
        .dp-title { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .dp-sub { font-size: 13px; color: #475569; margin-bottom: 28px; }
        .dp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media(max-width:768px){ .dp-grid { grid-template-columns: 1fr; } }
        .dp-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 24px;
        }
        .dp-card-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 15px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }
        .dp-card-title svg { color: #00d4ff; }
        .dp-field { margin-bottom: 16px; }
        .dp-save-btn {
          width: 100%; padding: 12px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; margin-top: 8px;
        }
        .dp-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,212,255,0.3); }
        .dp-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .dp-photo-wrap {
          display: flex; align-items: center; gap: 16px;
          padding: 16px; background: rgba(255,255,255,0.02);
          border: 1.5px dashed rgba(255,255,255,0.08);
          border-radius: 14px; cursor: pointer; margin-bottom: 20px;
          transition: border-color 0.2s;
        }
        .dp-photo-wrap:hover { border-color: rgba(0,212,255,0.3); }
        .dp-photo {
          width: 64px; height: 64px; border-radius: 16px;
          object-fit: cover; border: 2px solid rgba(0,212,255,0.2);
          flex-shrink: 0;
        }
        .dp-photo-ph {
          width: 64px; height: 64px; border-radius: 16px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif; font-size: 24px; font-weight: 700;
          color: #00d4ff; border: 2px solid rgba(0,212,255,0.2); flex-shrink: 0;
        }

        .dp-pw-wrap { position: relative; }
        .dp-pw-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          color: #334155; cursor: pointer; background: none; border: none;
          font-size: 15px; transition: color 0.2s;
        }
        .dp-pw-eye:hover { color: #00d4ff; }

        .dp-info-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 11px; margin-bottom: 10px;
          font-size: 13px; color: #94a3b8;
        }
        .dp-info-row svg { color: #00d4ff; font-size: 15px; flex-shrink: 0; }
        .dp-info-label { font-size: 10px; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }

        .dp-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Cabinet Grotesk', sans-serif;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
      `}</style>

      {toast && (
        <div className="dp-toast" style={{
          background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: toast.type === "success" ? "#22c55e" : "#f87171",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <div className="dp-title">My Profile</div>
      <div className="dp-sub">Manage your personal information and account settings</div>

      <div className="dp-grid">
        {/* Left — Edit Info */}
        <div>
          <div className="dp-card">
            <div className="dp-card-title"><FiUser /> Personal Information</div>

            {/* Photo */}
            <div className="dp-photo-wrap" onClick={() => fileRef.current.click()}>
              {photoPreview
                ? <img src={photoPreview} alt="photo" className="dp-photo" />
                : <div className="dp-photo-ph">{doctor.name?.[0]?.toUpperCase()}</div>
              }
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Update Photo</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Click to change · JPG, PNG</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </div>

            <form onSubmit={handleSave}>
              <div className="dp-field">
                <label style={lbl}>Full Name</label>
                <input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. Name" />
              </div>
              <div className="dp-field">
                <label style={lbl}>Phone</label>
                <input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+880..." />
              </div>
              <div className="dp-field">
                <label style={lbl}>About</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: 80 }} value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} placeholder="Brief description..." />
              </div>
              <button type="submit" className="dp-save-btn" disabled={saving}>
                <FiSave /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Info + Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Read-only info */}
          <div className="dp-card">
            <div className="dp-card-title"><FiMail /> Account Info</div>
            <div className="dp-info-row">
              <FiMail />
              <div>
                <div className="dp-info-label">Email</div>
                <div>{doctor.email}</div>
              </div>
            </div>
            <div className="dp-info-row">
              <FiUser />
              <div>
                <div className="dp-info-label">Specialist</div>
                <div>{doctor.specialist}</div>
              </div>
            </div>
            <div className="dp-info-row">
              <FiPhone />
              <div>
                <div className="dp-info-label">Experience</div>
                <div>{doctor.experience} years</div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="dp-card">
            <div className="dp-card-title"><FiLock /> Change Password</div>
            <form onSubmit={handlePasswordChange}>
              {[
                { key: "current", label: "Current Password", placeholder: "Current password" },
                { key: "newPw",   label: "New Password",     placeholder: "Min 6 characters" },
                { key: "confirm", label: "Confirm Password", placeholder: "Repeat new password" },
              ].map(({ key, label, placeholder }) => (
                <div className="dp-field" key={key}>
                  <label style={lbl}>{label}</label>
                  <div className="dp-pw-wrap">
                    <input
                      style={{ ...inp, paddingRight: 40 }}
                      type={showPw[key] ? "text" : "password"}
                      placeholder={placeholder}
                      value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                      required
                    />
                    <button type="button" className="dp-pw-eye" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
                      {showPw[key] ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" className="dp-save-btn" disabled={pwSaving}
                style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
                <FiLock /> {pwSaving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}