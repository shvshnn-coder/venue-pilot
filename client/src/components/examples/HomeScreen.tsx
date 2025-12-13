import HomeScreen from '../screens/HomeScreen';
import { mockEvents } from '@/lib/mockData';

export default function HomeScreenExample() {
  return (
    <div className="h-[600px] w-full max-w-[420px] bg-charcoal">
      <HomeScreen events={mockEvents} />
    </div>
  );
}
