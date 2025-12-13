import ProfileScreen from '../screens/ProfileScreen';
import { mockUser, mockPOIs } from '@/lib/mockData';

export default function ProfileScreenExample() {
  return (
    <div className="h-[700px] w-full max-w-[420px] bg-charcoal">
      <ProfileScreen user={mockUser} pois={mockPOIs} />
    </div>
  );
}
