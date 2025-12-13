import { useState, useMemo } from "react";
import CardStack from "../CardStack";
import { Attendee } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface AttendeesScreenProps {
  attendees: Attendee[];
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

export default function AttendeesScreen({ attendees, onSwipe }: AttendeesScreenProps) {
  const [viewMode, setViewMode] = useState<'discover' | 'connections'>('discover');
  const [localAttendees, setLocalAttendees] = useState(attendees);

  const connections = useMemo(() => 
    localAttendees.filter(a => a.swiped === 'right'), 
    [localAttendees]
  );

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    setLocalAttendees(prev => 
      prev.map(a => a.id === id ? { ...a, swiped: direction } : a)
    );
    onSwipe?.(id, direction);
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn" data-testid="screen-attendees">
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={viewMode === 'discover' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('discover')}
          className={viewMode === 'discover' 
            ? 'bg-accent-gold text-charcoal border-accent-gold' 
            : 'border-accent-teal text-accent-teal'}
          data-testid="button-view-discover"
        >
          Discover
        </Button>
        <Button
          variant={viewMode === 'connections' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('connections')}
          className={viewMode === 'connections' 
            ? 'bg-accent-gold text-charcoal border-accent-gold' 
            : 'border-accent-teal text-accent-teal'}
          data-testid="button-view-connections"
        >
          Connections ({connections.length})
        </Button>
      </div>

      {viewMode === 'discover' ? (
        <div className="flex-grow relative">
          <CardStack 
            items={localAttendees.filter(a => a.swiped === null)} 
            type="attendee" 
            onSwipe={handleSwipe}
          />
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3">
          {connections.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-secondary text-center p-8">
              No connections yet. Swipe right on attendees you'd like to connect with!
            </div>
          ) : (
            connections.map(attendee => {
              const initials = attendee.name.split(' ').map(n => n[0]).join('');
              return (
                <div 
                  key={attendee.id}
                  className="p-4 bg-deep-teal/80 backdrop-blur-md rounded-xl border border-accent-teal/30 flex items-center gap-4 hover-elevate"
                  data-testid={`card-connection-${attendee.id}`}
                >
                  <div className="w-14 h-14 rounded-full border-2 border-accent-gold bg-charcoal flex items-center justify-center font-display text-xl text-accent-gold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-display text-lg text-accent-gold truncate">{attendee.name}</h4>
                    <p className="text-sm text-accent-teal truncate">{attendee.role}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {attendee.tags.slice(0, 2).map(tag => (
                        <Badge 
                          key={tag}
                          variant="outline"
                          className="bg-accent-teal/10 text-accent-teal border-accent-teal/30 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="icon" variant="outline" className="border-accent-teal text-accent-teal" data-testid={`button-message-${attendee.id}`}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
