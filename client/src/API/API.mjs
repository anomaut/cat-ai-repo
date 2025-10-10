// Determine server URL based on environment
const SERVER_URL = import.meta.env.PROD 
  ? window.location.origin  // In production, API is served from same origin
  : 'http://localhost:3001'  // In development, use local server

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text 
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        data: formdata,
        manual: manual
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text,
        palette
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


const handleExerciseRegeneration = async (textBoxes, text) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate/exercise-again`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        textBoxes,
        text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        textBoxes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        textBoxes
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        textBoxes,
        selectedId,
        text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Errore:', data.errore);
      return { errore: data.errore };
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

    return data;
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, error: 'Network error or server unavailable' };
  }
};

const handleCheckApiKeyStatus = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/apikey/status`, {
      method: 'GET',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking API key status:', error);
    return { configured: false, error: 'Network error or server unavailable' };
  }
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
  handleCheckApiKeyStatus
}

export default API