import { Home, Search, Calendar, Users, User } from "lucide-react";

export type Screen = 'home' | 'discover' | 'calendar' | 'attendees' | 'profile';

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Search },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'attendees', label: 'Attendees', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  return (
    <nav 
      className="flex-shrink-0 bg-charcoal/80 backdrop-blur-sm border-t border-accent-teal/20 grid grid-cols-5 gap-2 p-2 z-20"
      data-testid="nav-bottom"
    >
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeScreen === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-accent-gold glow-text-gold' 
                : 'text-text-secondary hover:text-accent-teal'
            }`}
            data-testid={`button-nav-${id}`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
