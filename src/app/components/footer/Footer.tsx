// components/Footer.tsx
"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center text-gray-200 py-14 mt-1"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 z-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-wide">
            Surgical Data Management System
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Empowering brands with digital creativity, strategy, and impact. 
            We help you grow, engage, and lead in your industry.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-amber-500 inline-block pb-1">
            Quick Links
          </h3>
          <ul className="space-y-2 mt-3 text-sm">
            <li><a href="#" className="hover:text-amber-400 transition">Home</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">About</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Services</a></li>
            <li><a href="#" className="hover:text-amber-400 transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-amber-500 inline-block pb-1">
            Contact Us
          </h3>
          <p className="text-sm mt-3">📍 Dhaka, Bangladesh</p>
          <p className="text-sm">📞 +880 1711-000000</p>
          <p className="text-sm">✉️ support@surgical.com</p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-3 border-b border-amber-500 inline-block pb-1">
            Follow Us
          </h3>
          <div className="flex gap-5 text-3xl mt-4">
            <a href="#" className="hover:scale-125 transition-transform duration-300 text-blue-500">
              <FaFacebook />
            </a>
            <a href="#" className="hover:scale-125 transition-transform duration-300 text-pink-500">
              <FaInstagram />
            </a>
            <a href="#" className="hover:scale-125 transition-transform duration-300 text-blue-400">
              <FaLinkedin />
            </a>
            <a href="#" className="hover:scale-125 transition-transform duration-300 text-gray-400">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-700 mt-12 pt-5 text-center text-sm text-gray-400 z-10">
        © {new Date().getFullYear()} <span className="text-amber-400 font-semibold">Surgical Data Management System</span>. All rights reserved.
      </div>
    </footer>
  );
}
