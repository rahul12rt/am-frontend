"use client";
import Banner from "@/components/organisms/banner/Banner";
import About from "@/components/organisms/about/About";
import NewCollection from "@/components/organisms/newCollection/NewCollection";
import MostLoved from "@/components/organisms/mostLoved/MostLoved";
import WatchAnimation from "@/components/organisms/watchAnimation/watchAnimation";
import Upgrade from "@/components/organisms/upgrade/Upgrade";
import QaulityMarque from "@/components/organisms/qualityMarque/QualityMarque";
import Gallery from "@/components/organisms/gallery/Gallery";
import GetInTouch from "@/components/organisms/getInTouch/GetInTouch";
import StructuredData from "@/components/seo/StructuredData";
import LocalBusinessSchema from "@/components/seo/LocalBusinessSchema";
import { useGSAPCleanup } from "@/hooks/useGSAPCleanup";
import { useWatchCache } from "@/contexts/WatchCacheContext";
import { useEffect } from "react";

export default function Home() {
  // Use the GSAP cleanup hook
  useGSAPCleanup();
  
  // Initialize watch cache on homepage
  const { isLoading, isCacheReady, allWatches } = useWatchCache();
  
  useEffect(() => {
    if (isCacheReady) {
      console.log(`🎯 Homepage: Watch cache ready with ${allWatches.length} watches`);
    }
  }, [isCacheReady, allWatches.length]);

  // Remove the old loading screen - now handled by AppLoader

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData type="organization" />
      <StructuredData type="website" />
      <LocalBusinessSchema />
      
      {/* Main Content */}
      <Banner />
      <About />
      <NewCollection /> 
      <MostLoved />
      <WatchAnimation />
      <Upgrade />
      <QaulityMarque />
      <Gallery />
      <GetInTouch />
      {/* <Articles /> */}
    </>
  );
}
