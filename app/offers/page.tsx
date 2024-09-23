import Image from "next/image";
import styles from "./page.module.css";
import Card from "@/components/ui/Card";

const Offers = () => {
  const products = [
    {
      id: 1,
      name: "Alban OS1",
      image: "/images/am0s2.webp",
      price: 240,
      originalPrice: 260,
      link: "#",
      offer: "30%",
    },
    {
      id: 2,
      name: "Alban OS2",
      image: "/images/am0s1.webp",
      price: 250,
      originalPrice: 280,
      link: "#",
      offer: "30%",
    },
    {
      id: 3,
      name: "Alban OS3",
      image: "/images/ams03.png",
      price: 220,
      originalPrice: 240,
      link: "#",
      offer: "30%",
    },
    {
      id: 4,
      name: "Alban OS4",
      image: "/images/series01.png",
      price: 270,
      originalPrice: 300,
      link: "#",
      offer: "30%",
    },
    {
      id: 5,
      name: "Alban OS5",
      image: "/images/am0s2.webp",
      price: 290,
      originalPrice: 320,
      link: "#",
      offer: "30%",
    },
    {
      id: 6,
      name: "Alban OS6",
      image: "/images/am0s2.webp",
      price: 310,
      originalPrice: 340,
      link: "#",
      offer: "30%",
    },
  ];
  return (
    <section
      className="pt-[40px] pb-[70px] text-black-1 bg-black-1 text-white-1"
      id="banner"
    >
      <div className="container">
        <div className={styles.banner}>
          <div className="grid grid-cols-1 custom-xsm:grid-cols-1 custom-sm:grid-cols-2 custom-md:grid-cols-4 gap-4 pt-[140px]">
            {products.map((product, id) => {
              return (
                <div className={styles.product} key={id}>
                  <h3>{product.name}</h3>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover mb-6 mt-6 h-[260px]"
                  />
                  <p>{product.offer}</p>
                  <h2 className="text-[14px] text-gray-400 m-2 text-center w-[250px]">
                    Black ceramic case, 18-carat pink gold bezel, lugs and
                    caseback,
                  </h2>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
