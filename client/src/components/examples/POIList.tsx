import POIList from '../POIList';
import { mockPOIs } from '@/lib/mockData';

export default function POIListExample() {
  return <POIList pois={mockPOIs} />;
}
