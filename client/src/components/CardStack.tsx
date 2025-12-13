import { useState, useCallback } from "react";
import SwipeCard from "./SwipeCard";
import { Event, Attendee } from "@/lib/mockData";

interface CardStackProps {
  items: (Event | Attendee)[];
  type: 'event' | 'attendee';
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

export default function CardStack({ items: initialItems, type, onSwipe }: CardStackProps) {
  const [items, setItems] = useState(initialItems.filter(i => i.swiped === null));

  const handleSwipe = useCallback((id: string, direction: 'left' | 'right') => {
    setItems(prev => prev.filter(item => item.id !== id));
    onSwipe?.(id, direction);
  }, [onSwipe]);

  if (items.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-text-secondary p-8 text-center" data-testid="text-empty-stack">
        No more items to discover. Check back later!
      </div>
    );
  }

  const visibleItems = items.slice(0, 3);

  return (
    <div className="flex-grow relative" data-testid="container-card-stack">
      {visibleItems.map((item, index) => {
        const isEvent = 'location' in item;
        const initials = !isEvent ? item.name.split(' ').map(n => n[0]).join('') : undefined;
        
        return (
          <SwipeCard
            key={item.id}
            id={item.id}
            title={item.name}
            subtitle={isEvent ? (item as Event).location : (item as Attendee).role}
            meta={isEvent ? (item as Event).time : (item as Attendee).bio}
            tags={item.tags}
            type={type}
            isTop={index === 0}
            stackIndex={index}
            onSwipe={handleSwipe}
            initials={initials}
          />
        );
      })}
    </div>
  );
}
