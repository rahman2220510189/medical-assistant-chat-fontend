import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { Heart, Menu, X } from "lucide-react";
import { AuthContext } from "../Provider/AuthProvider";
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const {user, logOut} = useContext(AuthContext);
  const handleLogOut = () =>{
    logOut()
    .then(()=>{
      console.log('logged out successfully');
    })
    .catch(error => console.log(error));
  }
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600 transition";

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
         <NavLink to="/" className="flex items-center space-x-3">
  <div className="bg-blue-600 p-2 rounded-lg">
    <Heart className="w-7 h-7 text-white" />
  </div>

  <div className="leading-tight">
    <span className="text-xl font-bold text-gray-800">
      MediCare<span className="text-blue-600">Plus</span>
    </span>
    <p className="text-xs text-gray-500">
      Smart Healthcare. Powered by AI.
    </p>
  </div>
</NavLink>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              Services
            </NavLink>
            <NavLink to="/doctors" className={navLinkClass}>
              Doctors
            </NavLink>
            <NavLink to="/appointments" className={navLinkClass}>
              Appointments
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/chatbot" className={navLinkClass}>
              Chatbot
            </NavLink>

            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
           
            {user ? (
              <button onClick={handleLogOut} className="text-red-600 hover:text-red-700 font-medium transition">
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{from: location}}replace
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{from: location}}replace
                  className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/services" className={navLinkClass}>
              Services
            </NavLink>
            <NavLink to="/doctors" className={navLinkClass}>
              Doctors
            </NavLink>
            <NavLink to="/appointments" className={navLinkClass}>
              Appointments
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>

            {user ? (
              <button onClick={handleLogOut} className="text-red-600 hover:text-red-700 font-medium transition">
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{from: location}}replace
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{from: location}}replace
                  className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
