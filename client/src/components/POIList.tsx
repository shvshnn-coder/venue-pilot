import { Coffee, Users, Briefcase, Palette } from "lucide-react";
import { POI } from "@/lib/mockData";

interface POIListProps {
  pois: POI[];
}

const iconMap: Record<string, typeof Coffee> = {
  "Refreshment": Coffee,
  "Networking Hub": Users,
  "Workspace": Briefcase,
  "Exhibition": Palette,
};

export default function POIList({ pois }: POIListProps) {
  return (
    <div className="space-y-3" data-testid="container-poi-list">
      {pois.map((poi, index) => {
        const Icon = iconMap[poi.type] || Coffee;
        return (
          <div 
            key={index}
            className="p-3 bg-deep-teal/50 rounded-lg border border-accent-teal/20 flex items-start gap-3 hover-elevate"
            data-testid={`card-poi-${index}`}
          >
            <div className="w-10 h-10 bg-charcoal rounded-md border border-accent-teal/30 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-accent-teal" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-display text-sm text-accent-gold truncate">{poi.name}</h4>
              <p className="text-xs text-accent-teal">{poi.type}</p>
              <p className="text-xs text-text-secondary mt-1">{poi.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
