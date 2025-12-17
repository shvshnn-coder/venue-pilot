import { useState, useMemo } from "react";
import CalendarView from "../CalendarView";
import { Event } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

interface CalendarScreenProps {
  events: Event[];
}

export default function CalendarScreen({ events }: CalendarScreenProps) {
  const likedEvents = useMemo(() => events.filter(e => e.swiped === 'right'), [events]);
  const eventDates = useMemo(() => Array.from(new Set(likedEvents.map(e => e.date))), [likedEvents]);
  const [selectedDate, setSelectedDate] = useState<number | null>(eventDates[0] || null);
  
  const eventsForDate = useMemo(() => 
    likedEvents.filter(e => e.date === selectedDate), 
    [likedEvents, selectedDate]
  );

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn overflow-y-auto" data-testid="screen-calendar">
      <CalendarView 
        eventDates={eventDates}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      
      <div className="mt-4 flex-grow flex flex-col">
        <h3 className="font-display text-lg text-theme-accent text-center mb-3">
          {selectedDate ? `Interested Events: Dec ${selectedDate}` : 'Select a date with events'}
        </h3>
        
        {eventsForDate.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-theme-text-muted text-center p-4">
            {selectedDate 
              ? 'No events for this date yet. Swipe right on events to add them!'
              : 'Swipe right on events you\'re interested in to see them here.'
            }
          </div>
        ) : (
          <div className="space-y-3">
            {eventsForDate.map(event => (
              <div 
                key={event.id}
                className="p-4 bg-theme-card/80 backdrop-blur-md rounded-xl border border-theme-accent/30 hover-elevate"
                data-testid={`card-calendar-event-${event.id}`}
              >
                <h4 className="font-display text-lg font-bold text-theme-highlight">{event.name}</h4>
                <div className="flex items-center gap-2 mt-2 text-theme-text-muted text-sm">
                  <MapPin className="w-4 h-4 text-theme-accent" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-theme-accent text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {event.tags.map(tag => (
                    <Badge 
                      key={tag}
                      variant="outline"
                      className="bg-theme-highlight/10 text-theme-highlight border-theme-highlight/20 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
