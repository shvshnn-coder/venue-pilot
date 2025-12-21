import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, X, Layers, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VenueLocation {
  id: string;
  name: string;
  floor: string;
  zone: string;
  x: string;
  y: string;
  eventCount: string | null;
}

interface MiniMapProps {
  location?: string;
  onLocationSelect?: (location: VenueLocation) => void;
}

export default function MiniMap({ location, onLocationSelect }: MiniMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("L1");
  const [selectedLocation, setSelectedLocation] = useState<VenueLocation | null>(null);

  const { data: locations = [] } = useQuery<VenueLocation[]>({
    queryKey: ["/api/venue/locations"],
  });

  const floors = ["L1", "L2", "L3", "L5"];
  const filteredLocations = locations.filter(loc => loc.floor === selectedFloor);

  const handleLocationTap = (loc: VenueLocation) => {
    setSelectedLocation(loc);
    onLocationSelect?.(loc);
  };

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="p-3 bg-theme-card/50 rounded-lg border border-theme-accent/20 flex items-center gap-3 w-full text-left hover-elevate active-elevate-2"
        data-testid="button-expand-minimap"
      >
        <div className="w-12 h-12 bg-theme-surface rounded-md border border-theme-accent/30 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-theme-accent" />
        </div>
        <div>
          <h4 className="font-display text-sm text-theme-text-muted">Mini-Map</h4>
          <p className="text-xs text-theme-accent">{location || "Tap to explore venue"}</p>
        </div>
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-theme-background/95 backdrop-blur-md flex flex-col animate-fadeIn"
      data-testid="container-minimap-expanded"
    >
      <div className="flex items-center justify-between p-4 border-b border-theme-accent/20">
        <h2 className="font-display text-xl text-theme-highlight">Venue Map</h2>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => setIsExpanded(false)}
          data-testid="button-close-minimap"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto">
        {floors.map(floor => (
          <Button
            key={floor}
            size="sm"
            variant={selectedFloor === floor ? "default" : "outline"}
            onClick={() => setSelectedFloor(floor)}
            className={selectedFloor === floor 
              ? "bg-theme-highlight text-theme-surface" 
              : "border-theme-accent/30 text-theme-accent"}
            data-testid={`button-floor-${floor}`}
          >
            <Layers className="w-3 h-3 mr-1" />
            {floor}
          </Button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <div 
          className="relative w-full h-full bg-theme-surface/50 rounded-xl border border-theme-accent/20 overflow-hidden"
          data-testid="container-venue-map"
        >
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-theme-accent/20" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            <rect x="5" y="5" width="90" height="90" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-theme-accent/40" rx="2" />
            
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.3" className="text-theme-accent/30" strokeDasharray="2,2" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.3" className="text-theme-accent/30" strokeDasharray="2,2" />
            
            {filteredLocations.map(loc => {
              const x = parseFloat(loc.x);
              const y = parseFloat(loc.y);
              const isSelected = selectedLocation?.id === loc.id;
              const eventCount = parseInt(loc.eventCount || "0");
              
              return (
                <g key={loc.id} onClick={() => handleLocationTap(loc)} style={{ cursor: 'pointer' }}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isSelected ? 6 : 4}
                    className={isSelected ? "fill-theme-highlight" : "fill-theme-accent"}
                    data-testid={`marker-location-${loc.id}`}
                  />
                  {isSelected && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={10}
                      className="fill-none stroke-theme-highlight"
                      strokeWidth="0.5"
                      opacity={0.5}
                    />
                  )}
                  {eventCount > 0 && (
                    <text 
                      x={x + 5} 
                      y={y - 3} 
                      className="fill-theme-text text-[3px] font-bold"
                    >
                      {eventCount}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-4 text-xs text-theme-text-muted">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-theme-accent" />
                <span>Location</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-theme-highlight" />
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedLocation && (
        <div className="p-4 border-t border-theme-accent/20 bg-theme-card/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-theme-highlight truncate">
                {selectedLocation.name}
              </h3>
              <p className="text-sm text-theme-text-muted">
                Floor {selectedLocation.floor}, Zone {selectedLocation.zone}
              </p>
              {selectedLocation.eventCount && parseInt(selectedLocation.eventCount) > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-3 h-3 text-theme-accent" />
                  <span className="text-xs text-theme-accent">
                    {selectedLocation.eventCount} events happening here
                  </span>
                </div>
              )}
            </div>
            <Badge 
              variant="outline" 
              className="bg-theme-accent/10 text-theme-accent border-theme-accent/30 shrink-0"
            >
              {selectedLocation.zone}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
