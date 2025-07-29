import React, { useEffect, useState } from 'react';
import { FiDownload, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';

function TranscriptionView() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/transcriptions')
      .then((res) => res.json())
      .then((data) => {
        setTranscriptions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/transcriptions/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok) {
        setTranscriptions((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(`Failed to delete transcription: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting.');
    }
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text || 'No transcription'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'transcription'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text || '').then(() => {
      alert('Transcription copied to clipboard.');
    });
  };

  const filteredTranscriptions = transcriptions.filter((t) =>
    t.transcription?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-center text-gray-500">Loading transcription history...</p>;

  return (
    <div className="mt-10 px-4">
      <h2 className="text-2xl font-bold text-[#BBE1FA] mb-6">Transcription History</h2>

      <div className="relative w-full mb-6">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3282b8]"
          size={18}
        />

        <input
          type="text"
          placeholder="Search transcriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 pr-10 border border-[#3282b8] rounded-xl
               focus:outline-none focus:ring-2 focus:ring-[#3282b8]
               bg-[#1B262C] text-[#BBE1FA] placeholder-[#0f4c75]"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3282b8] hover:text-red-500 transition"
            title="Clear search"
          >
            <FiX size={18} />
          </button>
        )}
      </div>



      {filteredTranscriptions.length === 0 ? (
        <p className="text-center text-gray-500">No matching transcriptions found.</p>
      ) : (
        <div className="space-y-5">
          {filteredTranscriptions.map((t, index) => (
            <div
              key={t.id}
              className="bg-[#bbe1fa] border border-[#3282b8] rounded-xl p-5 shadow-md
             transform transition duration-300 ease-in-out
             hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl
             animate-fade-down"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
            >

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#1b262c] font-mono truncate">{t.filename}</p>
                <p className="text-xs text-[#0f4c75] italic">
                  {t.created_at
                    ? new Date(t.created_at).toLocaleString()
                    : 'Unknown date'}
                </p>
              </div>

              <p className="text-[#1b262c] mb-4">{t.transcription || "No transcription available."}</p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleCopy(t.transcription)}
                  title="Copy"
                  className="text-[#0f4c75] hover:text-white hover:bg-[#3282b8] p-2 rounded-full transition duration-300"
                >
                  <FiCopy size={18} />
                </button>
                <button
                  onClick={() => handleDownload(t.transcription, t.filename)}
                  title="Download"
                  className="text-[#0f4c75] hover:text-white hover:bg-[#3282b8] p-2 rounded-full transition duration-300"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  title="Delete"
                  className="text-[#0f4c75] hover:text-white hover:bg-[#3282b8] p-2 rounded-full transition duration-300"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TranscriptionView;
