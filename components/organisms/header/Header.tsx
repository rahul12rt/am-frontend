"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import Series from "@/components/molecules/series/Series";
import { useIsClient } from "@/hooks/useIsClient";
import { useUserModal } from "@/contexts/UserModalContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isClient = useIsClient();

  // Drawer states
  const [drawerType, setDrawerType] = useState<"series" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { openModal, closeModal, isOpen: isUserModalOpen } = useUserModal();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const isHomePage = pathname === "/";
  const isCollectionRoute = pathname === "/collections";
  const isWatchDetailRoute = pathname === "/watchdetail";

  /** ---- Series Drawer Handlers ---- */
  const toggleDrawer = (type: "series" | null) => {
    if (!isAnimating) {
      setIsAnimating(true);
      setDrawerType(drawerType === type ? null : type);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isDrawerOpen = drawerType !== null;


  /** ---- Menu Drawer Handlers ---- */
  const toggleMenu = () => {
    if (!isMenuAnimating) {
      setIsMenuAnimating(true);
      setIsMenuOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isMenuAnimating) {
      const timer = setTimeout(() => setIsMenuAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isMenuAnimating]);

  // Close drawers on route change
  useEffect(() => {
    if (isDrawerOpen) {
      toggleDrawer(null);
    }
    if (isMenuOpen) {
      toggleMenu();
    }
    if (isUserModalOpen) {
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <header
        style={{
          backdropFilter: isScrolled || isCollectionRoute ? "blur(20px)" : "",
        }}
        className={`text-white-1 fixed top-0 left-0 w-full z-[50] transition-all duration-300
          ${isScrolled || isCollectionRoute ? "bg-black-1 bg-opacity-60" : ""}
          ${isWatchDetailRoute ? "bg-black-1" : ""}
          ${!isHomePage ? "bg-black-1" : ""}`}
      >
        <nav className="container flex justify-between items-center py-[16px] gap-[20px]">
          {/* Left section */}
          <div className="flex items-center gap-[0px] custom-xmd:gap-[24px]">
            {/* Menu Drawer Button */}
            <button
              onClick={toggleMenu}
              className="flex items-center gap-2 transition-all duration-300 block custom-xmd:hidden z-[60]"
            >
              <FaBars className="text-[18px]" />
            </button>

            {/* Series Drawer Button */}
            <button
              onClick={() => toggleDrawer("series")}
              className={`flex justify-center items-center gap-[10px] hidden custom-xmd:block transition-all duration-300
                ${
                  drawerType === "series"
                    ? "border-b-2 border-white-1"
                    : "border-b-2 border-transparent"
                }
                hover:border-white-1`}
            >
              <span className="text-[16px] bebas-neue-regular tracking-widest">
                SERIES
              </span>
            </button>

            {/* Offers Button */}
            <Link href="/offers" className="text-[16px] zen-dots-regular">
              <button className="flex justify-center items-center transition-transform duration-300 hover:rotate-[360deg] hidden custom-xmd:block">
                <Image
                  src="/icons/offers.svg"
                  alt="menu"
                  width={31}
                  height={31}
                />
              </button>
            </Link>
          </div>

          {/* Center Logo */}
          <Link href="/" className="text-[16px] zen-dots-regular">
            <p className="tracking-[0px] lg:tracking-[10px] text-[16px]">
              ALBAN MARCUS
            </p>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-[24px]">
            <Link href="/collections" className="hidden custom-xmd:block">
              <button
                className={`flex justify-center items-center gap-[4px] border-b-2 border-transparent hover:border-white-1 transition-all duration-300
                  ${
                    isCollectionRoute
                      ? "border-b-2 border-white-1"
                      : "border-b-2 border-transparent"
                  }`}
              >
                <span className="text-[16px] bebas-neue-regular tracking-widest">
                  Collection
                </span>
                <Image
                  src="/icons/collection.svg"
                  alt="menu"
                  width={27}
                  height={27}
                />
              </button>
            </Link>

            {/* Bag */}
            <Link href='/cart'>
              <button className="flex justify-center items-center relative hidden custom-xmd:block">
                <span className="flex justify-center items-center rounded-full bg-red-1 min-w-[16px] min-h-[16px] absolute top-[-1px] right-[-2px]">
                  4
                </span>
                <Image src="/icons/bag.svg" alt="menu" width={27} height={27} />
              </button>
            </Link>

            {/* User Drawer Button */}
            <button
              className="flex justify-center items-center"
              onClick={openModal}
            >
              <Image
                src="/icons/user.svg"
                alt="menu"
                width={16}
                height={16}
                className="custom-xmd:w-[23px] w-[18px]"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Mobile Menu Drawer ---- */}
      {(isMenuOpen || isMenuAnimating) && (
        <div
          className="fixed inset-0 bg-black-1/50 backdrop-blur-sm z-[40]"
          style={{
            animation: isMenuOpen
              ? "fadeIn 0.3s ease-out"
              : "fadeOut 0.3s ease-in",
            opacity: isMenuOpen ? 1 : 0,
          }}
          onClick={toggleMenu}
        >
          <div
            className={`fixed top-0 left-0 h-full w-full bg-black-1 text-white-1 pt-[100px] shadow-xl
              transform transition-transform duration-300
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-10 text-18 bebas-neue-regular tracking-widest container">
              <li className="text-center text-[18px]">
                <Link href="/" onClick={toggleMenu}>
                  Home
                </Link>
              </li>
              <li className="text-center text-[18px]">
                <Link href="/collections" onClick={toggleMenu}>
                  Collections
                </Link>
              </li>
              <li className="text-center text-[18px]">
                <Link href="/offers" onClick={toggleMenu}>
                  Offers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* ---- Series Drawer ---- */}
      <div
        className={`fixed inset-0 bg-black-1 bg-opacity-50 z-[30] ${
          isDrawerOpen || isAnimating ? "block" : "hidden"
        }`}
        style={{
          animation: isDrawerOpen
            ? "fadeIn 0.3s ease-out"
            : isAnimating
            ? "fadeOut 0.3s ease-in"
            : "none",
          opacity: isDrawerOpen ? 1 : 0,
          backdropFilter: "blur(20px)",
        }}
        onClick={() => toggleDrawer(null)}
      >
        {/* ---- Series Drawer (Top Slide) ---- */}
        {drawerType === "series" && (
          <div
            className="fixed inset-x-0 top-0 bg-black text-white-1"
            style={{
              animation: isDrawerOpen
                ? "slideIn 0.5s ease-out"
                : isAnimating
                ? "slideOut 0.2s ease-in"
                : "none",
              transform: isDrawerOpen ? "translateY(0)" : "translateY(-100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Series />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes slideOut {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-100%);
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
