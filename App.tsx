import React, { useState, useRef } from 'react';
import { identifyPeopleInImage, fileToBase64 } from './services/geminiService';
import { AppState, Person } from './types';
import AnnotationOverlay from './components/AnnotationOverlay';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle File Selection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = async (file: File) => {
    try {
      setAppState(AppState.ANALYZING);
      setError(null);
      setPeople([]);

      // Preview Image
      const objectUrl = URL.createObjectURL(file);
      setImageSrc(objectUrl);

      // Convert to Base64 for API
      const base64 = await fileToBase64(file);
      
      // Call Gemini API
      const result = await identifyPeopleInImage(base64, file.type);
      
      setPeople(result.people);
      setAppState(AppState.SUCCESS);
    } catch (e) {
      console.error(e);
      setError("Failed to identify people. Please try a clearer image or check your API key limits.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageSrc(null);
    setPeople([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="w-full max-w-4xl mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
          AI People Identifier
        </h1>
        <p className="text-slate-400">
          Upload an image to identify famous tech leaders using Gemini 2.5 Flash.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col items-center gap-8">
        
        {/* Upload Section (Only shown when IDLE) */}
        {appState === AppState.IDLE && (
          <div className="w-full max-w-lg">
            <label 
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-2xl cursor-pointer bg-slate-800/50 hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-slate-400 group-hover:text-cyan-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">PNG, JPG or JPEG (Max 10MB)</p>
              </div>
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>
            
            {/* Quick Test Button (Simulates the requested scenario) */}
            <div className="mt-6 text-center">
               <p className="text-xs text-slate-500 mb-2">Don't have the file? Try uploading the famous Tech CEO parking lot image.</p>
            </div>
          </div>
        )}

        {/* Image Preview & Analysis Area */}
        {imageSrc && (
          <div className="relative w-full max-w-4xl bg-slate-950 rounded-xl border border-slate-800 shadow-2xl p-2">
             {/* Image Container */}
             <div className="relative w-full rounded-lg overflow-hidden bg-black/40">
               <img 
                 ref={imageRef}
                 src={imageSrc} 
                 alt="Uploaded content" 
                 className="w-full h-auto block object-contain max-h-[80vh]" 
               />
               
               {/* Loading Overlay */}
               {appState === AppState.ANALYZING && (
                 <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                   <Spinner />
                   <p className="mt-4 text-cyan-300 font-medium animate-pulse">Analyzing visual data...</p>
                 </div>
               )}

               {/* Annotation Layer */}
               {appState === AppState.SUCCESS && (
                 <AnnotationOverlay 
                    people={people} 
                    imageWidth={imageRef.current?.width || 0} 
                    imageHeight={imageRef.current?.height || 0}
                 />
               )}
             </div>

             {/* Controls */}
             <div className="flex justify-between items-center mt-4 px-2 pb-2">
                <div className="text-sm text-slate-400">
                  {appState === AppState.SUCCESS && (
                    <span>Identified <strong className="text-white">{people.length}</strong> individuals</span>
                  )}
                  {appState === AppState.ERROR && (
                     <span className="text-red-400">{error}</span>
                  )}
                </div>
                <button 
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Analyze New Image
                </button>
             </div>
          </div>
        )}
        
        {/* List View for Accessibility / Detail */}
        {appState === AppState.SUCCESS && people.length > 0 && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {people.map((person, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex items-center gap-3 hover:bg-slate-700/50 transition-colors">
                 <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400 text-xs font-bold border border-cyan-700">
                   {idx + 1}
                 </div>
                 <span className="font-medium text-slate-200">{person.name}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;