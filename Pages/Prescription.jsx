import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiSave, FiDownload, FiPlus, FiX, FiFileText } from "react-icons/fi";
import { RiHeartPulseLine } from "react-icons/ri";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Prescription() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const doctorToken  = localStorage.getItem("doctor-token");
  const patientToken = localStorage.getItem("access-token");
  const role  = doctorToken ? "doctor" : "patient";
  const token = doctorToken || patientToken;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved]             = useState(false);
  const [toast, setToast]             = useState(null);

  const [notes, setNotes]       = useState("");
  const [medicines, setMedicines] = useState([""]);

  useEffect(() => {
    axios.get(`${API}/api/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const apt = res.data.appointment;
      setAppointment(apt);
      if (apt.prescriptionNotes) setNotes(apt.prescriptionNotes);
      if (apt.medicines?.length)  setMedicines(apt.medicines);
    })
    .catch(() => showToast("Failed to load appointment", "error"))
    .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addMedicine = () => setMedicines(prev => [...prev, ""]);
  const removeMedicine = (i) => setMedicines(prev => prev.filter((_, idx) => idx !== i));
  const updateMedicine = (i, val) => setMedicines(prev => prev.map((m, idx) => idx === i ? val : m));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/api/appointments/${appointmentId}/prescription`, {
        prescriptionNotes: notes,
        medicines: medicines.filter(m => m.trim()),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaved(true);
      showToast("Prescription saved! Status → Completed ✅");
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(`${API}/api/appointments/${appointmentId}/prescription`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `prescription-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { showToast("Download failed", "error"); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#00d4ff", fontFamily: "Cabinet Grotesk, sans-serif" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(0,212,255,0.2)", borderTopColor: "#00d4ff", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div>Loading...</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d1a; }
        .rx-page { min-height: 100vh; background: #050d1a; font-family: 'Cabinet Grotesk', sans-serif; color: #e2e8f0; }

        .rx-header {
          padding: 16px 28px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
          backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 10;
        }
        .rx-logo { display: flex; align-items: center; gap: 10px; color: #00d4ff; font-size: 20px; }
        .rx-logo-text { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; }
        .rx-header-actions { display: flex; gap: 10px; }

        .rx-save-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 11px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .rx-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,212,255,0.3); }
        .rx-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rx-dl-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 20px; border-radius: 11px;
          border: 1px solid rgba(0,212,255,0.2);
          background: rgba(0,212,255,0.06);
          color: #00d4ff; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .rx-dl-btn:hover:not(:disabled) { background: rgba(0,212,255,0.12); }
        .rx-dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rx-content { max-width: 860px; margin: 0 auto; padding: 28px 20px; }

        .rx-title { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .rx-sub { font-size: 13px; color: #475569; margin-bottom: 28px; }

        .rx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        @media(max-width: 640px) { .rx-grid { grid-template-columns: 1fr; } }

        .rx-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; padding: 20px;
        }
        .rx-card-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 14px; font-weight: 700; color: #f1f5f9;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .rx-card-title svg { color: #00d4ff; }

        .rx-info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; }
        .rx-info-row:last-child { border-bottom: none; }
        .rx-info-label { color: #475569; font-weight: 600; }
        .rx-info-val { color: #e2e8f0; text-align: right; }

        .rx-status {
          display: inline-flex; align-items: center; padding: 3px 10px;
          border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;
        }

        /* Doctor write section */
        .rx-write-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; padding: 24px;
          margin-bottom: 20px;
        }

        .rx-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }

        .rx-textarea {
          width: 100%; min-height: 160px;
          padding: 14px; resize: vertical;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 13px; color: #e2e8f0;
          font-size: 14px; font-family: inherit; outline: none;
          line-height: 1.7; transition: border-color 0.2s;
        }
        .rx-textarea::placeholder { color: #334155; }
        .rx-textarea:focus { border-color: rgba(0,212,255,0.3); }

        .rx-med-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .rx-med-input {
          flex: 1; padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 11px; color: #e2e8f0;
          font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s;
        }
        .rx-med-input::placeholder { color: #334155; }
        .rx-med-input:focus { border-color: rgba(0,212,255,0.3); }
        .rx-med-num {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(0,212,255,0.08);
          border: 1px solid rgba(0,212,255,0.15);
          color: #00d4ff; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rx-med-del {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.15);
          color: #f87171; cursor: pointer; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.2s;
        }
        .rx-med-del:hover { background: rgba(248,113,113,0.15); }
        .rx-add-med {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          border: 1.5px dashed rgba(0,212,255,0.2);
          background: transparent; color: #00d4ff;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: inherit; transition: all 0.2s; margin-top: 8px;
        }
        .rx-add-med:hover { background: rgba(0,212,255,0.05); }

        /* Patient view */
        .rx-patient-view {
          background: rgba(0,212,255,0.04);
          border: 1px solid rgba(0,212,255,0.1);
          border-radius: 18px; padding: 24px;
          text-align: center;
        }
        .rx-patient-icon { font-size: 48px; margin-bottom: 12px; }
        .rx-patient-title { font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
        .rx-patient-sub { font-size: 13px; color: #475569; margin-bottom: 20px; line-height: 1.6; }

        .rx-preview-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: left;
        }
        .rx-preview-title { font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
        .rx-preview-notes { font-size: 13px; color: #94a3b8; line-height: 1.7; white-space: pre-wrap; }
        .rx-preview-med { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #e2e8f0; }
        .rx-preview-med:last-child { border-bottom: none; }

        .rx-not-ready { color: #334155; font-size: 13px; font-style: italic; }

        .rx-toast {
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 12px 20px; border-radius: 12px; font-size: 13px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Cabinet Grotesk', sans-serif;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {toast && (
        <div className="rx-toast" style={{
          background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
          color: toast.type === "success" ? "#22c55e" : "#f87171",
        }}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      <div className="rx-page px-20 py-20">
        {/* Header */}
        <div className="rx-header">
          
          <div className="rx-header-actions">
            {role === "doctor" && (
              <button className="rx-save-btn" onClick={handleSave} disabled={saving}>
                <FiSave /> {saving ? "Saving..." : "Save & Complete"}
              </button>
            )}
            <button className="rx-dl-btn" onClick={handleDownload} disabled={downloading}>
              <FiDownload /> {downloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>

        <div className="rx-content">
          <div className="rx-title">
            {role === "doctor" ? "Write Prescription" : "My Prescription"}
          </div>
          <div className="rx-sub">
            {role === "doctor"
              ? "Fill in the prescription details and save to complete the appointment."
              : "Download your prescription PDF below."}
          </div>

          {/* Info cards */}
          <div className="rx-grid">
            {/* Patient info */}
            <div className="rx-card">
              <div className="rx-card-title"><FiFileText /> Patient Info</div>
              {[
                ["Name",    appointment?.patientName || "—"],
                ["Phone",   appointment?.patientPhone || "—"],
                ["Problem", appointment?.problem || "—"],
                ["Date",    appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"],
                ["Time",    appointment?.appointmentTime || "—"],
              ].map(([label, val]) => (
                <div key={label} className="rx-info-row">
                  <span className="rx-info-label">{label}</span>
                  <span className="rx-info-val">{val}</span>
                </div>
              ))}
              <div className="rx-info-row">
                <span className="rx-info-label">Status</span>
                <span className="rx-status" style={{
                  background: appointment?.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(0,212,255,0.1)",
                  color: appointment?.status === "Completed" ? "#22c55e" : "#00d4ff",
                }}>
                  {appointment?.status}
                </span>
              </div>
            </div>

            {/* Doctor info */}
            <div className="rx-card">
              <div className="rx-card-title"><RiHeartPulseLine /> Doctor Info</div>
              {[
                ["Appointment ID", appointment?._id?.toString().slice(-8).toUpperCase() || "—"],
                ["Payment", appointment?.paymentStatus === "paid" ? "✅ Paid" : "Pending"],
              ].map(([label, val]) => (
                <div key={label} className="rx-info-row">
                  <span className="rx-info-label">{label}</span>
                  <span className="rx-info-val">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor — write prescription */}
          {role === "doctor" && (
            <div className="rx-write-card">
              <div style={{ marginBottom: 20 }}>
                <label className="rx-label">Prescription Notes / Diagnosis</label>
                <textarea
                  className="rx-textarea"
                  placeholder="Write diagnosis, instructions, follow-up advice..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="rx-label">Prescribed Medicines</label>
                {medicines.map((med, i) => (
                  <div key={i} className="rx-med-row">
                    <div className="rx-med-num">{i + 1}</div>
                    <input
                      className="rx-med-input"
                      placeholder={`Medicine ${i + 1} (e.g. Paracetamol 500mg — 1 tablet 3x daily)`}
                      value={med}
                      onChange={e => updateMedicine(i, e.target.value)}
                    />
                    {medicines.length > 1 && (
                      <button className="rx-med-del" onClick={() => removeMedicine(i)}>
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
                <button className="rx-add-med" onClick={addMedicine}>
                  <FiPlus /> Add Medicine
                </button>
              </div>
            </div>
          )}

          {/* Patient — view + download */}
          {role === "patient" && (
            <div>
              {/* Preview */}
              {(appointment?.prescriptionNotes || appointment?.medicines?.length > 0) ? (
                <div style={{ marginBottom: 20 }}>
                  {appointment?.prescriptionNotes && (
                    <div className="rx-preview-card">
                      <div className="rx-preview-title">Doctor's Notes</div>
                      <div className="rx-preview-notes">{appointment.prescriptionNotes}</div>
                    </div>
                  )}
                  {appointment?.medicines?.length > 0 && (
                    <div className="rx-preview-card">
                      <div className="rx-preview-title">Prescribed Medicines</div>
                      {appointment.medicines.map((m, i) => (
                        <div key={i} className="rx-preview-med">
                          <span style={{ color: "#00d4ff", fontWeight: 700, fontSize: 12 }}>{i + 1}.</span> {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rx-patient-view" style={{ marginBottom: 20 }}>
                  <div className="rx-patient-icon">📋</div>
                  <div className="rx-patient-title">Prescription Not Ready</div>
                  <div className="rx-patient-sub">
                    Your doctor hasn't written the prescription yet.<br />
                    Please check back after your consultation.
                  </div>
                </div>
              )}

              {/* Download button */}
              <div style={{ textAlign: "center" }}>
                <button className="rx-dl-btn" onClick={handleDownload} disabled={downloading}
                  style={{ padding: "13px 32px", fontSize: 14 }}>
                  <FiDownload /> {downloading ? "Downloading..." : "Download PDF Prescription"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}