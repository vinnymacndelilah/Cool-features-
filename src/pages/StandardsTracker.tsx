import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { CheckCircle2, Circle, Loader2, Award, ListChecks } from 'lucide-react';
import { oklahomaStandards } from '../data/oklahomaStandards';

type CheckedState = Record<string, boolean>;

export default function StandardsTracker() {
  const [activeStudent, setActiveStudent] = useState<string>('Addy');
  const [checkedStandards, setCheckedStandards] = useState<CheckedState>({});
  const [loading, setLoading] = useState(true);

  const students = Object.keys(oklahomaStandards);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'users', 'demo-user', 'standards', 'progress');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCheckedStandards(docSnap.data().checked || {});
        } else {
          await setDoc(docRef, { checked: {} });
        }
      } catch (error) {
        console.error('Error fetching standards:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, []);

  const handleToggle = async (studentId: string, subjectName: string, standardId: string) => {
    const key = `${studentId}_${subjectName}_${standardId}`;
    const newState = !checkedStandards[key];
    
    const updated = {
      ...checkedStandards,
      [key]: newState
    };
    
    setCheckedStandards(updated);
    
    try {
      const docRef = doc(db, 'users', 'demo-user', 'standards', 'progress');
      await updateDoc(docRef, { checked: updated });
    } catch (error) {
      console.error('Error updating standard:', error);
      // Revert if failed
      setCheckedStandards(checkedStandards);
    }
  };

  const calculateProgress = (student: string) => {
    const subjects = oklahomaStandards[student as keyof typeof oklahomaStandards].subjects;
    let total = 0;
    let completed = 0;

    Object.entries(subjects).forEach(([subjectName, stds]) => {
      stds.forEach(std => {
        total++;
        if (checkedStandards[`${student}_${subjectName}_${std.id}`]) {
          completed++;
        }
      });
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-lg font-medium">Loading Oklahoma Academic Standards...</p>
      </div>
    );
  }

  const currentData = oklahomaStandards[activeStudent as keyof typeof oklahomaStandards];
  const currentProgress = calculateProgress(activeStudent);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3">
             <ListChecks className="text-indigo-600" size={36} />
             Oklahoma Academic Standards
          </h1>
          <p className="text-lg text-slate-600 mt-2">Track yearly learning requirements for each child.</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm min-w-[200px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase">Yearly Progress</span>
            <span className="text-indigo-600 font-bold font-mono">{currentProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }}></div>
          </div>
        </div>
      </header>

      <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {students.map(student => (
          <button
            key={student}
            onClick={() => setActiveStudent(student)}
            className={`px-6 py-3 font-medium text-sm rounded-t-xl transition-colors whitespace-nowrap ${
              activeStudent === student 
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {student} <span className="ml-2 text-xs opacity-70 bg-black/5 px-2 py-0.5 rounded-full">{oklahomaStandards[student as keyof typeof oklahomaStandards].grade}</span>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.entries(currentData.subjects).map(([subjectName, standards]) => {
          let subjectCompleted = 0;
          standards.forEach(std => {
            if (checkedStandards[`${activeStudent}_${subjectName}_${std.id}`]) subjectCompleted++;
          });
          const isAllDone = subjectCompleted === standards.length;

          return (
            <div key={subjectName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className={`p-5 border-b border-slate-100 flex justify-between items-center ${isAllDone ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                <h3 className="text-xl font-bold text-slate-800">{subjectName}</h3>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-mono font-bold ${isAllDone ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {subjectCompleted} / {standards.length}
                  </span>
                  {isAllDone && <Award className="text-emerald-500" size={20} />}
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {standards.map(std => {
                  const key = `${activeStudent}_${subjectName}_${std.id}`;
                  const isChecked = !!checkedStandards[key];
                  return (
                    <div 
                      key={std.id}
                      onClick={() => handleToggle(activeStudent, subjectName, std.id)}
                      className={`p-5 flex gap-4 cursor-pointer transition-colors hover:bg-slate-50 ${isChecked ? 'bg-indigo-50/30' : ''}`}
                    >
                      <button className={`mt-0.5 flex-shrink-0 transition-colors ${isChecked ? 'text-indigo-600' : 'text-slate-300'}`}>
                        {isChecked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      </button>
                      <div>
                        <div className={`font-mono text-sm font-bold mb-1 ${isChecked ? 'text-indigo-700' : 'text-slate-500'}`}>
                          {std.id}
                        </div>
                        <p className={`leading-relaxed ${isChecked ? 'text-slate-700' : 'text-slate-600'}`}>
                          {std.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
