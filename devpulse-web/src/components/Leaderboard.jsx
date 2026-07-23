import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, RefreshCcw, Globe } from 'lucide-react';

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { x: -30, opacity: 0 }, show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return <div className="flex items-center justify-center gap-1 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full font-black text-sm border border-yellow-400 shadow-sm"><Trophy size={14}/> 1st</div>;
    if (rank === 2) return <div className="flex items-center justify-center gap-1 bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-black text-sm border border-slate-400 shadow-sm"><Medal size={14}/> 2nd</div>;
    if (rank === 3) return <div className="flex items-center justify-center gap-1 bg-orange-200 text-orange-900 px-3 py-1 rounded-full font-black text-sm border border-orange-400 shadow-sm"><Award size={14}/> 3rd</div>;
    return <div className="flex items-center justify-center bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black text-sm border border-slate-200">#{rank}</div>;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      <div className="flex justify-between items-end border-b-2 border-slate-200 pb-6 mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <Globe size={36} className="text-blue-600" />
            Global Rankings
          </h2>
          <p className="text-slate-500 mt-2 text-lg">Compare your combined progress against the entire DevPulse network.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={fetchLeaderboard} 
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition"
        >
          <RefreshCcw size={18} /> Refresh Standings
        </motion.button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCcw size={40} className="text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold text-lg">Calculating global positions...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-4">
          {leaderboard.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
              <Trophy size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold text-xl">The leaderboard is empty.</p>
              <p className="text-slate-400">Sync a user profile to establish the first rank!</p>
            </div>
          ) : (
            leaderboard.map((user) => (
              <motion.div key={user.username} variants={itemVariants} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                
                <div className="flex items-center gap-6">
                  <div className="w-20">{getRankBadge(user.rank)}</div>
                  <span className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition">{user.username}</span>
                </div>

                <div className="flex items-center gap-12 text-right">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Solved</div>
                    <div className="font-black text-blue-600 text-3xl">{user.total_solved}</div>
                  </div>
                  <div className="w-px h-12 bg-slate-200"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Rating</div>
                    <div className="font-black text-emerald-500 text-3xl">{user.total_rating}</div>
                  </div>
                </div>
                
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}