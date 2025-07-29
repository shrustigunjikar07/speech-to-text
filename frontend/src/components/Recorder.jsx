import React, { useState, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

function Recorder({ onResult }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      onResult(data.transcription);
      chunks.current = [];
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
<div className="bg-[#1b262c] text-white p-4 rounded-xl shadow-md animate-fade-in border border-[#3282b8] w-full h-full min-h-[180px] flex flex-col justify-between">
  <div>
    <h2 className="text-base font-semibold text-[#bbe1fa] mb-3">Record Voice Input</h2>
  </div>

<button
  onClick={recording ? stopRecording : startRecording}
  className={`mt-2 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium shadow-md transition ${
    recording
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-[#0f4c75] hover:bg-[#3282b8]'
  }`}
>
  {recording ? (
    <>
      <StopIcon className="w-4 h-4 text-white" />
      Stop
    </>
  ) : (
    <>
      <MicrophoneIcon className="w-4 h-4 text-white" />
      Record
    </>
  )}
</button>

</div>

  );
}

export default Recorder;
