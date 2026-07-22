import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, LayoutDashboard, Trophy, LogOut } from "lucide-react";
import DashboardCards from "./components/DashboardCards";
import Leaderboard from "./components/Leaderboard";
import Recommendations from "./components/Recommendations";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalUsername, setGlobalUsername] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' or 'leaderboard'

  const handleLogin = (e) => {
    e.preventDefault();
    if (globalUsername.trim()) setIsAuthenticated(true);
  };

  const handleGlobalSync = () => {
    console.log("Syncing all platforms for global username:", globalUsername);
    // Call backend API /sync here
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Activity className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-900">DevPulse</h1>
          </div>
          <p className="text-center text-slate-500 mb-8">Login or register to track your competitive programming journey.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Enter Global Username" 
              value={globalUsername}
              onChange={(e) => setGlobalUsername(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              required
            />
            <button type="submit" className="bg-blue-600 text-white rounded-lg px-4 py-3 font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/30">
              Continue to Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- MAIN APP SCREEN ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-[#0f172a] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400" />
          <h1 className="text-xl font-bold tracking-wide">DevPulse</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === "dashboard" ? "bg-blue-600" : "hover:bg-slate-800"}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("leaderboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${activeTab === "leaderboard" ? "bg-slate-700" : "hover:bg-slate-800"}`}
          >
            <Trophy size={18} /> Leaderboard
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition ml-2"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-6 mt-4">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              {/* Dashboard Header */}
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">Developer Stats</h2>
                  <p className="text-slate-500 mt-1">Track your competitive programming progress, <span className="font-semibold">{globalUsername}</span>.</p>
                </div>
                
                {/* Global Sync Button */}
                <button 
                  onClick={handleGlobalSync}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/30"
                >
                  <Activity size={18} /> Sync All Data
                </button>
              </div>

              {/* Stats Cards */}
              <DashboardCards globalUsername={globalUsername} />

              {/* New Recommendations Section */}
              <Recommendations />

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