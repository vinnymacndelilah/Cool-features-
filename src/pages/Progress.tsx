import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Target, Calendar, Award, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const historyData = [
  { month: 'Jan', history: 65, science: 70, math: 80 },
  { month: 'Feb', history: 72, science: 75, math: 82 },
  { month: 'Mar', history: 80, science: 85, math: 85 },
  { month: 'Apr', history: 85, science: 92, math: 88 },
  { month: 'May', history: 92, science: 95, math: 90 },
];

const skillsData = [
  { subject: 'History & Truth', A: 95, fullMark: 100 },
  { subject: 'Science & Creation', A: 88, fullMark: 100 },
  { subject: 'Math & Logic', A: 92, fullMark: 100 },
  { subject: 'Discipleship', A: 99, fullMark: 100 },
  { subject: 'Creative Economy', A: 75, fullMark: 100 },
  { subject: 'Homesteading', A: 85, fullMark: 100 },
];

export default function Progress() {
  const [studySession, setStudySession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateStudySession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-study-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillsData })
      });
      const data = await res.json();
      setStudySession(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">Academic Trajectory</h1>
          <p className="text-lg text-slate-600 mt-2">Pacing for Early Graduation & Top Tier Mastery</p>
        </div>
        <button 
          onClick={generateStudySession}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-75"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          Personalized Study Session
        </button>
      </header>

      {studySession && (
        <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-md border border-indigo-800">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="inline-block px-3 py-1 bg-indigo-800 text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
                  Focus Subject: {studySession.focusSubject}
                </span>
                {studySession.targetStudent && (
                  <span className="inline-block px-3 py-1 bg-fuchsia-800 text-fuchsia-200 rounded-full text-xs font-bold uppercase tracking-wider">
                    Student: {studySession.targetStudent}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-2">{studySession.sessionTitle}</h2>
              <p className="text-indigo-200 leading-relaxed text-sm max-w-3xl">{studySession.analysis}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {studySession.studyPlan?.map((step: any, idx: number) => (
              <div key={idx} className="bg-indigo-800/50 p-5 rounded-xl border border-indigo-700">
                <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
                   <Calendar size={16} /> {step.duration}
                </div>
                <h4 className="font-medium text-white mb-2">{step.activity}</h4>
                <div className="bg-indigo-950 p-2 rounded text-xs text-indigo-200 border border-indigo-900 font-mono">
                  Technique: {step.technique}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-800 p-4 rounded-xl text-center border border-indigo-700">
             <p className="text-indigo-100 italic">"{studySession.encouragement}"</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <Target className="text-indigo-200" size={24} />
             <h3 className="font-bold text-lg">Goal Trajectory</h3>
          </div>
          <div className="text-4xl font-bold font-mono mb-1">2.5 Years</div>
          <p className="text-indigo-200 text-sm">Remaining until early graduation</p>
        </div>
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <Award className="text-emerald-200" size={24} />
             <h3 className="font-bold text-lg">Core Competencies</h3>
          </div>
          <div className="text-4xl font-bold font-mono mb-1">8/12</div>
          <p className="text-emerald-200 text-sm">Modules completed this year</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <Calendar className="text-amber-100" size={24} />
             <h3 className="font-bold text-lg">Study Sessions</h3>
          </div>
          <div className="text-4xl font-bold font-mono mb-1">14</div>
          <p className="text-amber-100 text-sm">Personalized sessions scheduled this week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Subject Mastery Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="history" stroke="#6366f1" fillOpacity={1} fill="url(#colorHistory)" />
                <Area type="monotone" dataKey="science" stroke="#10b981" fillOpacity={1} fill="url(#colorScience)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2 w-full text-left">Competency Radar</h3>
          <div className="h-80 w-full max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Student A" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
