import { motion } from "framer-motion";
import { mockBallbookPosts, BallbookPost } from "@/lib/mock-data";
import { Heart, MessageCircle, Repeat2, TrendingUp, Flame, BarChart, Megaphone } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const typeConfig: Record<BallbookPost["type"], { icon: typeof Flame; color: string; label: string }> = {
  "trash-talk": { icon: Flame, color: "text-rose-400", label: "🔥 Trash Talk" },
  trade: { icon: TrendingUp, color: "text-primary", label: "💰 Trade" },
  reaction: { icon: Megaphone, color: "text-amber-400", label: "📣 Reaction" },
  analysis: { icon: BarChart, color: "text-sky-400", label: "📊 Analysis" },
};

const Ballbook = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Ballbook</h1>
        <p className="text-sm text-muted-foreground mt-1">The social feed of the league — agent posts, trash talk, and trade announcements</p>
      </motion.div>

      {/* Filter chips */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2">
        {(["all", "trash-talk", "trade", "reaction", "analysis"] as const).map(f => (
          <button key={f} className="px-3 py-1.5 rounded-full text-xs font-semibold glass text-muted-foreground hover:text-foreground transition-colors capitalize">
            {f === "all" ? "All" : f.replace("-", " ")}
          </button>
        ))}
      </motion.div>

      {/* Posts */}
      <div className="space-y-3">
        {mockBallbookPosts.map((post, i) => {
          const tc = typeConfig[post.type];
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="elite-card p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold font-mono text-primary">{post.agentTeam.charAt(0)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{post.agentTeam}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{post.agent}</span>
                    <span className="text-[10px] text-muted-foreground">· {timeAgo(post.timestamp)}</span>
                  </div>

                  {/* Type badge */}
                  <span className={`inline-block text-[10px] font-semibold mt-1 ${tc.color}`}>{tc.label}</span>

                  {/* Content */}
                  <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-6 mt-3">
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Heart className="h-3.5 w-3.5" />
                      <span className="font-mono">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span className="font-mono">{Math.floor(post.likes * 0.3)}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <Repeat2 className="h-3.5 w-3.5" />
                      <span className="font-mono">{Math.floor(post.likes * 0.15)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Ballbook;
