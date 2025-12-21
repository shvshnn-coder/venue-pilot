import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import CardStack from "../CardStack";
import FilterChips from "../FilterChips";
import MiniMap from "../MiniMap";
import StatsCard from "../StatsCard";
import { Event } from "@/lib/mockData";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface HomeScreenProps {
  events: Event[];
  userId?: string;
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

interface Swipe {
  id: string;
  userId: string;
  targetId: string;
  targetType: string;
  direction: string;
}

export default function HomeScreen({ events, userId = "current-user", onSwipe }: HomeScreenProps) {
  const { data: swipes = [] } = useQuery<Swipe[]>({
    queryKey: ["/api/swipes", userId],
  });

  const { data: connections = [] } = useQuery<any[]>({
    queryKey: ["/api/connections", userId],
  });

  const swipeMutation = useMutation({
    mutationFn: async (data: { targetId: string; direction: string }) => {
      return apiRequest("POST", "/api/swipes", {
        userId,
        targetId: data.targetId,
        targetType: "event",
        direction: data.direction,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/swipes", userId] });
    },
  });

  const eventSwipes = swipes.filter(s => s.targetType === 'event');
  const swipedEventIds = new Set(eventSwipes.map(s => s.targetId));
  const unswipedEvents = events.filter(e => !swipedEventIds.has(e.id));

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    swipeMutation.mutate({ targetId: id, direction });
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
          items={unswipedEvents} 
          type="event" 
          onSwipe={handleSwipe}
        />
      </div>
      
      <div className="flex-shrink-0 grid grid-cols-2 gap-4 mt-4">
        <MiniMap />
        <StatsCard swipedCount={eventSwipes.length} connectionsCount={connections.length} />
      </div>
    </div>
  );
}
