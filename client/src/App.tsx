import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppHeader from "@/components/AppHeader";
import BottomNav, { Screen } from "@/components/BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import DiscoverScreen from "@/components/screens/DiscoverScreen";
import CalendarScreen from "@/components/screens/CalendarScreen";
import AttendeesScreen from "@/components/screens/AttendeesScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import { 
  mockUser, 
  mockEvents, 
  mockAttendees, 
  mockPOIs,
  Event,
  Attendee
} from "@/lib/mockData";

function AuraApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [events, setEvents] = useState<Event[]>(mockEvents); // todo: remove mock functionality
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees); // todo: remove mock functionality

  const handleEventSwipe = (id: string, direction: 'left' | 'right') => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, swiped: direction } : e));
  };

  const handleAttendeeSwipe = (id: string, direction: 'left' | 'right') => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, swiped: direction } : a));
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen events={events} onSwipe={handleEventSwipe} />;
      case 'discover':
        return <DiscoverScreen events={events} onSwipe={handleEventSwipe} />;
      case 'calendar':
        return <CalendarScreen events={events} />;
      case 'attendees':
        return <AttendeesScreen attendees={attendees} onSwipe={handleAttendeeSwipe} />;
      case 'profile':
        return <ProfileScreen user={mockUser} pois={mockPOIs} />;
      default:
        return <HomeScreen events={events} onSwipe={handleEventSwipe} />;
    }
  };

  return (
    <div 
      className="relative mx-auto h-screen max-h-[900px] w-full max-w-[420px] overflow-hidden rounded-lg shadow-2xl shadow-deep-teal/50 flex flex-col"
      style={{
        background: 'radial-gradient(circle at 50% 100%, hsla(195, 60%, 10%, 0.5), transparent 70%), hsl(210, 45%, 6%)'
      }}
      data-testid="container-app"
    >
      <AppHeader user={mockUser} />
      <main className="flex-grow overflow-hidden relative">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex items-center justify-center p-4">
          <AuraApp />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
