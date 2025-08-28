"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-gray-200 py-10 mt-10">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Section */}
        <p className="text-[14px] text-white">
          © Alban Marcus {new Date().getFullYear()}
        </p>

        {/* Middle Section */}
        <div className="flex gap-4 text-[14px] text-white">
          <Link href="/privacypolicy" className="hover:text-black">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/termsandconditions" className="hover:text-black">
            Terms & Conditions
          </Link>
        </div>

        {/* Right Section - Social Links */}
        <div className="flex gap-4 text-white">
          <Link href="https://instagram.com" target="_blank">
            <Instagram className="w-8 h-8 hover:text-black" />
          </Link>
          <Link href="https://twitter.com" target="_blank">
            <Twitter className="w-8 h-8 hover:text-black" />
          </Link>   
          <Link href="https://facebook.com" target="_blank">
            <Facebook className="w-8 h-8 hover:text-black" />
          </Link>                 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
