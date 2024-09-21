import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className='text-white-1 fixed top-0 left-0 w-full z-[1]'>
      <nav className='container flex justify-between items-center py-[13px]'>
        <div className='flex items-center gap-[24px]'>
          <button className='flex justify-center items-center gap-[4px]'>
            <span className='text-[2rem] bebas-neue-regular'>MENU</span>
            <Image src='/icons/menu.svg' alt='menu' width={32} height={17} />
          </button>
          <button className='flex justify-center items-center gap-[10px]'>
            <span className='text-[2rem] bebas-neue-regular'>SERIES</span>
            <Image
              src='/icons/downArrow.svg'
              alt='menu'
              width={15}
              height={9}
            />
          </button>
          <button className='flex justify-center items-center'>
            <Image src='/icons/offers.svg' alt='menu' width={31} height={31} />
          </button>
        </div>

        <Link href='/' className='text-[2.2rem] zen-dots-regular'>
          ALBAN MARCUS
        </Link>

        <div className='flex items-center gap-[24px]'>
          <button className='flex justify-center items-center gap-[4px]'>
            <span className='text-[2rem] bebas-neue-regular'>Collection</span>
            <Image
              src='/icons/collection.svg'
              alt='menu'
              width={27}
              height={27}
            />
          </button>
          <button className='flex justify-center items-center relative'>
            <span className='flex justify-center items-center rounded-full bg-red-1 min-w-[16px] min-h-[16px] absolute top-[-1px] right-[-2px]'>
              4
            </span>
            <Image src='/icons/bag.svg' alt='menu' width={27} height={27} />
          </button>
          <button className='flex justify-center items-center'>
            <Image src='/icons/user.svg' alt='menu' width={23} height={23} />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
