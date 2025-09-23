"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
  progress?: number;
  currentTask?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isLoading, 
  onComplete, 
  progress: externalProgress,
  currentTask: externalTask 
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [internalProgress, setInternalProgress] = useState(0);

  const progress = externalProgress ?? internalProgress;
  
  const loadingTexts = [
    "Loading finest luxury",
    "Crafting excellence", 
    "Preparing your experience",
    "Curating timepieces",
    "Almost ready"
  ];

  const currentText = externalTask || loadingTexts[currentTextIndex];

  // Simulate loading progress (only if no external progress provided)
  useEffect(() => {
    if (isLoading && externalProgress === undefined) {
      const progressInterval = setInterval(() => {
        setInternalProgress((prev: number) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => onComplete?.(), 500);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    }
  }, [isLoading, onComplete, externalProgress]);

  // Text animation cycling
  useEffect(() => {
    if (isLoading) {
      const textInterval = setInterval(() => {
        setCurrentTextIndex(prev => (prev + 1) % loadingTexts.length);
      }, 2000);

      return () => clearInterval(textInterval);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'
        }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'float 20s ease-in-out infinite'
          }} />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12"
          >
            <h1 className="text-white text-center zen-dots-regular text-[24px] lg:text-[32px] tracking-[4px] lg:tracking-[10px]">
              ALBAN MARCUS
            </h1>
          </motion.div>

          {/* Spinning animation */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="mb-8"
          >
            <div className="w-16 h-16 border-2 border-white/20 rounded-full relative">
              <div className="absolute top-0 left-0 w-full h-full border-2 border-transparent border-t-white rounded-full animate-spin" />
              <div className="absolute top-2 left-2 w-12 h-12 border border-white/30 rounded-full">
                <div className="absolute top-1 left-1 w-10 h-10 border border-white/20 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Animated loading text */}
          <div className="h-12 mb-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={externalTask ? externalTask : currentTextIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-white/80 text-center text-[18px] lg:text-[24px]"
                style={{ 
                  fontFamily: 'var(--font-ppneuemontrealNormal), -apple-system, BlinkMacSystemFont, sans-serif',
                  letterSpacing: '0.1em'
                }}
              >
                {currentText}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-px bg-white/20 relative overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Progress percentage */}
          <motion.p
            className="text-white/60 mt-4 text-xl lg:text-xl tracking-wider"
            style={{ 
              fontFamily: 'var(--font-ppneuemontrealNormal), -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            {Math.round(progress)}%
          </motion.p>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
