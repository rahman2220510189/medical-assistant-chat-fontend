import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Modal({ onClose, children }) {
  return ReactDOM.createPortal(
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 bg-black/50 z-[2147483647] flex items-center justify-center p-4 backdrop-blur-sm"
    >
      {children}
    </div>,
    document.body
  );
}

export default function AdminPatients() {
  const [patients, setPatients]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [toast, setToast]               = useState(null);
  const [detailPatient, setDetailPatient] = useState(null);

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await axios.get(`${API}/api/admin/patients`, { params, headers });
      setPatients(res.data.patients || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [page]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchPatients(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
  };

  const Avatar = ({ patient, size = "sm" }) => {
    const s = size === "sm" ? "w-9 h-9 text-sm" : "w-14 h-14 text-xl";
    if (patient.photoURL) {
      return <img src={patient.photoURL} alt={patient.name} className={`${s} rounded-xl object-cover`} />;
    }
    return (
      <div className={`${s} rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white font-bold`}>
        {patient.name?.[0]?.toUpperCase() || "P"}
      </div>
    );
  };

  const RoleBadge = ({ role }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
      ${role === "admin"
        ? "bg-violet-100 text-violet-800 border-violet-300"
        : "bg-slate-100 text-slate-600 border-slate-300"}`}>
      {role === "admin" ? "⚙ Admin" : "👤 User"}
    </span>
  );

  return (
    <div className="font-sans p-8 py-20 px-20">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2147483647] px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl border
          ${toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Patients</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage all registered patients · {total} total</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3.5 mb-6 flex-wrap">
        {[
          { icon: "👥", val: total, lbl: "Total Patients" },
          { icon: "✅", val: patients.filter(p => p.appointmentCount > 0).length, lbl: "Active Patients" },
          { icon: "🆕", val: patients.filter(p => {
            const d = new Date(p.createdAt);
            return new Date() - d < 7 * 24 * 60 * 60 * 1000;
          }).length, lbl: "New This Week" },
          { icon: "⚙", val: patients.filter(p => p.role === "admin").length, lbl: "Admins" },
        ].map(({ icon, val, lbl }) => (
          <div key={lbl} className="flex-1 min-w-[130px] bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xl mb-1.5">{icon}</div>
            <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>{val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{lbl}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] bg-slate-50 border-b border-slate-200 px-5 py-3">
          {["Patient", "Email", "Phone", "Joined", "Appointments", "Role"].map(h => (
            <div key={h} className="text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-sm font-medium text-slate-500">No patients found</div>
          </div>
        ) : (
          patients.map((patient, i) => (
            <div key={patient._id}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_0.5fr] px-5 py-3.5 items-center cursor-pointer hover:bg-sky-50/40 transition-colors
                ${i < patients.length - 1 ? "border-b border-slate-100" : ""}
                ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
              onClick={() => setDetailPatient(patient)}>

              {/* Patient */}
              <div className="flex items-center gap-3">
                <Avatar patient={patient} size="sm" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">{patient.name || "—"}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{patient.email}</div>
                </div>
              </div>

              {/* Email */}
              <div className="text-sm text-slate-500 truncate">{patient.email || "—"}</div>

              {/* Phone */}
              <div className="text-sm text-slate-500">{patient.phone || "—"}</div>

              {/* Joined */}
              <div className="text-sm text-slate-500">{fmt(patient.createdAt)}</div>

              {/* Appointments */}
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border
                  ${patient.appointmentCount > 0
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                  {patient.appointmentCount || 0} appts
                </span>
              </div>

              {/* Role */}
              <div><RoleBadge role={patient.role} /></div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 items-center">
          <button
            onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${page === 1 ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer"}`}>
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); setPage(i + 1); }}
              className={`w-9 h-9 rounded-xl border text-sm font-semibold cursor-pointer transition-all
                ${page === i + 1 ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              {i + 1}
            </button>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${page === totalPages ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer"}`}>
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailPatient && (
        <Modal onClose={() => setDetailPatient(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[88vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="px-7 pt-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Patient Details</h2>
              <button onClick={() => setDetailPatient(null)} className="w-8 h-8 rounded-xl bg-slate-100 border-none cursor-pointer text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>

            <div className="px-7 pt-5 pb-7">

              {/* Avatar + Name */}
              <div className="flex flex-col items-center mb-6">
                <Avatar patient={detailPatient} size="lg" />
                <div className="mt-3 text-center">
                  <div className="text-base font-bold text-slate-900">{detailPatient.name || "—"}</div>
                  <div className="text-sm text-slate-400 mt-0.5">{detailPatient.email}</div>
                  <div className="mt-2"><RoleBadge role={detailPatient.role} /></div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Info</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Phone", detailPatient.phone || "—"],
                    ["Joined", fmt(detailPatient.createdAt)],
                    ["Appointments", `${detailPatient.appointmentCount || 0} total`],
                    ["Role", detailPatient.role === "admin" ? "Admin" : "Patient"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                      <div className="text-sm font-medium text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note about role management */}
              <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
                <div className="text-xs font-bold text-violet-400 uppercase tracking-wide mb-1">Role Management</div>
                <div className="text-sm text-violet-600">
                  To change this user's role, go to <span className="font-semibold">Settings → User Role Management</span>.
                </div>
              </div>

            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}