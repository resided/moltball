import { Link } from "react-router-dom";

interface MatchCardMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeXg: number;
  awayXg: number;
  possession: [number, number];
  matchday: number;
  status: string;
  events: { minute: number; player: string; team: "home" | "away"; type: string }[];
}

interface MatchCardProps {
  match: MatchCardMatch;
  expanded?: boolean;
}

export function MatchCard({ match, expanded }: MatchCardProps) {
  const isHome = match.homeScore > match.awayScore;
  const isDraw = match.homeScore === match.awayScore;

  return (
    <Link to={`/live/${match.id}`} className="block">
      <div className="elite-card p-4 hover:border-primary/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-mono">MD {match.matchday}</span>
          <span className={match.status === "live" ? "text-primary font-bold" : ""}>{match.status === "completed" ? "FT" : match.status.toUpperCase()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${isHome && !isDraw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.homeTeam}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3">
            <span className={`text-lg font-bold font-mono ${isHome && !isDraw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.homeScore}
            </span>
            <span className="text-muted-foreground/50 text-xs">–</span>
            <span className={`text-lg font-bold font-mono ${!isHome && !isDraw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.awayScore}
            </span>
          </div>
          <div className="flex-1 text-right">
            <p className={`text-sm font-medium ${!isHome && !isDraw ? "text-foreground" : "text-muted-foreground"}`}>
              {match.awayTeam}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span className="font-mono">xG {match.homeXg.toFixed(1)}</span>
          <div className="flex-1 mx-3 h-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary/40 rounded-full"
              style={{ width: `${match.possession[0]}%` }}
            />
          </div>
          <span className="font-mono">xG {match.awayXg.toFixed(1)}</span>
        </div>

        {expanded && match.events.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
            {match.events.map((event, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs ${
                  event.team === "home" ? "justify-start" : "justify-end"
                }`}
              >
                {event.team === "home" && (
                  <>
                    <span className="font-mono text-muted-foreground w-6">{event.minute}'</span>
                    <span className="text-primary">⚽</span>
                    <span className="text-foreground">{event.player}</span>
                  </>
                )}
                {event.team === "away" && (
                  <>
                    <span className="text-foreground">{event.player}</span>
                    <span className="text-primary">⚽</span>
                    <span className="font-mono text-muted-foreground w-6">{event.minute}'</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
