import {check, validationResult} from 'express-validator';
import express from 'express';
import multer from 'multer'
import path from 'path';
import fs from 'fs/promises';
import PdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { createLog } from '../utils.mjs';

/* ROUTE */
const PORT = 3001
const fileRoutes = express.Router();
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo di file non supportato'), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const safeName = base.replace(/\s+/g, '_'); 
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
  limits: { fileSize: MAX_FILE_SIZE },
});

const upload = multer({
  storage:storage,
  fileFilter: fileFilter,
});

fileRoutes.post("/upload",
    (req, res) => {
    upload.single('file')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'Il file supera la dimensione massima di 3MB.' });
        }
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nessun file caricato o tipo non valido.' });
      }

      const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
      res.json({ url: fileUrl });
    });
  });

fileRoutes.delete('/delete', async (req, res) => {
  const filePath = req.body.path;

  if (!filePath) {
    return res.status(400).json({ error: 'Path del file mancante.' });
  }

  const absolutePath = path.resolve(filePath);

  try {
    await fs.unlink(absolutePath); 
    return res.status(200).json({ message: 'File eliminato con successo.' });
  } catch (err) {
    console.error('Errore durante la cancellazione:', err); 
    
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Il file specificato non esiste.' });
    }
    return res.status(500).json({ error: 'Impossibile eliminare il file.' });
  }
});

const extractTextFromPdf = async (filePath) => {
  const dataBuffer = await fs.readFile(filePath); 
  const pdfData = await PdfParse(dataBuffer);
  return pdfData.text;
};

const extractTextFromImage = async (filePath) => {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
  return text;
};

fileRoutes.post('/log', async (req, res) => {

  const {timestampKeys, exportData, filename, school, grade, exercise_level} = req.body
  try {
    const logContent = createLog(timestampKeys, exportData, filename, school, grade, exercise_level);
    await fs.writeFile('logs/log.txt', logContent, 'utf8');

  } catch (err) {
    console.error('Errore durante salvataggio log:', err);
    res.status(500).json({ error: 'Errore durante salvataggio log' });
  }
});

fileRoutes.post('/extract-text', async (req, res) => {
  const filePath = req.body.path;

  if (!filePath) return res.status(400).json({ error: 'Path mancante' });

  const ext = path.extname(filePath).toLowerCase();

  try {
    let text = '';

    if (ext === '.pdf') {
      text = await extractTextFromPdf(filePath);
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      text = await extractTextFromImage(filePath);
    } else {
      return res.status(400).json({ error: 'Tipo file non supportato per estrazione testo' });
    }

    res.json({ text });
  } catch (err) {
    console.error('Errore durante l\'estrazione del testo:', err);
    res.status(500).json({ error: 'Errore durante l\'estrazione del testo' });
  }
});


export default fileRoutes;