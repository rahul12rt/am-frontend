import Link from 'next/link';

const GetInTouch = () => {
  return (
    <section className='pb-[40px] md:pb-[80px]'>
      <div className='container'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-[20px] md:gap-[30px] bg-white-1 rounded-[8px] text-black-1 px-[20px] md:px-[40px] py-[24px] md:py-[30px]'>
          <div className='w-full md:max-w-[800px]'>
            <h3 className='text-[2.4rem] md:text-[3.2rem] lg:text-[4rem] leading-[1.2] pb-[8px] md:pb-[4px]'>
              Lorem Ipsum is simply dummy text ?
            </h3>
            <p className='text-[1.6rem] md:text-[1.8rem] lg:text-[2rem] leading-[1.5] md:leading-[1.25]'>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&lsquo;s standard dummy
              text ever since the 1500s
            </p>
          </div>
          <Link
            href='/'
            className='w-full md:w-auto bg-black-1 text-white-1 px-[30px] md:px-[54px] py-[16px] md:py-[24px] text-[1.4rem] md:text-[1.6rem] leading-[1.2] text-center md:inline-flex whitespace-nowrap'
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
