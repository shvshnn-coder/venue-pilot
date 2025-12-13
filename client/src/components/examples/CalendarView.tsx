import { useState } from 'react';
import CalendarView from '../CalendarView';

export default function CalendarViewExample() {
  const [selected, setSelected] = useState<number | null>(15);
  return (
    <CalendarView 
      eventDates={[15, 16, 17]} 
      selectedDate={selected}
      onDateSelect={(d) => setSelected(d)}
    />
  );
}
