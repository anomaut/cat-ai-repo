import React, { createContext, useState, useContext, useEffect } from 'react';

const FormContext = createContext();

const myStyle = {
    name: "MyStyle",
    font: { label: "Roboto", value: "roboto" },
    palette: ["#888", "#000000", "#2196f3", "", ""]
  }

const FormalStyle = {
    name: "Formal",
    font: { label: "Playfair Display", value: "playfair" },
    palette: ["#1C1C1E", "#3A3F58", "#D6D6D6", "", ""]
  }

const PlayfulStyle = {
    name: "Playful",
    font: { label: "Poppins", value: "poppins" },
    palette: ["#FF6B6B", "#FFD93D", "#6BCB77", "", ""]
  }

const initialFormData = {
    file: {
      url: "",
      name: "",
      size: "",
      type: "",
    },
    exercisetext:"",
    exercisefeatures: [],
    goals:[],
    prerequisites:[],
    school: "",
    grade: "",
    reminder: true,
    example: false,
    exercise_level: "Easy",
    n_questions: "3",
    vocabulary: "Colloquial",
    style: { 
      "MyStyle":myStyle,
      "Formal": FormalStyle,
      "Playful":PlayfulStyle
    },
    selectedStyle: "MyStyle",
    language: { code: 'IT', label: 'Italian' },
    dislexiaInclusive: false,
  }

const getInitialData = () => {
  const saved = localStorage.getItem("formData");
  try {
    return saved ? JSON.parse(saved) : initialFormData;
  } catch {
    return initialFormData;
  }
};

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState(getInitialData);

  useEffect(() => {
      localStorage.setItem("formData", JSON.stringify(formData));
      }, [formData]);

  const resetFormData = () =>{
    setFormData(prev => ({
      ...prev,
      file: {
        url: "",
        name: "",
        size: "",
        type: "",
      },
      exercisetext:"",
      exercisefeatures: [],
      goals:[],
      prerequisites:[],
      school: "",
      grade: "",
      reminder: false,
      example: false,
    }))
  }
    
  return (
    <FormContext.Provider value={{ formData, setFormData, resetFormData }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => useContext(FormContext);