interface SeasonData {
  matchday: number;
  totalMatchdays: number;
  teamsCount: number;
  name?: string;
  status?: string;
  nextMatchAt?: string;
}

interface SeasonProgressProps {
  season: SeasonData;
}

export function SeasonProgress({ season }: SeasonProgressProps) {
  const progress = season.totalMatchdays > 0 ? (season.matchday / season.totalMatchdays) * 100 : 0;
  const name = season.name || `Season 1`;
  const status = season.status || "In Progress";

  return (
    <div className="elite-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {season.teamsCount} teams · {status === "active" ? "In Progress" : status}
          </p>
        </div>
        {season.nextMatchAt && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Next match</p>
            <p className="text-sm font-mono text-primary text-glow">
              {new Date(season.nextMatchAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Matchday {season.matchday}</span>
          <span>{season.totalMatchdays} total</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 glow-pitch"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
