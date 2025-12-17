import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const dots = '.'.repeat(dotCount);

  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center"
      style={{
        background: 'var(--app-gradient)'
      }}
      data-testid="screen-splash"
    >
      <div className="relative">
        <div className="absolute -inset-20 bg-theme-accent/10 rounded-full blur-3xl animate-pulse" />
        <h1 className="font-display text-4xl font-bold text-theme-highlight glow-text-gold relative z-10">
          AURA
        </h1>
      </div>
      
      <div className="mt-12 flex items-baseline">
        <span className="font-display text-2xl text-theme-accent glow-text-teal">
          This way
        </span>
        <span className="font-display text-2xl text-theme-accent glow-text-teal w-8">
          {dots}
        </span>
      </div>

      <div className="mt-8 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < dotCount ? 'bg-theme-highlight glow-border-gold' : 'bg-theme-accent/30'
            }`}
            style={{
              animationDelay: `${i * 0.15}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
