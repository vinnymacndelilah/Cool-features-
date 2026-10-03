import React, { useState, useEffect } from 'react';
import { Shield, Sword, Trophy, Star, Plus, Check, Flame, Globe, Lock, ExternalLink } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: string;
  completedBy: string[];
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  requiredLevel: number;
  category: string;
  link?: string;
}

const DEFAULT_QUESTS: Quest[] = [
  { id: '1', title: 'The Daily Reset', description: 'Perform a 15-minute sweep of main living areas. Clear all floors, wipe surfaces, and put away stray items to maintain a baseline of order.', xp: 50, category: 'Life Autonomy', completedBy: [] },
  { id: '2', title: 'Zone Defense: Kitchen & Pantry', description: 'Deep clean the kitchen zone. Wash all dishes, sanitize counters, organize the pantry, and take stock of low supplies.', xp: 100, category: 'Practical Life', completedBy: [] },
  { id: '3', title: 'Systematic Maintenance', description: 'Organize a utility closet, bathroom cabinet, or emergency supply kit. Everything must have a designated place so it can be found in the dark.', xp: 75, category: 'Health & Homesteading', completedBy: [] },
];

const OPPORTUNITIES: Opportunity[] = [
  { id: 'o1', title: 'Scholastic Art & Writing Awards', description: 'Submit your best digital art, animation, or writing. Win regional or national recognition and potential scholarships.', requiredLevel: 2, category: 'Art & Freelance', link: 'https://www.artandwriting.org/' },
  { id: 'o2', title: 'NASA Dream with Us Challenge', description: 'High School & Middle School engineering challenge to design future aerospace solutions.', requiredLevel: 3, category: 'STEM & Science', link: 'https://www.nasa.gov/stem' },
  { id: 'o3', title: 'Freelance Family Art Contract', description: 'Commission: Design a new logo for the family homestead or a custom t-shirt. Earn a real-world budget.', requiredLevel: 4, category: 'Art & Freelance' },
  { id: 'o4', title: 'Organize a Community Food Drive', description: 'Lead a civic engagement project with the local homeschool co-op. Manage logistics, marketing, and donations.', requiredLevel: 5, category: 'Civic Engagement' },
  { id: 'o5', title: 'Regeneron Science Talent Search', description: 'The most prestigious science research competition for high school seniors. Start your research project now.', requiredLevel: 7, category: 'STEM & Science', link: 'https://www.societyforscience.org/regeneron-sts/' },
  { id: 'o6', title: 'Local Youth Advisory Council', description: 'Represent youth voices to local government. Apply for a seat to discuss public policy and community planning.', requiredLevel: 8, category: 'Civic Engagement' },
];

