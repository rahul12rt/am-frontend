import Banner from '@/components/organisms/banner/Banner';
import About from '@/components/organisms/about/About';
import NewCollection from '@/components/organisms/newCollection/NewCollection';
import MostLoved from '@/components/organisms/mostLoved/MostLoved';

export default function Home() {
  return (
    <>
      <Banner />
      <About />
      <NewCollection />
      <MostLoved />
    </>
  );
}
