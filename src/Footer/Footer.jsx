import { NavLink } from "react-router-dom";
import { Heart, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">
                MediCare<span className="text-blue-400">Plus</span>
              </span>
            </div>
            <p className="text-gray-400">
              Providing quality healthcare services with modern technology and compassionate care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <NavLink to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/services" className="text-gray-400 hover:text-white transition">
                  Services
                </NavLink>
              </li>
              <li>
                <NavLink to="/doctors" className="text-gray-400 hover:text-white transition">
                  Doctors
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className="text-gray-400 hover:text-white transition">
                  About Us
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-1" />
                <span className="text-gray-400">
                  123 Healthcare Ave, Medical City, MC 12345
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">
                  info@medicareplus.com
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <NavLink to="#" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition">
                <Facebook className="w-5 h-5" />
              </NavLink>
              <NavLink to="#" className="bg-gray-800 p-3 rounded-full hover:bg-blue-400 transition">
                <Twitter className="w-5 h-5" />
              </NavLink>
              <NavLink to="#" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition">
                <Instagram className="w-5 h-5" />
              </NavLink>
              <NavLink to="#" className="bg-gray-800 p-3 rounded-full hover:bg-blue-700 transition">
                <Linkedin className="w-5 h-5" />
              </NavLink>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} MediCarePlus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
