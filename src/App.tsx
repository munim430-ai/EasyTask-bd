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
  Image as ImageIcon
} from "lucide-react";
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
              "flex flex-col items-center gap-1 transition-all duration-300 relative",
              isActive ? "text-primary scale-110" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            {isActive && (
              <motion.div layoutId="nav-glow" className="absolute -top-1 w-6 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(225,29,72,0.5)]" />
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

  useEffect(() => {
    fetch("/api/jobs")
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-widest">Initalizing Database...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-primary/10 p-5 rounded-3xl border border-primary/20 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="font-bold text-white text-lg">Limited Time Bonus!</h2>
          <p className="text-xs text-primary/80 font-medium">Earn 5% extra on social media tasks today.</p>
        </div>
        <div className="absolute right-[-10px] top-[-10px] opacity-10">
          <TrendingUp className="text-primary w-24 h-24" />
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Available Tasks</h3>
        <button className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full border border-white/5 text-zinc-300">Filter</button>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-white/5 border-dashed">
            <Briefcase className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-600">No tasks detected</p>
          </div>
        ) : (
          jobs.map((job) => (
            <Link
              key={job.id}
              to={`/job/${job.id}`}
              className="block bg-card p-4 rounded-2xl border border-white/5 card-shadow active:scale-[0.98] transition-all hover:border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 ring-1 ring-white/5">
                    <ImageIcon className="text-zinc-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight tracking-tight">{job.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter mt-1.5">{job.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-secondary font-black text-sm">৳{job.budgetPerTask}</p>
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">Reward</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] font-bold text-zinc-600">2 MINUTES AGO</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-16 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full" 
                      style={{ width: `${(job.remaining / job.totalNeeded) * 100}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-secondary uppercase tracking-tighter">
                    {job.remaining} LEFT
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

const JobDetail = () => {
  const [job, setJob] = useState<Job | null>(null);
  const [proof, setProof] = useState("");
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

  if (!job) return <div className="p-20 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">Retrieving job record...</div>;

  return (
    <div className="p-4 space-y-6 pb-24">
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
        <button 
          onClick={() => {
            alert("Protocol completed. Verification pending.");
            window.history.back();
          }}
          className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Submit Protocol
        </button>
      </div>
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
      <div className="bg-gradient-to-br from-primary to-[#9F1239] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden ring-1 ring-white/20">
        <div className="relative z-10">
          <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Liquid Balance</p>
          <h2 className="text-4xl font-black mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold opacity-50">৳</span>{balance.toLocaleString()}
          </h2>
          <div className="mt-8 flex gap-3">
             <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cash Out</button>
             <button className="bg-black/20 hover:bg-black/30 backdrop-blur-md px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">History</button>
          </div>
        </div>
        <div className="absolute right-[-20%] bottom-[-20%] opacity-10 blur-xl">
          <Wallet className="w-64 h-64" />
        </div>
      </div>

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

export default function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (u: UserData) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) return null;

  if (!user) return <Auth onLogin={handleLogin} />;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] radial-glow opacity-30 pointer-events-none"></div>
        <Header user={user} onLogout={handleLogout} />
        <main className="max-w-md mx-auto relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/job/:id" element={<JobDetail />} />
            <Route path="/wallet" element={<WalletPage user={user} />} />
            <Route path="/post-job" element={user.role === "employer" ? <PostJob /> : <Navigate to="/" />} />
            <Route path="/submissions" element={<div className="p-20 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">No active protocols detected.</div>} />
            <Route path="/profile" element={
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
                   <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/10 transition-all">Verification Status: Verified</button>
                   <button className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/10 transition-all">Settings & Privacy</button>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <BottomNav role={user.role} />
      </div>
    </BrowserRouter>
  );
}
