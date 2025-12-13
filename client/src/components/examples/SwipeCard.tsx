import SwipeCard from '../SwipeCard';

export default function SwipeCardExample() {
  return (
    <div className="relative h-80 w-full">
      <SwipeCard
        id="evt1"
        title="Quantum Leap Keynote"
        subtitle="Grand Auditorium, L5, Nexus Tower"
        meta="Dec 15, 09:00"
        tags={["Keynote", "Quantum"]}
        type="event"
        isTop={true}
        stackIndex={0}
        onSwipe={(id, dir) => console.log(`Swiped ${id} ${dir}`)}
      />
    </div>
  );
}
