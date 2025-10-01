"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full border-gray-200 py-10 mt-10">
      <div className="container flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-4">
        {/* Left Section */}
        <p className="text-[14px] text-white zen-dots-regular">
          © ALBAN MARCUS {new Date().getFullYear()}
        </p>

        {/* Middle Section */}
        <div className="flex gap-2 md:gap-4 text-[11px] sm:text-[12px] md:text-[14px] text-white flex-wrap justify-center items-center max-w-md lg:max-w-none">
          <Link href="/privacypolicy" className="hover:text-black whitespace-nowrap transition-colors">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Link href="/termsandconditions" className="hover:text-black whitespace-nowrap transition-colors">
            Terms & Conditions
          </Link>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Link href="/returns" className="hover:text-black whitespace-nowrap transition-colors">
            Returns & Exchange
          </Link>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Link href="/warranty" className="hover:text-black whitespace-nowrap transition-colors">
            Warranty
          </Link>
          <span className="hidden sm:inline text-gray-400">|</span>
          <Link href="/shipping-policy" className="hover:text-black whitespace-nowrap transition-colors">
            Shipping Policy
          </Link>
        </div>

        {/* Right Section - Social Links */}
        <div className="flex gap-4 text-white">
          <Link href="https://www.instagram.com/albanmarcus_?igsh=MXVpNGp1OHJ1anl4dA==" target="_blank">
            <Instagram className="w-8 h-8 hover:text-black" />
          </Link>
          <Link href="https://x.com/albanmarcu95380" target="_blank">
            <Image 
              src="/icons/twitter_icon.svg" 
              alt="Twitter" 
              width={32} 
              height={32} 
              className="w-8 h-8 hover:opacity-70 transition-opacity" 
            />
          </Link>   
          <Link href="https://www.facebook.com/profile.php?id=61581064653071" target="_blank">
            <Facebook className="w-8 h-8 hover:text-black" />
          </Link>                 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
