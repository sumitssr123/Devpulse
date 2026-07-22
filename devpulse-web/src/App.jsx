import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, LayoutDashboard, Trophy } from 'lucide-react';
import SyncButton from './components/SyncButton';
import DashboardCards from './components/DashboardCards';
import Leaderboard from './components/Leaderboard';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username, setUsername] = useState('sumit_coder');
  const [syncedData, setSyncedData] = useState(null);

  // Updates the dashboard when SyncButton finishes
  const handleDataFetched = (data) => {
    if (data && data.platforms) {
      setSyncedData(data.platforms);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sleek Navigation Bar */}
      <nav style={{ backgroundColor: '#0f172a', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity color="#3b82f6" size={28} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>DevPulse</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', backgroundColor: '#1e293b', padding: '6px', borderRadius: '12px' }}>
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <TabButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Trophy size={18} />} label="Leaderboard" />
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <AnimatePresence mode="wait">
          
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 8px 0' }}>Developer Stats</h2>
                  <p style={{ color: '#64748b', margin: 0 }}>Track your competitive programming progress.</p>
                </div>

                {/* Input and Sync Button Container */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'white', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username..."
                    style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '1rem', width: '200px' }}
                  />
                  <SyncButton username={username} onSyncSuccess={handleDataFetched} />
                </div>
              </div>

              {syncedData ? (
                <DashboardCards platformData={syncedData} />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                  <Activity size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                  <h3>No data loaded yet</h3>
                  <p>Enter a username and click Sync to fetch live stats from the server.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <Leaderboard />
            </motion.div>
          )}
          
        </AnimatePresence>
      </main>
    </div>
  );
}

// Custom Animated Tab Button Helper
function TabButton({ active, onClick, icon, label }) {
  return (
    <motion.button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', position: 'relative', backgroundColor: 'transparent', color: active ? 'white' : '#94a3b8', zIndex: 1 }} whileHover={{ color: 'white' }}>
      {active && (
        <motion.div layoutId="activeTab" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#3b82f6', borderRadius: '8px', zIndex: -1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
      )}
      {icon} {label}
    </motion.button>
  );
}