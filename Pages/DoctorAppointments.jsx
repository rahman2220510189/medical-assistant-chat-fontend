import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiSearch, FiFilter } from "react-icons/fi";
import { getDoctorToken, getDoctorInfo } from "./DoctorDashboard";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  Pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  Confirmed: { color: "#00d4ff", bg: "rgba(0,212,255,0.1)"   },
  Completed: { color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  Cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");
  const [search, setSearch]             = useState("");
  const token    = getDoctorToken();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/doctor/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAppointments(res.data.appointments || []))
    .catch(e => { if (e.response?.status === 403) navigate("/doctor/login"); })
    .finally(() => setLoading(false));
  }, []);

  const TABS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  const filtered = appointments.filter(a => {
    const matchStatus = filter === "All" || a.status === filter;
    const matchSearch = !search || a.patientName?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <style>{`
        .da-title { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .da-sub { font-size: 13px; color: #475569; margin-bottom: 24px; }

        .da-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .da-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .da-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #334155; font-size: 14px; }
        .da-search {
          width: 100%; padding: 10px 14px 10px 36px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; color: #e2e8f0;
          font-size: 13px; font-family: 'Cabinet Grotesk', sans-serif;
          outline: none; box-sizing: border-box;
        }
        .da-search::placeholder { color: #334155; }
        .da-search:focus { border-color: rgba(0,212,255,0.3); }

        .da-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .da-tab {
          padding: 7px 14px; border-radius: 20px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: #475569; transition: all 0.2s;
          font-family: 'Cabinet Grotesk', sans-serif;
        }
        .da-tab:hover { color: #94a3b8; }
        .da-tab.active {
          background: rgba(0,212,255,0.1);
          border-color: rgba(0,212,255,0.2);
          color: #00d4ff;
        }

        .da-table-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden;
        }
        .da-table { width: 100%; border-collapse: collapse; }
        .da-th {
          text-align: left; padding: 12px 16px;
          font-size: 10px; font-weight: 700; color: #334155;
          text-transform: uppercase; letter-spacing: 0.8px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .da-td {
          padding: 14px 16px; font-size: 13px; color: #94a3b8;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          vertical-align: middle;
        }
        .da-tr:last-child .da-td { border-bottom: none; }
        .da-tr:hover .da-td { background: rgba(255,255,255,0.02); }

        .da-patient-name { font-weight: 600; color: #e2e8f0; font-size: 13px; }
        .da-patient-phone { font-size: 11px; color: #334155; margin-top: 2px; }

        .da-status {
          display: inline-flex; align-items: center;
          padding: 4px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
        }
        .da-join-btn {
          padding: 6px 14px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          transition: all 0.2s;
        }
        .da-join-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,212,255,0.3); }

        .da-empty { padding: 60px; text-align: center; color: #334155; font-size: 13px; }
        .da-empty-icon { font-size: 40px; margin-bottom: 12px; }

        .da-problem { font-size: 12px; color: #475569; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .da-skeleton { height: 60px; background: rgba(255,255,255,0.03); animation: shimmer 1.5s infinite; }
        .da-skeleton:nth-child(even) { opacity: 0.6; }
        @keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>

      <div className="da-title">Appointments</div>
      <div className="da-sub">Manage all your patient appointments</div>

      {/* Toolbar */}
      <div className="da-toolbar">
        <div className="da-search-wrap">
          <FiSearch className="da-search-icon" />
          <input
            className="da-search"
            placeholder="Search patient name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="da-tabs" style={{ marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} className={`da-tab ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
            {t} {t === "All" ? `(${appointments.length})` : `(${appointments.filter(a => a.status === t).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="da-table-wrap">
        {loading ? (
          <table className="da-table">
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i}><td className="da-td" colSpan={6}><div className="da-skeleton" /></td></tr>
              ))}
            </tbody>
          </table>
        ) : filtered.length === 0 ? (
          <div className="da-empty">
            <div className="da-empty-icon">📅</div>
            No appointments found
          </div>
        ) : (
          <table className="da-table">
            <thead>
              <tr>
                <th className="da-th">Patient</th>
                <th className="da-th">Problem</th>
                <th className="da-th">Date</th>
                <th className="da-th">Time</th>
                <th className="da-th">Status</th>
                <th className="da-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => {
                const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.Pending;
                return (
                  <tr key={apt._id} className="da-tr">
                    <td className="da-td">
                      <div className="da-patient-name">{apt.patientName || "—"}</div>
                      <div className="da-patient-phone">{apt.patientPhone}</div>
                    </td>
                    <td className="da-td">
                      <div className="da-problem" title={apt.problem}>{apt.problem || "—"}</div>
                    </td>
                    <td className="da-td">{formatDate(apt.appointmentDate)}</td>
                    <td className="da-td">{apt.appointmentTime}</td>
                    <td className="da-td">
                      <span className="da-status" style={{ background: sc.bg, color: sc.color }}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="da-td">
                      {apt.status === "Confirmed" && apt.callRoomId && (
                        <button className="da-join-btn" onClick={() => navigate(`/doctor/call/${apt._id}`)}>
                          Join Call
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}