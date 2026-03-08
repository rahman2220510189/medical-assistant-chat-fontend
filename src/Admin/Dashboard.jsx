import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  FiUsers, FiCalendar, FiActivity, FiDollarSign,
  FiUserCheck, FiTrendingUp, FiClock, FiCheckCircle,
  FiXCircle, FiAlertCircle
} from "react-icons/fi";
import { MdLocalHospital } from "react-icons/md";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLORS = {
  Pending:   "#fbbf24",
  Confirmed: "#60a5fa",
  Completed: "#34d399",
  Cancelled: "#f87171",
};

const STAT_CARDS = (stats) => [
  {
    label: "Total Doctors",
    value: stats.totalDoctors || 0,
    icon: <MdLocalHospital />,
    bg: "from-sky-400 to-sky-600",
    light: "bg-sky-50 text-sky-600",
  },
  {
    label: "Total Patients",
    value: stats.totalPatients || 0,
    icon: <FiUsers />,
    bg: "from-violet-400 to-violet-600",
    light: "bg-violet-50 text-violet-600",
  },
  {
    label: "Total Appointments",
    value: stats.totalAppointments || 0,
    icon: <FiCalendar />,
    bg: "from-emerald-400 to-emerald-600",
    light: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "This Month",
    value: stats.thisMonthAppointments || 0,
    icon: <FiTrendingUp />,
    bg: "from-orange-400 to-orange-600",
    light: "bg-orange-50 text-orange-600",
  },
  {
    label: "Total Revenue",
    value: `৳${(stats.totalRevenue || 0).toLocaleString()}`,
    icon: <FiDollarSign />,
    bg: "from-pink-400 to-pink-600",
    light: "bg-pink-50 text-pink-600",
  },
  {
    label: "Online Doctors",
    value: stats.onlineDoctors || 0,
    icon: <FiUserCheck />,
    bg: "from-teal-400 to-teal-600",
    light: "bg-teal-50 text-teal-600",
  },
];

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-BD", {
    day: "2-digit", month: "short", year: "numeric"
  });
};

const StatusBadge = ({ status }) => {
  const styles = {
    Pending:   "bg-yellow-100 text-yellow-800 border-yellow-300",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
    Completed: "bg-green-100 text-green-800 border-green-300",
    Cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.Pending}`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const [stats, setStats]               = useState({});
  const [recentAppts, setRecentAppts]   = useState([]);
  const [topDoctors, setTopDoctors]     = useState([]);
  const [loading, setLoading]           = useState(true);

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/admin/stats`, { headers });
        setStats(res.data.stats || {});
        setRecentAppts(res.data.recentAppointments || []);
        setTopDoctors(res.data.topDoctors || []);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Pie chart data
  const pieData = stats.appointmentsByStatus
    ? Object.entries(stats.appointmentsByStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  // Bar chart — mock monthly data (replace with real API if available)
  const barData = [
    { month: "Oct", appointments: 12 },
    { month: "Nov", appointments: 19 },
    { month: "Dec", appointments: 15 },
    { month: "Jan", appointments: 28 },
    { month: "Feb", appointments: 22 },
    { month: "Mar", appointments: stats.thisMonthAppointments || 0 },
  ];

  if (loading) {
    return (
      <div className="p-8 px-10">
        <div className="text-slate-400 text-sm">Loading dashboard...</div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans p-8 px-20 py-20">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
          Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {STAT_CARDS(stats).map(({ label, value, icon, bg, light }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${light}`}>
              {icon}
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>
                {value}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── APPOINTMENT STATUS MINI CARDS ── */}
      {stats.appointmentsByStatus && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Pending",   val: stats.appointmentsByStatus.pending,   icon: <FiClock />,       color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
            { label: "Confirmed", val: stats.appointmentsByStatus.confirmed, icon: <FiActivity />,    color: "text-blue-600 bg-blue-50 border-blue-200" },
            { label: "Completed", val: stats.appointmentsByStatus.completed, icon: <FiCheckCircle />, color: "text-green-600 bg-green-50 border-green-200" },
            { label: "Cancelled", val: stats.appointmentsByStatus.cancelled, icon: <FiXCircle />,     color: "text-red-600 bg-red-50 border-red-200" },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className={`flex items-center gap-3 p-4 rounded-2xl border ${color}`}>
              <div className="text-xl">{icon}</div>
              <div>
                <div className="text-lg font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>{val || 0}</div>
                <div className="text-xs font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-2 gap-5 mb-6">

        {/* Bar Chart — Monthly Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>Monthly Appointments</div>
            <div className="text-xs text-slate-400">Last 6 months trend</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                cursor={{ fill: "rgba(14,165,233,0.06)" }}
              />
              <Bar dataKey="appointments" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Appointment Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>Appointments by Status</div>
            <div className="text-xs text-slate-400">Current distribution</div>
          </div>
          {pieData.length > 0 && pieData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: "#64748b" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No appointment data yet
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-5">

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Appointments</div>
              <div className="text-xs text-slate-400">Latest 5 bookings</div>
            </div>
            <FiCalendar className="text-slate-400" />
          </div>

          {recentAppts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No appointments yet</div>
          ) : (
            <div>
              {recentAppts.map((appt, i) => (
                <div key={appt._id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i < recentAppts.length - 1 ? "border-b border-slate-100" : ""}`}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {appt.patientName?.[0]?.toUpperCase() || "P"}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{appt.patientName || "—"}</div>
                    <div className="text-xs text-slate-400">{fmt(appt.appointmentDate)} · {appt.appointmentTime || "—"}</div>
                  </div>
                  {/* Status */}
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Doctors */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>Top Doctors</div>
              <div className="text-xs text-slate-400">By appointment count</div>
            </div>
            <MdLocalHospital className="text-slate-400" />
          </div>

          {topDoctors.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div>
              {topDoctors.map((doc, i) => (
                <div key={doc._id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i < topDoctors.length - 1 ? "border-b border-slate-100" : ""}`}>
                  {/* Rank */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                    ${i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-slate-100 text-slate-600" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-50 text-slate-400"}`}>
                    {i + 1}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">Dr. {doc._id || "—"}</div>
                    <div className="text-xs text-slate-400">{doc.count} appointments</div>
                  </div>
                  {/* Bar */}
                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full"
                      style={{ width: `${Math.min(100, (doc.count / (topDoctors[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}