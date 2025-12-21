import { useState, useRef, useCallback } from "react";
import { Clock, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReportBlockModal from "./ReportBlockModal";

interface SwipeCardProps {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  tags: string[];
  type: 'event' | 'attendee';
  isTop: boolean;
  stackIndex: number;
  onSwipe: (id: string, direction: 'left' | 'right') => void;
  initials?: string;
  topCardDragging?: boolean;
  currentUserId?: string;
}

export default function SwipeCard({
  id,
  title,
  subtitle,
  meta,
  tags,
  type,
  isTop,
  stackIndex,
  onSwipe,
  initials,
  topCardDragging = false,
  currentUserId = "current-user"
}: SwipeCardProps) {
  const [dragState, setDragState] = useState({ x: 0, y: 0, isDragging: false });
  const [swipeOpacity, setSwipeOpacity] = useState({ left: 0, right: 0 });
  const [showReportModal, setShowReportModal] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isTop) return;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragState(prev => ({ ...prev, isDragging: true }));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [isTop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging || !isTop) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setDragState({ x: deltaX, y: deltaY, isDragging: true });
    
    const cardWidth = cardRef.current?.clientWidth || 300;
    const opacity = Math.min(Math.abs(deltaX) / (cardWidth / 2), 1);
    setSwipeOpacity({
      left: deltaX < 0 ? opacity : 0,
      right: deltaX > 0 ? opacity : 0
    });
  }, [dragState.isDragging, isTop]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging || !isTop) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const cardWidth = cardRef.current?.clientWidth || 300;
    const threshold = cardWidth / 3;
    
    if (Math.abs(dragState.x) > threshold) {
      const direction = dragState.x > 0 ? 'right' : 'left';
      onSwipe(id, direction);
    }
    
    setDragState({ x: 0, y: 0, isDragging: false });
    setSwipeOpacity({ left: 0, right: 0 });
  }, [dragState, isTop, id, onSwipe]);

  const getTransform = () => {
    if (!isTop) {
      return '';
    }
    if (dragState.isDragging) {
      return `translate(${dragState.x}px, ${dragState.y}px) rotate(${dragState.x * 0.1}deg)`;
    }
    return '';
  };

  const getOpacity = () => {
    if (!isTop) {
      return 0;
    }
    return 1;
  };

  const getBlur = () => {
    return '';
  };

  return (
    <div
      ref={cardRef}
      className={`absolute inset-0 bg-theme-card rounded-xl border border-theme-accent/30 glow-border-teal p-4 flex flex-col ${
        isTop ? 'cursor-grab' : 'pointer-events-none'
      } ${dragState.isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        zIndex: 100 - stackIndex,
        transform: getTransform(),
        opacity: getOpacity(),
        filter: getBlur(),
        transition: dragState.isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s',
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      data-testid={`card-${type}-${id}`}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-theme-accent/5 rounded-bl-full blur-3xl"></div>
      </div>

      {type === 'attendee' && (
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-theme-text-muted"
                onClick={(e) => e.stopPropagation()}
                data-testid={`button-menu-${id}`}
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="theme-card border-theme-accent/30">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReportModal(true);
                }}
                className="text-orange-500 cursor-pointer"
                data-testid={`button-report-${id}`}
              >
                Report or Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {type === 'attendee' && initials ? (
        <div className="flex-grow flex flex-col items-center justify-center relative z-10 text-center">
          <div className="w-24 h-24 rounded-full border-2 border-theme-highlight bg-theme-surface mb-4 glow-border-gold flex items-center justify-center font-display text-4xl text-theme-highlight">
            {initials}
          </div>
          <h3 className="font-display text-2xl font-bold text-theme-highlight" data-testid="text-card-title">{title}</h3>
          <p className="text-theme-accent">{subtitle}</p>
          {meta && <p className="text-theme-text-muted mt-4 text-sm max-w-xs mx-auto">"{meta}"</p>}
        </div>
      ) : (
        <div className="relative z-10 flex-grow">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-display text-2xl font-bold text-theme-highlight" data-testid="text-card-title">{title}</h3>
            <div className="w-16 h-16 border border-theme-accent/50 flex items-center justify-center flex-shrink-0">
              <Clock className="w-8 h-8 text-theme-accent" />
            </div>
          </div>
          <div className="mt-2 text-theme-text-muted">
            <p>{subtitle}</p>
            {meta && <p className="text-theme-accent font-medium">{meta}</p>}
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-wrap gap-2 mt-4">
        {tags.map(tag => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="bg-theme-accent/10 text-theme-accent border-theme-accent/30 text-xs font-bold"
          >
            {tag}
          </Badge>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-between w-full px-4 pointer-events-none">
        <div 
          className="border-2 border-red-500 text-red-500 font-bold text-2xl px-6 py-2 rounded-lg -rotate-12 transition-opacity bg-red-500/10"
          style={{ opacity: swipeOpacity.left }}
        >
          SKIP
        </div>
        <div 
          className="border-2 border-green-500 text-green-500 font-bold text-2xl px-6 py-2 rounded-lg rotate-12 transition-opacity bg-green-500/10"
          style={{ opacity: swipeOpacity.right }}
        >
          {type === 'attendee' ? 'CONNECT' : 'INTERESTED'}
        </div>
      </div>

      {type === 'attendee' && (
        <ReportBlockModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetUserId={id}
          targetUserName={title}
          currentUserId={currentUserId}
          mode="both"
        />
      )}
    </div>
  );
}
