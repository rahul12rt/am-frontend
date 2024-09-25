"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";
import Series from "@/components/molecules/series/Series";
import User from "@/components/molecules/user/User";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerType, setDrawerType] = useState<string | null>(null); // null means no drawer is open
  const [isAnimating, setIsAnimating] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCollectionRoute = pathname === '/collections';

  // Single function to toggle between series and user drawers
  const toggleDrawer = (type: string | null) => {
    if (!isAnimating) {
      setIsAnimating(true);
      setDrawerType(drawerType === type ? null : type);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const isDrawerOpen = drawerType !== null;

  return (
    <>
      <header
        style={{
          backdropFilter: isScrolled || isCollectionRoute ? "blur(20px)" : "",
        }}
        className={`text-white-1 fixed top-0 left-0 w-full z-[3] transition-all duration-300 ${
          isScrolled || isCollectionRoute ? "bg-black-1 bg-opacity-60" : ""
        }`}
      >
        <nav className="container flex justify-between items-center py-[16px] opacity-100 gap-[20px]">
          <div className="flex items-center gap-[0px] custom-xmd:gap-[24px]">
            <button className="flex justify-center items-center gap-[4px] border-b-2 border-transparent hover:border-white-1 transition-all duration-300">
              <span className="text-[16px] bebas-neue-regular tracking-widest hidden custom-xmd:block">
                MENU
              </span>
              <FaBars className="text-[18px]" />
            </button>

            {/* Series Button */}
            <button
              onClick={() => toggleDrawer("series")}
              className={`flex justify-center items-center gap-[10px] hidden custom-xmd:block hover:border-white-1 transition-all duration-300 ${
                drawerType === "series"
                  ? "border-b-2 border-white-1"
                  : "border-b-2 border-transparent"
              }`}
            >
              <span className="text-[16px] bebas-neue-regular tracking-widest">
                SERIES
              </span>
            </button>
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

          <Link href="/" className="text-[16px] zen-dots-regular ">
            <p className="tracking-[0px] lg:tracking-[10px] text-[16px]">
              ALBAN MARCUS
            </p>
          </Link>

          <div className="flex items-center gap-[24px] ">
            <Link href="/collections" className="hidden custom-xmd:block">
              <button
                className={`flex justify-center items-center gap-[4px] border-b-2 border-transparent hover:border-white-1 transition-all duration-300 hidden custom-xmd:flex  ${
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
            <button className="flex justify-center items-center relative hidden custom-xmd:block">
              <span className="flex justify-center items-center rounded-full bg-red-1 min-w-[16px] min-h-[16px] absolute top-[-1px] right-[-2px]">
                4
              </span>
              <Image src="/icons/bag.svg" alt="menu" width={27} height={27} />
            </button>
            <button
              className="flex justify-center items-center"
              onClick={() => toggleDrawer("user")}
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

      {/* Custom Drawer */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
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
      `}</style>
      <div
        className={`fixed inset-0 bg-black-1 bg-opacity-50 z-[2] ${
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
          {drawerType === "series" && <Series />}
          {drawerType === "user" && <User />}
        </div>
      </div>
    </>
  );
};

export default Header;
