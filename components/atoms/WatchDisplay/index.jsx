import React, { useState } from "react";
import styles from "./index.module.css";
import { motion } from "framer-motion";

const WatchDisplay = () => {
  const watches = [
    {
      id: 1,
      title: "AM OS1 - Gold",
      description:
        "Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur.",
      image: "/images/watch-silver.png",
    },
    {
      id: 2,
      title: "AM OS1 - Silver",
      description:
        "Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur,",
      image: "/images/watch-silver.png",
    },
    {
      id: 3,
      title: "AM OS1 - Black",
      description:
        "The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from 'de Finibus Bonorum et Malorum' by Cicero",
      image: "/images/watch-silver.png",
    },
  ];

  const [selectedWatch, setSelectedWatch] = useState(watches[0]);

  const handleColorChange = (watch) => {
    setSelectedWatch(watch);
  };

  return (
    <div
      className={styles.container}
      style={{ backgroundImage: 'url("/images/colorbg.jpg")', backgroundPositionY:"10px" }}
    >
      <div className={styles.watchImageContainer}>
        <motion.img
          key={selectedWatch.id}
          src={selectedWatch.image}
          alt={selectedWatch.title}
          className={styles.watchImage}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        />
      </div>

      <div className={styles.textContainer}>
        <motion.h1
          key={selectedWatch.title}
          className={`${styles.title} ${styles.customFont}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {selectedWatch.title}
        </motion.h1>
        <motion.p
          key={selectedWatch.description}
          className={styles.description}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {selectedWatch.description}
        </motion.p>
        <div className={styles.colorOptions}>
          {watches.map((watch) => (
            <div
              key={watch.id}
              className={`${styles.colorCircle} ${
                watch.id === selectedWatch.id ? styles.active : ""
              }`}
              onClick={() => handleColorChange(watch)}
              style={{
                background: watch.title.includes("Gold")
                  ? "linear-gradient(135deg, #d4af37, #f9d976)"
                  : watch.title.includes("Silver")
                  ? "linear-gradient(135deg, #c0c0c0, #f5f5f5)"
                  : "linear-gradient(135deg, #000000, #434343)",
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchDisplay;
