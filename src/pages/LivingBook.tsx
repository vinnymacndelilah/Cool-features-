import React, { useEffect, useState } from 'react';
import { Book, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function LivingBook() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const q = query(
          collection(db, 'users', 'demo-user', 'bookEntries'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntries(fetched);
      } catch (error) {
        console.error('Error fetching book entries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  if (selectedEntry) {
    const { title, lessonData, answers, createdAt } = selectedEntry;
    
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
        <button 
          onClick={() => setSelectedEntry(null)}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mb-4"
        >
          ← Back to Library
        </button>
        
        <header className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-3 text-slate-500 mb-3">
             <Calendar size={16} />
             <span className="text-sm font-medium">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-slate-900">{title}</h1>
        </header>

        <div className="space-y-12">
          {/* INDIVIDUAL BREAKOUTS */}
          {lessonData.individualBreakouts && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-100 pb-2 inline-block">
                Individual Missions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(lessonData.individualBreakouts).map(([student, data]: [string, any]) => (
                  <div key={student} className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <h4 className="text-xl font-bold text-indigo-900 mb-3">{student}</h4>
                    <p className="font-bold text-indigo-800 mb-3 text-sm">{data.appliedChallenge || data.interactiveQuestion}</p>
                    <p className="text-indigo-950 font-medium whitespace-pre-wrap font-serif text-lg">
                      {answers?.[student]?.[data.questionId] || answers?.['Parent']?.[data.questionId] || <span className="text-indigo-400/50 italic">No answer recorded.</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lessonData.integratedActivities?.map((activity: any, idx: number) => (
             <div key={idx} className="space-y-4">
               <h3 className="text-2xl font-bold text-slate-800 border-b-2 border-indigo-100 pb-2 inline-block">
                 {activity.subject}: {activity.activityName}
               </h3>
               <p className="text-slate-700 leading-relaxed text-lg">
                 {activity.directTeaching}
               </p>
               {activity.interactiveQuestion && (
                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4 shadow-inner">
                   <p className="font-bold text-slate-800 mb-3">{activity.interactiveQuestion}</p>
                   <p className="text-indigo-900 font-medium whitespace-pre-wrap font-serif text-lg">
                     {answers?.['Parent']?.[activity.questionId] || answers?.[activity.questionId] || <span className="text-slate-400 italic">No answer recorded.</span>}
                   </p>
                 </div>
               )}
            </div>
          ))}

          {lessonData.scienceExperiment && (
            <div className="space-y-4">
               <h3 className="text-2xl font-bold text-emerald-800 border-b-2 border-emerald-100 pb-2 inline-block">
                 Sovereign Lab: {lessonData.scienceExperiment.name}
               </h3>
               {lessonData.scienceExperiment.directTeaching && (
                 <p className="text-slate-700 leading-relaxed text-lg">
                   {lessonData.scienceExperiment.directTeaching}
                 </p>
               )}
               {lessonData.scienceExperiment.reflectionQuestion && (
                 <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-4 shadow-inner">
                   <p className="font-bold text-emerald-900 mb-3">{lessonData.scienceExperiment.reflectionQuestion}</p>
                   <p className="text-emerald-950 font-medium whitespace-pre-wrap font-serif text-lg">
                     {answers?.['Parent']?.[lessonData.scienceExperiment.questionId] || answers?.[lessonData.scienceExperiment.questionId] || <span className="text-emerald-400/50 italic">No observation recorded.</span>}
                   </p>
                 </div>
               )}
            </div>
          )}

          {lessonData.writingPrompt && (
             <div className="space-y-4">
               <h3 className="text-2xl font-bold text-fuchsia-800 border-b-2 border-fuchsia-100 pb-2 inline-block">
                 Creative Synthesis
               </h3>
               <div className="bg-fuchsia-50 p-6 rounded-xl border border-fuchsia-100 mt-4 shadow-inner">
                 <p className="font-bold text-fuchsia-900 mb-3">{lessonData.writingPrompt.prompt}</p>
                 <p className="text-fuchsia-950 font-medium whitespace-pre-wrap font-serif text-lg">
                   {answers?.['Parent']?.[lessonData.writingPrompt.questionId] || answers?.[lessonData.writingPrompt.questionId] || <span className="text-fuchsia-400/50 italic">No response recorded.</span>}
                 </p>
               </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3">
             <Book className="text-indigo-600" size={36} />
             Our Living Book
          </h1>
          <p className="text-lg text-slate-600 mt-2">A permanent record of our investigations, discoveries, and growth.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-slate-400">
           <span className="animate-pulse flex items-center gap-2"><Sparkles /> Opening the archives...</span>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <Book size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-600 mb-2">The Book is Empty</h3>
          <p className="text-slate-500 max-w-md mx-auto">Complete your first Daily Quest and save it to begin writing your family's living book.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map(entry => (
            <div 
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-64"
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">
                <Calendar size={14} />
                {new Date(entry.createdAt).toLocaleDateString()}
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-3">
                {entry.title}
              </h3>
              <div className="mt-auto flex items-center justify-between text-sm text-slate-500 font-medium">
                <span>View Chapter</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
