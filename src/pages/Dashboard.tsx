import React, { useState, useEffect } from 'react';
import { Play, Book, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const { activeProfile } = useUser();
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const fetchXp = async () => {
      if (activeProfile && activeProfile !== 'Parent') {
        const docSnap = await getDoc(doc(db, 'users', 'demo-user', 'state', 'chores_state'));
        if (docSnap.exists() && docSnap.data().xpData) {
          const myXp = docSnap.data().xpData[activeProfile] || 0;
          setXp(myXp);
          setLevel(Math.floor(myXp / 1000) + 1);
        }
      }
    };
    fetchXp();
  }, [activeProfile]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-serif font-bold text-slate-900">
          Good Morning, {activeProfile === 'Parent' ? 'Family' : activeProfile}
        </h1>
        <p className="text-lg text-slate-600 mt-2">Today's overarching theme is <strong>Lost Skills: Self-Sustaining Independence</strong></p>
      </header>

      <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500 text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Today's Narrative Hook
          </span>
          <h2 className="text-3xl font-serif font-bold text-white mb-4">The Lost Arts of Self-Sufficiency</h2>
          <p className="text-slate-300 leading-relaxed mb-6 text-lg">
            "To be truly independent, we must reclaim the knowledge our ancestors relied on. This year, we are mastering the lost skills of self-sustaining living—from simple machines and off-grid energy, to naturopathic health, thermal regulation, carpentry, canning, preserving, and even creating alternative fuels. Today, we uncover the mechanics of providing for ourselves."
          </p>
          <Link to="/daily-quest" className="inline-flex items-center space-x-2 bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors">
            <Play size={20} />
            <span>Begin Daily Quest</span>
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
           <MapPin size={300} color="white" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="text-emerald-500" /> Autonomy Quests
            </h3>
            <Link to="/chores" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View all</Link>
          </div>
          
          {activeProfile !== 'Parent' ? (
             <div className="space-y-4">
               <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-center justify-between">
                 <div>
                   <div className="font-bold text-amber-900">Your Current Level</div>
                   <div className="text-sm text-amber-700">Keep completing quests to level up!</div>
                 </div>
                 <div className="text-3xl font-bold text-amber-600 font-mono">Lvl {level}</div>
               </div>
               <p className="text-slate-500 text-sm">Head over to the Autonomy Quests tab to see today's challenges and earn XP.</p>
             </div>
          ) : (
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium text-slate-700 flex flex-col">
                  <span>Zone Defense: Kitchen & Pantry</span>
                  <span className="text-xs text-slate-400">Assigned to: Cash & Ellie</span>
                </span>
                <span className="text-sm text-emerald-600 font-mono font-bold">+100 XP</span>
              </li>
              <li className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-medium text-slate-700 flex flex-col">
                  <span>Systematic Maintenance</span>
                  <span className="text-xs text-slate-400">Assigned to: Addy & Della</span>
                </span>
                <span className="text-sm text-emerald-600 font-mono font-bold">+75 XP</span>
              </li>
            </ul>
          )}
        </div>

        {activeProfile === 'Parent' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Book className="text-indigo-500" /> Recent Progress
              </h3>
              <Link to="/progress" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">Truth-Based History</span>
                  <span className="text-slate-500">85% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">God's Creation & Science</span>
                  <span className="text-slate-500">92% Mastery</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
