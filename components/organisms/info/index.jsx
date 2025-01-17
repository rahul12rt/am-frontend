import React from "react";
import styles from "./index.module.css";
import Image from "next/image";

function Info() {
  return (
    <div className="container">
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.content}>
            <span>Safety</span>
            <h5>High Impact Protection</h5>
            <p>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industrys standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </p>
          </div>
          <div className={styles.buttonWrap}>
            <button className="secoundaryButton" style={{ marginBottom: 10 }}>
              View in 360
            </button>
            <button className="primaryButton">Book Now</button>
          </div>
        </div>
        <div className={styles.right}>
          <Image
            src="/images/infoWatch.jpg"
            alt="infoWatch"
            layout="responsive" // Ensures it adapts to its container
            width={180}
            height={181}
            className={styles.image} // Add this class for custom styles if needed
          />
        </div>
      </div>
    </div>
  );
}

export default Info;
