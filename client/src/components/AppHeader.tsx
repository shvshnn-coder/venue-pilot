import { User } from "@/lib/mockData";

interface AppHeaderProps {
  user: User;
}

export default function AppHeader({ user }: AppHeaderProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('');
  
  return (
    <header 
      className="flex-shrink-0 p-4 border-b border-accent-teal/20 flex justify-between items-center z-20 bg-charcoal/80 backdrop-blur-sm"
      data-testid="header-container"
    >
      <h1 
        className="font-display text-2xl font-bold tracking-widest text-accent-gold glow-text-gold"
        data-testid="text-app-title"
      >
        AURA
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary" data-testid="text-user-name">
          {user.name}
        </span>
        <div 
          className="w-8 h-8 rounded-full border-2 border-accent-gold bg-deep-teal glow-border-gold flex items-center justify-center text-accent-gold font-bold text-sm"
          data-testid="avatar-user"
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
