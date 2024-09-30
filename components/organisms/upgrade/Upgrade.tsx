import Link from 'next/link';

const Upgrade = () => {
  return (
    <section
      className='pt-[35px] pb-[70px] bg-cover bg-no-repeat bg-top'
      style={{ backgroundImage: 'url("/images/bgNet.webp")' }}
    >
      <div className='container'>
        <div className='flex justify-center wrap gap-[141px]'>
          <div className='max-w-[522px] flex-shrink-0'>
            <h2 className='font-[family-name:var(--font-ppneuemontrealNormal)] text-[4.8rem] leading-[58px] text-white-1 pb-[22px]'>
              Upgrade
              <i className='font-[family-name:var(--font-ppeditorialnewitalic)]'>
                &nbsp;Your Timepiece
              </i>
              <br />
              Collection Today
            </h2>
            <Link
              href='/'
              className='inline-flex justify-center items-center px-[32px] py-[16px] text-[1.6rem] leading-[2rem] bg-white-1 text-black-1 rounded-[4px]'
            >
              Book now
            </Link>
          </div>
          <ul className='text-[2rem] leading-[2.5rem] list-disc'>
            <li>
              Movement: Landeron 24 Skeleton AutomaticMovement - Swiss data to
              move Made merge data to be made single
            </li>
            <li>Dimensions: 55 x 45 mm</li>
            <li>
              Glass: Double Dome Sapphire Crystal with Anti-reflective coating
            </li>
            <li> Number of jewels: 25</li>
            <li>
              Movement: Landeron 24 Skeleton AutomaticMovement - Swiss data to
              move Made merge data to be made single
            </li>
            <li>Dimensions: 55 x 45 mm</li>
            <li>
              Glass: Double Dome Sapphire Crystal with Anti-reflective coating
            </li>
            <li> Number of jewels: 25</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Upgrade;
