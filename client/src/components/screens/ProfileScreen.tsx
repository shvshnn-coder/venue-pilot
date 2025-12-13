import { useState } from "react";
import PreferenceSlider from "../PreferenceSlider";
import POIList from "../POIList";
import { Button } from "@/components/ui/button";
import { User, POI } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

interface ProfileScreenProps {
  user: User;
  pois: POI[];
}

export default function ProfileScreen({ user, pois }: ProfileScreenProps) {
  const { toast } = useToast();
  const initials = user.name.split(' ').map(n => n[0]).join('');
  const [preferences, setPreferences] = useState({
    keynotes: 80,
    networking: 60,
    workshops: 40,
    panels: 70,
    demos: 50
  });

  const handleSave = () => {
    console.log('Saved preferences:', preferences);
    toast({
      title: "Preferences Saved",
      description: "Your event preferences have been updated."
    });
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn overflow-y-auto" data-testid="screen-profile">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-accent-gold bg-charcoal mx-auto mb-3 glow-border-gold flex items-center justify-center font-display text-3xl text-accent-gold">
          {initials}
        </div>
        <h2 className="font-display text-2xl font-bold text-accent-gold" data-testid="text-profile-name">
          {user.name}
        </h2>
        <p className="text-sm text-accent-teal mt-1" data-testid="text-profile-role">{user.role}</p>
        <p className="text-xs text-text-secondary mt-2 max-w-xs mx-auto" data-testid="text-profile-tagline">
          "{user.tagline}"
        </p>
      </div>

      <div className="bg-deep-teal/50 rounded-lg border border-accent-teal/20 p-4 mb-4">
        <h3 className="font-display text-lg text-accent-gold mb-4">Event Preferences</h3>
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
          className="w-full mt-4 bg-accent-gold text-charcoal border-accent-gold font-display font-bold glow-border-gold"
          data-testid="button-save-preferences"
        >
          Save Preferences
        </Button>
      </div>

      <div className="bg-deep-teal/50 rounded-lg border border-accent-teal/20 p-4">
        <h3 className="font-display text-lg text-accent-gold mb-3">Points of Interest</h3>
        <POIList pois={pois} />
      </div>
    </div>
  );
}
