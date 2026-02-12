import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { usePlayers, usePlayerPriceHistory } from "@/hooks/use-game-data";
import { TrendingUp, TrendingDown, BarChart3, Search, X, ChevronDown, GitCompareArrows } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Legend } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const PlayerSearchSelect = ({
  players,
  selectedId,
  onSelect,
  placeholder = "Search player...",
  label,
}: {
  players: any[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder?: string;
  label: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return players.slice(0, 50);
    const q = search.toLowerCase();
    return players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      (p.team_real || "").toLowerCase().includes(q)
    ).slice(0, 50);
  }, [players, search]);

  const selected = players.find(p => p.id === selectedId);

  return (
    <div className="flex-1 min-w-[200px]">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">{label}</span>
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) setTimeout(() => inputRef.current?.focus(), 50); }}>
        <PopoverTrigger asChild>
          <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg glass border border-border/50 text-sm hover:border-primary/50 transition-all">
            {selected ? (
              <>
                <span className="font-semibold text-foreground truncate">{selected.name}</span>
                <span className="text-muted-foreground text-xs">{selected.position}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0 bg-card border-border" align="start" sideOffset={4}>
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 px-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, position, or club..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="max-h-[280px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-6">No players found</div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p.id); setOpen(false); setSearch(""); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                    selectedId === p.id ? "bg-primary/15 text-primary" : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.team_real || "Free Agent"}</div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{p.position}</span>
                  <span className="text-xs font-mono font-semibold">{p.overall_rating}</span>
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PriceStats = ({ chartData, player, color }: { chartData: any[]; player: any; color: string }) => {
  const firstPrice = chartData[0]?.price ?? 0;
  const lastPrice = chartData[chartData.length - 1]?.price ?? 0;
  const change = lastPrice - firstPrice;
  const changePct = firstPrice > 0 ? ((change / firstPrice) * 100).toFixed(1) : "0";
  const isUp = change >= 0;
  const high = chartData.length > 0 ? Math.max(...chartData.map(d => d.price)) : 0;
  const low = chartData.length > 0 ? Math.min(...chartData.map(d => d.price)) : 0;

  return (
    <div>
      <p className="text-sm text-muted-foreground">{player?.name} · {player?.position}</p>
      <div className="flex items-end gap-3 mt-1">
        <span className="text-3xl font-bold font-mono text-foreground">{player?.price_ball || lastPrice}</span>
        <span className="text-sm text-muted-foreground">$BALL</span>
        {chartData.length > 1 && (
          <span className={`text-sm font-mono font-semibold flex items-center gap-1`} style={{ color }}>
            {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {isUp ? "+" : ""}{changePct}%
          </span>
        )}
      </div>
      <div className="flex gap-5 text-xs text-muted-foreground mt-2">
        <div><span className="font-mono text-foreground">{high}</span> High</div>
        <div><span className="font-mono text-foreground">{low}</span> Low</div>
      </div>
    </div>
  );
};

const PlayerCharts = () => {
  const { data: players = [], isLoading } = usePlayers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compareId, setCompareId] = useState<string | null>(null);

  const activeId = selectedId || players[0]?.id;
  const activePlayer = players.find(p => p.id === activeId);
  const comparePlayer = players.find(p => p.id === compareId);

  const { data: priceHistory = [] } = usePlayerPriceHistory(activeId);
  const { data: comparePriceHistory = [] } = usePlayerPriceHistory(compareId ?? undefined);

  const chartData = useMemo(() => priceHistory.map(ph => ({
    date: new Date(ph.recorded_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
    price: Math.round(ph.price),
    volume: ph.volume || 0,
  })), [priceHistory]);

  const compareChartData = useMemo(() => comparePriceHistory.map(ph => ({
    date: new Date(ph.recorded_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
    price: Math.round(ph.price),
    volume: ph.volume || 0,
  })), [comparePriceHistory]);

  // Merge data for overlay chart
  const mergedData = useMemo(() => {
    if (!compareId || compareChartData.length === 0) return chartData.map(d => ({ ...d, comparePrice: undefined }));
    const allDates = new Set([...chartData.map(d => d.date), ...compareChartData.map(d => d.date)]);
    const mainMap = Object.fromEntries(chartData.map(d => [d.date, d]));
    const compMap = Object.fromEntries(compareChartData.map(d => [d.date, d]));
    return Array.from(allDates).sort().map(date => ({
      date,
      price: mainMap[date]?.price ?? null,
      volume: mainMap[date]?.volume ?? 0,
      comparePrice: compMap[date]?.price ?? null,
    }));
  }, [chartData, compareChartData, compareId]);

  const isUp = (chartData[chartData.length - 1]?.price ?? 0) >= (chartData[0]?.price ?? 0);
  const COLOR_MAIN = isUp ? "hsl(142, 72%, 50%)" : "hsl(0, 72%, 50%)";
  const COLOR_COMPARE = "hsl(210, 80%, 60%)";

  if (isLoading) return <div className="max-w-6xl mx-auto p-8 text-center text-muted-foreground">Loading players...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Player Share Charts</h1>
        <p className="text-sm text-muted-foreground mt-1">Price history, volume & player comparison</p>
      </motion.div>

      {/* Selectors */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex flex-col sm:flex-row gap-3">
        <PlayerSearchSelect
          players={players}
          selectedId={activeId}
          onSelect={(id) => setSelectedId(id)}
          label="Primary Player"
          placeholder="Select a player..."
        />
        <div className="flex items-end pb-1">
          <GitCompareArrows className="h-5 w-5 text-muted-foreground" />
        </div>
        <PlayerSearchSelect
          players={players.filter(p => p.id !== activeId)}
          selectedId={compareId}
          onSelect={(id) => setCompareId(id)}
          label="Compare Against"
          placeholder="Add comparison..."
        />
      </motion.div>

      {/* Price Overview */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elite-card p-5">
        <div className="flex flex-col md:flex-row gap-6 mb-4">
          <PriceStats chartData={chartData} player={activePlayer} color={COLOR_MAIN} />
          {comparePlayer && compareChartData.length > 0 && (
            <div className="border-l border-border pl-6">
              <PriceStats chartData={compareChartData} player={comparePlayer} color={COLOR_COMPARE} />
            </div>
          )}
        </div>

        {mergedData.length > 0 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mergedData}>
                <defs>
                  <linearGradient id="shareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_MAIN} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLOR_MAIN} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_COMPARE} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLOR_COMPARE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(220, 10%, 45%)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide domain={["dataMin - 30", "dataMax + 30"]} />
                <Tooltip
                  contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "11px", fontFamily: "JetBrains Mono" }}
                  formatter={(v: number, name: string) => [
                    `${v} $BALL`,
                    name === "price" ? activePlayer?.name : comparePlayer?.name
                  ]}
                />
                <Area type="monotone" dataKey="price" stroke={COLOR_MAIN} strokeWidth={2} fill="url(#shareGrad)" name="price" connectNulls />
                {compareId && (
                  <Area type="monotone" dataKey="comparePrice" stroke={COLOR_COMPARE} strokeWidth={2} strokeDasharray="6 3" fill="url(#compareGrad)" name="comparePrice" connectNulls />
                )}
                {compareId && <Legend formatter={(v) => v === "price" ? activePlayer?.name : comparePlayer?.name} />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No price history available</div>
        )}
      </motion.div>

      {/* Volume Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elite-card p-4">
          <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Trade Volume
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", fontSize: "11px", fontFamily: "JetBrains Mono" }} formatter={(v: number) => [`${v} trades`, "Volume"]} />
                <Bar dataKey="volume" fill="hsl(142, 72%, 50%)" opacity={0.5} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerCharts;
