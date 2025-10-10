import { Header } from "./Header";
import { useExportData } from "../contexts/ExportData";
import { useFormData } from "../contexts/FormContext";
import { useEffect, useRef, useState } from 'react';
import { CircularProgress, Autocomplete, TextField, Chip, Button } from "@mui/material";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
GlobalWorkerOptions.workerSrc = pdfWorker;
import fs from "fs"
import API from "../API/API.mjs";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

function Export() {
  const { exportData, setExportData } = useExportData();
  const {formData} = useFormData()
  const canvasRef = useRef();
  const [loading, setLoading] = useState(true)
  const [exerciseType, setExerciseType] = useState("Exercise")
  const [downloaded, setDownloaded] = useState(false)

  const getUrl = ()=>{
    return exerciseType === "Exercise"? exportData.url 
    : exerciseType === "Exercise + Exam Heading" ? exportData.urlHeading
    : exerciseType === "Answer" ? exportData.urlAnswer
    : ""
  }

  useEffect(() => {
  if (!exportData?.url) {
    setTimeout(()=>{},[1000])
    return
  }

  const renderPDF = async (url) => {
        let renderTask = null;

        try {
        const loadingTask = getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 2, rotation: 0});
        
        const canvas = canvasRef.current;

        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport,
        };

        
        renderTask = page.render(renderContext);
        await renderTask.promise;
        } catch (error) {
            console.log("Already rendered");
        }
    };

  
    setLoading(true);
    const url = getUrl();
    requestAnimationFrame(async () => {
      await renderPDF(url);
      setLoading(false);
    });

    }, [exerciseType, canvasRef.current]);

    
    const handleDownloadFile = async () => {
        await setExportData((prev)=>({...prev, startTimeDownload: Date.now()}))
        const url = getUrl()
        const filename = `${exerciseType}.pdf`
        await API.handleDownloadFile(url,filename)
        setDownloaded(true)
    }; 

    useEffect(()=>{
        const saveLog = async () =>{
            const timestampKeys = Object.keys(exportData)
            .filter(k => k.startsWith('startTime'))
            .sort((a, b) => exportData[a] - exportData[b]);
            await API.handleLogSave(timestampKeys, exportData, formData.file.name, formData.school, formData.grade, formData.exercise_level)
        }
        
      if (downloaded) saveLog()
    },[exportData, downloaded])

  return (
    <div className="flex flex-col w-full h-[120%] items-center">
      <Header stepnumber={downloaded?3:2} />
      <div className="flex flex-row justify-between w-[80%] my-2 max-md:w-full">
        <div className="flex flex-row items-center w-[50%] gap-3">
        <Chip color="primary" variant="outlined" size="large" icon={<FileCopyIcon />} label="Format" />
        <Autocomplete 
        fullWidth
        disableClearable
        value={exerciseType}
        options={["Exercise", "Exercise + Exam Heading", "Answer"]} 
        onChange={(event, newValue) => {
          setExerciseType(newValue);
        }}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Type" size="small"/>
        )}></Autocomplete>
        </div>
        <div className="flex items-center " data-ignore-click-outside>
            <Button onClick={handleDownloadFile} variant="contained" endIcon={<DownloadIcon></DownloadIcon>}>Save</Button>
        </div>
      </div>
      
        <div className="flex justify-center items-center relative w-[80%] h-full overflow-auto bg-gray-100 max-md:w-full">
            
            <canvas
                ref={canvasRef}
                style={{ border: '1px solid #ccc',
                    width: "auto",
                    maxHeight: "95%",
                    display: 'block',
                }}
            />
        </div>
    </div>
  );
};

export { Export };
