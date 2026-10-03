import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, FlaskConical, PenTool, Loader2, ArrowRight, MonitorPlay, Save, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

export default function DailyQuest() {
  const { activeProfile } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<any>(null);
  const [bibleStudy, setBibleStudy] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', 'demo-user', 'state', 'daily_quest'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLessonPlan(data.lessonPlan || null);
        setBibleStudy(data.bibleStudy || null);
        // Only load our answers if they exist
        if (data.answers && activeProfile) {
          setAnswers(data.answers[activeProfile] || {});
        }
      } else {
        setLessonPlan(null);
        setBibleStudy(null);
        setAnswers({});
      }
    });
    return () => unsub();
  }, [activeProfile]);

  const handleAnswerChange = async (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    if (!activeProfile) return;
    
    try {
      const docRef = doc(db, 'users', 'demo-user', 'state', 'daily_quest');
      await setDoc(docRef, {
        answers: {
          [activeProfile]: {
            [id]: value
          }
        }
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync answer", e);
    }
  };

  const generateToday = async () => {
    setLoading(true);
    try {
      const [lessonRes, bibleRes] = await Promise.all([
        fetch('/api/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: 'Lost skills and knowledge for being self-sustaining (topics: simple machines, energy generation, naturopathic health, heating/cooling systems, carpentry, canning and preserving, alternative fuels)',
            ageGroup: '11-16 years old',
            interests: 'Surviving in the real world, hands-on engineering, helping those suffering, changing the future'
          })
        }),
        fetch('/api/bible-study', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicOrVerse: 'Isaiah 1:17'
          })
        })
      ]);

      const lessonData = await lessonRes.json();
      const bibleData = await bibleRes.json();

      const docRef = doc(db, 'users', 'demo-user', 'state', 'daily_quest');
      await setDoc(docRef, {
        lessonPlan: lessonData,
        bibleStudy: bibleData,
        answers: {},
        createdAt: Date.now()
      });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveToBook = async () => {
    if (!lessonPlan) return;
    setSaving(true);
    try {
      const { getDoc } = await import('firebase/firestore');
      const docSnap = await getDoc(doc(db, 'users', 'demo-user', 'state', 'daily_quest'));
      
      let finalAnswers = answers;
      if (docSnap.exists() && docSnap.data().answers) {
        finalAnswers = docSnap.data().answers;
      }

      await addDoc(collection(db, 'users', 'demo-user', 'bookEntries'), {
        title: lessonPlan.title,
        theme: 'Lost Skills: Self-Sustaining Independence',
        lessonData: lessonPlan,
        answers: finalAnswers, 
        savedBy: activeProfile,
        userId: 'demo-user',
        createdAt: Date.now()
      });
      alert('Saved successfully to Our Living Book!');
    } catch (err) {
      console.error('Failed to save to book', err);
      alert('Failed to save to book. Please check connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">Today's Quest</h1>
          <p className="text-lg text-slate-600 mt-2">
            {activeProfile === 'Parent' ? 'Family Overview' : `Individual Workspace for ${activeProfile}`}
          </p>
        </div>
        <div className="flex gap-4">
          {!lessonPlan && !loading && activeProfile === 'Parent' && (
            <button 
              onClick={generateToday}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Sparkles size={20} />
              Generate Today's Lesson
            </button>
          )}
          {!lessonPlan && !loading && activeProfile !== 'Parent' && (
            <div className="text-slate-500 italic bg-slate-100 px-4 py-2 rounded-lg">Waiting for Parent to generate today's quest...</div>
          )}
          {lessonPlan && activeProfile === 'Parent' && (
            <button 
              onClick={saveToBook}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save to Our Living Book'}
            </button>
          )}
        </div>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
          <p className="text-lg">Designing family learning experience...</p>
        </div>
      )}

      {bibleStudy && (
        <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6 text-indigo-300">
            <BookOpen size={24} />
            <h2 className="text-2xl font-serif font-bold">Discipleship Deep Dive</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{bibleStudy.reference}</h3>
              <p className="text-xl italic text-slate-300 border-l-4 border-indigo-500 pl-4 py-2">
                "{bibleStudy.englishText}"
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl p-5">
                <h4 className="font-bold text-indigo-300 mb-2 uppercase tracking-wide text-xs">Original Language Analysis</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{bibleStudy.originalLanguageAnalysis}</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-5">
                <h4 className="font-bold text-indigo-300 mb-2 uppercase tracking-wide text-xs">Translation Nuances</h4>
                <p className="text-slate-300 text-sm leading-relaxed">{bibleStudy.translationNuances}</p>
              </div>
            </div>

            <div className="bg-indigo-900/50 rounded-xl p-6 border border-indigo-800">
              <h4 className="font-bold text-indigo-200 mb-2 uppercase tracking-wide text-xs">Application: Justice & Change-Making</h4>
              <p className="text-slate-200 leading-relaxed">{bibleStudy.application}</p>
            </div>
          </div>
        </section>
      )}

      {lessonPlan && (
        <div className="space-y-8">
          <section className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
            <h2 className="text-3xl font-serif font-bold text-amber-950 mb-4">{lessonPlan.title}</h2>
            <p className="text-amber-900 leading-relaxed text-lg">
              {lessonPlan.narrativeHook}
            </p>
          </section>

            {/* INDIVIDUAL BREAKOUT SECTIONS */}
          {lessonPlan.individualBreakouts && (
            <section className="bg-indigo-50 rounded-2xl p-8 border border-indigo-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 text-indigo-900">
                <Users size={24} />
                <h2 className="text-2xl font-serif font-bold">Your Individual Mission</h2>
              </div>
              
              {activeProfile !== 'Parent' ? (
                // Kid View
                lessonPlan.individualBreakouts[activeProfile] && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-950 mb-3">Level: {activeProfile}</h3>
                    <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">
                      {lessonPlan.individualBreakouts[activeProfile].directTeaching}
                    </p>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <label className="block text-sm font-bold text-indigo-900 mb-2">
                        {lessonPlan.individualBreakouts[activeProfile].appliedChallenge}
                      </label>
                      <textarea 
                        className="w-full p-3 rounded-lg border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
                        placeholder="Record your findings, measurements, or calculations here..."
                        value={answers[lessonPlan.individualBreakouts[activeProfile].questionId] || ''}
                        onChange={(e) => handleAnswerChange(lessonPlan.individualBreakouts[activeProfile].questionId, e.target.value)}
                      />
                    </div>
                  </div>
                )
              ) : (
                // Parent View (sees all)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(lessonPlan.individualBreakouts).map(([student, data]: [string, any]) => (
                    <div key={student} className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100 opacity-75">
                      <h3 className="text-lg font-bold text-indigo-900 mb-2">{student}'s Mission</h3>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">{data.directTeaching}</p>
                      <div className="text-xs font-bold text-indigo-700 bg-indigo-50 p-2 rounded">
                        <strong>Task:</strong> {data.appliedChallenge}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ArrowRight className="text-indigo-500" /> Integrated Investigations
              </h3>
              
              {lessonPlan.integratedActivities?.map((activity: any, index: number) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col space-y-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                      {activity.subject}
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{activity.activityName}</h4>
                    <p className="text-slate-700 leading-relaxed">{activity.directTeaching}</p>
                  </div>
                  
                  {activity.interactiveQuestion && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                      <label className="block text-sm font-bold text-indigo-900 mb-2">
                        {activity.interactiveQuestion}
                      </label>
                      <textarea 
                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                        placeholder="Write your answer here..."
                        value={answers[activity.questionId] || ''}
                        onChange={(e) => handleAnswerChange(activity.questionId, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}

              {lessonPlan.multimediaResources && lessonPlan.multimediaResources.length > 0 && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MonitorPlay className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-blue-950">Curated Multimedia</h3>
                  </div>
                  <div className="space-y-4">
                    {lessonPlan.multimediaResources?.map((res: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-blue-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-blue-900">{res.title}</h4>
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{res.type}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{res.description}</p>
                        <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-500 flex flex-col gap-1">
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Search Query</span>
                          {res.searchQuery}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {lessonPlan.scienceExperiment && (
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical className="text-emerald-600" size={24} />
                    <h3 className="text-xl font-bold text-emerald-950">Sovereign Lab</h3>
                  </div>
                  <h4 className="font-bold text-emerald-900 mb-2">{lessonPlan.scienceExperiment.name}</h4>
                  
                  {lessonPlan.scienceExperiment.directTeaching && (
                    <p className="text-emerald-800 text-sm mb-4 leading-relaxed">
                      {lessonPlan.scienceExperiment.directTeaching}
                    </p>
                  )}

                  <div className="mb-4">
                    <h5 className="text-xs uppercase font-bold text-emerald-800 tracking-wider mb-1">Materials</h5>
                    <ul className="list-disc list-inside text-sm text-emerald-900 space-y-1">
                      {lessonPlan.scienceExperiment?.materials?.map((m: string, i: number) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-xs uppercase font-bold text-emerald-800 tracking-wider mb-1">Protocol</h5>
                    <ol className="list-decimal list-inside text-sm text-emerald-900 space-y-2">
                      {lessonPlan.scienceExperiment?.instructions?.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {lessonPlan.scienceExperiment.reflectionQuestion && (
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <label className="block text-sm font-bold text-emerald-900 mb-2">
                        {lessonPlan.scienceExperiment.reflectionQuestion}
                      </label>
                      <textarea 
                        className="w-full p-3 rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                        placeholder="Record your observations..."
                        value={answers[lessonPlan.scienceExperiment.questionId] || ''}
                        onChange={(e) => handleAnswerChange(lessonPlan.scienceExperiment.questionId, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {lessonPlan.writingPrompt && (
                <div className="bg-fuchsia-50 rounded-2xl p-6 border border-fuchsia-100 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                    <PenTool className="text-fuchsia-600" size={24} />
                    <h3 className="text-xl font-bold text-fuchsia-950">Creative Synthesis</h3>
                  </div>
                  <label className="block text-sm font-medium text-fuchsia-900 mb-3 leading-relaxed">
                    {lessonPlan.writingPrompt.prompt}
                  </label>
                  <textarea 
                    className="w-full p-3 rounded-lg border border-fuchsia-200 focus:ring-2 focus:ring-fuchsia-500 outline-none resize-none h-32"
                    placeholder="Start drafting here..."
                    value={answers[lessonPlan.writingPrompt.questionId] || ''}
                    onChange={(e) => handleAnswerChange(lessonPlan.writingPrompt.questionId, e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
