import Link from "next/link";

const Articles = () => {
  return (
    <section className="pb-[80px]">
      <div className="container">
        <div className="flex gap-[25px] flex-wrap">
          <div
            className="h-[403px] w-[calc((100%-25px)/2)] bg-no-repeat bg-cover bg-center rounded-[8px] p-[30px] text-white-1 max-[768px]:w-full"
            style={{ backgroundImage: 'url("/images/galleryThree.webp")' }}
          >
            <div className="max-w-[230px]">
              <h4 className="text-[2.2rem] pb-[5px]">
                A perfect day in Yokohama
              </h4>
              <p className="text-[1.6rem] leading-[19px] pb-[17px]">
                Japan&lsquo;s Mt. Fuji is an active volcano about 100 kilometres
                southwest of Tokyo
              </p>
            </div>
            <Link
              href="/"
              className="px-[20px] py-[16px] text-[1.6rem] leading-[20px] text-black-1 bg-white-1 rounded-[4px] inline-flex items-center justify-center"
            >
              Read Article
            </Link>
          </div>
          <div
            className="h-[403px] w-[calc((100%-25px)/2)] bg-no-repeat bg-cover bg-center rounded-[8px] p-[30px] text-white-1 max-[768px]:w-full"
            style={{ backgroundImage: 'url("/images/galleryThree.webp")' }}
          >
            <div className="max-w-[230px]">
              <h4 className="text-[2.2rem] pb-[5px]">
                A perfect day in Yokohama
              </h4>
              <p className="text-[1.6rem] leading-[19px] pb-[17px]">
                Japan&lsquo;s Mt. Fuji is an active volcano about 100 kilometres
                southwest of Tokyo
              </p>
            </div>
            <Link
              href="/"
              className="px-[20px] py-[16px] text-[1.6rem] leading-[20px] text-black-1 bg-white-1 rounded-[4px] inline-flex items-center justify-center"
            >
              Read Article
            </Link>
          </div>
          <div
            className="h-[403px] w-[calc((100%-25px)/2)] bg-no-repeat bg-cover bg-center rounded-[8px] p-[30px] text-white-1 max-[768px]:w-full"
            style={{ backgroundImage: 'url("/images/galleryThree.webp")' }}
          >
            <div className="max-w-[230px]">
              <h4 className="text-[2.2rem] pb-[5px]">
                A perfect day in Yokohama
              </h4>
              <p className="text-[1.6rem] leading-[19px] pb-[17px]">
                Japan&lsquo;s Mt. Fuji is an active volcano about 100 kilometres
                southwest of Tokyo
              </p>
            </div>
            <Link
              href="/"
              className="px-[20px] py-[16px] text-[1.6rem] leading-[20px] text-black-1 bg-white-1 rounded-[4px] inline-flex items-center justify-center"
            >
              Read Article
            </Link>
          </div>
          <div
            className="h-[403px] w-[calc((100%-25px)/2)] bg-no-repeat bg-cover bg-center rounded-[8px] p-[30px] text-white-1 max-[768px]:w-full"
            style={{ backgroundImage: 'url("/images/galleryThree.webp")' }}
          >
            <div className="max-w-[230px]">
              <h4 className="text-[2.2rem] pb-[5px]">
                A perfect day in Yokohama
              </h4>
              <p className="text-[1.6rem] leading-[19px] pb-[17px]">
                Japan&lsquo;s Mt. Fuji is an active volcano about 100 kilometres
                southwest of Tokyo
              </p>
            </div>
            <Link
              href="/"
              className="px-[20px] py-[16px] text-[1.6rem] leading-[20px] text-black-1 bg-white-1 rounded-[4px] inline-flex items-center justify-center"
            >
              Read Article
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Articles;
