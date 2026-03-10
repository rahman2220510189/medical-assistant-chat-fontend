import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../Provider/AuthProvider";
import axios from "axios";                              

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);        
  const location = useLocation();
  const { user, logOut } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Admin check 
  useEffect(() => {
    if (user?.email) {
      const token = localStorage.getItem("access-token");
       console.log("Token:", token);       
      console.log("Email:", user.email);
      axios
        .get(`${API}/api/admin/check/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setIsAdmin(res.data.isAdmin))
        .catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogOut = () => {
    logOut().catch((e) => console.log(e));
  };

  // ── User links 
  const userLinks = [
    { to: "/",             label: "Home",         icon: "⌂" },
    { to: "/services",     label: "Services",     icon: "✦" },
    { to: "/doctors",      label: "Doctors",      icon: "⚕" },
    { to: "/appointments", label: "Appointments", icon: "◈" },
    { to: "/chatbot",      label: "AI Chat",      icon: "◉" },
    { to: "/about",        label: "About",        icon: "◎" },
    { to: "/contact",      label: "Contact",      icon: "◇" },
  ];

  // ── Admin links
  const adminLinks = [
    { to: "/admin",              label: "Dashboard",    icon: "▦" },
    { to: "/admin/doctors",      label: "Doctors",      icon: "⚕" },
    { to: "/admin/appointments", label: "Appointments", icon: "◈" },
    { to: "/admin/patients",     label: "Patients",     icon: "◉" },
    { to: "/admin/settings",     label: "Settings",     icon: "⊙" },
  ];

 
  const navLinks = isAdmin ? adminLinks : userLinks;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-root.scrolled {
          padding: 0 24px;
        }

        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(14, 165, 233, 0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-root.scrolled .nav-inner {
          border-radius: 20px;
          margin-top: 12px;
          border: 1px solid rgba(14, 165, 233, 0.15);
          box-shadow: 0 8px 40px rgba(14, 165, 233, 0.12), 0 2px 8px rgba(0,0,0,0.06);
        }

        /* ── ADMIN MODE ── (নতুন) */
        .nav-root.admin-mode .nav-inner {
          background: rgba(15, 23, 42, 0.95);
          border-bottom-color: rgba(14, 165, 233, 0.15);
        }
        .nav-root.admin-mode.scrolled .nav-inner {
          background: rgba(15, 23, 42, 0.97);
          border-color: rgba(14, 165, 233, 0.2);
          box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        }
        .nav-root.admin-mode .nav-item { color: rgba(255,255,255,0.6); }
        .nav-root.admin-mode .nav-item:hover,
        .nav-root.admin-mode .nav-item.active { color: #38bdf8; background: rgba(14,165,233,0.15); }
        .nav-root.admin-mode .ham-line { background: rgba(255,255,255,0.7); }
        .nav-root.admin-mode .logo-title { color: white; }
        .nav-root.admin-mode .mobile-menu { background: #1e293b; border-color: rgba(14,165,233,0.2); }
        .nav-root.admin-mode .mobile-link { color: rgba(255,255,255,0.6); }
        .nav-root.admin-mode .mobile-link:hover,
        .nav-root.admin-mode .mobile-link.active { background: rgba(14,165,233,0.15); color: #38bdf8; }

        .admin-badge {
          display: inline-flex; align-items: center;
          font-size: 9px; font-weight: 700;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white; padding: 2px 8px; border-radius: 20px;
          letter-spacing: 0.5px; text-transform: uppercase; margin-left: 6px;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          padding: 0 28px;
        }

        /* LOGO */
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          position: relative;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.35);
          transition: transform 0.3s ease;
        }

        .logo-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
        }

        .logo-wrap:hover .logo-icon {
          transform: rotate(-8deg) scale(1.05);
        }

        .logo-pulse {
          width: 20px;
          height: 20px;
          position: relative;
        }

        .logo-pulse svg {
          width: 100%;
          height: 100%;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .logo-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .logo-title span { color: #0ea5e9; }

        .logo-sub {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        /* NAV LINKS */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .nav-item {
          position: relative;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: #475569;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .nav-item-icon {
          font-size: 11px;
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.25s ease;
        }

        .nav-item:hover .nav-item-icon,
        .nav-item.active .nav-item-icon {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-item:hover {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.07);
        }

        .nav-item.active {
          color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
          font-weight: 600;
        }

        .nav-item-pill {
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 2px;
          background: #0ea5e9;
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .nav-item.active .nav-item-pill,
        .nav-item:hover .nav-item-pill {
          width: 20px;
        }

        /* AI CHAT BADGE */
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          color: white;
          padding: 2px 6px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          animation: pulse-badge 2s infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* AUTH BUTTONS */
        .auth-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-login {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #0ea5e9;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 10px;
          transition: all 0.25s ease;
          border: 1.5px solid transparent;
        }

        .btn-login:hover {
          border-color: rgba(14, 165, 233, 0.3);
          background: rgba(14, 165, 233, 0.05);
        }

        .btn-register {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          padding: 9px 20px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-register::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .btn-register:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
        }

        .btn-register:hover::before { opacity: 1; }

        /* USER AVATAR */
        .user-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(14, 165, 233, 0.3);
          overflow: hidden;
          cursor: pointer;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .btn-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.07);
          border: 1.5px solid rgba(239, 68, 68, 0.15);
          padding: 7px 14px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* HAMBURGER */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 6px;
          border-radius: 10px;
          transition: background 0.2s;
          background: none;
          border: none;
        }

        .hamburger:hover { background: rgba(14,165,233,0.08); }

        .ham-line {
          width: 22px;
          height: 2px;
          background: #334155;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
        }

        .hamburger.open .ham-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .hamburger.open .ham-line:nth-child(2) {
          opacity: 0; transform: scaleX(0);
        }
        .hamburger.open .ham-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* MOBILE MENU */
        .mobile-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 16px;
          right: 16px;
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(14, 165, 233, 0.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(14,165,233,0.1);
          padding: 16px;
          transform-origin: top center;
          animation: menuSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        @keyframes menuSlideIn {
          from { opacity: 0; transform: scaleY(0.9) translateY(-10px); }
          to   { opacity: 1; transform: scaleY(1) translateY(0); }
        }

        .mobile-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 12px;
        }

        .mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          transition: all 0.2s ease;
        }

        .mobile-link:hover, .mobile-link.active {
          background: rgba(14, 165, 233, 0.08);
          color: #0ea5e9;
        }

        .mobile-link-icon {
          width: 32px;
          height: 32px;
          background: rgba(14, 165, 233, 0.08);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .mobile-link:hover .mobile-link-icon,
        .mobile-link.active .mobile-link-icon {
          background: rgba(14, 165, 233, 0.15);
        }

        .mobile-divider {
          height: 1px;
          background: rgba(14, 165, 233, 0.1);
          margin: 8px 0;
        }

        .mobile-auth {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-top: 4px;
        }

        .mobile-btn-login {
          display: block;
          text-align: center;
          text-decoration: none;
          padding: 11px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #0ea5e9;
          border: 1.5px solid rgba(14, 165, 233, 0.3);
          transition: all 0.2s;
        }

        .mobile-btn-login:hover {
          background: rgba(14, 165, 233, 0.06);
        }

        .mobile-btn-register {
          display: block;
          text-align: center;
          text-decoration: none;
          padding: 11px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
          transition: all 0.2s;
        }

        .mobile-btn-logout {
          display: block;
          text-align: center;
          padding: 11px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.07);
          border: 1.5px solid rgba(239, 68, 68, 0.15);
          cursor: pointer;
          width: 100%;
          transition: all 0.2s;
        }

        /* SIGNAL DOT */
        .signal-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          position: relative;
        }

        .signal-dot::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.3);
          animation: signal-ping 1.5s ease-out infinite;
        }

        @keyframes signal-ping {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .auth-wrap { display: none; }
          .hamburger { display: flex; }
        }

        @media (max-width: 640px) {
          .nav-content { padding: 0 16px; }
          .logo-sub { display: none; }
        }
      `}</style>

      {/* admin-mode class  isAdmin  */}
      <nav className={`nav-root ${scrolled ? "scrolled" : ""} ${isAdmin ? "admin-mode" : ""}`}>
        <div className="nav-inner">
          <div className="nav-content">

            {/* ── LOGO ── admin /admin  */}
            <NavLink to={isAdmin ? "/admin" : "/"} className="logo-wrap">
              <div className="logo-icon">
                <div className="logo-pulse">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M2 10 L5 10 L7 5 L10 15 L13 8 L15 10 L18 10"
                      stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="logo-text">
                <span className="logo-title">
                  MediCare<span>Plus</span>
                  {isAdmin && <span className="admin-badge">⚙ Admin</span>}
                </span>
                <span className="logo-sub">
                  <span className="signal-dot" style={{marginRight: 5}}></span>
                  {isAdmin ? "Admin Control Panel" : "Smart Healthcare · Powered by AI"}
                </span>
              </div>
            </NavLink>

            {/* ── DESKTOP NAV ── */}
            <div className="nav-links">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/admin"}
                  className={({ isActive }) =>
                    `nav-item${isActive ? " active" : ""}`
                  }
                >
                  <span className="nav-item-icon">{icon}</span>
                  {label}
                  {label === "AI Chat" && (
                    <span className="ai-badge">✦ New</span>
                  )}
                  <span className="nav-item-pill"></span>
                </NavLink>
              ))}
            </div>

            {/* ── AUTH ── (same as before) */}
            <div className="auth-wrap">
              {user ? (
                <div className="user-wrap">
                  <div className="user-avatar" title={user.displayName || user.email}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="avatar" />
                    ) : (
                      (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <button onClick={handleLogOut} className="btn-logout">
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" state={{ from: location }} replace className="btn-login">
                    Sign in
                  </Link>
                  <Link to="/register" state={{ from: location }} replace className="btn-register">
                    Get started →
                  </Link>
                </>
              )}
            </div>

            {/* ── HAMBURGER ── */}
            <button
              className={`hamburger ${isOpen ? "open" : ""}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <span className="ham-line"></span>
              <span className="ham-line"></span>
              <span className="ham-line"></span>
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-links">
              {navLinks.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/" || to === "/admin"}
                  className={({ isActive }) =>
                    `mobile-link${isActive ? " active" : ""}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="mobile-link-icon">{icon}</span>
                  {label}
                  {label === "AI Chat" && (
                    <span className="ai-badge" style={{ marginLeft: "auto" }}>✦ New</span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="mobile-divider"></div>

            <div className="mobile-auth">
              {user ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px",
                    background: isAdmin ? "rgba(14,165,233,0.1)" : "rgba(14,165,233,0.05)",
                    borderRadius: 12, marginBottom: 4
                  }}>
                    <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      {user.photoURL
                        ? <img src={user.photoURL} alt="avatar" />
                        : (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()
                      }
                    </div>
                    <div>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: isAdmin ? "white" : "#0f172a",
                        display: "flex", alignItems: "center", gap: 6
                      }}>
                        {user.displayName || "User"}
                        {isAdmin && <span className="admin-badge">Admin</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{user.email}</div>
                    </div>
                  </div>
                  <button onClick={() => { handleLogOut(); setIsOpen(false); }} className="mobile-btn-logout">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" state={{ from: location }} replace
                    className="mobile-btn-login" onClick={() => setIsOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/register" state={{ from: location }} replace
                    className="mobile-btn-register" onClick={() => setIsOpen(false)}>
                    Get started →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default NavBar;