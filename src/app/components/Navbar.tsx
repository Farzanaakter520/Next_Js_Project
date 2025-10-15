// src/components/Navbar.tsx
import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-200 text-black shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">SDMS</h1>

        <div className="flex space-x-6">
          <Link href="/fileUpload">
            <span className="hover:text-blue-900 transition-colors duration-200 font-medium text-xl cursor-pointer">
              Upload File
            </span>
          </Link>
          <Link href="/record">
            <span className="hover:text-gray-500 transition-colors duration-200 font-medium text-xl cursor-pointer">
              Report
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
