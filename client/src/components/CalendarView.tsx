import { useMemo } from "react";

interface CalendarViewProps {
  eventDates: number[];
  selectedDate: number | null;
  onDateSelect?: (date: number) => void;
}

export default function CalendarView({ eventDates, selectedDate, onDateSelect }: CalendarViewProps) {
  const calendarDays = useMemo(() => {
    const daysInMonth = 31;
    const firstDayOffset = 4;
    const days: (number | null)[] = [];
    
    for (let i = 0; i < firstDayOffset; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  }, []);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div 
      className="p-4 bg-deep-teal/50 rounded-lg border border-accent-teal/20"
      data-testid="container-calendar"
    >
      <div className="flex justify-between items-center mb-4 gap-2">
        <h3 className="font-display text-xl text-accent-gold">December 2024</h3>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-text-secondary mb-2">
        {weekDays.map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }
          const hasEvent = eventDates.includes(day);
          const isSelected = selectedDate === day;
          
          return (
            <button
              key={day}
              onClick={() => hasEvent && onDateSelect?.(day)}
              className={`h-10 flex flex-col items-center justify-center text-sm relative rounded-md transition-colors ${
                hasEvent 
                  ? 'text-accent-gold font-bold cursor-pointer hover:bg-accent-gold/10' 
                  : 'text-text-secondary cursor-default'
              } ${isSelected ? 'bg-accent-gold/20 ring-1 ring-accent-gold' : ''}`}
              data-testid={`button-date-${day}`}
            >
              {day}
              {hasEvent && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-accent-gold rounded-full glow-text-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
