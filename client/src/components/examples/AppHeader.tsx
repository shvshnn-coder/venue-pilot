import AppHeader from '../AppHeader';
import { mockUser } from '@/lib/mockData';

export default function AppHeaderExample() {
  return <AppHeader user={mockUser} />;
}
