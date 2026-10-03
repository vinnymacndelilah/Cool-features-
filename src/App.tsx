import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, CheckSquare, BarChart, Settings, Home, Compass, Video, Users, Book, ListChecks, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DailyQuest from './pages/DailyQuest';
import Chores from './pages/Chores';
import Progress from './pages/Progress';
import CreationStudio from './pages/CreationStudio';
import LivingBook from './pages/LivingBook';
import StandardsTracker from './pages/StandardsTracker';
import { UserProvider, useUser, Profile } from './contexts/UserContext';

function ProfileSelector() {
  const { setActiveProfile } = useUser();
  const profiles: Profile[] = ['Parent', 'Addy', 'Della', 'Cash', 'Ellie'];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-8">
      <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-200 max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">Dear Adeline</h1>
          <p className="text-slate-500 text-lg">Who is using this device?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {profiles.map(p => (
            <button
              key={p}
              onClick={() => setActiveProfile(p)}
              className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                p === 'Parent' 
                  ? 'col-span-2 border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const { activeProfile, setActiveProfile } = useUser();

  if (!activeProfile) {
    return <ProfileSelector />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#FDFBF7] text-slate-800 font-sans">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Dear Adeline</h1>
            <p className="text-sm text-slate-500 mt-1">Family Learning Platform</p>
          </div>
          
          <div className="flex-1 px-4 space-y-1 mt-4">
            <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
            <NavItem to="/daily-quest" icon={<Compass size={20} />} label="Daily Quest" />
            <NavItem to="/book" icon={<Book size={20} />} label="Our Living Book" />
            <NavItem to="/chores" icon={<CheckSquare size={20} />} label="Autonomy Quests" />
            {(activeProfile === 'Parent' || activeProfile === 'Addy') && (
              <NavItem to="/progress" icon={<BarChart size={20} />} label="Progress & Goals" />
            )}
            {activeProfile === 'Parent' && (
              <NavItem to="/standards" icon={<ListChecks size={20} />} label="Academic Standards" />
            )}
            <NavItem to="/creation" icon={<Video size={20} />} label="Creation Studio" />
          </div>

          <div className="px-4 py-6 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> Current User
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">{activeProfile}</span>
              <button 
                onClick={() => setActiveProfile(null)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded"
              >
                Switch <LogOut size={12} />
              </button>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100">
            <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/daily-quest" element={<DailyQuest />} />
            <Route path="/book" element={<LivingBook />} />
            <Route path="/chores" element={<Chores />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/standards" element={<StandardsTracker />} />
            <Route path="/creation" element={<CreationStudio />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
