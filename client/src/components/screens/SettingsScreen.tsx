import { useState, useEffect } from "react";
import { ArrowLeft, Globe, Eye, EyeOff, User, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { Check } from "lucide-react";

interface SettingsScreenProps {
  onBack: () => void;
  userId: string;
  userName: string;
  userRole: string;
  onProfileUpdate: (name: string, role: string) => void;
}

const themeColors: Record<Theme, { primary: string; secondary: string; bg: string }> = {
  'sci-fi': { primary: 'bg-[hsl(166,100%,70%)]', secondary: 'bg-[hsl(51,100%,50%)]', bg: 'bg-[hsl(210,45%,6%)]' },
  'basic-white': { primary: 'bg-[hsl(220,90%,45%)]', secondary: 'bg-[hsl(220,90%,50%)]', bg: 'bg-[hsl(0,0%,98%)]' },
  'wild-flowers': { primary: 'bg-[hsl(340,65%,55%)]', secondary: 'bg-[hsl(35,85%,55%)]', bg: 'bg-[hsl(45,40%,96%)]' },
};

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

export default function SettingsScreen({ onBack, userId, userName, userRole, onProfileUpdate }: SettingsScreenProps) {
  const { toast } = useToast();
  const { theme, setTheme, themes } = useTheme();
  const [editName, setEditName] = useState(userName);
  const [editRole, setEditRole] = useState(userRole);
  const [language, setLanguage] = useState("en");
  const [invisibleMode, setInvisibleMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  interface SettingsData {
    userId: string;
    language: string;
    invisibleMode: string;
    isPremium: string;
  }

  const { data: settings } = useQuery<SettingsData>({
    queryKey: ["/api/settings", userId],
  });

  useEffect(() => {
    if (settings) {
      setLanguage(settings.language || "en");
      setInvisibleMode(settings.invisibleMode === "true");
      setIsPremium(settings.isPremium === "true");
    }
  }, [settings]);

  const settingsMutation = useMutation({
    mutationFn: async (data: { userId: string; language?: string; invisibleMode?: string; isPremium?: string }) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings", userId] });
    },
  });

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    settingsMutation.mutate({ userId, language: newLang });
    toast({
      title: "Language Updated",
      description: `Language changed to ${languages.find(l => l.code === newLang)?.name}`,
    });
  };

  const handleInvisibleModeToggle = (enabled: boolean) => {
    if (!isPremium && enabled) {
      toast({
        title: "Premium Feature",
        description: "Invisible mode is available for premium members only.",
        variant: "destructive",
      });
      return;
    }
    setInvisibleMode(enabled);
    settingsMutation.mutate({ userId, invisibleMode: enabled ? "true" : "false" });
    toast({
      title: enabled ? "Invisible Mode On" : "Invisible Mode Off",
      description: enabled ? "You are now invisible to other attendees." : "You are now visible to other attendees.",
    });
  };

  const handleSaveProfile = () => {
    onProfileUpdate(editName, editRole);
    toast({
      title: "Profile Updated",
      description: "Your profile has been saved.",
    });
  };

  const handleUpgradeToPremium = () => {
    toast({
      title: "Coming Soon",
      description: "Premium upgrade will be available soon!",
    });
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn overflow-y-auto" data-testid="screen-settings">
      <div className="flex items-center gap-3 mb-6">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="text-theme-accent"
          data-testid="button-settings-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-display text-2xl font-bold text-theme-highlight">Settings</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
          <h3 className="font-display text-lg text-theme-highlight mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Edit Profile
          </h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-theme-accent font-display">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-theme-surface border-theme-accent/30 text-theme-text"
                data-testid="input-settings-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-theme-accent font-display">Role / Title</Label>
              <Input
                id="role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="bg-theme-surface border-theme-accent/30 text-theme-text"
                data-testid="input-settings-role"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              className="w-full bg-theme-highlight text-theme-surface border-theme-highlight font-display font-bold glow-border-gold"
              data-testid="button-save-profile"
            >
              Save Profile
            </Button>
          </div>
        </div>

        <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
          <h3 className="font-display text-lg text-theme-highlight mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Language
          </h3>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="bg-theme-surface border-theme-accent/30 text-theme-text" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-theme-card border-theme-accent/30">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code} className="text-theme-text">
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
          <h3 className="font-display text-lg text-theme-highlight mb-3 flex items-center gap-2">
            App Theme
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

        <div className="bg-theme-card/50 rounded-lg border border-theme-accent/20 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {invisibleMode ? (
                <EyeOff className="w-5 h-5 text-theme-accent" />
              ) : (
                <Eye className="w-5 h-5 text-theme-accent" />
              )}
              <div>
                <h3 className="font-display text-theme-highlight">Invisible Mode</h3>
                <p className="text-xs text-theme-text-muted">Hide yourself from other attendees</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPremium && (
                <Crown className="w-4 h-4 text-amber-500" />
              )}
              <Switch
                checked={invisibleMode}
                onCheckedChange={handleInvisibleModeToggle}
                disabled={!isPremium}
                data-testid="switch-invisible-mode"
              />
            </div>
          </div>
          {!isPremium && (
            <div className="mt-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-amber-500 font-display">Premium Feature</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUpgradeToPremium}
                  className="border-amber-500 text-amber-500 font-display"
                  data-testid="button-upgrade-premium"
                >
                  Upgrade
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
