import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  Pending:   "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Confirmed: "bg-blue-100 text-blue-800 border border-blue-300",
  Completed: "bg-green-100 text-green-800 border border-green-300",
  Cancelled: "bg-red-100 text-red-800 border border-red-300",
};

const STATUSES = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

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

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [toast, setToast]               = useState(null);
  const [detailAppt, setDetailAppt]     = useState(null);
  const [updating, setUpdating]         = useState(null);

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await axios.get(`${API}/api/admin/appointments`, { params, headers });
      setAppointments(res.data.appointments || []);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [page, statusFilter]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchAppointments(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateStatus = async (id, status) => {
    setUpdating(id + status);
    try {
      await axios.patch(`${API}/api/admin/appointments/${id}/status`, { status }, { headers });
      showToast(`Appointment ${status}!`);
      fetchAppointments();
      if (detailAppt?._id === id) setDetailAppt(prev => ({ ...prev, status }));
    } catch {
      showToast("Update failed", "error");
    } finally {
      setUpdating(null);
    }
  };

  const fmt = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || STATUS_COLORS.Pending}`}>
      {status}
    </span>
  );

  const ActionBtns = ({ appt, small }) => {
    const sz = small ? "px-2.5 py-1" : "px-3.5 py-1.5";
    return (
      <div className="flex gap-1.5 flex-wrap">
        {appt.status === "Pending" && <>
          <button className={`${sz} rounded-lg border border-blue-300 bg-blue-50 text-blue-800 text-xs font-semibold cursor-pointer ${updating ? "opacity-60" : ""}`} onClick={() => updateStatus(appt._id, "Confirmed")}>✓ Confirm</button>
          <button className={`${sz} rounded-lg border border-red-300 bg-red-50 text-red-800 text-xs font-semibold cursor-pointer ${updating ? "opacity-60" : ""}`} onClick={() => updateStatus(appt._id, "Cancelled")}>✕ Cancel</button>
        </>}
        {appt.status === "Confirmed" && <>
          <button className={`${sz} rounded-lg border border-green-300 bg-green-50 text-green-800 text-xs font-semibold cursor-pointer ${updating ? "opacity-60" : ""}`} onClick={() => updateStatus(appt._id, "Completed")}>✔ Complete</button>
          <button className={`${sz} rounded-lg border border-red-300 bg-red-50 text-red-800 text-xs font-semibold cursor-pointer ${updating ? "opacity-60" : ""}`} onClick={() => updateStatus(appt._id, "Cancelled")}>✕ Cancel</button>
        </>}
        {(appt.status === "Completed" || appt.status === "Cancelled") && (
          <span className="text-xs text-slate-400">No actions</span>
        )}
      </div>
    );
  };

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
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Appointments</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage all patient appointments · {total} total</p>
      </div>

      {/* Status Tab Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold cursor-pointer transition-all
              ${statusFilter === s
                ? "border-sky-400 bg-sky-50 text-sky-700"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
          placeholder="Search patient name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1fr_1.5fr] bg-slate-50 border-b border-slate-200 px-5 py-3">
          {["Patient", "Doctor", "Date", "Time", "Status", "Actions"].map(h => (
            <div key={h} className="text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm font-medium text-slate-500">No appointments found</div>
          </div>
        ) : (
          appointments.map((appt, i) => (
            <div key={appt._id}
              className={`grid grid-cols-[1.5fr_1.2fr_1fr_1fr_1fr_1.5fr] px-5 py-3.5 items-center
                ${i < appointments.length - 1 ? "border-b border-slate-100" : ""}
                ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>

              {/* Patient */}
              <div>
                <div className="text-sm font-semibold text-slate-800">{appt.patientName || "—"}</div>
                <div className="text-xs text-slate-400 mt-0.5">{appt.patientEmail || "—"}</div>
              </div>

              {/* Doctor */}
              <div className="flex items-center gap-2">
                {appt.doctor?.photo ? (
                  <img src={appt.doctor.photo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {appt.doctor?.name?.[0] || "D"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-800">Dr. {appt.doctor?.name || "—"}</div>
                  <div className="text-xs text-slate-400">{appt.doctor?.specialist || "—"}</div>
                </div>
              </div>

              {/* Date */}
              <div className="text-sm text-slate-500">{fmt(appt.appointmentDate)}</div>

              {/* Time */}
              <div className="text-sm text-slate-500">{appt.appointmentTime || "—"}</div>

              {/* Status */}
              <div><StatusBadge status={appt.status} /></div>

              {/* Actions */}
              <div className="flex gap-1.5 items-center">
                <ActionBtns appt={appt} small />
                <button
                  onClick={() => setDetailAppt(appt)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs cursor-pointer hover:border-slate-300">
                  👁
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 items-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${page === 1 ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer"}`}>
            ← Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl border text-sm font-semibold cursor-pointer transition-all
                ${page === i + 1 ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all
              ${page === totalPages ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-500 hover:border-slate-300 cursor-pointer"}`}>
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailAppt && (
        <Modal onClose={() => setDetailAppt(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="px-7 pt-6 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Appointment Details</h2>
              <button onClick={() => setDetailAppt(null)} className="w-8 h-8 rounded-xl border-none bg-slate-100 cursor-pointer text-slate-500 flex items-center justify-center hover:bg-slate-200">✕</button>
            </div>

            <div className="px-7 pt-5 pb-7">

              {/* Status */}
              <div className="flex justify-center mb-5">
                <StatusBadge status={detailAppt.status} />
              </div>

              {/* Patient Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-3.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">Patient Info</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["Name", detailAppt.patientName],
                    ["Email", detailAppt.patientEmail],
                    ["Phone", detailAppt.patientPhone || "—"],
                    ["Age", detailAppt.patientAge || "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                      <div className="text-sm font-medium text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-3.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">Doctor Info</div>
                <div className="flex items-center gap-3">
                  {detailAppt.doctor?.photo ? (
                    <img src={detailAppt.doctor.photo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                      {detailAppt.doctor?.name?.[0] || "D"}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Dr. {detailAppt.doctor?.name || "—"}</div>
                    <div className="text-xs text-slate-400">{detailAppt.doctor?.specialist || "—"}</div>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="bg-slate-50 rounded-2xl p-4 mb-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">Appointment Info</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["Date", fmt(detailAppt.appointmentDate)],
                    ["Time", detailAppt.appointmentTime || "—"],
                    ["Booked At", fmt(detailAppt.bookedAt)],
                    ["Type", detailAppt.appointmentType || "In-person"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                      <div className="text-sm font-medium text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>
                {detailAppt.symptoms && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-400 mb-1">Symptoms</div>
                    <div className="text-sm text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">{detailAppt.symptoms}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(detailAppt.status === "Pending" || detailAppt.status === "Confirmed") && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">Update Status</div>
                  <ActionBtns appt={detailAppt} />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}