import React, { createContext, useState, useContext, useEffect } from 'react';

const ExportContext = createContext();

const initialExportData = {
      url : null,
      urlHeading: null,
      urlAnswer: null,
      startTimeImport: null,
      startTimeGoal: null,
      startTimeGeneration: null,
      startTimeEdit: null,
      startTimeExport: null,
      startTimeDownload: null,
      numberRegenerations: 0
    }

const getInitialData = () => {
  const saved = localStorage.getItem("exportData");
  try {
    return saved ? JSON.parse(saved) : initialExportData;
  } catch {
    return initialExportData;
  }
};

export const ExportProvider = ({ children }) => {
  const [exportData, setExportData] = useState(getInitialData);

  useEffect(() => {
    localStorage.setItem("exportData", JSON.stringify(exportData));
    }, [exportData]);

  return (
    <ExportContext.Provider value={{ exportData, setExportData }}>
      {children}
    </ExportContext.Provider>
  );
};

export const useExportData = () => useContext(ExportContext);