import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Trophy, LogOut, Code, Terminal, Database, Layers } from "lucide-react";
import DashboardCards from "./components/DashboardCards";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalUsername, setGlobalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [activeTab, setActiveTab] = useState("combined"); 

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthMessage("");
    try {
      const response = await fetch("http://localhost:8080/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authMode, username: globalUsername, password })
      });
      const data = await response.json();
      
      if (response.ok && data.status === "success") {
        if (authMode === "forgot") {
          setAuthMessage("Password updated! Please login.");
          setAuthMode("login");
          setPassword("");
        } else {
          setIsAuthenticated(true);
        }
      } else {
        setAuthMessage(data.message || "Authentication failed.");
      }
    } catch (err) {
      setAuthMessage("Server is offline. Ensure backend is running.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111827] p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Activity className="text-blue-500" size={48} />
            <h1 className="text-4xl font-black text-white tracking-tight">DevPulse <span className="text-blue-500">Pro</span></h1>
            <p className="text-slate-400 font-medium">
              {authMode === "login" ? "Welcome back, developer." : authMode === "register" ? "Initialize your environment." : "Reset system access."}
            </p>
          </div>
          
          {authMessage && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm font-bold text-center mb-6">{authMessage}</div>}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input type="text" placeholder="Global Username" value={globalUsername} onChange={(e) => setGlobalUsername(e.target.value)} className="bg-[#1f2937] border border-slate-700 text-white rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-lg transition-all" required />
            <input type="password" placeholder={authMode === "forgot" ? "New Password" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#1f2937] border border-slate-700 text-white rounded-xl px-5 py-4 outline-none focus:border-blue-500 text-lg transition-all" required />
            <button type="submit" className="bg-blue-600 text-white rounded-xl px-5 py-4 font-bold text-lg hover:bg-blue-700 transition mt-2 shadow-lg shadow-blue-500/20">
              {authMode === "login" ? "Access System" : authMode === "register" ? "Register Account" : "Update Password"}
            </button>
          </form>

          <div className="flex flex-col items-center mt-8 space-y-3 text-sm font-semibold text-slate-400">
            {authMode === "login" ? (
              <>
                <button onClick={() => setAuthMode("forgot")} className="hover:text-blue-400 transition">Forgot Password?</button>
                <button onClick={() => setAuthMode("register")} className="hover:text-blue-400 transition">Don't have an account? Register →</button>
              </>
            ) : (
              <button onClick={() => setAuthMode("login")} className="hover:text-blue-400 transition">← Back to Login</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const NavButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 border-l-4 ${activeTab === id ? "bg-slate-800/50 border-blue-500 text-white font-bold" : "border-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 font-medium"}`}>
      <Icon size={20} className={activeTab === id ? "text-blue-400" : ""} /> 
      <span className="text-[15px] tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <aside className="w-[280px] bg-[#0a0f1c] text-white flex flex-col shadow-2xl flex-shrink-0 border-r border-slate-800">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800/50">
          <Activity className="text-blue-500" size={28} />
          <h1 className="text-2xl font-black tracking-wider">DevPulse</h1>
        </div>
        <nav className="flex-1 py-8 flex flex-col gap-2 overflow-y-auto">
          <div className="px-6 mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Analysis Engine</div>
          <NavButton id="combined" icon={Layers} label="Analyze All Platforms" />
          <div className="px-6 mt-6 mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Deep Dives</div>
          <NavButton id="lc" icon={Code} label="LeetCode" />
          <NavButton id="cf" icon={Terminal} label="Codeforces" />
          <NavButton id="ac" icon={Database} label="AtCoder" />
          <div className="px-6 mt-6 mb-2 text-[10px] font-black tracking-widest text-slate-500 uppercase">Network</div>
          <NavButton id="leaderboard" icon={Trophy} label="Global Leaderboard" />
        </nav>
        <div className="p-6 border-t border-slate-800/50 bg-[#0a0f1c]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">{globalUsername.charAt(0).toUpperCase()}</div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{globalUsername}</span>
              <span className="text-xs text-slate-400">Pro Developer</span>
            </div>
          </div>
          <button onClick={() => {setIsAuthenticated(false); setPassword("");}} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition font-semibold text-sm">
            <LogOut size={16} /> Disconnect
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "leaderboard" ? (
              <motion.div key="leaderboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}><Leaderboard /></motion.div>
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}><DashboardCards globalUsername={globalUsername} activeTab={activeTab} /></motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;