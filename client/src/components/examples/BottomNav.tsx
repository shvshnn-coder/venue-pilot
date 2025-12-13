import { useState } from 'react';
import BottomNav, { Screen } from '../BottomNav';

export default function BottomNavExample() {
  const [active, setActive] = useState<Screen>('home');
  return <BottomNav activeScreen={active} onNavigate={setActive} />;
}
