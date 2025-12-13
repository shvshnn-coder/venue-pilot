import CardStack from '../CardStack';
import { mockEvents } from '@/lib/mockData';

export default function CardStackExample() {
  return (
    <div className="h-96 w-full p-4">
      <CardStack 
        items={mockEvents.slice(0, 3)} 
        type="event" 
        onSwipe={(id, dir) => console.log(`Swiped ${id} ${dir}`)}
      />
    </div>
  );
}
