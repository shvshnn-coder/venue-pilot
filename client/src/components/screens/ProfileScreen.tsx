import { useState } from "react";
import PreferenceSlider from "../PreferenceSlider";
import POIList from "../POIList";
import { Button } from "@/components/ui/button";
import { User, POI, Event } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { ProfileMode } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, MapPin, Tag, Settings, Check, Palette } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme, Theme } from "@/contexts/ThemeContext";

interface ProfileScreenProps {
  user: User;
  pois: POI[];
  mode: ProfileMode;
  onModeChange: (mode: ProfileMode) => void;
  onCreateEvent: (event: Omit<Event, 'id' | 'swiped'>) => void;
  events: Event[];
  onOpenSettings?: () => void;
}

const themeColors: Record<Theme, { primary: string; secondary: string; bg: string }> = {
  'sci-fi': { primary: 'bg-[hsl(166,100%,70%)]', secondary: 'bg-[hsl(51,100%,50%)]', bg: 'bg-[hsl(210,45%,6%)]' },
  'basic-white': { primary: 'bg-[hsl(220,90%,45%)]', secondary: 'bg-[hsl(220,90%,50%)]', bg: 'bg-[hsl(0,0%,98%)]' },
  'wild-flowers': { primary: 'bg-[hsl(340,65%,55%)]', secondary: 'bg-[hsl(35,85%,55%)]', bg: 'bg-[hsl(45,40%,96%)]' },
};

