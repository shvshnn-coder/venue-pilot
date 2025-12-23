import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AppHeader from "@/components/AppHeader";
import BottomNav, { Screen } from "@/components/BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import DiscoverScreen from "@/components/screens/DiscoverScreen";
import CalendarScreen from "@/components/screens/CalendarScreen";
import AttendeesScreen from "@/components/screens/AttendeesScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";
import ChatScreen from "@/components/screens/ChatScreen";
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
type SubScreen = 'none' | 'settings' | 'chat';

interface ChatPartner {
  id: string;
  name: string;
}

function AuraApp() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>('none');
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [profileMode, setProfileMode] = useState<ProfileMode>('attendee');
  const [currentUser, setCurrentUser] = useState<User>(mockUser);
  const currentUserId = "current-user";

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

  const handleOpenSettings = () => {
    setSubScreen('settings');
  };

  const handleCloseSettings = () => {
    setSubScreen('none');
  };

  const handleOpenChat = (partnerId: string, partnerName: string) => {
    setChatPartner({ id: partnerId, name: partnerName });
    setSubScreen('chat');
  };

  const handleCloseChat = () => {
    setChatPartner(null);
    setSubScreen('none');
  };

  const handleProfileUpdate = (name: string, role: string) => {
    setCurrentUser(prev => ({ ...prev, name, role }));
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
        return <AttendeesScreen attendees={attendees} onSwipe={handleAttendeeSwipe} onOpenChat={handleOpenChat} />;
      case 'profile':
        return (
          <ProfileScreen 
            user={currentUser} 
            pois={mockPOIs} 
            mode={profileMode}
            onModeChange={setProfileMode}
            onCreateEvent={handleCreateEvent}
            events={events}
            onOpenSettings={handleOpenSettings}
          />
        );
      default:
        return <HomeScreen events={events} onSwipe={handleEventSwipe} />;
    }
  };

  const renderSubScreen = () => {
    if (subScreen === 'settings') {
      return (
        <SettingsScreen
          onBack={handleCloseSettings}
          userId={currentUserId}
          userName={currentUser.name}
          userRole={currentUser.role}
          onProfileUpdate={handleProfileUpdate}
        />
      );
    }
    if (subScreen === 'chat' && chatPartner) {
      return (
        <ChatScreen
          onBack={handleCloseChat}
          currentUserId={currentUserId}
          otherUserId={chatPartner.id}
          otherUserName={chatPartner.name}
        />
      );
    }
    return null;
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
        background: 'var(--app-gradient)'
      }}
      data-testid="container-app"
    >
      {subScreen !== 'none' ? (
        <main className="flex-grow overflow-hidden relative">
          {renderSubScreen()}
        </main>
      ) : (
        <>
          <AppHeader user={currentUser} />
          <main className="flex-grow overflow-hidden relative">
            {renderScreen()}
          </main>
          <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex items-center justify-center p-4">
            <AuraApp />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
