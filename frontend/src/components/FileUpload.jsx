import React, { useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';

function FileUpload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload .mp3, .wav, or .m4a.');
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a valid audio file.');

    const formData = new FormData();
    formData.append('audio', file);

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onResult(data.transcription);
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="bg-[#1b262c] text-white p-4 rounded-xl shadow-md animate-fade-in border border-[#3282b8] w-full h-full min-h-[180px] flex flex-col justify-between">
  <div>
    <h2 className="text-base font-semibold text-[#bbe1fa] mb-3">Upload Audio File</h2>

    <input
      type="file"
      accept=".mp3, .wav, .m4a"
      onChange={handleFileChange}
      className="block w-full text-sm text-white file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:font-medium
      file:bg-[#0f4c75] file:text-white hover:file:bg-[#3282b8] transition mb-3"
    />

    {error && <p className="text-red-300 text-sm">{error}</p>}
  </div>

  <button
  onClick={handleUpload}
  disabled={loading}
  className="mt-2 flex items-center justify-center gap-2 bg-[#0f4c75] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#3282b8] transition disabled:opacity-50"
>
  <CloudArrowUpIcon className="w-4 h-4" />
  {loading ? 'Uploading...' : 'Upload'}
</button>

</div>

  );
}

export default FileUpload;
