import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Trophy, LogOut, Code, Terminal, Database, Layers, User, Lock } from "lucide-react";
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

  // -----------------------------------------------------
  // 1. PREMIUM LOGIN PAGE UI
  // -----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-800"
        >
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="bg-blue-500/10 p-4 rounded-full shadow-inner shadow-blue-500/20">
              <Activity className="text-blue-500" size={40} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-2">
              DevPulse <span className="text-blue-500">Pro</span>
            </h1>
            <p className="text-slate-400 font-medium text-center text-sm">
              {authMode === "login" ? "Welcome back, developer. Securely access your dashboard." 
               : authMode === "register" ? "Initialize your environment and track your progress." 
               : "Reset your system access password."}
            </p>
          </div>
          
          {authMessage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold text-center mb-6">
              {authMessage}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            {/* Username Field - Fixed Overlap */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <User size={20} className="text-slate-500 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Global Username" 
                value={globalUsername} 
                onChange={(e) => setGlobalUsername(e.target.value)} 
                className="w-full bg-transparent text-white placeholder-slate-500 pl-3 pr-4 py-4 outline-none" 
                required 
              />
            </div>

            {/* Password Field - Fixed Overlap */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <Lock size={20} className="text-slate-500 flex-shrink-0" />
              <input 
                type="password" 
                placeholder={authMode === "forgot" ? "New Password" : "Password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-transparent text-white placeholder-slate-500 pl-3 pr-4 py-4 outline-none" 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white rounded-xl px-5 py-4 font-bold text-lg hover:bg-blue-500 transition-all mt-2 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              {authMode === "login" ? "Access System" : authMode === "register" ? "Register Account" : "Update Password"}
            </button>
          </form>

          <div className="flex flex-col items-center mt-8 space-y-4 text-sm font-medium text-slate-400">
            {authMode === "login" ? (
              <>
                <button onClick={() => setAuthMode("forgot")} className="hover:text-blue-400 transition-colors">Forgot Password?</button>
                <button onClick={() => setAuthMode("register")} className="hover:text-blue-400 transition-colors">Don't have an account? <span className="text-blue-500 font-bold">Register &rarr;</span></button>
              </>
            ) : (
              <button onClick={() => setAuthMode("login")} className="hover:text-blue-400 transition-colors">&larr; Back to Secure Login</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // -----------------------------------------------------
  // 2. PREMIUM SIDEBAR & MAIN DASHBOARD UI
  // -----------------------------------------------------
  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 border-l-4 group
        ${activeTab === id 
          ? "bg-slate-900 border-blue-500 text-white font-bold" 
          : "border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 font-medium"
        }`}
    >
      <Icon size={20} className={`transition-colors ${activeTab === id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"}`} /> 
      <span className="text-[15px] tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Sidebar Component */}
      <aside className="w-[280px] bg-slate-950 text-slate-300 flex flex-col shadow-2xl flex-shrink-0 border-r border-slate-800 z-10">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800/80">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">DevPulse</h1>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-1 overflow-y-auto">
          <div className="px-6 mb-3 text-[11px] font-black tracking-widest text-slate-500 uppercase">Analysis Engine</div>
          <NavButton id="combined" icon={Layers} label="Analyze All Platforms" />
          
          <div className="px-6 mt-8 mb-3 text-[11px] font-black tracking-widest text-slate-500 uppercase">Deep Dives</div>
          <NavButton id="lc" icon={Code} label="LeetCode" />
          <NavButton id="cf" icon={Terminal} label="Codeforces" />
          <NavButton id="ac" icon={Database} label="AtCoder" />
          
          <div className="px-6 mt-8 mb-3 text-[11px] font-black tracking-widest text-slate-500 uppercase">Network</div>
          <NavButton id="leaderboard" icon={Trophy} label="Global Leaderboard" />
        </nav>

        <div className="p-6 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-bold text-xl text-white shadow-md">
              {globalUsername.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[15px] text-white truncate max-w-[150px]">{globalUsername}</span>
              <span className="text-xs text-blue-400 font-semibold tracking-wide">Pro Developer</span>
            </div>
          </div>
          <button 
            onClick={() => {setIsAuthenticated(false); setPassword("");}} 
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 text-slate-400 hover:text-red-400 transition-all font-semibold text-sm group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "leaderboard" ? (
              <motion.div key="leaderboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <Leaderboard />
              </motion.div>
            ) : (
              <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                <DashboardCards globalUsername={globalUsername} activeTab={activeTab} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;