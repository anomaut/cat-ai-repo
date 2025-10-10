import express from "express"
import { OpenAI } from "openai"
import dotenv from "dotenv"
import { extractionPrompt, generatePrompt, regenerateElementPrompt, regenerateAllPrompt, generateImagePrompt, regenerateSolutionPrompt, cleanJSON, evaluateConfidencePrompt } from "../utils.mjs";
import { pipeline } from "stream";
import { promisify } from "util";
import path from "path"
import fs from "fs"
import { getCurrentApiKey } from "./apiKeyRoutes.mjs";

const PORT = 3001

const generateRoutes = express.Router();

dotenv.config();

// Function to get OpenAI client with current API key
const getOpenAIClient = () => {
  const apiKey = getCurrentApiKey();
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
};

const streamPipeline = promisify(pipeline);

generateRoutes.post('/exercise-info', async (req, res) => {
  const { text } = req.body;

  const prompt = extractionPrompt(text)

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    
    const result = JSON.parse(cleanJSON(completion.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante l\'analisi' });
  }
});

generateRoutes.post('/exercise', async (req, res) => {
  const { data, manual } = req.body;
  
  try {
    const openai = getOpenAIClient();
    const prompt = generatePrompt(data, manual);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });
    const textboxes = cleanJSON(completion.choices[0].message.content)
    console.log(textboxes)
    const prompt1 = evaluateConfidencePrompt(textboxes);
    const completion1 = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt1 }],
      temperature: 0,
      max_completion_tokens: 200*JSON.parse(textboxes).length
    });
    console.log(cleanJSON(completion1.choices[0].message.content))
    //console.log(cleanJSON(completion.choices[0].message.content))
    const result = JSON.parse(cleanJSON(completion1.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione.' });
  }
});

generateRoutes.post('/exercise-again', async (req, res) => {
  const { textBoxes, text } = req.body;

  try {
    const openai = getOpenAIClient();
    const prompt = regenerateAllPrompt(textBoxes,text);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    });

    const result = JSON.parse(cleanJSON(completion.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione.' });
  }
});

generateRoutes.post('/solution-again', async (req, res) => {
  const { textBoxes } = req.body;

  try {
    const openai = getOpenAIClient();
    const prompt = regenerateSolutionPrompt(textBoxes);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(cleanJSON(completion.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione.' });
  }
});

generateRoutes.post('/confidence-flag', async (req, res) => {
  const { textBoxes } = req.body;

  try {
    const openai = getOpenAIClient();
    const prompt = evaluateConfidencePrompt(textBoxes);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const result = JSON.parse(cleanJSON(completion.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione.' });
  }
});

generateRoutes.post('/element-again', async (req, res) => {
  const { textBoxes,  selectedId, text } = req.body;

  try {
    const openai = getOpenAIClient();
    const prompt = regenerateElementPrompt(textBoxes,selectedId,text);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });
    console.log(completion.choices[0].message.content)
    const result = JSON.parse(cleanJSON(completion.choices[0].message.content));
    res.json(result);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione.' });
  }
});

generateRoutes.post('/image', async (req, res) => {
  const { text, palette } = req.body;

  try {
    const openai = getOpenAIClient();
    const prompt = generateImagePrompt(text, palette);

    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: text,
      size: "256x256",
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    const fetchResponse = await fetch(imageUrl);

    if (!fetchResponse.ok) {
      throw new Error(`Errore durante il download: ${fetchResponse.statusText}`);
    }

    const ext = '.png';
    const fileName = `generated-${Date.now()}${ext}`;
    const savePath = path.join('uploads', fileName);
    const fileUrl = `http://localhost:${PORT}/uploads/${fileName}`;

    await streamPipeline(fetchResponse.body, fs.createWriteStream(savePath));

    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore durante la generazione o il salvataggio dell\'immagine.' });
  }
});


export default generateRoutes;