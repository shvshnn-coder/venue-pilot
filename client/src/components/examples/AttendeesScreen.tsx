import AttendeesScreen from '../screens/AttendeesScreen';
import { mockAttendees } from '@/lib/mockData';

export default function AttendeesScreenExample() {
  const attendeesWithSwipes = mockAttendees.map((a, i) => ({
    ...a,
    swiped: i < 2 ? 'right' as const : null
  }));
  
  return (
    <div className="h-[600px] w-full max-w-[420px] bg-charcoal">
      <AttendeesScreen attendees={attendeesWithSwipes} />
    </div>
  );
}
