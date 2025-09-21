"use client";
import Banner from "@/components/organisms/banner/Banner";
import About from "@/components/organisms/about/About";
import NewCollection from "@/components/organisms/newCollection/NewCollection";
import MostLoved from "@/components/organisms/mostLoved/MostLoved";
import WatchAnimation from "@/components/organisms/watchAnimation/watchAnimation";
import Upgrade from "@/components/organisms/upgrade/Upgrade";
import QaulityMarque from "@/components/organisms/qualityMarque/QualityMarque";
import Gallery from "@/components/organisms/gallery/Gallery";
import Articles from "@/components/organisms/articles/Articles";
import GetInTouch from "@/components/organisms/getInTouch/GetInTouch";
import { useGSAPCleanup } from "@/hooks/useGSAPCleanup";

export default function Home() {
  // Use the GSAP cleanup hook
  useGSAPCleanup();

  return (
    <>
      <Banner />
      <About />
      <NewCollection /> 
      <MostLoved />
      <WatchAnimation />
      <Upgrade />
      <QaulityMarque />
      <Gallery />
      <GetInTouch />
      <Articles />
    </>
  );
}
