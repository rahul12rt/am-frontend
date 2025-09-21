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

  // Show loading state while cache is initializing
  if (isLoading && !isCacheReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <span className="text-xl font-medium text-white">Loading Alban Marcus Collection...</span>
          </div>
          <p className="text-gray-300 text-sm">Preparing the finest luxury watches for you</p>
        </div>
      </div>
    );
  }

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
