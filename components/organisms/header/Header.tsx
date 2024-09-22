"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCollectionRoute = pathname == "/collections";

  return (
    <header
      style={{
        backdropFilter: isScrolled || isCollectionRoute ? "blur(5px)" : "",
      }}
      className={`text-white-1 fixed top-0 left-0 w-full z-[1] transition-all duration-300 ${
        isScrolled || isCollectionRoute ? "bg-black-1 bg-opacity-60" : ""
      }`}
    >
      <nav className="container flex justify-between items-center py-[16px] opacity-100">
        <div className="flex items-center gap-[24px]">
          <button className="flex justify-center items-center gap-[4px] border-b-2 border-transparent hover:border-white-1 transition-all duration-300">
            <span className="text-[16px] bebas-neue-regular tracking-widest">
              MENU
            </span>
            <Image src="/icons/menu.svg" alt="menu" width={32} height={17} />
          </button>

          <button className="flex justify-center items-center gap-[10px]">
            <span className="text-[16px] bebas-neue-regular tracking-widest border-b-2 border-transparent hover:border-white-1 transition-all duration-300">
              SERIES
            </span>
            {/* <Image
              src="/icons/downArrow.svg"
              alt="menu"
              width={15}
              height={9}
            /> */}
          </button>
          <button className="flex justify-center items-center transition-transform duration-300 hover:rotate-[360deg]">
            <Image src="/icons/offers.svg" alt="menu" width={31} height={31} />
          </button>
        </div>

        <Link href="/" className="text-[16px] zen-dots-regular">
          <Image src="/icons/logo.svg" width={357} height={27} alt="logo" />
        </Link>

        <div className="flex items-center gap-[24px]">
          <Link href="/collections">
            <button className="flex justify-center items-center gap-[4px] border-b-2 border-transparent hover:border-white-1 transition-all duration-300">
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
          <button className="flex justify-center items-center relative">
            <span className="flex justify-center items-center rounded-full bg-red-1 min-w-[16px] min-h-[16px] absolute top-[-1px] right-[-2px]">
              4
            </span>
            <Image src="/icons/bag.svg" alt="menu" width={27} height={27} />
          </button>
          <button className="flex justify-center items-center">
            <Image src="/icons/user.svg" alt="menu" width={23} height={23} />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
