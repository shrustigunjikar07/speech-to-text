const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const router = express.Router();
const supabase = require('../supabaseClient');
require('dotenv').config();

// ✅ Allowed MIME types
const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4'];

// ✅ Multer config
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP3, WAV, and M4A are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ✅ GET: Fetch all transcriptions
router.get('/transcriptions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transcriptions' });
  }
});

// ✅ POST: Upload and transcribe
router.post('/upload', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded or invalid file type.' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

  try {
    console.log('📁 File uploaded:', req.file.filename);

    const audioStream = fs.createReadStream(filePath);

    const response = await axios.post(
      'https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true',
      audioStream,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': req.file.mimetype || 'audio/wav',
        },
      }
    );

    const text = response.data.results.channels[0].alternatives[0].transcript;
    console.log('📝 Transcribed:', text);

    const { error } = await supabase.from('transcriptions').insert([{
      filename: req.file.filename,
      transcription: text,
    }]);

    if (error) {
      console.error('❌ DB Insert error:', error.message);
      return res.status(500).json({ error: 'Failed to save to database' });
    }

    res.json({
      message: 'Transcription successful',
      filename: req.file.filename,
      transcription: text,
    });
  } catch (err) {
    console.error('❌ Deepgram error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Transcription failed. Please try again.' });
  }
});

// ✅ DELETE: Remove transcription by ID
router.delete('/transcriptions/:id', async (req, res) => {
  const { id } = req.params;
  console.log('🧹 DELETE request for ID:', id);

  try {
    const { error } = await supabase.from('transcriptions').delete().eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error.message);
      return res.status(500).json({ error: 'Failed to delete transcription' });
    }

    console.log('✅ Deleted transcription ID:', id);
    res.json({ message: 'Transcription deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete transcription' });
  }
});

// 🚨 Catch-all 404 route
router.use((req, res) => {
  console.warn(`⚠️  Unknown route: ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
