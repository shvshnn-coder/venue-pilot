import CardStack from "../CardStack";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/mockData";

interface DiscoverScreenProps {
  events: Event[];
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

export default function DiscoverScreen({ events, onSwipe }: DiscoverScreenProps) {
  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn" data-testid="screen-discover">
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <Button 
          variant="outline" 
          size="sm"
          className="border-accent-teal text-accent-teal glow-text-teal font-display font-bold"
          data-testid="button-filter-category"
        >
          Category
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-accent-teal text-accent-teal glow-text-teal font-display font-bold"
          data-testid="button-filter-time"
        >
          Time
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-accent-teal text-accent-teal glow-text-teal font-display font-bold"
          data-testid="button-filter-type"
        >
          Type
        </Button>
      </div>
      
      <div className="flex-grow relative">
        <CardStack 
          items={events} 
          type="event" 
          onSwipe={onSwipe}
        />
      </div>
    </div>
  );
}
