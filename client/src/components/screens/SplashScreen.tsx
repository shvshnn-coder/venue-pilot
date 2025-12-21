import { useEffect, useState } from "react";
import splashImage from "@assets/20251222_021603_0000_1766341481797.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setFadeIn(true);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 4;
      });
    }, 100);

    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      data-testid="screen-splash"
    >
      <img 
        src={splashImage} 
        alt="Grid Way" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="mt-48" />
        
        <div className="flex flex-col items-center gap-4 mt-auto mb-16">
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/60 text-sm font-medium tracking-wider">
            Loading{'.'.repeat((Math.floor(progress / 25) % 3) + 1)}
          </span>
        </div>
      </div>
    </div>
  );
}
