import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, LayoutDashboard, Trophy, LogOut } from "lucide-react";
import DashboardCards from "./components/DashboardCards";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalUsername, setGlobalUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login"); // 'login', 'register', 'forgot'
  const [authMessage, setAuthMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' or 'leaderboard'

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-900">DevPulse</h1>
          </div>
          <p className="text-center text-slate-500 mb-4">
            {authMode === "login" ? "Login to track your competitive journey." : authMode === "register" ? "Create an account to start tracking." : "Reset your password."}
          </p>
          
          {authMessage && <p className="text-center text-sm font-bold text-red-500 mb-4">{authMessage}</p>}

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Global Username" 
              value={globalUsername}
              onChange={(e) => setGlobalUsername(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
            <input 
              type="password" 
              placeholder={authMode === "forgot" ? "New Password" : "Password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/30">
              {authMode === "login" ? "Login to Dashboard" : authMode === "register" ? "Register Account" : "Update Password"}
            </button>
          </form>

          <div className="flex justify-between items-center mt-6 text-sm text-slate-500">
            {authMode === "login" ? (
              <>
                <button onClick={() => setAuthMode("forgot")} className="hover:text-blue-600 transition">Forgot Password?</button>
                <button onClick={() => setAuthMode("register")} className="hover:text-blue-600 font-semibold transition">Register →</button>
              </>
            ) : (
              <button onClick={() => setAuthMode("login")} className="hover:text-blue-600 transition mx-auto">← Back to Login</button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // --- MAIN APP SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-[#0f172a] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400" />
          <h1 className="text-xl font-bold tracking-wide">DevPulse</h1>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === "dashboard" ? "bg-blue-600" : "hover:bg-slate-800"}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("leaderboard")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === "leaderboard" ? "bg-slate-700" : "hover:bg-slate-800"}`}>
            <Trophy size={18} /> Leaderboard
          </button>
          <button onClick={() => {setIsAuthenticated(false); setPassword("");}} className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition ml-2">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-4">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Developer Stats</h2>
                  <p className="text-slate-500 mt-1">Track your competitive programming progress, <span className="font-semibold">{globalUsername}</span>.</p>
                </div>
              </div>

              {/* Passes control down to DashboardCards */}
              <DashboardCards globalUsername={globalUsername} />

            </motion.div>
          ) : (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;