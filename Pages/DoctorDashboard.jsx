import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import {
  FiGrid, FiCalendar, FiUser, FiLogOut,
  FiMenu, FiX, FiChevronRight, FiBell,
  FiToggleLeft, FiToggleRight
} from "react-icons/fi";
import { RiHeartPulseLine, RiStethoscopeLine } from "react-icons/ri";
import { MdVerified } from "react-icons/md";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Auth helper ──
export const getDoctorToken = () => localStorage.getItem("doctor-token");
export const getDoctorInfo  = () => {
  try { return JSON.parse(localStorage.getItem("doctor-info") || "{}"); }
  catch { return {}; }
};

// ── Doctor Protected Route ──
export function DoctorRoute({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getDoctorToken()) navigate("/doctor/login");
  }, []);
  return getDoctorToken() ? children : null;
}

// ── Sidebar nav items ──
const NAV = [
  { path: "/doctor/dashboard",              icon: <FiGrid />,     label: "Dashboard"     },
  { path: "/doctor/dashboard/appointments", icon: <FiCalendar />, label: "Appointments"  },
  { path: "/doctor/dashboard/profile",      icon: <FiUser />,     label: "My Profile"    },
];

// ── Layout ──
export function DoctorLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen]         = useState(false);
  const [online, setOnline]     = useState(false);
  const [toggling, setToggling] = useState(false);
  const doctor = getDoctorInfo();
  const token  = getDoctorToken();

  // Load online status
  useEffect(() => {
    axios.get(`${API}/api/doctor/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setOnline(res.data.doctor?.isOnline || false))
      .catch(() => {});
  }, []);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      await axios.patch(`${API}/api/doctor/status`,
        { isOnline: !online },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOnline(o => !o);
    } catch {}
    finally { setToggling(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("doctor-token");
    localStorage.removeItem("doctor-info");
    navigate("/doctor/login");
  };

  const isActive = (path) => {
  if (path === "/doctor/dashboard") return location.pathname === "/doctor/dashboard";
  return location.pathname.startsWith(path);
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .dl-root { min-height: 100vh; background: #050d1a; font-family: 'Cabinet Grotesk', sans-serif; color: #e2e8f0; display: flex; }

        /* Sidebar */
        .dl-sidebar {
          width: 260px; min-height: 100vh;
          background: rgba(255,255,255,0.02);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 100; transition: transform 0.3s ease;
          backdrop-filter: blur(20px);
        }
        .dl-sidebar.closed { transform: translateX(-100%); }

        .dl-sb-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; gap: 10px;
        }
        .dl-sb-logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          border: 1px solid rgba(0,212,255,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #00d4ff; font-size: 17px;
        }
        .dl-sb-logo-name { font-family: 'Clash Display', sans-serif; font-size: 15px; font-weight: 700; color: #f1f5f9; }
        .dl-sb-logo-role { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; }

        /* Doctor card in sidebar */
        .dl-sb-doctor {
          margin: 16px 12px;
          padding: 14px;
          background: rgba(0,212,255,0.04);
          border: 1px solid rgba(0,212,255,0.1);
          border-radius: 14px;
        }
        .dl-sb-doctor-photo {
          width: 42px; height: 42px; border-radius: 12px;
          object-fit: cover; border: 2px solid rgba(0,212,255,0.2);
        }
        .dl-sb-doctor-ph {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.15));
          display: flex; align-items: center; justify-content: center;
          font-family: 'Clash Display', sans-serif; font-size: 18px; font-weight: 700; color: #00d4ff;
          border: 2px solid rgba(0,212,255,0.2);
        }
        .dl-sb-doctor-name { font-size: 13px; font-weight: 700; color: #f1f5f9; }
        .dl-sb-doctor-spec { font-size: 10px; color: #475569; margin-top: 2px; }
        .dl-status-dot {
          width: 8px; height: 8px; border-radius: 50%;
          transition: background 0.3s;
        }
        .dl-status-dot.online { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .dl-status-dot.offline { background: #475569; }

        /* Nav */
        .dl-sb-nav { flex: 1; padding: 8px 12px; overflow-y: auto; }
        .dl-nav-label { font-size: 9px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; padding: 12px 8px 6px; }
        .dl-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 11px; margin-bottom: 2px;
          font-size: 13px; font-weight: 600; color: #475569;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
          border: 1px solid transparent;
        }
        .dl-nav-item:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
        .dl-nav-item.active {
          background: rgba(0,212,255,0.08);
          border-color: rgba(0,212,255,0.15);
          color: #00d4ff;
        }
        .dl-nav-item svg { font-size: 16px; flex-shrink: 0; }

        /* Online toggle */
        .dl-sb-toggle {
          margin: 0 12px 12px;
          padding: 12px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dl-toggle-label { font-size: 12px; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 6px; }
        .dl-toggle-btn {
          font-size: 22px; cursor: pointer; background: none; border: none;
          transition: color 0.2s; padding: 0;
        }
        .dl-toggle-btn.on { color: #22c55e; }
        .dl-toggle-btn.off { color: #334155; }

        /* Logout */
        .dl-sb-logout {
          margin: 0 12px 20px;
          padding: 11px 14px;
          background: rgba(248,113,113,0.06);
          border: 1px solid rgba(248,113,113,0.12);
          border-radius: 12px;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 600; color: #f87171;
          cursor: pointer; transition: all 0.2s;
        }
        .dl-sb-logout:hover { background: rgba(248,113,113,0.12); }

        /* Main */
        .dl-main { margin-left: 260px; flex: 1; min-height: 100vh; }

        /* Topbar */
        .dl-topbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(5,13,26,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding: 0 28px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .dl-topbar-left { display: flex; align-items: center; gap: 12px; }
        .dl-menu-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #64748b; cursor: pointer;
          display: none; align-items: center; justify-content: center;
          font-size: 17px; transition: all 0.2s;
        }
        .dl-menu-btn:hover { color: #e2e8f0; }
        .dl-topbar-title { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; }
        .dl-topbar-right { display: flex; align-items: center; gap: 10px; }
        .dl-topbar-status {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
          border: 1px solid;
        }
        .dl-topbar-status.online { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); color: #22c55e; }
        .dl-topbar-status.offline { background: rgba(71,85,105,0.1); border-color: rgba(71,85,105,0.2); color: #475569; }

        /* Content */
        .dl-content { padding: 28px; }

        /* Overlay for mobile */
        .dl-overlay {
          display: none; position: fixed; inset: 0; z-index: 99;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
        }

        @media (max-width: 768px) {
          .dl-sidebar { transform: translateX(-100%); }
          .dl-sidebar.open { transform: translateX(0); }
          .dl-main { margin-left: 0; }
          .dl-menu-btn { display: flex; }
          .dl-overlay { display: block; }
          .dl-content { padding: 20px 16px; }
        }
      `}</style>

      <div className="dl-root">
        {/* Overlay */}
        {open && <div className="dl-overlay" onClick={() => setOpen(false)} />}

        {/* Sidebar */}
        <div className={`dl-sidebar ${open ? "open" : ""}`}>
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
        

          {/* Doctor info */}
          <div className="dl-sb-doctor">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              {doctor.photo
                ? <img src={doctor.photo} alt={doctor.name} className="dl-sb-doctor-photo" />
                : <div className="dl-sb-doctor-ph">{doctor.name?.[0]?.toUpperCase()}</div>
              }
              <div>
                <div className="dl-sb-doctor-name">Dr. {doctor.name || "Doctor"}</div>
                <div className="dl-sb-doctor-spec">{doctor.specialist || "Specialist"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: online ? "#22c55e" : "#475569" }}>
              <div className={`dl-status-dot ${online ? "online" : "offline"}`} />
              {online ? "Online — Accepting patients" : "Offline"}
            </div>
          </div>

          {/* Nav */}
          <div className="dl-sb-nav">
            <div className="dl-nav-label">Menu</div>
            {NAV.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`dl-nav-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.icon} {item.label}
                {isActive(item.path) && <FiChevronRight style={{ marginLeft: "auto", fontSize: 12 }} />}
              </Link>
            ))}
          </div>

          {/* Online toggle */}
          <div className="dl-sb-toggle">
            <div className="dl-toggle-label">
              <div className={`dl-status-dot ${online ? "online" : "offline"}`} />
              {online ? "Online" : "Offline"}
            </div>
            <button
              className={`dl-toggle-btn ${online ? "on" : "off"}`}
              onClick={toggleStatus}
              disabled={toggling}
            >
              {online ? <FiToggleRight /> : <FiToggleLeft />}
            </button>
          </div>

          {/* Logout */}
          <div className="dl-sb-logout" onClick={handleLogout}>
            <FiLogOut /> Sign Out
          </div>
        </div>

        {/* Main */}
        <div className="dl-main">
          {/* Topbar */}
          <div className="dl-topbar">
            <div className="dl-topbar-left">
              <button className="dl-menu-btn" onClick={() => setOpen(o => !o)}>
                {open ? <FiX /> : <FiMenu />}
              </button>
              <div className="dl-topbar-title">Dr. {doctor.name || "Dashboard"}</div>
            </div>
            <div className="dl-topbar-right">
              <div className={`dl-topbar-status ${online ? "online" : "offline"}`}>
                <div className={`dl-status-dot ${online ? "online" : "offline"}`} />
                {online ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="dl-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Dashboard Home ──
export default function DoctorDashboard() {
  const [stats, setStats]               = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const doctor = getDoctorInfo();
  const token  = getDoctorToken();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, apptRes] = await Promise.all([
          axios.get(`${API}/api/doctor/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/doctor/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setStats(statsRes.data.stats);
        setAppointments(apptRes.data.appointments?.slice(0, 5) || []);
      } catch (e) {
        if (e.response?.status === 403) navigate("/doctor/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const STAT_CARDS = stats ? [
    { label: "Total Appointments", value: stats.totalAppointments, color: "#00d4ff",   bg: "rgba(0,212,255,0.08)",   border: "rgba(0,212,255,0.15)",   icon: "📅" },
    { label: "Today",              value: stats.todayAppointments,  color: "#22c55e",   bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.15)",   icon: "🗓️" },
    { label: "Completed",          value: stats.completedAppointments, color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.15)", icon: "✅" },
    { label: "Total Earnings",     value: `$${stats.totalEarnings}`, color: "#f59e0b",  bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.15)",  icon: "💰" },
  ] : [];

  const STATUS_COLORS = {
    Pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
    Confirmed: { color: "#00d4ff", bg: "rgba(0,212,255,0.1)"   },
    Completed: { color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
    Cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <>
      <style>{`
        .dd-greeting { font-family: 'Clash Display', sans-serif; font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .dd-sub { font-size: 13px; color: #475569; margin-bottom: 28px; }
        .dd-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .dd-stat-card {
          padding: 20px; border-radius: 18px; border: 1px solid;
          display: flex; flex-direction: column; gap: 10px;
          transition: transform 0.2s;
        }
        .dd-stat-card:hover { transform: translateY(-2px); }
        .dd-stat-icon { font-size: 24px; }
        .dd-stat-val { font-family: 'Clash Display', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; }
        .dd-stat-lbl { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.7; }

        .dd-section-title { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .dd-table-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px; overflow: hidden;
        }
        .dd-table { width: 100%; border-collapse: collapse; }
        .dd-th {
          text-align: left; padding: 12px 16px;
          font-size: 10px; font-weight: 700; color: #334155;
          text-transform: uppercase; letter-spacing: 0.8px;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dd-td {
          padding: 13px 16px;
          font-size: 13px; color: #94a3b8;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .dd-tr:last-child .dd-td { border-bottom: none; }
        .dd-tr:hover .dd-td { background: rgba(255,255,255,0.02); }
        .dd-status {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
        }
        .dd-patient-name { font-weight: 600; color: #e2e8f0; }
        .dd-empty { padding: 40px; text-align: center; color: #334155; font-size: 13px; }
        .dd-skeleton { background: rgba(255,255,255,0.04); border-radius: 18px; height: 100px; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }

        .dd-join-btn {
          padding: 5px 12px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #00d4ff, #0284c7);
          color: white; font-size: 11px; font-weight: 700;
          cursor: pointer; font-family: 'Cabinet Grotesk', sans-serif;
          transition: all 0.2s;
        }
        .dd-join-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,212,255,0.3); }
      `}</style>

      {/* Greeting */}
      <div className="dd-greeting">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, Dr. {doctor.name?.split(" ")[0] || "Doctor"} 👋</div>
      <div className="dd-sub">Here's your practice overview for today.</div>

      {/* Stats */}
      {loading ? (
        <div className="dd-stats">
          {[1,2,3,4].map(i => <div key={i} className="dd-skeleton" />)}
        </div>
      ) : (
        <div className="dd-stats">
          {STAT_CARDS.map(({ label, value, color, bg, border, icon }) => (
            <div key={label} className="dd-stat-card" style={{ background: bg, borderColor: border }}>
              <div className="dd-stat-icon">{icon}</div>
              <div className="dd-stat-val" style={{ color }}>{value}</div>
              <div className="dd-stat-lbl" style={{ color }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Appointments */}
      <div className="dd-section-title">
        <FiCalendar style={{ color: "#00d4ff" }} /> Recent Appointments
      </div>
      <div className="dd-table-wrap">
        {loading ? (
          <div className="dd-empty">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="dd-empty">No appointments yet.</div>
        ) : (
          <table className="dd-table">
            <thead>
              <tr>
                <th className="dd-th">Patient</th>
                <th className="dd-th">Date</th>
                <th className="dd-th">Time</th>
                <th className="dd-th">Status</th>
                <th className="dd-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => {
                const sc = STATUS_COLORS[apt.status] || STATUS_COLORS.Pending;
                return (
                  <tr key={apt._id} className="dd-tr">
                    <td className="dd-td"><span className="dd-patient-name">{apt.patientName || "—"}</span><br /><span style={{ fontSize: 11, color: "#334155" }}>{apt.patientPhone}</span></td>
                    <td className="dd-td">{formatDate(apt.appointmentDate)}</td>
                    <td className="dd-td">{apt.appointmentTime}</td>
                    <td className="dd-td">
                      <span className="dd-status" style={{ background: sc.bg, color: sc.color }}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="dd-td">
                      {apt.status === "Confirmed" && apt.callRoomId && (
                        <button className="dd-join-btn" onClick={() => navigate(`/doctor/call/${apt._id}`)}>
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