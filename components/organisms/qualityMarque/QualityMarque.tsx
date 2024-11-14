const QualityMarque = () => {
  const textOne = "QUALITY + BRAND + QUALITY + ";
  const textTwo = "BRAND + QUALITY + BRAND + ";
  return (
    <section className="translate-y-[-50px]">
      <div className="w-full overflow-hidden bg-black">
        <div className="inline-flex">
          <div className="animate-marquee whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="text-[20rem] max-[768px]:text-[70px] font-[family-name:var(--font-timesNewRomanNormal)] leading-[23rem] max-[768px]:leading-[6.5rem] mx-4 text-white"
              >
                {textOne}
              </span>
            ))}
          </div>
          <div className="animate-marquee2 whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="text-[20rem] max-[768px]:text-[70px] font-[family-name:var(--font-timesNewRomanNormal)] leading-[23rem] max-[768px]:leading-[6.5rem] max-[768px]:leading-[1.5rem] mx-4 text-white"
              >
                {textOne}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full overflow-hidden bg-black">
        <div className="inline-flex">
          <div className="animate-marquee-reverse whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="text-[20rem] max-[768px]:text-[70px] font-[family-name:var(--font-timesNewRomanNormal)] leading-[23rem]  max-[768px]:leading-[7.5rem] max-[768px]:leading-[1.5rem] mx-4 text-white"
              >
                {textTwo}
              </span>
            ))}
          </div>
          <div className="animate-marquee2-reverse whitespace-nowrap">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="text-[20rem] max-[768px]:text-[70px] font-[family-name:var(--font-timesNewRomanNormal)] leading-[23rem] max-[768px]:leading-[7.5rem] max-[768px]:leading-[1.5rem] mx-4 text-white"
              >
                {textTwo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QualityMarque;
