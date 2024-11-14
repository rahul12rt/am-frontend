const About = () => {
  return (
    <section className="pt-[90px] pb-[70px]">
      <div className="container">
        <div className="flex justify-center gap-[141px] max-[1280px]:gap-[40px] max-[1024px]:flex-col">
          <h2 className="font-[family-name:var(--font-ppneuemontrealNormal)] max-w-[522px] flex-shrink-0 text-[4.8rem] leading-[58px] text-white-1">
            Upgrade
            <i className="font-[family-name:var(--font-ppeditorialnewitalic)]">
              &nbsp;Your Timepiece
            </i>
            <br />
            Collection Today
          </h2>
          <p className="text-[2rem] leading-[25px]  max-[765px]:text-[16px]">
            Each timepiece is subjected to the most rigorous quality controls.
            Our watchmakers control every spare part before it is assigned a
            place in inventory. Even if there is tiny marks, the piece will not
            be allowed through quality control, and it invariably means the loss
            of valuable parts and starting again from scratch. A great number of
            aesthetic criteria will be taken into consideration to ensure that
            the watch is beautifully finished.
            <br /> <br />
            Mechanical watches may go through up to 50 or 60 different processes
            before the watch is considered to be as near to perfect as humanly
            possible before delivery.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
