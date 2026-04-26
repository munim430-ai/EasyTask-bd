import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home as HomeIcon, 
  Briefcase, 
  PlusCircle, 
  Wallet, 
  User, 
  Bell, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Youtube,
  Twitter,
  Smartphone,
  ClipboardList,
  Zap,
  Globe,
  Share2
} from "lucide-react";

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Social Media": return <Zap className="text-rose-500 w-6 h-6" />;
    case "App Install": return <Smartphone className="text-cyan-500 w-6 h-6" />;
    case "SEO/Website": return <Globe className="text-indigo-500 w-6 h-6" />;
    case "Surveys": return <ClipboardList className="text-emerald-500 w-6 h-6" />;
    default: return <Share2 className="text-zinc-400 w-6 h-6" />;
  }
};

const getJobBrandIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("youtube")) return <Youtube className="text-red-500 w-6 h-6" />;
  if (lowerTitle.includes("twitter") || lowerTitle.includes(" x ")) return <Twitter className="text-sky-400 w-6 h-6" />;
  return null;
};
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserData {
  id: string;
  name: string;
  email: string;
  role: "worker" | "employer";
  balance: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  budgetPerTask: number;
  totalNeeded: number;
  remaining: number;
  category: string;
  proofInstructions: string;
  createdAt: string;
}

// --- Components ---

