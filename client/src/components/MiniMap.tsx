import { MapPin } from "lucide-react";

interface MiniMapProps {
  location: string;
}

export default function MiniMap({ location }: MiniMapProps) {
  return (
    <div 
      className="p-3 bg-deep-teal/50 rounded-lg border border-accent-teal/20 flex items-center gap-3"
      data-testid="container-minimap"
    >
      <div className="w-12 h-12 bg-charcoal rounded-md border border-accent-teal/30 flex items-center justify-center">
        <MapPin className="w-6 h-6 text-accent-teal" />
      </div>
      <div>
        <h4 className="font-display text-sm text-text-secondary">Mini-Map</h4>
        <p className="text-xs text-accent-teal">{location}</p>
      </div>
    </div>
  );
}
