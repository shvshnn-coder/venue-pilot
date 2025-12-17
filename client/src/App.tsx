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
import SplashScreen from "@/components/screens/SplashScreen";
import SignUpScreen from "@/components/screens/SignUpScreen";
import { 
  mockUser, 
  mockEvents, 
  mockAttendees, 
  mockPOIs,
  Event,
  Attendee,
  User
} from "@/lib/mockData";

export type ProfileMode = 'attendee' | 'organizer';
type AppState = 'splash' | 'signup' | 'main';

function AuraApp() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [events, setEvents] = useState<Event[]>(mockEvents); // todo: remove mock functionality
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees); // todo: remove mock functionality
  const [profileMode, setProfileMode] = useState<ProfileMode>('attendee');
  const [currentUser, setCurrentUser] = useState<User>(mockUser);

  const handleEventSwipe = (id: string, direction: 'left' | 'right') => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, swiped: direction } : e));
  };

  const handleAttendeeSwipe = (id: string, direction: 'left' | 'right') => {
    setAttendees(prev => prev.map(a => a.id === id ? { ...a, swiped: direction } : a));
  };

  const handleCreateEvent = (newEvent: Omit<Event, 'id' | 'swiped' | 'isUserCreated'>) => {
    const event: Event = {
      ...newEvent,
      id: `evt${Date.now()}`,
      swiped: null,
      isUserCreated: true,
    };
    setEvents(prev => [event, ...prev]);
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
        return (
          <ProfileScreen 
            user={currentUser} 
            pois={mockPOIs} 
            mode={profileMode}
            onModeChange={setProfileMode}
            onCreateEvent={handleCreateEvent}
            events={events}
          />
        );
      default:
        return <HomeScreen events={events} onSwipe={handleEventSwipe} />;
    }
  };

  const handleSignUpComplete = (userData: { name: string; avatar?: string }) => {
    setCurrentUser({
      name: userData.name,
      role: "Event Enthusiast",
      tagline: "Discovering amazing experiences"
    });
    setAppState('main');
  };

  if (appState === 'splash') {
    return (
      <div 
        className="relative mx-auto h-screen max-h-[900px] w-full max-w-[420px] overflow-hidden rounded-lg shadow-2xl shadow-deep-teal/50"
        data-testid="container-splash"
      >
        <SplashScreen onComplete={() => setAppState('signup')} />
      </div>
    );
  }

  if (appState === 'signup') {
    return (
      <div 
        className="relative mx-auto h-screen max-h-[900px] w-full max-w-[420px] overflow-hidden rounded-lg shadow-2xl shadow-deep-teal/50"
        data-testid="container-signup"
      >
        <SignUpScreen onComplete={handleSignUpComplete} />
      </div>
    );
  }

  return (
    <div 
      className="relative mx-auto h-screen max-h-[900px] w-full max-w-[420px] overflow-hidden rounded-lg shadow-2xl shadow-deep-teal/50 flex flex-col"
      style={{
        background: 'radial-gradient(circle at 50% 100%, hsla(195, 60%, 10%, 0.5), transparent 70%), hsl(210, 45%, 6%)'
      }}
      data-testid="container-app"
    >
      <AppHeader user={currentUser} />
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
