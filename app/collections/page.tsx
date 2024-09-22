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
    },
    {
      id: 2,
      name: "Alban OS2",
      image: "/images/am0s1.webp",
      price: 250,
      originalPrice: 280,
      link: "#",
    },
    {
      id: 3,
      name: "Alban OS3",
      image: "/images/am0s1.webp",
      price: 220,
      originalPrice: 240,
      link: "#",
    },
    {
      id: 4,
      name: "Alban OS4",
      image: "/images/am0s1.webp",
      price: 270,
      originalPrice: 300,
      link: "#",
    },
    {
      id: 5,
      name: "Alban OS5",
      image: "/images/am0s1.webp",
      price: 290,
      originalPrice: 320,
      link: "#",
    },
    {
      id: 6,
      name: "Alban OS6",
      image: "/images/am0s1.webp",
      price: 310,
      originalPrice: 340,
      link: "#",
    },
    {
      id: 7,
      name: "Alban OS7",
      image: "/images/am0s1.webp",
      price: 330,
      originalPrice: 350,
      link: "#",
    },
    {
      id: 8,
      name: "Alban OS8",
      image: "/images/am0s1.webp",
      price: 350,
      originalPrice: 370,
      link: "#",
    },
    {
      id: 9,
      name: "Alban OS9",
      image: "/images/am0s1.webp",
      price: 360,
      originalPrice: 380,
      link: "#",
    },
    {
      id: 10,
      name: "Alban OS10",
      image: "/images/am0s1.webp",
      price: 400,
      originalPrice: 420,
      link: "#",
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
        <div className="grid grid-cols-1 custom-xsm:grid-cols-1 custom-sm:grid-cols-2 custom-md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative rounded-[15px] flex flex-col items-center p-[15px] pt-[20px]"
            >
              <Link
                href={`/collections/${product.id}`}
                className="flex flex-col items-center"
              >
                <div className="bg-black-1 px-[15px] py-[8px] rounded-[8px] text-center flex item-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold">{product.name}</h3>
                  </div>
                  {/* <div className="flex justify-center items-center text-[28px] text-black-1">
                    <img src="/icons/rightArrow.svg" alt="right arrow" />
                  </div> */}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover mb-6 mt-6 h-[260px]"
                />
                <h2 className="text-[14px] text-gray-400 m-2 text-center w-[250px]">
                  Black ceramic case, 18-carat pink gold bezel, lugs and
                  caseback,
                </h2>
                <div className="mb-2 text-center">
                  <span className="text-[24px] text-center">
                    ${product.price}
                  </span>
                  &nbsp; &nbsp;
                  <span className="text-[24px] text-gray-400 line-through font-bold">
                    ${product.originalPrice}
                  </span>
                  <div className="flex justify-center items-center text-[28px] text-black-1">
                    <img src="/icons/rightArrow.svg" alt="right arrow" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collection;
