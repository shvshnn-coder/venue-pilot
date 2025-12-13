import CalendarScreen from '../screens/CalendarScreen';
import { mockEvents } from '@/lib/mockData';

export default function CalendarScreenExample() {
  const eventsWithSwipes = mockEvents.map((e, i) => ({
    ...e,
    swiped: i < 3 ? 'right' as const : null
  }));
  
  return (
    <div className="h-[600px] w-full max-w-[420px] bg-charcoal">
      <CalendarScreen events={eventsWithSwipes} />
    </div>
  );
}
