import { useState } from "react";
import CardStack from "../CardStack";
import FilterChips from "../FilterChips";
import MiniMap from "../MiniMap";
import StatsCard from "../StatsCard";
import { Event } from "@/lib/mockData";

interface HomeScreenProps {
  events: Event[];
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

export default function HomeScreen({ events, onSwipe }: HomeScreenProps) {
  const [stats, setStats] = useState({ swiped: 12, connections: 3 }); // todo: remove mock functionality

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    setStats(prev => ({
      ...prev,
      swiped: prev.swiped + 1,
      connections: direction === 'right' ? prev.connections + 1 : prev.connections
    }));
    onSwipe?.(id, direction);
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn" data-testid="screen-home">
      <FilterChips 
        filters={["Today's Keynotes", "Networking Tonight"]} 
        onFilterChange={(f) => console.log(`Filter: ${f}`)}
      />
      
      <div className="flex-grow relative mt-4">
        <CardStack 
          items={events} 
          type="event" 
          onSwipe={handleSwipe}
        />
      </div>
      
      <div className="flex-shrink-0 grid grid-cols-2 gap-4 mt-4">
        <MiniMap location="Nexus Tower, L5" />
        <StatsCard swipedCount={stats.swiped} connectionsCount={stats.connections} />
      </div>
    </div>
  );
}
