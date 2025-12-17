import { MapPin } from "lucide-react";

interface MiniMapProps {
  location: string;
}

export default function MiniMap({ location }: MiniMapProps) {
  return (
    <div 
      className="p-3 bg-theme-card/50 rounded-lg border border-theme-accent/20 flex items-center gap-3"
      data-testid="container-minimap"
    >
      <div className="w-12 h-12 bg-theme-surface rounded-md border border-theme-accent/30 flex items-center justify-center">
        <MapPin className="w-6 h-6 text-theme-accent" />
      </div>
      <div>
        <h4 className="font-display text-sm text-theme-text-muted">Mini-Map</h4>
        <p className="text-xs text-theme-accent">{location}</p>
      </div>
    </div>
  );
}