const Header = ({ user, onLogout }: { user: UserData | null; onLogout: () => void }) => (
  <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
        <TrendingUp className="text-white w-5 h-5" />
      </div>
      <h1 className="text-lg font-light tracking-tight text-white uppercase"><span className="font-bold">EasyTask</span>BD</h1>
    </div>
    <div className="flex items-center gap-3">
      <button className="relative p-2 text-zinc-400 hover:bg-white/5 rounded-full transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
      </button>
      {user && (
        <button onClick={onLogout} className="p-2 text-zinc-400 hover:bg-white/5 rounded-full transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      )}
    </div>
  </header>
);

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const BottomNav = ({ role }: { role: "worker" | "employer" }) => {
  const location = useLocation();
  const navItems = role === "worker" 
    ? [
        { path: "/", icon: HomeIcon, label: "Home" },
        { path: "/submissions", icon: CheckCircle2, label: "Tasks" },
        { path: "/wallet", icon: Wallet, label: "Wallet" },
        { path: "/profile", icon: User, label: "Profile" },
      ]
    : [
        { path: "/", icon: HomeIcon, label: "Home" },
        { path: "/post-job", icon: PlusCircle, label: "Post" },
        { path: "/wallet", icon: Wallet, label: "Wallet" },
        { path: "/profile", icon: User, label: "Profile" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-white/5 px-6 py-2 pb-6 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative px-4 py-2",
              isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <motion.div
              whileHover={{ rotateY: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
              {isActive && (
                <motion.div 
                  layoutId="nav-bg"
                  className="absolute inset-[-12px] bg-primary/10 blur-xl rounded-full -z-10"
                />
              )}
            </motion.div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
            {isActive && (
              <motion.div layoutId="nav-glow" className="absolute -top-1 w-8 h-0.5 bg-primary rounded-full shadow-[0_0_12px_rgba(225,29,72,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

// --- Pages ---

const Home = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const categories = ["All", "Social Media", "SEO/Website", "App Install", "Surveys"];

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => {
        if (!res.ok) throw new Error("Connection failed");
        return res.json();
      })
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error, using fallback:", err);
        // Fallback to static data for demo if API fails
        const fallbackJobs = [
          {
            id: "j1",
            title: "Subscribe to YouTube Channel",
            category: "Social Media",
            description: "Visit 'EasyTaskBD' on YouTube and subscribe.",
            budgetPerTask: 2,
            totalNeeded: 500,
            remaining: 482,
            status: "active"
          },
          {
            id: "j2",
            title: "Follow Protocol on Twitter (X)",
            category: "Social Media",
            description: "Follow @EasyTaskBD for updates.",
            budgetPerTask: 1.5,
            totalNeeded: 1000,
            remaining: 950,
            status: "active"
          }
        ];
        setJobs(fallbackJobs as any);
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter(j => {
    const matchesFilter = filter === "All" || j.category === filter;
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return (
    <div className="p-20 text-center space-y-4">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto opacity-40"></div>
      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Establishing Secure Connection...</p>
    </div>
  );

  if (jobs.length === 0 && !loading) return (
    <div className="p-20 text-center space-y-6">
      <div className="relative">
        <AlertCircle className="w-16 h-16 text-zinc-800 mx-auto opacity-20" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-red-500/5 blur-2xl rounded-full"
        ></motion.div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold text-white uppercase tracking-widest">Handshake Failed</p>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">The server nodes are not responding to queries. Please verify network status.</p>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-primary font-black uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        Retry Protocol
      </button>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/10 p-6 rounded-[2rem] border border-primary/20 flex items-center justify-between overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-primary animate-pulse" />
            <h2 className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Live Incentive</h2>
          </div>
          <h2 className="font-bold text-white text-xl tracking-tight">Limited Time Bonus!</h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-1">Earn 5% extra on social media tasks today.</p>
        </div>
        <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-110 transition-transform">
          <TrendingUp className="text-primary w-24 h-24" />
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search Protocols..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-xs text-zinc-300"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                filter === c ? "bg-primary border-primary text-white" : "bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Available Tasks</h3>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-white/5 border-dashed">
            <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">No tasks detected</p>
          </div>
        ) : (
          filteredJobs.map((job, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={job.id}
            >
              <Link
                to={`/job/${job.id}`}
                className="group block bg-card p-5 rounded-[2rem] border border-white/5 card-shadow active:scale-[0.98] transition-all hover:border-primary/20 hover:bg-white/[0.04] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/5 group-hover:ring-primary/30 transition-all">
                      {getJobBrandIcon(job.title) || getCategoryIcon(job.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-[15px] leading-tight tracking-tight group-hover:text-primary transition-colors">{job.title}</h4>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">{job.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                      <p className="text-secondary font-black text-xs">৳{job.budgetPerTask}</p>
                    </div>
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-2">Reward</p>
                  </div>
                </div>
                <div className="mt-6 pt-5 border-t border-white/[0.03] flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Protocol</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-zinc-900 rounded-full overflow-hidden ring-1 ring-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(job.remaining / job.totalNeeded) * 100}%` }}
                        className="h-full bg-gradient-to-r from-secondary to-orange-500 rounded-full" 
                      />
                    </div>
                    <span className="text-[10px] font-black text-white px-2 py-0.5 bg-white/5 border border-white/10 rounded-md">
                      {job.remaining} LEFT
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
};

const Chat = ({ jobId, user }: { jobId: string; user: UserData }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchMessages = () => {
      fetch(`/api/chat/${jobId}`)
        .then(res => res.json())
        .then(data => setMessages(data));
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const send = () => {
    if (!input.trim()) return;
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, userId: user.id, userName: user.name, text: input })
    }).then(() => setInput(""));
  };

  return (
    <div className="bg-card p-6 rounded-3xl border border-white/5 space-y-4 h-[400px] flex flex-col">
      <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Protocol Support</h3>
      <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={cn("max-w-[80%] p-3 rounded-2xl text-[10px]", m.userId === user.id ? "ml-auto bg-primary/20 text-white" : "mr-auto bg-white/5 text-zinc-400")}>
            <p className="font-black uppercase tracking-tighter opacity-50 mb-1">{m.userId === user.id ? "You" : m.userName}</p>
            <p className="leading-relaxed">{m.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..." 
          className="flex-1 bg-zinc-900 border border-white/5 p-3 rounded-xl text-[10px] text-white focus:outline-none"
        />
        <button onClick={send} className="bg-primary px-4 rounded-xl text-[10px] font-black uppercase">Send</button>
      </div>
    </div>
  );
};

const JobDetail = ({ user }: { user: UserData }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [proof, setProof] = useState("");
  const [showChat, setShowChat] = useState(false);
  const location = useLocation();
  const jobId = location.pathname.split("/").pop();

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => {
        const found = data.find((j: Job) => j.id === jobId);
        setJob(found);
      });
  }, [jobId]);

  const handleSubmit = () => {
    if (!proof.trim()) return alert("Proof data required.");
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, userId: user.id, proofData: proof, jobTitle: job?.title })
    }).then(() => {
      alert("Protocol completed. Verification pending.");
      window.history.back();
    });
  };

  if (!job) return <div className="p-20 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">Retrieving job record...</div>;

  return (
    <div className="p-4 space-y-6 pb-32">
      <div className="flex gap-2 mb-2">
        <button 
          onClick={() => setShowChat(false)}
          className={cn("flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", !showChat ? "bg-white/10 border-white/10 text-white" : "border-white/5 text-zinc-600")}
        >
          Protocol Specs
        </button>
        <button 
          onClick={() => setShowChat(true)}
          className={cn("flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", showChat ? "bg-white/10 border-white/10 text-white" : "border-white/5 text-zinc-600")}
        >
          Live Feed
        </button>
      </div>

      {!showChat ? (
        <>
          <div className="bg-card p-6 rounded-3xl card-shadow border border-white/5">
            <h2 className="text-2xl font-light tracking-tight text-white mb-2">{job.title}</h2>
            <div className="flex items-center gap-2">
              <span className="inline-block bg-secondary/10 text-secondary text-[10px] font-black tracking-widest px-2 py-1 rounded uppercase">
                {job.category}
              </span>
              <span className="text-zinc-700 text-xs">•</span>
              <span className="text-secondary text-[10px] font-black tracking-wider uppercase">{job.remaining} TASKS LEFT</span>
            </div>
            
            <div className="mt-10 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full"></div>
                Job Extraction
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/[0.03]">
                {job.description}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Proof Logic</p>
              <div className="p-5 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <p className="text-xs text-secondary/80 font-medium italic">"{job.proofInstructions}"</p>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl card-shadow border border-white/5 space-y-5">
            <h3 className="text-sm font-bold text-white tracking-tight">Deployment Proof</h3>
            <textarea
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="System output or verification code..."
              className="w-full h-32 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 focus:ring-1 focus:ring-primary/40 focus:outline-none transition-all text-xs font-mono text-zinc-400 placeholder:text-zinc-700"
            />
            <button className="w-full py-5 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 group hover:bg-white/[0.08] transition-all">
              <PlusCircle className="w-6 h-6 text-zinc-600 group-hover:text-primary transition-all" />
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">Attach Screenshot</span>
            </button>
            <motion.button 
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="w-full py-5 bg-gradient-to-r from-primary to-rose-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all border border-white/10"
            >
              Submit Protocol
            </motion.button>
          </div>
        </>
      ) : (
        <Chat jobId={jobId!} user={user} />
      )}
    </div>
  );
};

const WalletPage = ({ user }: { user: UserData }) => {
  const [balance, setBalance] = useState(user.balance);
  const [amount, setAmount] = useState("");

  const handleDeposit = () => {
    fetch("/api/wallet/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount, method: "bKash", transactionId: "BK" + Math.random().toString(36).substring(7).toUpperCase() })
    })
    .then(res => res.json())
    .then(data => {
      setBalance(data.balance);
      setAmount("");
      alert("Successfully deposited!");
    });
  };

  return (
    <div className="p-4 space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-primary via-rose-600 to-[#9F1239] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group"
      >
        <motion.div 
          animate={{ rotate: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full"
        />
        <div className="relative z-10">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Liquid Balance</p>
          <h2 className="text-4xl font-black mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold opacity-50">৳</span>{balance.toLocaleString()}
          </h2>
          <div className="mt-8 flex gap-3">
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Cash Out</button>
             <button className="bg-black/20 hover:bg-black/30 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">History</button>
          </div>
        </div>
        <div className="absolute right-0 bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Wallet className="w-48 h-48 rotate-[-15deg]" />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-6 rounded-3xl border border-white/5 card-shadow">
          <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-success/20">
            <TrendingUp className="text-success w-5 h-5" />
          </div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Lifetime Yield</p>
          <p className="text-xl font-black text-white">৳280</p>
        </div>
        <div className="bg-card p-6 rounded-3xl border border-white/5 card-shadow">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <Briefcase className="text-primary w-5 h-5" />
          </div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Ad Spend</p>
          <p className="text-xl font-black text-white">৳0</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-3xl card-shadow border border-white/5 space-y-6">
        <h3 className="text-sm font-bold text-white tracking-tight uppercase px-1">Deposit Capital</h3>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-zinc-600 text-lg">৳</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-10 pr-4 py-5 bg-zinc-900/50 rounded-2xl border border-white/5 focus:ring-2 focus:ring-primary/20 font-black text-xl text-white outline-none"
          />
        </div>
        <div className="flex gap-4">
          {[
            { name: "bKash", color: "bg-primary" },
            { name: "Nagad", color: "bg-[#f48c06]" }
          ].map((method) => (
            <button
              key={method.name}
              onClick={handleDeposit}
              className="flex-1 py-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/[0.08] transition-all group"
            >
              <div className={cn("w-12 h-1 rounded-full opacity-40 group-hover:opacity-100 transition-all", method.color)} />
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-all">{method.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "Social Media",
    description: "",
    proofInstructions: "",
    budgetPerTask: 2,
    totalNeeded: 100
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    }).then(() => {
      alert("Campaign launched successfully.");
      navigate("/");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-32">
      <div className="bg-card p-6 rounded-3xl card-shadow border border-white/5 space-y-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest opacity-80">Campaign Configuration</h3>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Job Designation</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Subscribe to Protocol"
            className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-sm text-zinc-300"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Category Sector</label>
          <select 
            className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-sm text-zinc-300 appearance-none"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option>Social Media</option>
            <option>SEO/Website</option>
            <option>App Install</option>
            <option>Surveys</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Budget ৳ / Task</label>
            <input
              type="number"
              value={formData.budgetPerTask}
              onChange={e => setFormData({ ...formData, budgetPerTask: Number(e.target.value) })}
              className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-secondary/40 focus:outline-none text-sm font-black text-secondary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Labor Nodes</label>
            <input
              type="number"
              value={formData.totalNeeded}
              onChange={e => setFormData({ ...formData, totalNeeded: Number(e.target.value) })}
              className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-sm font-black text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-3xl card-shadow border border-white/5 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Architecture Overview</label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed instructions for the extraction process..."
            className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-sm text-zinc-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-1">Proof Validation Script</label>
          <textarea
            required
            rows={3}
            value={formData.proofInstructions}
            onChange={e => setFormData({ ...formData, proofInstructions: e.target.value })}
            placeholder="What data must be submitted?"
            className="w-full p-4 bg-zinc-900 border border-white/5 border-dashed rounded-2xl focus:ring-1 focus:ring-primary/40 focus:outline-none text-sm text-zinc-400"
          />
        </div>
        
        <div className="pt-4 px-2">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Escrow Lock:</span>
            <span className="text-2xl font-black text-white">৳{formData.budgetPerTask * formData.totalNeeded}</span>
          </div>
          <button type="submit" className="w-full py-5 bg-white/5 hover:bg-white/[0.08] text-white border border-white/10 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl active:scale-[0.98] transition-all">
            Initiate Deployment
          </button>
        </div>
      </div>
    </form>
  );
};

const Auth = ({ onLogin }: { onLogin: (u: UserData) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "worker" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) alert(data.error);
      else onLogin(data.user);
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] radial-glow opacity-60"></div>
      
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <div className="bg-primary w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 ring-4 ring-white/5">
            <TrendingUp className="text-white w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-light text-white uppercase tracking-tighter">
               <span className="font-black">EasyTask</span>BD
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Micro-Task Network</p>
          </div>
        </div>

        <div className="bg-card p-8 rounded-[3rem] card-shadow border border-white/5 space-y-8 mt-10">
          <div className="flex bg-zinc-900 p-1.5 rounded-2xl">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn("flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", isLogin ? "bg-white/10 shadow-lg text-white" : "text-zinc-600")}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn("flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all", !isLogin ? "bg-white/10 shadow-lg text-white" : "text-zinc-600")}
            >
              Initialize
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                required
                type="text"
                placeholder="Identitiy Alias"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/50 focus:outline-none text-sm text-zinc-300 placeholder:text-zinc-700"
              />
            )}
            <input
              required
              type="email"
              placeholder="Email Interface"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/50 focus:outline-none text-sm text-zinc-300 placeholder:text-zinc-700"
            />
            <input
              required
              type="password"
              placeholder="Security Key"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-1 focus:ring-primary/50 focus:outline-none text-sm text-zinc-300 placeholder:text-zinc-700"
            />
            
            {!isLogin && (
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'worker'})}
                  className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", formData.role === 'worker' ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-zinc-600")}
                >
                  Labor
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'employer'})}
                  className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", formData.role === 'employer' ? "border-secondary bg-secondary/10 text-secondary" : "border-white/5 text-zinc-600")}
                >
                  Node
                </button>
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/30 mt-6 active:scale-95 transition-all">
              {isLogin ? "Authenticate" : "Register Node"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Submissions = ({ user }: { user: UserData }) => {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/submissions/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Fetch error");
        return res.json();
      })
      .then(data => {
        setSubs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Submissions API Error:", err);
        setLoading(false);
      });
  }, [user.id]);

  if (loading) return <div className="p-20 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600 animate-pulse">Syncing encrypted data...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Task History</h3>
      </div>
      <div className="space-y-4">
        {subs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-white/5 border-dashed">
            <CheckCircle2 className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">No records found</p>
          </div>
        ) : (
          subs.map((s: any) => (
            <div key={s.id} className="bg-card p-5 rounded-2xl border border-white/5 card-shadow flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white mb-1">{s.jobTitle}</h4>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{new Date(s.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                s.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              )}>
                {s.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Default demo account
  const demoWorker: UserData = {
    id: "demo-u1",
    name: "Demo Worker",
    email: "worker@test.com",
    role: "worker",
    balance: 280
  };

  const demoEmployer: UserData = {
    id: "demo-u2",
    name: "Demo Employer",
    email: "employer@test.com",
    role: "employer",
    balance: 5000
  };

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      setUser(demoWorker); // Default to worker for demo
    }
    setLoading(false);
  }, []);

  const handleLogin = (u: UserData) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(demoWorker); // Reset to demo instead of clearing
    localStorage.removeItem("user");
  };

  const toggleDemoRole = () => {
    if (!user) return;
    const newUser = user.role === "worker" ? demoEmployer : demoWorker;
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  if (loading || !user) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] radial-glow opacity-30 pointer-events-none"></div>
        <Header user={user} onLogout={handleLogout} />
        <main className="max-w-md mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/job/:id" element={<PageTransition><JobDetail user={user} /></PageTransition>} />
              <Route path="/wallet" element={<PageTransition><WalletPage user={user} /></PageTransition>} />
              <Route path="/post-job" element={user.role === "employer" ? <PageTransition><PostJob /></PageTransition> : <Navigate to="/" />} />
              <Route path="/submissions" element={<PageTransition><Submissions user={user} /></PageTransition>} />
              <Route path="/profile" element={
                <PageTransition>
                  <div className="p-8 text-center space-y-10 relative">
                    <div className="space-y-4">
                      <div className="w-28 h-28 bg-card rounded-[3rem] flex items-center justify-center mx-auto border border-white/10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"></div>
                        <User className="w-14 h-14 text-zinc-600 group-hover:text-primary transition-all" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-light tracking-tight text-white">{user.name}</h2>
                        <p className="text-[10px] text-primary uppercase tracking-[0.4em] font-black mt-2 opacity-80">{user.role}</p>
                      </div>
                    </div>
                    
                    <div className="bg-card grid grid-cols-2 divide-x divide-white/[0.03] rounded-[2.5rem] border border-white/5 overflow-hidden card-shadow">
                      <div className="p-6">
                        <p className="text-2xl font-black text-secondary">5.0</p>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Trust Score</p>
                      </div>
                      <div className="p-6">
                        <p className="text-2xl font-black text-white">12</p>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Protocols</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        onClick={toggleDemoRole}
                        className="w-full py-4 bg-primary/20 border border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/30 transition-all"
                      >
                        Switch to {user.role === 'worker' ? 'Employer' : 'Worker'} Mode
                      </button>
                      <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/10 transition-all">Verification Status: Verified</button>
                      <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/10 transition-all">Settings & Privacy</button>
                    </div>
                  </div>
                </PageTransition>
              } />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </main>
    <BottomNav role={user.role} />
  </div>
</BrowserRouter>
);
}
