const Banner = () => {
  return (
    <section
      className="relative h-screen overflow-y-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/banner.webp")' }}
    >
      <div className="container h-full">
        <div className="h-full flex flex-col justify-end items-start py-[60px]">
          <i className="text-[5.6rem] font-[family-name:var(--font-ppeditorialnewitalic)]">
            &nbsp;AM0S1
          </i>
          <h1 className="text-[1.6rem] text-white-1 leading-[19px] pb-[17px] max-w-[505px]">
            Mechanical watches may go through up to 50 or 60 different processes
            before the watch is considered to be as near to perfect as humanly
            possible before delivery.
          </h1>
          <button className="px-[32px] py-[16px] rounded-[4px] text-[1.6rem] text-black-1 bg-white-1">
            View Info
          </button>
        </div>
      </div>
    </section>
  );
};

export default Banner;
