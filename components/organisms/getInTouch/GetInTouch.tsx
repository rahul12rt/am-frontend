import Link from 'next/link';

const GetInTouch = () => {
  return (
    <section className='pb-[80px]'>
      <div className='container'>
        <div className='flex items-center justify-between gap-[30px] flex-wrap bg-white-1 rounded-[8px] text-black-1 px-[40px] py-[30px]'>
          <div className='max-w-[800px]'>
            <h3 className='text-[4rem] leading-[50px] pb-[4px]'>
              Lorem Ipsum is simply dummy text ?
            </h3>
            <p className='text-[2rem] leading-[25px]'>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s
            </p>
          </div>
          <Link
            href='/'
            className='bg-black-1 text-white-1 px-[54px] py-[24px] text-[1.6rem] leading-[20px] inline-flex'
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
