import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Recorder from './components/Recorder';
import TranscriptionView from './components/TranscriptionView';

function App() {
  const [transcription, setTranscription] = useState("");

  return (
    <div className="min-h-screen bg-[#1b262c] text-white px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-10 animate-fade-in">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#bbe1fa]">EchoNote</h1>
          <p className="text-[#3282b8] text-sm font-medium">Echoes captured as text</p>
        </header>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex">
              <FileUpload onResult={setTranscription} />
            </div>
            <div className="flex-1 flex">
              <Recorder onResult={setTranscription} />
            </div>
          </div>



        </section>

        {transcription && (
          <section className="bg-[#0f4c75] text-white p-5 rounded-xl shadow-lg border border-[#3282b8] animate-slide-up">
            <h2 className="text-lg font-semibold mb-2">Transcription Result</h2>
            <p className="whitespace-pre-wrap">{transcription}</p>
          </section>
        )}

        <TranscriptionView />
      </div>
    </div>
  );
}

export default App;
