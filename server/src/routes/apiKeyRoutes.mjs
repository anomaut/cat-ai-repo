import express from "express";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const apiKeyRoutes = express.Router();

// Store API key in memory (for current session)
let currentApiKey = process.env.OPENAI_API_KEY || '';

// Initialize API key from .env if it exists and is valid
if (currentApiKey && currentApiKey !== 'your-api-key-here') {
  // API key already configured
  console.log('OpenAI API key found in .env file');
} else {
  currentApiKey = '';
  console.log('No valid OpenAI API key configured. Please configure via the web interface.');
}

// Validate API key by making a simple test request
apiKeyRoutes.post('/validate', async (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey || apiKey.trim() === '') {
    return res.status(400).json({ 
      valid: false, 
      error: 'API key is required' 
    });
  }

  try {
    // Test the API key with a minimal request
    const testClient = new OpenAI({ apiKey: apiKey.trim() });
    
    // Make a minimal test call to verify the key works
    await testClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5,
    });

    // If successful, store the key
    currentApiKey = apiKey.trim();
    
    // Update the .env file
    const envPath = path.join(process.cwd(), '.env');
    const envContent = `OPENAI_API_KEY=${apiKey.trim()}\n`;
    fs.writeFileSync(envPath, envContent);

    res.json({ 
      valid: true, 
      message: 'API key is valid and has been saved' 
    });
  } catch (error) {
    console.error('API key validation error:', error.message);
    res.status(400).json({ 
      valid: false, 
      error: 'Invalid API key. Please check and try again.' 
    });
  }
});

// Check if API key is configured
apiKeyRoutes.get('/status', (req, res) => {
  const hasKey = !!(currentApiKey && currentApiKey.trim() !== '' && currentApiKey !== 'your-api-key-here');
  res.json({ 
    configured: hasKey,
    message: hasKey ? 'API key is configured' : 'API key not configured'
  });
});

// Get current API key (for the OpenAI client initialization)
export const getCurrentApiKey = () => currentApiKey;

export default apiKeyRoutes;

