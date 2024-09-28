import Banner from '@/components/organisms/banner/Banner';
import About from '@/components/organisms/about/About';
import NewCollection from '@/components/organisms/newCollection/NewCollection';
import MostLoved from '@/components/organisms/mostLoved/MostLoved';
import WatchAnimation from '@/components/organisms/watchAnimation/watchAnimation';
import Upgrade from '@/components/organisms/upgrade/Upgrade';
import QaulityMarque from '@/components/organisms/qualityMarque/QualityMarque';

export default function Home() {
  return (
    <>
      <Banner />
      <About />
      <NewCollection />
      <MostLoved />
      <WatchAnimation />
      <Upgrade />
      <QaulityMarque />
    </>
  );
}
