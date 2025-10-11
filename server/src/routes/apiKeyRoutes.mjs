import express from "express";
import { OpenAI } from "openai";

const apiKeyRoutes = express.Router();

// Validate API key by making a simple test request
// NOTE: API key is NOT stored on the server - client handles storage with expiration
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

    // Return success without storing the key
    res.json({ 
      valid: true, 
      message: 'API key is valid' 
    });
  } catch (error) {
    console.error('API key validation error:', error.message);
    res.status(400).json({ 
      valid: false, 
      error: 'Invalid API key. Please check and try again.' 
    });
  }
});

// Get API key from request header (client sends it with each request)
export const getApiKeyFromRequest = (req) => {
  const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    throw new Error('OpenAI API key not provided');
  }
  return apiKey;
};

export default apiKeyRoutes;

