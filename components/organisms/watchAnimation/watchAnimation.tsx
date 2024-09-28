import Image from 'next/image';

const WatchAnimation = () => {
  return (
    <section>
      <div className='h-screen w-full relative'>
        <Image
          src='/images/watchAnimation.webp'
          fill
          alt='watch'
          objectFit='cover'
        />
      </div>
    </section>
  );
};

export default WatchAnimation;
