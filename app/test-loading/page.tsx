"use client";

import { useState } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function TestLoadingPage() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <LoadingScreen 
        isLoading={showLoading}
        onComplete={() => {
          console.log('Loading complete!');
          setShowLoading(false);
        }}
      />
      
      {!showLoading && (
        <div className="text-center text-black">
          <h1 className="text-4xl font-bold mb-4">Loading Complete!</h1>
          <p className="mb-4">✅ Header-style font applied to ALBAN MARCUS (Zen Dots)</p>
          <p className="mb-4">✅ Larger loading text (18px/20px)</p>
          <p className="mb-4">✅ No more 404 asset errors</p>
          <p className="mb-4">✅ Removed old "Loading Alban Marcus Collection" screen</p>
          <p className="mb-6">✅ Fixed infinite loop in useAppLoader hook</p>
          <button 
            onClick={() => setShowLoading(true)}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Show Loading Again
          </button>
        </div>
      )}
    </div>
  );
}