export default function Chores() {
  const { activeProfile } = useUser();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [xpData, setXpData] = useState<Record<string, number>>({});
  const [streakData, setStreakData] = useState<Record<string, { streak: number; lastCompleted: string }>>({});
  const [activeTab, setActiveTab] = useState<'tasks' | 'opportunities'>('tasks');
  
  const currentXp = activeProfile ? (xpData[activeProfile] || 0) : 0;
  const level = Math.floor(currentXp / 1000) + 1;
  const progressToNext = currentXp % 1000;
  const currentStreak = activeProfile ? (streakData[activeProfile]?.streak || 0) : 0;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', 'demo-user', 'state', 'chores_state_v2'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQuests(data.quests || DEFAULT_QUESTS);
        setXpData(data.xpData || {});
        setStreakData(data.streakData || {});
      } else {
        setQuests(DEFAULT_QUESTS);
      }
    });
    return () => unsub();
  }, []);

  const completeQuest = async (questId: string, xpReward: number) => {
    if (!activeProfile || activeProfile === 'Parent') return;

    const updatedQuests = quests.map(q => {
      if (q.id === questId && !q.completedBy.includes(activeProfile)) {
        return { ...q, completedBy: [...q.completedBy, activeProfile] };
      }
      return q;
    });

    const updatedXp = {
      ...xpData,
      [activeProfile]: (xpData[activeProfile] || 0) + xpReward
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const prevStreakInfo = streakData[activeProfile] || { streak: 0, lastCompleted: '' };
    
    let newStreak = prevStreakInfo.streak;
    if (prevStreakInfo.lastCompleted !== todayStr) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (prevStreakInfo.lastCompleted === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const updatedStreakData = {
      ...streakData,
      [activeProfile]: { streak: newStreak, lastCompleted: todayStr }
    };

    await setDoc(doc(db, 'users', 'demo-user', 'state', 'chores_state_v2'), {
      quests: updatedQuests,
      xpData: updatedXp,
      streakData: updatedStreakData
    }, { merge: true });
  };

  const addQuest = async () => {
    const title = prompt("Enter new quest title:");
    const xp = parseInt(prompt("Enter XP reward (e.g. 50):") || '50');
    if (title && !isNaN(xp)) {
      const newQuest: Quest = {
        id: Date.now().toString(),
        title,
        description: 'New custom quest added by parent.',
        xp,
        category: 'Life Autonomy',
        completedBy: []
      };
      await setDoc(doc(db, 'users', 'demo-user', 'state', 'chores_state_v2'), {
        quests: [...quests, newQuest]
      }, { merge: true });
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">Autonomy Quests</h1>
          <p className="text-lg text-slate-600 mt-2">Gamified Life Skills & Real-World Opportunities</p>
        </div>
        
        {activeProfile !== 'Parent' && activeProfile && (
          <div className="flex flex-col gap-3 min-w-[300px]">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                <Trophy size={32} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-slate-900 text-lg">Level {level}</span>
                  <span className="text-xs text-slate-500 font-mono">{progressToNext} / 1000 XP</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(progressToNext / 1000) * 100}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-xl px-4 py-2 border border-orange-200 flex items-center gap-3">
              <Flame size={20} className="text-orange-500" />
              <span className="font-bold text-orange-900">Day Streak: {currentStreak}</span>
              <span className="text-xs text-orange-700 ml-auto font-medium">Keep it going!</span>
            </div>
          </div>
        )}

        {activeProfile === 'Parent' && (
          <button onClick={addQuest} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={20} /> Add New Quest
          </button>
        )}
      </header>

      {activeProfile === 'Parent' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {['Addy', 'Della', 'Cash', 'Ellie'].map(student => {
            const studentXp = xpData[student] || 0;
            const studentLevel = Math.floor(studentXp / 1000) + 1;
            const studentStreak = streakData[student]?.streak || 0;
            return (
              <div key={student} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                    <Star size={24} className={studentXp > 0 ? 'text-amber-400' : ''} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{student}</div>
                    <div className="text-xs text-slate-500 font-mono">Lvl {studentLevel} • {studentXp} XP</div>
                  </div>
                </div>
                {studentStreak > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md w-fit">
                    <Flame size={12} /> {studentStreak} Day Streak
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 px-4 font-bold transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Daily Quests
        </button>
        <button 
          onClick={() => setActiveTab('opportunities')}
          className={`pb-3 px-4 font-bold transition-colors border-b-2 ${activeTab === 'opportunities' ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Privileges & Opportunities
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quests.map(quest => {
            const isCompletedByMe = activeProfile ? quest.completedBy.includes(activeProfile) : false;
            return (
              <div 
                key={quest.id} 
                className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isCompletedByMe 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300'
                }`}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {quest.category === 'Practical Life' && <Shield size={14} />}
                      {quest.category === 'Life Autonomy' && <Sword size={14} />}
                      {quest.category === 'Health & Homesteading' && <Star size={14} />}
                      {quest.category}
                    </span>
                    <span className="font-mono font-bold text-amber-600">+{quest.xp} XP</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{quest.title}</h3>
                  <p className="text-slate-600 mb-6 flex-1">{quest.description}</p>
                  
                  {activeProfile !== 'Parent' ? (
                    <button 
                      onClick={() => completeQuest(quest.id, quest.xp)}
                      disabled={isCompletedByMe}
                      className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        isCompletedByMe 
                          ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {isCompletedByMe ? <><Check size={20} /> Claimed</> : 'Claim Victory'}
                    </button>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 mt-auto">
                      <span className="font-bold">Completed by: </span>
                      {quest.completedBy.length > 0 ? quest.completedBy.join(', ') : 'No one yet'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-900">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Globe size={24} /> Real-World Impact</h3>
            <p>Level up by completing Daily Quests to unlock real-world opportunities, academic contests, and freelance projects.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {OPPORTUNITIES.map(opp => {
              const isLocked = level < opp.requiredLevel;
              return (
                <div key={opp.id} className={`relative p-6 rounded-2xl border transition-all ${isLocked ? 'bg-slate-50 border-slate-200' : 'bg-white border-amber-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {opp.category}
                    </span>
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                        <Lock size={14} /> Unlocks at Lvl {opp.requiredLevel}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                        <Check size={14} /> Unlocked
                      </span>
                    )}
                  </div>
                  
                  <h4 className={`text-xl font-bold mb-2 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                    {opp.title}
                  </h4>
                  <p className={`mb-6 text-sm ${isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
                    {opp.description}
                  </p>
                  
                  {!isLocked && (
                    <button className="w-full py-2 bg-amber-100 text-amber-800 font-bold rounded-xl hover:bg-amber-200 flex items-center justify-center gap-2">
                      {opp.link ? <><ExternalLink size={16} /> View Details</> : 'Request Permission'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