export default function ProfileScreen({ user, pois, mode, onModeChange, onCreateEvent, events, onOpenSettings }: ProfileScreenProps) {
  const { toast } = useToast();
  const { theme, setTheme, themes } = useTheme();
  const initials = user.name.split(' ').map(n => n[0]).join('');
  const [preferences, setPreferences] = useState({
    keynotes: 80,
    networking: 60,
    workshops: 40,
    panels: 70,
    demos: 50
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    location: '',
    time: '',
    tags: '',
    date: 15,
  });

  const handleSave = () => {
    console.log('Saved preferences:', preferences);
    toast({
      title: "Preferences Saved",
      description: "Your event preferences have been updated."
    });
  };

  const handleCreateEvent = () => {
    if (!newEvent.name || !newEvent.location || !newEvent.time) {
      toast({
        title: "Missing Fields",
        description: "Please fill in event name, location, and time.",
        variant: "destructive"
      });
      return;
    }

    onCreateEvent({
      name: newEvent.name,
      location: newEvent.location,
      time: newEvent.time,
      tags: newEvent.tags.split(',').map(t => t.trim()).filter(Boolean),
      date: newEvent.date,
      recommended: false,
    });

    toast({
      title: "Event Created",
      description: `"${newEvent.name}" has been added to the event list.`
    });

    setNewEvent({ name: '', location: '', time: '', tags: '', date: 15 });
    setDialogOpen(false);
  };

  const myEvents = events.filter(e => e.isUserCreated === true);

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn overflow-y-auto" data-testid="screen-profile">
      <div className="relative text-center mb-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={onOpenSettings}
          className="absolute top-0 right-0 text-theme-accent"
          data-testid="button-open-settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <div className="w-20 h-20 rounded-full border-2 border-theme-highlight bg-theme-surface mx-auto mb-3 glow-border-gold flex items-center justify-center font-display text-3xl text-theme-highlight">
          {initials}
        </div>
        <h2 className="font-display text-2xl font-bold text-theme-highlight" data-testid="text-profile-name">
          {user.name}
        </h2>
        <p className="text-sm text-theme-accent mt-1" data-testid="text-profile-role">{user.role}</p>
        <p className="text-xs text-theme-text-muted mt-2 max-w-xs mx-auto" data-testid="text-profile-tagline">
          "{user.tagline}"
        </p>
      </div>

      <div className="flex gap-2 mb-4 justify-center">
        <Button
          variant={mode === 'attendee' ? 'default' : 'outline'}
          onClick={() => onModeChange('attendee')}
          className={`font-display ${mode === 'attendee' ? 'bg-theme-accent text-theme-surface border-theme-accent glow-border-teal' : 'border-theme-accent/50 text-theme-accent'}`}
          data-testid="button-mode-attendee"
        >
          Attendee
        </Button>
        <Button
          variant={mode === 'organizer' ? 'default' : 'outline'}
          onClick={() => onModeChange('organizer')}
          className={`font-display ${mode === 'organizer' ? 'bg-theme-highlight text-theme-surface border-theme-highlight glow-border-gold' : 'border-theme-highlight/50 text-theme-highlight'}`}
          data-testid="button-mode-organizer"
        >
          Organizer
        </Button>
      </div>

      {mode === 'attendee' ? (
        <>
          <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4 mb-4">
            <h3 className="font-display text-lg text-theme-highlight mb-4">Event Preferences</h3>
            <div className="space-y-4">
              <PreferenceSlider 
                label="Keynotes" 
                defaultValue={preferences.keynotes}
                onChange={(v) => setPreferences(p => ({ ...p, keynotes: v }))}
              />
              <PreferenceSlider 
                label="Networking" 
                defaultValue={preferences.networking}
                onChange={(v) => setPreferences(p => ({ ...p, networking: v }))}
              />
              <PreferenceSlider 
                label="Workshops" 
                defaultValue={preferences.workshops}
                onChange={(v) => setPreferences(p => ({ ...p, workshops: v }))}
              />
              <PreferenceSlider 
                label="Panels" 
                defaultValue={preferences.panels}
                onChange={(v) => setPreferences(p => ({ ...p, panels: v }))}
              />
              <PreferenceSlider 
                label="Tech Demos" 
                defaultValue={preferences.demos}
                onChange={(v) => setPreferences(p => ({ ...p, demos: v }))}
              />
            </div>
            <Button 
              onClick={handleSave}
              className="w-full mt-4 bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
              data-testid="button-save-preferences"
            >
              Save Preferences
            </Button>
          </div>

          <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4 mb-4">
            <h3 className="font-display text-lg text-theme-highlight mb-3">Points of Interest</h3>
            <POIList pois={pois} />
          </div>

          <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
            <h3 className="font-display text-lg text-theme-highlight mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" /> App Theme
            </h3>
            <div className="space-y-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    toast({
                      title: "Theme Changed",
                      description: `Switched to ${t.name} theme.`
                    });
                  }}
                  className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 hover-elevate ${
                    theme === t.id 
                      ? 'border-theme-highlight bg-theme-highlight/10' 
                      : 'border-theme-accent/20 bg-theme-surface/30'
                  }`}
                  data-testid={`button-theme-${t.id}`}
                >
                  <div className="flex gap-1">
                    <div className={`w-4 h-4 rounded-full ${themeColors[t.id].bg} border border-foreground/20`} />
                    <div className={`w-4 h-4 rounded-full ${themeColors[t.id].primary}`} />
                    <div className={`w-4 h-4 rounded-full ${themeColors[t.id].secondary}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-display text-sm text-theme-text">{t.name}</p>
                    <p className="text-xs text-theme-text-muted">{t.description}</p>
                  </div>
                  {theme === t.id && (
                    <Check className="w-5 h-5 text-theme-highlight" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-theme-card/50 rounded-lg border border-theme-highlight/30 p-4 mb-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-display text-lg text-theme-highlight">My Events</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="bg-theme-highlight text-theme-surface border-theme-highlight font-display glow-border-gold"
                    data-testid="button-create-event"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-theme-surface border-theme-accent/30 max-w-[380px]">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl text-theme-highlight">Create New Event</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-name" className="text-theme-accent font-display">Event Name</Label>
                      <Input
                        id="event-name"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Quantum Computing Workshop"
                        className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                        data-testid="input-event-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-location" className="text-theme-accent font-display flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </Label>
                      <Input
                        id="event-location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Innovation Lab, L3"
                        className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                        data-testid="input-event-location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time" className="text-theme-accent font-display flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date & Time
                      </Label>
                      <Input
                        id="event-time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                        placeholder="Dec 16, 14:00"
                        className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                        data-testid="input-event-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-date" className="text-theme-accent font-display">Date (day number)</Label>
                      <Input
                        id="event-date"
                        type="number"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: parseInt(e.target.value) || 15 }))}
                        placeholder="16"
                        min={15}
                        max={31}
                        className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                        data-testid="input-event-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-tags" className="text-theme-accent font-display flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Tags (comma separated)
                      </Label>
                      <Input
                        id="event-tags"
                        value={newEvent.tags}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Workshop, Quantum, Tech"
                        className="bg-theme-card/50 border-theme-accent/30 text-theme-text"
                        data-testid="input-event-tags"
                      />
                    </div>
                    <Button
                      onClick={handleCreateEvent}
                      className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
                      data-testid="button-submit-event"
                    >
                      Create Event
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {myEvents.length === 0 ? (
              <p className="text-theme-text-muted text-sm text-center py-6">
                You haven't created any events yet. Click "Create Event" to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {myEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="bg-theme-surface/50 rounded-lg p-3 border border-theme-accent/20"
                    data-testid={`card-my-event-${event.id}`}
                  >
                    <h4 className="font-display text-theme-highlight font-semibold">{event.name}</h4>
                    <p className="text-xs text-theme-text-muted mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.location}
                    </p>
                    <p className="text-xs text-theme-accent mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {event.time}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {event.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-theme-accent/50 text-theme-accent">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
            <h3 className="font-display text-lg text-theme-highlight mb-3">Organizer Tips</h3>
            <ul className="text-sm text-theme-text-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-theme-accent">1.</span>
                Create events with clear titles and detailed locations.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-theme-accent">2.</span>
                Add relevant tags to help attendees discover your events.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-theme-accent">3.</span>
                Your events will appear in the discovery flow for all attendees.
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
