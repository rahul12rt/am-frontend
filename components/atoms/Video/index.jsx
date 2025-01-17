import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import styles from './index.module.css';

const VideoDisplay = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <section className={styles.videoSection}>
      <div className={styles.videoContainer}>
        <div className="container relative aspect-video w-full overflow-hidden rounded-lg bg-black">
          <div className={`${styles.thumbnailWrapper} ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
            <div className="relative w-full h-full">
              <Image 
                src="/images/banner.png"
                alt="Luxury Watch Video Thumbnail"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
            <div className={styles.gradientOverlay} />
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={styles.playButton}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            <div className={styles.playButtonInner}>
              {isPlaying ? (
                <Pause className="h-8 w-8 text-black" />
              ) : (
                <Play className="h-8 w-8 pl-1 text-black" />
              )}
            </div>
          </button>

          <div className={styles.titleContainer}>
            <h3 className={styles.title}>
              The Art of Watchmaking
            </h3>
            <p className={styles.description}>
              Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDisplay;