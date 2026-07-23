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
  const [activeTab, setActiveTab] = useState("combined"); // 'combined', 'cf', 'lc', 'ac', 'leaderboard'

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

  // --- AUTH SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Activity className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">DevPulse</h1>
            <p className="text-center text-slate-500 font-medium">
              {authMode === "login" ? "Welcome back, developer." : authMode === "register" ? "Initialize your tracking environment." : "Reset your system access."}
            </p>
          </div>
          
          {authMessage && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center mb-6">{authMessage}</div>}

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            <input 
              type="text" 
              placeholder="Global Username" 
              value={globalUsername}
              onChange={(e) => setGlobalUsername(e.target.value)}
              className="bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition text-lg"
              required
            />
            <input 
              type="password" 
              placeholder={authMode === "forgot" ? "New Password" : "Password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-4 outline-none focus:border-blue-500 focus:bg-white transition text-lg"
              required
            />
            <button type="submit" className="bg-blue-600 text-white rounded-xl px-5 py-4 font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 mt-2">
              {authMode === "login" ? "Login to Dashboard" : authMode === "register" ? "Register Account" : "Update Password"}
            </button>
          </form>

          <div className="flex flex-col items-center mt-8 space-y-3 text-sm font-semibold text-slate-500">
            {authMode === "login" ? (
              <>
                <button onClick={() => setAuthMode("forgot")} className="hover:text-blue-600 transition">Forgot Password?</button>
                <button onClick={() => setAuthMode("register")} className="text-slate-800 hover:text-blue-600 transition">Don't have an account? Register →</button>
              </>
            ) : (
              <button onClick={() => setAuthMode("login")} className="hover:text-blue-600 transition">← Back to Login</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN APP SCREEN (SIDEBAR ARCHITECTURE) ---
  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`flex items-center gap-4 w-full px-6 py-4 transition-all duration-200 border-l-4 ${
        activeTab === id 
          ? "bg-slate-800 border-blue-500 text-white font-bold" 
          : "border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-medium"
      }`}
    >
      <Icon size={20} className={activeTab === id ? "text-blue-400" : ""} /> 
      <span className="text-lg">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-10 flex-shrink-0">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800">
          <Activity className="text-blue-500" size={28} />
          <h1 className="text-2xl font-black tracking-wider">DevPulse</h1>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2">
          <div className="px-6 mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Analysis Engine</div>
          <NavButton id="combined" icon={Layers} label="Analyze All" />
          <NavButton id="cf" icon={Terminal} label="Analyze Codeforces" />
          <NavButton id="lc" icon={Code} label="Analyze LeetCode" />
          <NavButton id="ac" icon={Database} label="Analyze AtCoder" />
          
          <div className="px-6 mt-8 mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Community</div>
          <NavButton id="leaderboard" icon={Trophy} label="Global Leaderboard" />
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">{globalUsername.charAt(0).toUpperCase()}</div>
            <div className="flex flex-col">
              <span className="font-bold">{globalUsername}</span>
              <span className="text-xs text-slate-400">Developer Profile</span>
            </div>
          </div>
          <button onClick={() => {setIsAuthenticated(false); setPassword("");}} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition font-semibold">
            <LogOut size={18} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "leaderboard" ? (
              <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Leaderboard />
              </motion.div>
            ) : (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
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