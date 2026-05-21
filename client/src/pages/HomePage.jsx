import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Plus, BarChart3, Vote, ListChecks, ArrowRight, Users, Zap,
  Share2, Lock, FileQuestion, CheckSquare, MessageSquare, Globe
} from "lucide-react";
import { getAllPolls } from "../services/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [recentPolls, setRecentPolls] = useState([]);
  const [stats, setStats] = useState({ totalPolls: 0, totalVotes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPolls();
        const polls = data.polls || [];
        setRecentPolls(polls.slice(0, 4));
        setStats({
          totalPolls: data.pagination?.total || polls.length,
          totalVotes: polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0),
        });
      } catch (err) {
        console.error("Failed to fetch polls:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page-enter">
      {/* Hero — image background */}
      <div className="relative overflow-hidden" style={{ minHeight: "360px" }}>
        <img src="/hero-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/60" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-4 tracking-tight leading-tight">
              Ask your campus<br />
              <span className="text-blue-200">anything.</span>
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-lg mb-8 leading-relaxed" style={{ fontWeight: 400 }}>
              Create a poll in seconds, share a link, and see what people think.
              No sign-up needed to vote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate("/create-poll")} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors">
                <Plus size={18} /> Create a Poll
              </button>
              <button onClick={() => navigate("/polls")} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-medium text-sm border border-white/20 hover:bg-white/20 transition-colors">
                See All Polls <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-8 max-w-md">
            {[
              { label: "Polls Created", value: stats.totalPolls },
              { label: "Total Votes", value: stats.totalVotes },
              { label: "Active Now", value: recentPolls.filter((p) => p.status === "Active").length },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/50 text-xs mt-0.5" style={{ fontWeight: 450 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            { icon: Plus, title: "Create Poll", desc: "Make a new poll with one or more questions", color: "var(--brand-500)", bg: "var(--brand-50)", action: () => navigate("/create-poll") },
            { icon: ListChecks, title: "Browse Polls", desc: "See what others are asking about", color: "var(--success-600)", bg: "var(--success-50)", action: () => navigate("/polls") },
            { icon: Vote, title: "Vote", desc: "Open a poll link and pick your answer", color: "var(--warning-600)", bg: "var(--warning-50)", action: null },
            { icon: BarChart3, title: "Results", desc: "See charts and numbers for any poll", color: "#7c3aed", bg: "#f5f3ff", action: null },
          ].map((item, i) => {
            const Tag = item.action ? "button" : "div";
            return (
              <Tag key={i} onClick={item.action || undefined} className={`card p-5 text-left animate-fade-in-up delay-${i + 1} ${item.action ? "cursor-pointer" : ""}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: item.bg }}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <h3 className="text-sm text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>{item.desc}</p>
              </Tag>
            );
          })}
        </div>

        {/* Recent Polls */}
        {recentPolls.length > 0 && (
          <div className="mb-12 animate-fade-in-up delay-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-gray-900">Recent Polls</h2>
              <button onClick={() => navigate("/polls")} className="btn-ghost text-brand-600 text-xs">
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentPolls.map((poll) => (
                <button key={poll.id} onClick={() => navigate(`/poll/${poll.voteId}`)} className="card p-4 text-left group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{poll.question}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="text-xs text-gray-400">{poll.optionCount} choices</span>
                        <span className="text-xs text-gray-400">{poll.totalVotes} votes</span>
                        <span className={`badge text-[10px] ${poll.status === "Active" ? "badge-success" : "badge-neutral"}`}>{poll.status}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-all flex-shrink-0 mt-0.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mb-14 animate-fade-in-up delay-5">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl text-gray-900 mb-2">How It Works</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto" style={{ fontWeight: 400 }}>
              Three simple steps to get answers from your campus community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: "1", icon: Plus, title: "Create your poll", desc: "Write one or more questions. Pick the type — single choice, multiple choice, or open-ended. Set a close date if you want.", color: "var(--brand-500)" },
              { step: "2", icon: Share2, title: "Share the link", desc: "You get a unique link for your poll. Send it through text, email, social media, or just copy and paste it anywhere.", color: "var(--warning-500)" },
              { step: "3", icon: BarChart3, title: "See what people think", desc: "Watch the votes come in on a live results page. See charts, counts, and which answer is winning.", color: "var(--success-500)" },
            ].map((item, i) => (
              <div key={i} className="card-flat p-6 group hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: item.color }}>
                    {item.step}
                  </div>
                  <h3 className="text-sm text-gray-900">{item.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Can Do */}
        <div className="mb-14 animate-fade-in-up">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl text-gray-900 mb-2">What You Can Do</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto" style={{ fontWeight: 400 }}>
              Campus Poll supports different question types and useful features.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: CheckSquare, title: "Single & Multiple Choice", desc: "Let people pick one answer or let them choose more than one." },
              { icon: MessageSquare, title: "Open-Ended Questions", desc: "Ask questions where people type their own answer in their own words." },
              { icon: FileQuestion, title: "Multiple Questions", desc: "Put several questions in one poll instead of making separate ones." },
              { icon: BarChart3, title: "Live Results", desc: "See votes as they come in. Charts and numbers update on their own." },
              { icon: Lock, title: "No Sign-Up to Vote", desc: "Anyone with the link can vote. They don't need to create an account." },
              { icon: Globe, title: "Share Anywhere", desc: "Every poll gets its own link. Works on phones, tablets, and computers." },
            ].map((item, i) => (
              <div key={i} className="card-flat p-5 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <item.icon size={20} className="text-brand-500 mb-3" />
                <h3 className="text-sm text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed" style={{ fontWeight: 400 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="card-flat p-8 sm:p-12 text-center animate-fade-in-up">
          <h2 className="text-xl sm:text-2xl text-gray-900 mb-3">Ready to ask a question?</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6" style={{ fontWeight: 400 }}>
            It takes less than a minute. No account needed — just type your question, add some choices, and share the link.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/create-poll")} className="btn-primary py-3 px-8">
              <Plus size={18} /> Create a Poll
            </button>
            <button onClick={() => navigate("/polls")} className="btn-secondary py-3 px-8">
              Browse Polls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
