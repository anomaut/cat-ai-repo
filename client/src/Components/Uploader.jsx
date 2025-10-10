import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  Avatar,
  Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import API from '../API/API.mjs';
import { useExportData } from '../contexts/ExportData';
import { useFormData } from "../contexts/FormContext"

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
};

function FileUploader({setUploading}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(false)
  const [isNotFileExercise, setIsNotFileExercise] = useState(false)
  const fileInputRef = useRef(null);

  const { formData, setFormData, resetFormData } = useFormData();
  const { setExportData } = useExportData()

  const handleFileUpload = async (selectedFile) => {
    if (!selectedFile) return;
    const data = new FormData();
    data.append('file', selectedFile);
    console.log(selectedFile)
    try {
      setUploading(true);
      const file = await API.handleUploadFile(data);
      setFormData(prev => ({
            ...prev,
            file: {
              url: file.url,
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type
            },
        }));
      setUploadError(false)

      const relativePath = new URL(file.url).pathname.replace(/^\/+/, '');
      const text = await API.handleTextExtraction(relativePath);
      const res = await API.handleTextAnalysis(text.text);
      if (res.error) {
        
        setUploadError(true)
        setIsNotFileExercise(true)
        handleDelete(file.url)
        return
      }

      setFormData(prev => ({
          ...prev,
          exercisetext: res.text,
          goals: res.learning_objectives,
          prerequisites: res.prerequisites,
          school: res.school_level,
          grade: res.grade
      }));

      setExportData((prev)=>({...prev, startTimeGoal: Date.now()}))

    } catch (err) {
        setUploadError(true)
        console.log(err);
    }
    finally{
      setUploading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const selected = event.target.files[0];
    handleFileUpload(selected)
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    handleFileUpload(droppedFile)
    setIsDragOver(false); 
  };

  const handleDelete = async (url) => {
    try{
      const relativePath = new URL(url).pathname.replace(/^\/+/, '');
      await API.handleDeleteFile(relativePath)
      resetFormData()
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    catch(err){
      console.log(err)
    }
  };

  const handleDragOver = (event) => event.preventDefault();
  const handleDragEnter = () => setIsDragOver(true);
  const handleDragLeave = () => setIsDragOver(false);

  useEffect(()=>{
    const tid = setTimeout(() => {
            setUploadError(false)
        }, 4000);
        return () => clearTimeout(tid);
  },[uploadError])

  return (
    <>
    {formData.file.url ? 
    
    <Card variant="outlined" className="drop-shadow-sm rounded-md" sx={{ p: 1, px:2, display: 'flex', alignItems: 'center' }}>
        <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', mr: 2 }}>
        {
            formData.file.type === 'application/pdf' ? (
            <InsertDriveFileIcon />  // Mostra icona PDF
            ) : (
            <img src={formData.file.url} alt="preview" width={40} height={40} style={{ objectFit: 'contain' }} />
            )
        }
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" className='line-clamp-1'>{formData.file.name}</Typography>
        <Typography variant="caption" color="text.secondary">
            {formatFileSize(formData.file.size)} • Upload complete
        </Typography>
        </Box>
        <IconButton onClick={()=>handleDelete(formData.file.url)} size="medium">
        <DeleteIcon />
        </IconButton>
        <CheckCircleIcon sx={{ color: 'green', ml: 1 }} />
    </Card>
    
    :
    <div className='flex flex-col my-2'>
    <Box
      onClick={() => fileInputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "80%",
        border: `2px dashed `,
        borderColor: uploadError? 'error.main': 'primary.main',
        borderRadius: 2,
        p: 4,
        bgcolor: isDragOver ? 'rgba(25, 118, 210, 0.08)' : uploadError ? 'rgba(211, 47, 47, 0.04)' : "",
        justifyContent: "center",
        alignItems: "center",
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: uploadError? "": 'rgba(25, 118, 210, 0.08)',
        },
      }}
    >
      <UploadFileIcon sx={{
        fontSize: 40,
        color: uploadError? 'error.main': 'primary.main',
      }} />
      <Box
        className={`flex flex-col items-center`}
        sx={{
          textAlign: 'center',
        }}
      >
        <Typography variant="body1" mt={2}>
          Drag and Drop or Click to upload your exercise file
        </Typography>
        <Typography variant="body2" mt={1} color={uploadError? "error" : "textSecondary"}>
          {uploadError? "Unsupported file or size exceded":"SVG, PNG, JPG, PDF (max. 3MB)"}
        </Typography>
      </Box>
      <input
        type="file"
        accept="*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </Box>
    {isNotFileExercise && <Alert className="my-2" severity="error" onClose={() => {setIsNotFileExercise(false)}}>
      The uploaded file does not contain a valid exercise, or the exercise is not readable. Upload another file or <a href='/generate/manual'>insert manually the exercise info</a>.
    </Alert>}
    </div>
    }
    </>
  );
};

export { FileUploader };
