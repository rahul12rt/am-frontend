import Card from "@/components/ui/Card";
import Link from "next/link";
import { MdKeyboardArrowRight } from "react-icons/md";

const Collection = () => {
  const products = [
    {
      id: 1,
      name: "Alban OS1",
      image: "/images/am0s1.webp",
      price: 240,
      originalPrice: 260,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 2,
      name: "Alban OS2",
      image: "/images/am0s2.webp",
      price: 250,
      originalPrice: 280,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 3,
      name: "Alban OS3",
      image: "/images/series01.png",
      price: 220,
      originalPrice: 240,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 4,
      name: "Alban OS4",
      image: "/images/ams03.png",
      price: 270,
      originalPrice: 300,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 5,
      name: "Alban OS5",
      image: "/images/am0s2.webp",
      price: 290,
      originalPrice: 320,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 6,
      name: "Alban OS6",
      image: "/images/am0s1.webp",
      price: 310,
      originalPrice: 340,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 7,
      name: "Alban OS7",
      image: "/images/ams03.png",
      price: 330,
      originalPrice: 350,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 8,
      name: "Alban OS8",
      image: "/images/series01.png",
      price: 350,
      originalPrice: 370,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 9,
      name: "Alban OS9",
      image: "/images/am0s2.webp",
      price: 360,
      originalPrice: 380,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
    {
      id: 10,
      name: "Alban OS10",
      image: "/images/am0s2.webp",
      price: 400,
      originalPrice: 420,
      link: "#",
      description:
        "Black ceramic case, 18-carat pink gold bezel, lugs and caseback,",
    },
  ];

  return (
    <section className="pt-[90px] pb-[70px] text-black-1 bg-black-1 text-white-1">
      <div className="container">
        <p className="flex items-center text-[14px] mb-[40px]">
          <Link href="/" className="opacity-60 hover:opacity-100">
            Home
          </Link>
          <MdKeyboardArrowRight className="mx-2" />
          <span>Collection</span>
        </p>
        <Card data={products} />
      </div>
    </section>
  );
};

export default Collection;
