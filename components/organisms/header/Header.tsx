"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerType, setDrawerType] = useState<"menu" | "series" | "user" | null>(null);

  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isCollectionRoute = pathname === "/collections";
  const isWatchDetailRoute = pathname === "/watchdetail";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = (type: "menu" | "series" | "user" | null) => {
    setDrawerType((prev) => (prev === type ? null : type));
  };

  const isDrawerOpen = drawerType !== null;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[50] transition-all duration-300 text-white-1 ${isScrolled || isCollectionRoute
            ? "bg-black-1/60 backdrop-blur-lg"
            : ""
          } ${isWatchDetailRoute || !isHomePage ? "bg-black-1" : ""}`}
      >
        <nav className="container flex justify-between items-center py-4 gap-5">
          {/* Left Side */}
          <div className="flex items-center gap-6">
            {/* MENU (mobile only) */}
            <button
              onClick={() => toggleDrawer("menu")}
              className="flex items-center gap-2 transition-all duration-300 block custom-xmd:hidden"
            >
              <FaBars className="text-[18px]" />
            </button>

            {/* Series (desktop only) */}
            <button
              onClick={() => toggleDrawer("series")}
              className={`flex items-center gap-2 hidden custom-xmd:block border-b-2 transition-all duration-300 ${drawerType === "series"
                  ? "border-white-1"
                  : "border-transparent hover:border-white-1"
                }`}
            >
              <span className="text-[16px] bebas-neue-regular tracking-widest">
                SERIES
              </span>
            </button>

            {/* Offers */}
            <Link href="/offers" className="hidden custom-xmd:block">
              <button className="flex items-center transition-transform duration-300 hover:rotate-[360deg]">
                <Image
                  src="/icons/offers.svg"
                  alt="offers"
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

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {/* Collection */}
            <Link href="/collections" className="hidden custom-xmd:block">
              <button
                className={`flex items-center gap-2 border-b-2 transition-all duration-300 ${isCollectionRoute
                    ? "border-white-1"
                    : "border-transparent hover:border-white-1"
                  }`}
              >
                <span className="text-[16px] bebas-neue-regular tracking-widest">
                  Collection
                </span>
                <Image
                  src="/icons/collection.svg"
                  alt="collection"
                  width={27}
                  height={27}
                />
              </button>
            </Link>

            {/* Bag */}
            <button className="relative hidden custom-xmd:block">
              <span className="absolute top-[-4px] right-[-6px] flex items-center justify-center rounded-full bg-red-1 min-w-[16px] min-h-[16px] text-12">
                4
              </span>
              <Image src="/icons/bag.svg" alt="bag" width={27} height={27} />
            </button>

            {/* User */}
            <button onClick={() => toggleDrawer("user")}>
              <Image
                src="/icons/user.svg"
                alt="user"
                width={23}
                height={23}
                className="w-[18px] custom-xmd:w-[23px]"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black-1/50 backdrop-blur-sm z-[40] animate-fadeIn"
          onClick={() => toggleDrawer(null)}
        >
          {/* Drawer Content */}
          <div
            className={`
        fixed top-0 left-0 h-full w-[100%]
        bg-black-1 text-white-1 pt-[100px] shadow-xl
        transform transition-transform duration-300
        ${drawerType ? "translate-x-0" : "-translate-x-full"}
      `}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-10 text-18 bebas-neue-regular tracking-widest container">
              <li className="text-center text-[18px]">
                <Link href="/" onClick={() => toggleDrawer(null)}>
                  Home
                </Link>
              </li>
              <li className="text-center text-[18px]">
                <Link href="/collections" onClick={() => toggleDrawer(null)}>
                  Collections
                </Link>
              </li>
              <li className="text-center text-[18px]">
                <Link href="/offers" onClick={() => toggleDrawer(null)}>
                  Offers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}


      <style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`}</style>

    </>
  );
};

export default Header;
