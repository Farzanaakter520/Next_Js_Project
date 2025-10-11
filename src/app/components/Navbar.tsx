// src/components/Navbar.tsx
import React from "react";

export default function Navbar() {
  return (
    <nav className="bg-blue-200 text-black shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold tracking-wide">SDMS</h1>

        {/* Menu */}
        <div className="flex space-x-6">
          <a
            href="/upload"
            className="hover:text-blue-900 transition-colors duration-200 font-medium text-xl"
          >
            Upload
          </a>
          <a
            href="/record"
            className="hover:text-gray-500 transition-colors duration-200 font-medium text-xl"
          >
            Report
          </a>
        </div>
      </div>
    </nav>
  );
}
