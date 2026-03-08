import React, { useState } from "react";
import axios from "axios";
import {
  FiSettings, FiUsers, FiShield, FiSearch,
  FiUser, FiMail, FiPhone, FiSave, FiCheck,
  FiAlertCircle
} from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TABS = [
  { id: "roles",   label: "Role Management", icon: <FiUsers /> },
  { id: "site",    label: "Site Settings",   icon: <FiSettings /> },
  { id: "account", label: "My Account",      icon: <FiUser /> },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("roles");
  const [toast, setToast]         = useState(null);

  // Role Management state
  const [roleSearch, setRoleSearch]   = useState("");
  const [foundUser, setFoundUser]     = useState(null);
  const [searching, setSearching]     = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: "MediCarePlus",
    siteEmail: "info@medicareplus.com",
    sitePhone: "+1 (555) 123-4567",
    siteAddress: "123 Healthcare Ave, Medical City, MC 12345",
  });

  const token   = localStorage.getItem("access-token");
  const headers = { Authorization: `Bearer ${token}` };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Search user ──
  const searchUser = async () => {
    if (!roleSearch.trim()) return;
    setSearching(true);
    setFoundUser(null);
    setSearchError("");
    try {
      const res = await axios.get(`${API}/api/admin/patients`, {
        params: { search: roleSearch, limit: 1 },
        headers,
      });
      const user = res.data.patients?.[0];
      if (user) {
        setFoundUser(user);
      } else {
        setSearchError("No user found with this email or name.");
      }
    } catch {
      setSearchError("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  };

  // ── Update role ──
  const updateRole = async (email, role) => {
    setUpdatingRole(true);
    try {
      await axios.patch(`${API}/api/admin/users/${email}/role`, { role }, { headers });
      showToast(`Role updated to ${role}!`);
      setFoundUser(prev => ({ ...prev, role }));
    } catch {
      showToast("Role update failed", "error");
    } finally {
      setUpdatingRole(false);
    }
  };

  // ── Save site settings ──
  const saveSiteSettings = (e) => {
    e.preventDefault();
    showToast("Settings saved!");
  };

  return (
    <div className="font-sans p-8 py-20 px-20">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[2147483647] px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 shadow-xl border
          ${toast.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {toast.type === "success" ? <FiCheck /> : <FiAlertCircle />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage your admin panel settings</p>
      </div>

      <div className="flex gap-6">

        {/* Sidebar Tabs */}
        <div className="w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all cursor-pointer border-none text-left
                  ${activeTab === tab.id
                    ? "bg-sky-50 text-sky-700 border-r-2 border-sky-500"
                    : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* ── ROLE MANAGEMENT ── */}
          {activeTab === "roles" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-content text-violet-600 text-xl">
                  <MdAdminPanelSettings className="mx-auto" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>User Role Management</h2>
                  <p className="text-xs text-slate-400">Search a user and change their role</p>
                </div>
              </div>

              {/* Search */}
              <div className="flex gap-2 mb-5">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                    placeholder="Search by name or email..."
                    value={roleSearch}
                    onChange={e => setRoleSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchUser()}
                  />
                </div>
                <button
                  onClick={searchUser}
                  disabled={searching}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold cursor-pointer border-none shadow-sm disabled:opacity-60">
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Error */}
              {searchError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                  <FiAlertCircle /> {searchError}
                </div>
              )}

              {/* Found User */}
              {foundUser && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  {/* User Info */}
                  <div className="flex items-center gap-4 p-5 bg-slate-50">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                      {foundUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{foundUser.name || "—"}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{foundUser.email}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border
                      ${foundUser.role === "admin"
                        ? "bg-violet-100 text-violet-800 border-violet-300"
                        : "bg-slate-100 text-slate-600 border-slate-300"}`}>
                      {foundUser.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>

                  {/* Role Buttons */}
                  <div className="p-5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Change Role</div>
                    <div className="flex gap-3">
                      <button
                        disabled={foundUser.role === "user" || updatingRole}
                        onClick={() => updateRole(foundUser.email, "user")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all
                          ${foundUser.role === "user"
                            ? "border-sky-400 bg-sky-50 text-sky-700 cursor-default"
                            : "border-slate-200 bg-white text-slate-500 cursor-pointer hover:border-sky-300 hover:text-sky-600"}`}>
                        <FiUser /> Set as User
                        {foundUser.role === "user" && <FiCheck className="text-sky-500" />}
                      </button>
                      <button
                        disabled={foundUser.role === "admin" || updatingRole}
                        onClick={() => updateRole(foundUser.email, "admin")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all
                          ${foundUser.role === "admin"
                            ? "border-violet-400 bg-violet-50 text-violet-700 cursor-default"
                            : "border-slate-200 bg-white text-slate-500 cursor-pointer hover:border-violet-300 hover:text-violet-600"}`}>
                        <FiShield /> Set as Admin
                        {foundUser.role === "admin" && <FiCheck className="text-violet-500" />}
                      </button>
                    </div>
                    {updatingRole && (
                      <div className="text-xs text-slate-400 text-center mt-2">Updating role...</div>
                    )}
                  </div>
                </div>
              )}

              {/* Info note */}
              {!foundUser && !searchError && (
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sm text-sky-700">
                  <span className="font-semibold">Tip:</span> Search by email for best results. Press Enter or click Search.
                </div>
              )}
            </div>
          )}

          {/* ── SITE SETTINGS ── */}
          {activeTab === "site" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl">
                  <FiSettings />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>Site Settings</h2>
                  <p className="text-xs text-slate-400">Update your site information</p>
                </div>
              </div>

              <form onSubmit={saveSiteSettings}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Site Name</label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                      value={siteSettings.siteName}
                      onChange={e => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Contact Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="email"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                        value={siteSettings.siteEmail}
                        onChange={e => setSiteSettings({ ...siteSettings, siteEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                        value={siteSettings.sitePhone}
                        onChange={e => setSiteSettings({ ...siteSettings, sitePhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Address</label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                      value={siteSettings.siteAddress}
                      onChange={e => setSiteSettings({ ...siteSettings, siteAddress: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-semibold cursor-pointer border-none shadow-sm hover:shadow-md transition-all">
                  <FiSave /> Save Settings
                </button>
              </form>
            </div>
          )}

          {/* ── MY ACCOUNT ── */}
          {activeTab === "account" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  <FiUser />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "'Syne', sans-serif" }}>My Account</h2>
                  <p className="text-xs text-slate-400">Your admin profile info</p>
                </div>
              </div>

              {/* Admin Badge */}
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold">
                  A
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Admin</div>
                  <div className="text-xs text-slate-400 mt-0.5">rahman22205101894@diu.edu.bd</div>
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 border border-violet-300">
                    <FiShield className="text-xs" /> Admin
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4">
                {[
                  ["Role", "Administrator"],
                  ["Access", "Full Access"],
                  ["Panel", "Admin Control Panel"],
                  ["Status", "Active"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                    <div className="text-sm font-medium text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}