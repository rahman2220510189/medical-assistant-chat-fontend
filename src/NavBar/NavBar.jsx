import React, { useState } from 'react'
import { NavLink } from 'react-router-dom';

const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Chatbot', path: '/chatbot' }
    ];

  return (
    <nav className="navbar bg-base-100 shadow-md sticky top-0 z-50 px-2 sm:px-4 md:px-6 justify-between md:justify-center">
      <div className="md:hidden">
        <a className="btn btn-ghost text-lg font-bold">
          Medical Assistant
        </a>
      </div>

      <div className="hidden md:flex">
        <a className="btn btn-ghost text-lg sm:text-xl md:text-2xl font-bold absolute left-2 sm:left-4 md:left-6">
          Medical Assistant
        </a>
      </div>

      {/* Mobile Menu Button */}
      <div className="flex-none md:hidden">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Desktop Menu - Centered */}
      <div className="hidden md:flex justify-center">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm md:text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-content'
                      : 'hover:bg-base-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Get Started Button - Right End */}
      {/* <div className="flex-none hidden md:flex">
        <button className="btn btn-primary btn-md">
          
        </button>
      </div> */}

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-base-100 shadow-lg border-t border-base-300">
          <ul className="menu w-full p-4 gap-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-content'
                        : 'hover:bg-base-200'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {/* <div className="px-4 pb-4">
            <button className="btn btn-primary w-full">
              
            </button>
          </div> */}
        </div>
      )}
    </nav>
  )
}

export default NavBar
