# Loading Screen Usage Guide

## Installation Requirements

First, make sure you have framer-motion installed:

```bash
npm install framer-motion
```

## Basic Usage

### 1. Wrap your app with AppLoader (Recommended)

In your main layout file (e.g., `app/layout.tsx`):

```tsx
import AppLoader from '@/components/layout/AppLoader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppLoader
          showOnFirstVisit={true}
          minLoadingTime={3000}
          additionalAssets={[
            '/images/hero-banner.jpg',
            '/images/featured-watch.jpg'
          ]}
        >
          {children}
        </AppLoader>
      </body>
    </html>
  );
}
```

### 2. Use LoadingScreen directly

For specific pages or components:

```tsx
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 3000);
  }, []);

  return (
    <>
      <LoadingScreen 
        isLoading={isLoading}
        onComplete={() => console.log('Loading complete!')}
      />
      <div>Your page content</div>
    </>
  );
}
```

### 3. With custom progress and tasks

```tsx
import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Loading...');

  useEffect(() => {
    const loadData = async () => {
      setCurrentTask('Loading user data...');
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentTask('Loading products...');
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentTask('Finalizing...');
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <>
      <LoadingScreen 
        isLoading={isLoading}
        progress={progress}
        currentTask={currentTask}
        onComplete={() => console.log('Loading complete!')}
      />
      <div>Your page content</div>
    </>
  );
}
```

## Features

### ✨ Animations
- Smooth fade in/out transitions
- Spinning loading indicator with nested circles
- Text animations with slide effects
- Floating particle effects
- Progress bar animation

### 🎨 Design
- Luxury black gradient background
- ALBAN MARCUS branding
- 14px font size as requested
- Same font family as header/nav
- Elegant spacing and typography

### 🚀 Performance
- Asset preloading (images, fonts, etc.)
- Minimum loading time to ensure smooth UX
- First-visit detection (localStorage)
- Graceful error handling

### 📱 Responsive
- Works on all screen sizes
- Proper mobile optimization
- Touch-friendly interactions

## Customization

### Colors
Edit the gradient and colors in `LoadingScreen.tsx`:

```tsx
style={{
  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'
}}
```

### Loading Messages
Customize the loading texts array:

```tsx
const loadingTexts = [
  "Loading finest luxury",
  "Crafting excellence", 
  "Preparing your experience",
  "Curating timepieces",
  "Almost ready"
];
```

### Assets to Preload
Add your assets to the arrays in `useAppLoader.ts`:

```tsx
export const CRITICAL_ASSETS = [
  '/fonts/Inter-Regular.woff2',
  '/images/logo.png',
  '/images/hero-bg.jpg',
  // Add your assets here
];
```

## Browser Support

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support
- Animation support (CSS transitions/transforms)
- localStorage support for first-visit detection
