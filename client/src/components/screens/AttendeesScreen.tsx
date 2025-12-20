import { useState, useMemo } from "react";
import CardStack from "../CardStack";
import { Attendee } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReportBlockModal from "../ReportBlockModal";

interface AttendeesScreenProps {
  attendees: Attendee[];
  onSwipe?: (id: string, direction: 'left' | 'right') => void;
}

export default function AttendeesScreen({ attendees, onSwipe }: AttendeesScreenProps) {
  const [viewMode, setViewMode] = useState<'discover' | 'connections'>('discover');
  const [localAttendees, setLocalAttendees] = useState(attendees);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const currentUserId = "current-user";

  const connections = useMemo(() => 
    localAttendees.filter(a => a.swiped === 'right'), 
    [localAttendees]
  );

  const handleSwipe = (id: string, direction: 'left' | 'right') => {
    setLocalAttendees(prev => 
      prev.map(a => a.id === id ? { ...a, swiped: direction } : a)
    );
    onSwipe?.(id, direction);
  };

  return (
    <div className="p-4 h-full flex flex-col animate-fadeIn" data-testid="screen-attendees">
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant={viewMode === 'discover' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('discover')}
          className={viewMode === 'discover' 
            ? 'bg-theme-highlight text-theme-surface border-theme-highlight' 
            : 'border-theme-accent text-theme-accent'}
          data-testid="button-view-discover"
        >
          Discover
        </Button>
        <Button
          variant={viewMode === 'connections' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('connections')}
          className={viewMode === 'connections' 
            ? 'bg-theme-highlight text-theme-surface border-theme-highlight' 
            : 'border-theme-accent text-theme-accent'}
          data-testid="button-view-connections"
        >
          Connections ({connections.length})
        </Button>
      </div>

      {viewMode === 'discover' ? (
        <div className="flex-grow relative">
          <CardStack 
            items={localAttendees.filter(a => a.swiped === null)} 
            type="attendee" 
            onSwipe={handleSwipe}
          />
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3">
          {connections.length === 0 ? (
            <div className="flex items-center justify-center h-full text-theme-text-muted text-center p-8">
              No connections yet. Swipe right on attendees you'd like to connect with!
            </div>
          ) : (
            connections.map(attendee => {
              const initials = attendee.name.split(' ').map(n => n[0]).join('');
              return (
                <div 
                  key={attendee.id}
                  className="p-4 bg-theme-card/80 backdrop-blur-md rounded-xl border border-theme-accent/30 flex items-center gap-4 hover-elevate"
                  data-testid={`card-connection-${attendee.id}`}
                >
                  <div className="w-14 h-14 rounded-full border-2 border-theme-highlight bg-theme-surface flex items-center justify-center font-display text-xl text-theme-highlight flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-display text-lg text-theme-highlight truncate">{attendee.name}</h4>
                    <p className="text-sm text-theme-accent truncate">{attendee.role}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {attendee.tags.slice(0, 2).map(tag => (
                        <Badge 
                          key={tag}
                          variant="outline"
                          className="bg-theme-accent/10 text-theme-accent border-theme-accent/30 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="icon" variant="outline" className="border-theme-accent text-theme-accent" data-testid={`button-message-${attendee.id}`}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-theme-text-muted" data-testid={`button-menu-connection-${attendee.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="theme-card border-theme-accent/30">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedAttendee(attendee);
                            setReportModalOpen(true);
                          }}
                          className="text-orange-500 cursor-pointer"
                          data-testid={`button-report-connection-${attendee.id}`}
                        >
                          Report or Block
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {selectedAttendee && (
        <ReportBlockModal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setSelectedAttendee(null);
          }}
          targetUserId={selectedAttendee.id}
          targetUserName={selectedAttendee.name}
          currentUserId={currentUserId}
          mode="both"
        />
      )}
    </div>
  );
}
