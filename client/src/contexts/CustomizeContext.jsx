import React, { createContext, useContext, useState, useEffect } from "react";

const DocumentContext = createContext();

const getInitialTextBoxes = () => {
  const saved = localStorage.getItem("textBoxes");
  try {
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInitialImages = () => {
  const saved = localStorage.getItem("images");
  try {
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const DocumentProvider = ({ children }) => {
  const [textBoxes, setTextBoxes] = useState(getInitialTextBoxes);
  const [images, setImages] = useState(getInitialImages);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
  localStorage.setItem("textBoxes", JSON.stringify(textBoxes));
  }, [textBoxes]);

  useEffect(() => {
    localStorage.setItem("images", JSON.stringify(images));
  }, [images]);

  // ───────────── HISTORY ─────────────
  const saveToHistory = (newTextBoxes, newImages) => {
    setHistory((prev) => [...prev, { textBoxes, images }]);
    setRedoStack([]); // Clear redo on new action
    setTextBoxes(newTextBoxes);
    setImages(newImages);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prevState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, { textBoxes, images }]);
    setTextBoxes(prevState.textBoxes);
    console.log(prevState.textBoxes)
    setImages(prevState.images);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, { textBoxes, images }]);
    setTextBoxes(nextState.textBoxes);
    setImages(nextState.images);
  };

  // ───────────── TEXT BOX ─────────────
  const addTextBox = (page) => {
    let newY = 16;
    let newX = 16
    if (textBoxes.filter(e => e.page === page).length >= 1) {
      const prevTextBox = [...textBoxes].filter(e => e.page === page).sort((a, b) => b.position.y - a.position.y)[0];
      newY = prevTextBox.position.y + prevTextBox.h + 16;
      newX = prevTextBox.position.x
    }

    const newTextBox = {
      id: Date.now(),
      page,
      position: { x: newX || 16, y: newY || 16 },
      w: 200,
      h: 50,
      content: '',
      textSize: 16,
      textColor: '#000000',
      bold: false,
      italic: false,
      underlined: false,
    };
    saveToHistory([...textBoxes, newTextBox], images);
    return newTextBox.id;
  };

  const updateTextBox = (id, updates) => {
    const updated = textBoxes.map((box) =>
      box.id === id ? { ...box, ...updates } : box
    );

    const last = history[history.length - 1];
    let isSame
    if (last) isSame = JSON.stringify(last.textBoxes) === JSON.stringify(updated);
    else isSame = JSON.stringify(textBoxes) === JSON.stringify(updated);

    if (!isSame) {
      console.log(updated)
      saveToHistory(updated, images);
    }
    else{
      setTextBoxes(updated)
    }
  };

  const updateTextBoxes = (updates) =>{
    let updatedBoxes = [...textBoxes];

    for (const c of updates) {
        const idx = updatedBoxes.findIndex(e => e.id === c.id);
        if (idx !== -1) {
          updatedBoxes[idx] = { ...updatedBoxes[idx], ...c };
        } else {
          updatedBoxes.push(c);
        }
      }

      const last = history[history.length - 1];
      const isSame = last && JSON.stringify(last.textBoxes) === JSON.stringify(updatedBoxes);

      if (!isSame) {
        saveToHistory(updatedBoxes, images);
      } else {
        setTextBoxes(updatedBoxes);
      }
    }

    const deleteTextBox = (id) => {
      const updated = textBoxes.filter((box) => box.id !== id);
      saveToHistory(updated, images);
  };

  // ───────────── IMAGES ─────────────
  const addImage = (url,page) => {
    const newImage = {
      id: Date.now(),
      page,
      url,
      position: { x: 16, y: 16 },
      w: 200,
      h: 200,
    };
    saveToHistory(textBoxes, [...images, newImage]);
    return newImage.id;
  };

  const updateImage = (id, updates) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, ...updates } : img
    );

    const last = history[history.length - 1];
    const isSame = last && JSON.stringify(last.images) === JSON.stringify(updated);

    if (!isSame){
      saveToHistory(textBoxes, updated);
    }
  };

  const deleteImage = (id) => {
    const updated = images.filter((img) => img.id !== id);
    saveToHistory(textBoxes, updated);
  };

  return (
    <DocumentContext.Provider
      value={{
        history,
        redoStack,
        textBoxes,
        setTextBoxes,
        images,
        setImages,
        addTextBox,
        updateTextBox,
        updateTextBoxes,
        deleteTextBox,
        addImage,
        updateImage,
        deleteImage,
        undo,
        redo,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => useContext(DocumentContext);