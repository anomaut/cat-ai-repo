// Determine server URL based on environment
const SERVER_URL = import.meta.env.PROD 
  ? window.location.origin  // In production, API is served from same origin
  : 'http://localhost:3001'  // In development, use local server

// API Key management with 30-minute expiration
const API_KEY_STORAGE_KEY = 'catai_openai_key';
const API_KEY_EXPIRY_KEY = 'catai_openai_key_expiry';
const API_KEY_EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

// Store API key with expiration
const storeApiKey = (apiKey) => {
  const expiryTime = Date.now() + API_KEY_EXPIRY_TIME;
  sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  sessionStorage.setItem(API_KEY_EXPIRY_KEY, expiryTime.toString());
};

// Retrieve API key if not expired
const getStoredApiKey = () => {
  const apiKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
  const expiryTime = sessionStorage.getItem(API_KEY_EXPIRY_KEY);
  
  if (!apiKey || !expiryTime) {
    return null;
  }
  
  if (Date.now() > parseInt(expiryTime)) {
    // Key has expired, clear it
    clearApiKey();
    return null;
  }
  
  return apiKey;
};

// Clear stored API key
const clearApiKey = () => {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
  sessionStorage.removeItem(API_KEY_EXPIRY_KEY);
};

// Check if API key exists and is valid
const hasValidApiKey = () => {
  return getStoredApiKey() !== null;
};

// Get headers with API key
const getAuthHeaders = () => {
  const apiKey = getStoredApiKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  return headers;
};

const handleUploadFile = async (formData) => {
    const response = await fetch(`${SERVER_URL}/api/file/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data;
}

const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Download fallito");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Errore durante il download:", error);
    }
  };

const handleDeleteFile = async (path) => {
   const response = await fetch(`${SERVER_URL}/api/file/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path
      }),
    });

    if (!response.ok) throw new Error('Deletion failed');

    const res = await response.json();
    return res;
}

const handleLogSave = async (timestampKeys, exportData, filename, school, grade, exercise_level) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/file/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        timestampKeys, exportData, filename, school, grade, exercise_level
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
    }

    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleTextExtraction = async (path) => {
   const response = await fetch(`${SERVER_URL}/api/file/extract-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path
      }),
    });

    if (!response.ok) throw new Error('Text extraction failed');

    const res = await response.json();
    return res;
}

const handleTextAnalysis = async (text) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/exercise-info`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        text 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleExerciseGeneration = async (formdata, manual) => {
  try {
    console.log(manual)
    const response = await fetch(`${SERVER_URL}/api/generate/exercise`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        data: formdata,
        manual: manual
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleImageGeneration = async (text, palette) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/image`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        text,
        palette
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};


const handleExerciseRegeneration = async (textBoxes, text) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/exercise-again`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        textBoxes,
        text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleSolutionRegeneration = async (textBoxes) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/solution-again`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        textBoxes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleConfidenceFlags = async (textBoxes) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/confidence-flag`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        textBoxes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleElementRegeneration = async (textBoxes, selectedId, text) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/element-again`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        textBoxes,
        selectedId,
        text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore || data.error);
      return { errore: data.errore || data.error };
    }

    console.log('Risultato:', data);
    return data;

  } catch (error) {
    console.error('Errore di rete:', error);
    return { errore: 'Errore di rete o server non disponibile' };
  }
};

const handleValidateApiKey = async (apiKey) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/apikey/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { valid: false, error: data.error || 'Validation failed' };
    }

    // Store the API key on successful validation
    if (data.valid) {
      storeApiKey(apiKey);
    }

    return data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, error: 'Network error or server unavailable' };
  }
};

const handleCheckApiKeyStatus = async () => {
  // Check if API key is stored and valid on client side
  return { configured: hasValidApiKey() };
};

const API = {
  handleUploadFile,
  handleDownloadFile,
  handleDeleteFile,
  handleTextExtraction,
  handleTextAnalysis,
  handleExerciseGeneration,
  handleExerciseRegeneration,
  handleSolutionRegeneration,
  handleElementRegeneration,
  handleImageGeneration,
  handleLogSave,
  handleConfidenceFlags,
  handleValidateApiKey,
  handleCheckApiKeyStatus,
  clearApiKey,
  hasValidApiKey,
  getStoredApiKey
}

export default API