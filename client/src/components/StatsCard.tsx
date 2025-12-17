interface StatsCardProps {
  swipedCount: number;
  connectionsCount: number;
}

export default function StatsCard({ swipedCount, connectionsCount }: StatsCardProps) {
  return (
    <div 
      className="p-3 bg-theme-card/50 rounded-lg border border-theme-accent/20"
      data-testid="container-stats"
    >
      <h4 className="font-display text-sm text-theme-text-muted text-center">Stats</h4>
      <div className="flex justify-around mt-1 gap-4">
        <div className="text-center">
          <span className="text-theme-highlight font-bold text-lg" data-testid="text-swiped-count">
            {swipedCount}
          </span>
          <span className="text-xs text-theme-text-muted ml-1">Swiped</span>
        </div>
        <div className="text-center">
          <span className="text-theme-highlight font-bold text-lg" data-testid="text-connections-count">
            {connectionsCount}
          </span>
          <span className="text-xs text-theme-text-muted ml-1">Connections</span>
        </div>
      </div>
    </div>
  );
}
