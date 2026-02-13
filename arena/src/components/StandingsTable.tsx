import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface StandingsTeam {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[];
}

interface StandingsTableProps {
  teams: StandingsTeam[];
  compact?: boolean;
}

function FormBadge({ result }: { result: string }) {
  const cls =
    result === "W"
      ? "bg-primary/20 text-primary"
      : result === "D"
      ? "bg-gold/20 text-gold"
      : "bg-destructive/20 text-destructive";

  return (
    <span className={`inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-bold ${cls}`}>
      {result}
    </span>
  );
}

const ease = [0.25, 0.4, 0.25, 1] as const;

const tableRowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease,
    },
  }),
};

export function StandingsTable({ teams, compact }: StandingsTableProps) {
  return (
    <div className="elite-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase tracking-wider">
            <th className="text-left py-3 px-4 w-8">#</th>
            <th className="text-left py-3 px-2">Team</th>
            <th className="text-center py-3 px-2">P</th>
            <th className="text-center py-3 px-2">W</th>
            <th className="text-center py-3 px-2">D</th>
            <th className="text-center py-3 px-2">L</th>
            {!compact && (
              <>
                <th className="text-center py-3 px-2">GF</th>
                <th className="text-center py-3 px-2">GA</th>
              </>
            )}
            <th className="text-center py-3 px-2">GD</th>
            <th className="text-center py-3 px-2 font-bold">Pts</th>
            {!compact && <th className="text-center py-3 px-2">Form</th>}
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <motion.tr
              key={team.id}
              variants={tableRowVariants}
              initial="initial"
              animate="animate"
              custom={i}
              className={`border-b border-border/20 hover:bg-primary/[0.03] transition-all cursor-pointer group ${
                i < 4 ? "border-l-2 border-l-primary" : i >= teams.length - 2 ? "border-l-2 border-l-destructive" : ""
              }`}
            >
              <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs">
                {i + 1}
              </td>
              <td className="py-2.5 px-2 font-medium text-foreground whitespace-nowrap">
                <Link to={`/team/${team.id}`} className="hover:text-primary transition-colors">
                  {team.name}
                </Link>
              </td>
              <td className="text-center py-2.5 px-2 text-muted-foreground">{team.played}</td>
              <td className="text-center py-2.5 px-2">{team.won}</td>
              <td className="text-center py-2.5 px-2">{team.drawn}</td>
              <td className="text-center py-2.5 px-2">{team.lost}</td>
              {!compact && (
                <>
                  <td className="text-center py-2.5 px-2">{team.goalsFor}</td>
                  <td className="text-center py-2.5 px-2">{team.goalsAgainst}</td>
                </>
              )}
              <td className="text-center py-2.5 px-2 font-mono text-xs">
                {team.goalsFor - team.goalsAgainst > 0 ? "+" : ""}
                {team.goalsFor - team.goalsAgainst}
              </td>
              <td className="text-center py-2.5 px-2 font-bold text-primary">
                {team.points}
              </td>
              {!compact && (
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-0.5 justify-center">
                    {team.form.map((r, fi) => (
                      <FormBadge key={fi} result={r} />
                    ))}
                  </div>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
