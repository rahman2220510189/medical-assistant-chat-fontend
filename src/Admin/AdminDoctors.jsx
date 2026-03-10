import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SPECIALISTS = [
  "Cardiologist","Dermatologist","Neurologist","Orthopedic","Pediatrician",
  "Psychiatrist","Gynecologist","Urologist","Gastroenterologist","Pulmonologist",
  "Endocrinologist","Ophthalmologist","ENT","Hepatologist","Nephrologist",
  "Rheumatologist","Oncologist","General Physician","Infectious Disease Specialist","Allergist",
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","12:30 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM",
  "04:00 PM","04:30 PM","05:00 PM","05:30 PM",
];
const defaultForm = {
  name:"",email:"",phone:"",specialist:"",experience:"",
  consultationFee:"",about:"",qualifications:"",availability:[],password:"",
};

// ─── Portal Modal — renders into document.body, above everything ───
function Modal({ onClose, children }) {
  return ReactDOM.createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position:"fixed", top:0, left:0, right:0, bottom:0,
        background:"rgba(0,0,0,0.55)",
        zIndex:2147483647,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"16px", backdropFilter:"blur(4px)",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export default function AdminDoctors() {
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editDoctor, setEditDoctor]     = useState(null);
  const [form, setForm]                 = useState(defaultForm);
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [search, setSearch]             = useState("");
  const [filterSpec, setFilterSpec]     = useState("");
  const [deleteId, setDeleteId]         = useState(null);
  const [toast, setToast]               = useState(null);
  const fileRef = useRef();

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)     params.search     = search;
      if (filterSpec) params.specialist = filterSpec;
      const res = await axios.get(`${API}/api/doctors`, { params });
      setDoctors(res.data.doctors || []);
    } catch { showToast("Failed to load doctors", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, [search, filterSpec]);

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

  const toggleDay = (day) => {
    setForm(prev => {
      const exists = prev.availability.find(a => a.day === day);
      if (exists) return { ...prev, availability: prev.availability.filter(a => a.day !== day) };
      return { ...prev, availability: [...prev.availability, { day, slots: [] }] };
    });
  };

  const toggleSlot = (day, time) => {
    setForm(prev => ({
      ...prev,
      availability: prev.availability.map(a => {
        if (a.day !== day) return a;
        const has = a.slots.find(s => s.time === time);
        return { ...a, slots: has ? a.slots.filter(s => s.time !== time) : [...a.slots, { time, isBooked: false }] };
      }),
    }));
  };

  const openAdd = () => {
    setEditDoctor(null); setForm(defaultForm);
    setPhotoFile(null); setPhotoPreview(null); setShowModal(true);
  };

  const openEdit = (doc) => {
    setEditDoctor(doc);
    setForm({
      name: doc.name||"", email: doc.email||"", phone: doc.phone||"",
      specialist: doc.specialist||"", experience: doc.experience||"",
      consultationFee: doc.consultationFee||"", about: doc.about||"",
      qualifications: (doc.qualifications||[]).join(", "),
      availability: doc.availability||[],
      password: "",
    });
    setPhotoPreview(doc.photo||null); setPhotoFile(null); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "availability") fd.append(k, JSON.stringify(v));
        else if (k === "qualifications") fd.append(k, JSON.stringify(v.split(",").map(s=>s.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      if (photoFile) fd.append("photo", photoFile);
      if (editDoctor) {
        await axios.put(`${API}/api/doctors/${editDoctor._id}`, fd, { headers: { ...headers, "Content-Type":"multipart/form-data" } });
        showToast("Doctor updated!");
      } else {
        await axios.post(`${API}/api/doctors`, fd, { headers: { ...headers, "Content-Type":"multipart/form-data" } });
        showToast("Doctor added!");
      }
      setShowModal(false); fetchDoctors();
    } catch(e) { showToast(e.response?.data?.message || "Something went wrong", "error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API}/api/doctors/${deleteId}`, { headers });
      showToast("Doctor removed"); setDeleteId(null); fetchDoctors();
    } catch { showToast("Delete failed", "error"); }
  };

  const inp = {
    width:"100%", padding:"10px 14px", borderRadius:11, border:"1.5px solid #e2e8f0",
    fontSize:13.5, fontFamily:"inherit", outline:"none", background:"#f8fafc", color:"#0f172a",
    boxSizing:"border-box",
  };
  const lbl = {
    display:"block", fontSize:12, fontWeight:600, color:"#475569",
    marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px",
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", padding:"32px 40px", margin:"40px" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:2147483647,
          padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:500,
          display:"flex", alignItems:"center", gap:8,
          background: toast.type==="success" ? "#f0fdf4" : "#fef2f2",
          color: toast.type==="success" ? "#16a34a" : "#dc2626",
          border: `1px solid ${toast.type==="success" ? "#bbf7d0" : "#fecaca"}`,
          boxShadow:"0 8px 30px rgba(0,0,0,0.12)",
        }}>
          {toast.type==="success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#0f172a" }}>Doctors</div>
          <div style={{ fontSize:13, color:"#94a3b8", marginTop:2 }}>Manage all registered doctors</div>
        </div>
        <button onClick={openAdd} style={{
          display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:12,
          background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"white", border:"none",
          cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit",
          boxShadow:"0 4px 15px rgba(14,165,233,0.3)",
        }}>
          ＋ Add Doctor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { icon:"⚕", val:doctors.length, lbl:"Total Doctors" },
          { icon:"🟢", val:doctors.filter(d=>d.isOnline).length, lbl:"Online Now" },
          { icon:"🔴", val:doctors.filter(d=>d.isBusy).length, lbl:"In Consultation" },
          { icon:"⭐", val:(doctors.reduce((a,d)=>a+(d.rating||0),0)/(doctors.length||1)).toFixed(1), lbl:"Avg Rating" },
        ].map(({ icon, val, lbl: l }) => (
          <div key={l} style={{ flex:1, minWidth:140, background:"white", borderRadius:16, padding:"16px 20px", border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#0f172a" }}>{val}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }}>🔍</span>
          <input style={{ ...inp, paddingLeft:38 }} placeholder="Search by name or specialist..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select style={{ ...inp, width:"auto", cursor:"pointer" }} value={filterSpec} onChange={e=>setFilterSpec(e.target.value)}>
          <option value="">All Specialists</option>
          {SPECIALISTS.map(s=><option key={s}>{s}</option>)}
        </select>
        {(search||filterSpec) && (
          <button style={{ padding:"10px 16px", borderRadius:11, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:13, color:"#475569", fontFamily:"inherit" }} onClick={()=>{ setSearch(""); setFilterSpec(""); }}>✕ Clear</button>
        )}
      </div>

      {/* Doctor Grid */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {[...Array(6)].map((_,i)=>(
            <div key={i} style={{ background:"white", borderRadius:20, padding:20, border:"1px solid #e2e8f0" }}>
              <div style={{ display:"flex", gap:14, marginBottom:14 }}>
                <div style={{ width:64, height:64, borderRadius:16, background:"#e2e8f0" }} />
                <div style={{ flex:1 }}>
                  <div style={{ height:16, background:"#e2e8f0", borderRadius:8, marginBottom:8 }} />
                  <div style={{ height:12, background:"#e2e8f0", borderRadius:8, width:"60%" }} />
                </div>
              </div>
              <div style={{ height:36, background:"#e2e8f0", borderRadius:10 }} />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#94a3b8" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⚕</div>
          <div style={{ fontSize:15, fontWeight:500, color:"#64748b" }}>No doctors found</div>
          <div style={{ fontSize:13, marginTop:6 }}>Add your first doctor to get started</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
          {doctors.map(doc=>(
            <div key={doc._id} style={{ background:"white", borderRadius:20, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ padding:"20px 20px 0", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:64, height:64, borderRadius:16, border:"2px solid #e2e8f0", flexShrink:0, background:"linear-gradient(135deg,#0ea5e9,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:22, fontWeight:700, overflow:"hidden" }}>
                  {doc.photo ? <img src={doc.photo} alt={doc.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : doc.name?.[0]?.toUpperCase()||"D"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#0f172a" }}>Dr. {doc.name}</div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(14,165,233,0.08)", color:"#0284c7", fontSize:11, fontWeight:600, padding:"3px 9px", borderRadius:20, marginTop:4 }}>⚕ {doc.specialist}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:6 }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:doc.isBusy?"#ef4444":doc.isOnline?"#22c55e":"#94a3b8", display:"inline-block" }}></span>
                    <span style={{ fontSize:12, color:"#64748b" }}>{doc.isBusy?"In Consultation":doc.isOnline?"Available":"Offline"}</span>
                  </div>
                </div>
              </div>
              <div style={{ padding:"14px 20px" }}>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[`⏳ ${doc.experience}y exp`,`⭐ ${doc.rating}`,`৳ ${doc.consultationFee}`].map(t=>(
                    <span key={t} style={{ fontSize:12, color:"#64748b", background:"#f8fafc", padding:"4px 10px", borderRadius:20, border:"1px solid #e2e8f0" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding:"12px 20px", borderTop:"1px solid #f1f5f9", display:"flex", gap:8 }}>
                <button onClick={()=>openEdit(doc)} style={{ flex:1, padding:8, borderRadius:10, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:13, fontWeight:500, color:"#475569", fontFamily:"inherit" }}>✏ Edit</button>
                <button onClick={()=>setDeleteId(doc._id)} style={{ padding:"8px 14px", borderRadius:10, border:"1.5px solid #fee2e2", background:"white", cursor:"pointer", fontSize:13, color:"#ef4444", fontFamily:"inherit" }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL via Portal ── */}
      {showModal && (
        <Modal onClose={()=>setShowModal(false)}>
          <div style={{ background:"white", borderRadius:24, width:"100%", maxWidth:640, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ padding:"24px 28px 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#0f172a" }}>
                {editDoctor ? "✏ Edit Doctor" : "＋ Add New Doctor"}
              </div>
              <button onClick={()=>setShowModal(false)} style={{ width:34, height:34, borderRadius:10, border:"none", background:"#f1f5f9", cursor:"pointer", fontSize:16, color:"#64748b" }}>✕</button>
            </div>

            <div style={{ padding:"20px 28px 28px" }}>
              {/* Photo */}
              <div onClick={()=>fileRef.current.click()} style={{ display:"flex", alignItems:"center", gap:16, marginBottom:20, padding:16, background:"#f8fafc", borderRadius:16, border:"2px dashed #e2e8f0", cursor:"pointer" }}>
                <div style={{ width:72, height:72, borderRadius:16, background:"linear-gradient(135deg,#0ea5e9,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:26, flexShrink:0, overflow:"hidden" }}>
                  {photoPreview ? <img src={photoPreview} alt="p" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "📷"}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#0f172a" }}>Upload Doctor Photo</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Click to browse · JPG, PNG, WEBP · Max 5MB</div>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display:"none" }} />
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div><label style={lbl}>Full Name *</label><input required style={inp} placeholder="Dr. John Smith" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                  <div><label style={lbl}>Email *</label><input required type="email" style={inp} placeholder="doctor@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                  <div><label style={lbl}>Phone</label><input style={inp} placeholder="+880 1234 567890" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                  <div>
                    <label style={lbl}>Specialist *</label>
                    <select required style={inp} value={form.specialist} onChange={e=>setForm({...form,specialist:e.target.value})}>
                      <option value="">Select specialist</option>
                      {SPECIALISTS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Experience (years) *</label><input required type="number" min="0" style={inp} placeholder="5" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} /></div>
                  <div><label style={lbl}>Consultation Fee (৳)</label><input type="number" min="0" style={inp} placeholder="500" value={form.consultationFee} onChange={e=>setForm({...form,consultationFee:e.target.value})} /></div>
                  <div style={{ gridColumn:"1/-1" }}><label style={lbl}>Qualifications (comma separated)</label><input style={inp} placeholder="MBBS, MD, FCPS" value={form.qualifications} onChange={e=>setForm({...form,qualifications:e.target.value})} /></div>
                  <div style={{ gridColumn:"1/-1" }}><label style={lbl}>About</label><textarea style={{ ...inp, resize:"vertical", minHeight:80 }} placeholder="Brief description..." value={form.about} onChange={e=>setForm({...form,about:e.target.value})} /></div>

                  {/* ✅ Password field */}
                  <div style={{ gridColumn:"1/-1" }}>
                    <label style={lbl}>Password (Doctor Login) {!editDoctor && "*"}</label>
                    <input
                      style={inp}
                      type="password"
                      placeholder={editDoctor ? "Leave blank to keep current password" : "Min 6 characters"}
                      value={form.password}
                      onChange={e=>setForm({...form,password:e.target.value})}
                      required={!editDoctor}
                      minLength={form.password ? 6 : undefined}
                    />
                  </div>

                  {/* Availability */}
                  <div style={{ gridColumn:"1/-1" }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#475569", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>Availability Schedule</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                      {DAYS.map(day=>{
                        const sel = !!form.availability.find(a=>a.day===day);
                        return <span key={day} onClick={()=>toggleDay(day)} style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer", border:`1.5px solid ${sel?"#0ea5e9":"#e2e8f0"}`, background:sel?"rgba(14,165,233,0.08)":"white", color:sel?"#0ea5e9":"#64748b" }}>{day.slice(0,3)}</span>;
                      })}
                    </div>
                    {form.availability.map(avail=>(
                      <div key={avail.day} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#0ea5e9", marginBottom:6 }}>{avail.day} — Select time slots:</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {TIME_SLOTS.map(time=>{
                            const sel = !!avail.slots.find(s=>s.time===time);
                            return <span key={time} onClick={()=>toggleSlot(avail.day,time)} style={{ padding:"5px 11px", borderRadius:8, fontSize:11.5, fontWeight:500, cursor:"pointer", border:`1.5px solid ${sel?"#0ea5e9":"#e2e8f0"}`, background:sel?"rgba(14,165,233,0.08)":"white", color:sel?"#0ea5e9":"#64748b" }}>{time}</span>;
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:24, paddingTop:20, borderTop:"1px solid #f1f5f9" }}>
                  <button type="button" onClick={()=>setShowModal(false)} style={{ padding:"10px 20px", borderRadius:11, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:14, fontWeight:500, color:"#475569", fontFamily:"inherit" }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ padding:"10px 24px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#0ea5e9,#0284c7)", color:"white", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit", opacity:submitting?0.6:1 }}>
                    {submitting ? "⏳ Saving..." : editDoctor ? "✓ Update Doctor" : "＋ Add Doctor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE CONFIRM via Portal ── */}
      {deleteId && (
        <Modal onClose={()=>setDeleteId(null)}>
          <div style={{ background:"white", borderRadius:20, padding:28, width:"100%", maxWidth:380, boxShadow:"0 25px 60px rgba(0,0,0,0.3)", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Remove Doctor?</div>
            <div style={{ fontSize:13, color:"#64748b", marginBottom:20 }}>This action cannot be undone.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setDeleteId(null)} style={{ flex:1, padding:10, borderRadius:11, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", fontSize:14, fontWeight:500, color:"#475569", fontFamily:"inherit" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex:1, padding:10, borderRadius:11, border:"none", background:"#ef4444", color:"white", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>Yes, Remove</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}