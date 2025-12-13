import DiscoverScreen from '../screens/DiscoverScreen';
import { mockEvents } from '@/lib/mockData';

export default function DiscoverScreenExample() {
  return (
    <div className="h-[600px] w-full max-w-[420px] bg-charcoal">
      <DiscoverScreen events={mockEvents} />
    </div>
  );
}
