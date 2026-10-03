import React, { useState, useRef } from 'react';
import { Video, Share2, Wand2, UploadCloud, Film } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function CreationStudio() {
  const [activeTab, setActiveTab] = useState<'upload' | 'prompt'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  const [aiPrompt, setAiPrompt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleShare = async () => {
    // In a real app, you would upload the videoFile to Firebase Storage first and get a URL.
    // For this prototype, we'll mock the URL or share local info.
    const shareData = {
      title: title || 'My Learning Project',
      text: description || 'Check out what I learned today!',
      url: window.location.href, // Mocking URL
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        alert('Web Share API is not supported in your browser. You can copy the link manually.');
      }
      
      // Save record to Firestore
      try {
        await addDoc(collection(db, 'users', 'demo-user', 'creations'), {
          title: shareData.title,
          videoUrl: 'https://example.com/mock-video-url.mp4',
          subject: 'Creation Studio',
          userId: 'demo-user',
          createdAt: Date.now()
        });
        console.log('Saved creation to DB');
      } catch (err) {
        console.error('Failed to save to DB (rules might require auth)', err);
      }
      
    } catch (err) {
      console.log('Share canceled or failed', err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-serif font-bold text-slate-900">Creation Studio</h1>
        <p className="text-lg text-slate-600 mt-2">Document your Sovereign Lab projects, film your learning, and share with the world.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button 
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'upload' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('upload')}
          >
            <span className="flex items-center justify-center gap-2"><Film size={18} /> Upload Footage</span>
          </button>
          <button 
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'prompt' ? 'bg-fuchsia-50 text-fuchsia-700 border-b-2 border-fuchsia-600' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('prompt')}
          >
            <span className="flex items-center justify-center gap-2"><Wand2 size={18} /> AI Text-to-Video Studio</span>
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {videoPreviewUrl ? (
                  <video src={videoPreviewUrl} controls className="max-h-64 rounded-lg shadow-sm" onClick={e => e.stopPropagation()} />
                ) : (
                  <>
                    <UploadCloud size={48} className="mb-4 text-indigo-400" />
                    <p className="font-medium text-slate-700">Click to upload or capture video</p>
                    <p className="text-sm mt-1">Supports MP4, WebM, QuickTime</p>
                  </>
                )}
                <input 
                  type="file" 
                  accept="video/*" 
                  capture="environment" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-6">
              <div className="bg-fuchsia-50 p-6 rounded-xl border border-fuchsia-100">
                <h3 className="font-bold text-fuchsia-900 mb-2">Director's Chair</h3>
                <p className="text-fuchsia-800 text-sm mb-4">Use this space to craft a perfect prompt for text-to-video generation tools (like Luma, Runway, or Sora). Describe the lighting, camera movement, subject, and environment in detail.</p>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Cinematic tracking shot of a glowing neon molecule structure in a dark, atmospheric laboratory, volumetric lighting..."
                  className="w-full h-32 p-4 rounded-xl border border-fuchsia-200 focus:ring-2 focus:ring-fuchsia-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g., My Sovereign Lab Results: Cellular Growth" 
                className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Learning Reflection (Caption)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What did you learn today? What surprised you?" 
                className="w-full h-24 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button 
              onClick={handleShare}
              disabled={!title || (!videoFile && !aiPrompt)}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Share2 size={20} />
              Share to Socials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
