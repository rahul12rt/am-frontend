import React from "react";
import styles from "./Series.module.css";
import Image from "next/image";

const seriesData = Array.from({ length: 10 }, (_, index) => ({
  title: `Series ${index + 1}`,
  price: `$${(index + 1) * 100}`,
  imageSrc: `/images/series0${(index % 10) + 1}.png`,
}));

function Series() {
  return (
    <div
      className="bg-black-1"
      style={{
        borderBottomLeftRadius: "10px",
        borderBottomRightRadius: "10px",
      }}
    >
      <div className="container pt-[90px] pb-[30px] ">
        <div className={styles.cardWrap}>
          {seriesData.map((series, index) => (
            <div key={index} className={styles.card}>
              <h3>{series.title}</h3>
              <p>
                starting at <span className="text-[16px]">{series.price}</span>
              </p>
              <div className={styles.imageWrap}>
                <Image
                  src="/images/am0s2.webp"
                  width={218}
                  height={219}
                  alt={series.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Series;
