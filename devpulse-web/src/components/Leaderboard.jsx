import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, RefreshCcw } from 'lucide-react';

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
    if (rank === 1) return <div style={badgeStyle('#fef08a', '#854d0e')}><Trophy size={16}/> 1st</div>;
    if (rank === 2) return <div style={badgeStyle('#e2e8f0', '#475569')}><Medal size={16}/> 2nd</div>;
    if (rank === 3) return <div style={badgeStyle('#fed7aa', '#9a3412')}><Award size={16}/> 3rd</div>;
    return <div style={badgeStyle('#f1f5f9', '#64748b')}>#{rank}</div>;
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Global Rankings</h2>
        <motion.button whileHover={{ scale: 1.1, rotate: 180 }} whileTap={{ scale: 0.9 }} onClick={fetchLeaderboard} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <RefreshCcw size={20} />
        </motion.button>
      </div>
      
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>Loading rankings...</p>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leaderboard.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8' }}>No data available. Go sync a user!</p>
          ) : (
            leaderboard.map((user) => (
              <motion.div key={user.username} variants={itemVariants} whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px' }}>{getRankBadge(user.rank)}</div>
                  <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>{user.username}</span>
                </div>

                <div style={{ display: 'flex', gap: '32px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Total Solved</div>
                    <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '1.2rem' }}>{user.total_solved}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Rating</div>
                    <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.2rem' }}>{user.total_rating}</div>
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

// Helper for consistent badge styling
const badgeStyle = (bg, color) => ({ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: bg, color: color, padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' });