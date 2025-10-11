import Typography from '@mui/material/Typography';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import imageCatAi from "../assets/illustazione-cat-ai.png"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import exportImg from "../assets/illustrazione-export.png"
import uploadImg from "../assets/illustrazione-upload.png"
import customizeImg from "../assets/illustrazione-customize.png"
import { useExportData } from '../contexts/ExportData';
import { useState, useEffect } from 'react';
import API from '../API/API.mjs';

function Home(){
    const {setExportData} = useExportData()
    const navigate = useNavigate()
    const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isApiKeyConfigured, setIsApiKeyConfigured] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        checkApiKeyStatus();
    }, []);

    const checkApiKeyStatus = async () => {
        setIsCheckingStatus(true);
        const result = await API.handleCheckApiKeyStatus();
        setIsApiKeyConfigured(result.configured);
        setIsCheckingStatus(false);
    };

    const handleStartGenerating = () => {
        if (!isApiKeyConfigured) {
            setIsApiKeyDialogOpen(true);
        } else {
            navigate("/generate");
            setExportData((prev) => ({ ...prev, startTimeImport: Date.now() }));
        }
    };

    const handleValidateApiKey = async () => {
        if (!apiKey.trim()) {
            setValidationError('Please enter an API key');
            return;
        }

        setIsValidating(true);
        setValidationError('');

        const result = await API.handleValidateApiKey(apiKey);

        setIsValidating(false);

        if (result.valid) {
            setIsApiKeyConfigured(true);
            setIsApiKeyDialogOpen(false);
            setApiKey('');
            navigate("/generate");
            setExportData((prev) => ({ ...prev, startTimeImport: Date.now() }));
        } else {
            setValidationError(result.error || 'Invalid API key');
        }
    };

    const handleCloseDialog = () => {
        if (!isValidating) {
            setIsApiKeyDialogOpen(false);
            setApiKey('');
            setValidationError('');
        }
    };

    return (
        <div className='flex flex-col-reverse gap-1 w-full h-full justify-around lg:flex-row max-lg:justify-end max-lg:gap-3'>
            <div className='flex flex-col gap-4 items-start justify-center max-lg:mt-3 max-lg:items-center'>
            <Typography variant='h4' className='font-bold max-lg:hidden'>Create classroom activities <br/>
                with your teaching assistant</Typography>
            <Typography variant='body1' className='max-lg:text-center'>CAT-AI makes it easy for teachers to design exercises <br/> and quizzes tailored to their students and learning goals.
            <br/>  Whether you're planning lessons or assessments, <br/> CAT-AI turns your ideas into ready-to-use activities.</Typography>
            <Steps></Steps>
            <Button 
                variant='contained' 
                size='large' 
                onClick={handleStartGenerating}
                disabled={isCheckingStatus}
                sx={{
                color: 'white',
                textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                backgroundImage: 'linear-gradient(135deg, #0097a7, #1565c0)',
                backgroundSize: '100% 100%',
                transition: 'background-image 0.3s ease, transform 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                    backgroundImage: 'linear-gradient(135deg, #006978, #0d47a1)', // ancora più scuro in hover
                },
                '&.Mui-selected': {
                    transform: 'scale(0.98)',
                    backgroundImage: 'linear-gradient(135deg, #26c6da, #1e88e5)', // selected più chiaro
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #0097a7, #1565c0)',
                    },
                },
            }}>
                {isCheckingStatus ? <CircularProgress size={24} color="inherit" /> : 'START GENERATING'}
            </Button>

            </div>
            <div className='flex flex-col justify-center max-lg:h-[30%]'>
                <div className='flex flex-row gap-3 relative rounded-md' style={{backgroundImage: "linear-gradient(135deg, #0097a7, #1565c0)"}}>
                    <img src={imageCatAi} className='flex object-contain rounded-md translate-x-4 translate-y-4 max-h-80 max-lg:max-h-36'></img>
                    <Typography variant='h4' className='h-full font-bold text-white text-center content-center mb-[5%] p-2 lg:hidden'>Your personal AI teaching assistant</Typography>
                </div>
                
            </div>

            {/* API Key Dialog */}
            <Dialog 
                open={isApiKeyDialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Configure OpenAI API Key
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        To use CAT-AI, you need to provide your OpenAI API key. 
                        You can get one from{' '}
                        <a 
                            href="https://platform.openai.com/api-keys" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#1565c0', textDecoration: 'underline' }}
                        >
                            OpenAI Platform
                        </a>.
                    </Typography>
                    
                    {validationError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {validationError}
                        </Alert>
                    )}
                    
                    <TextField
                        autoFocus
                        fullWidth
                        label="OpenAI API Key"
                        placeholder="sk-..."
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        disabled={isValidating}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isValidating) {
                                handleValidateApiKey();
                            }
                        }}
                        sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                        Your API key will be validated and stored securely in your browser session for 30 minutes.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button 
                        onClick={handleCloseDialog} 
                        disabled={isValidating}
                        sx={{ color: '#666' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleValidateApiKey}
                        variant="contained"
                        disabled={isValidating || !apiKey.trim()}
                        sx={{
                            backgroundImage: 'linear-gradient(135deg, #0097a7, #1565c0)',
                            color: 'white',
                            '&:hover': {
                                backgroundImage: 'linear-gradient(135deg, #006978, #0d47a1)',
                            }
                        }}
                    >
                        {isValidating ? <CircularProgress size={24} color="inherit" /> : 'Validate & Continue'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

function Steps(){
    return (
        <div className='flex flex-row w-full justify-center items-center gap-3'>
            <div className='flex flex-col gap-1 items-center text-center'>
            <Typography className='font-bold'>Upload and Generate</Typography>
            <div className='flex flex-col text-white font-bold text-center h-40 w-40 rounded-md p-2 max-md:h-28 max-md:w-28' style={{backgroundImage: "linear-gradient(135deg, #0097a7, #1565c0)"}}>
                <img src={uploadImg} className='object-contin'></img>
            </div>
            </div>
            <ArrowRightIcon></ArrowRightIcon>
            <div className='flex flex-col gap-1 items-center text-center'>
            <Typography className='font-bold'>Customize and Export</Typography>
            <div className='flex flex-col text-white font-bold text-center h-40 w-40 rounded-md p-2 max-md:h-28 max-md:w-28' style={{backgroundImage: "linear-gradient(135deg, #0097a7, #1565c0)"}}>
                <img src={customizeImg} className='object-contin'></img>
            </div>
            </div>
            <ArrowRightIcon></ArrowRightIcon>
            <div className='flex flex-col gap-1 items-center text-center'>
            <Typography className='font-bold'>Download and Repeat</Typography>
            <div className='flex flex-col text-white font-bold text-center h-40 w-40 rounded-md p-2 max-md:h-28 max-md:w-28' style={{backgroundImage: "linear-gradient(135deg, #0097a7, #1565c0)"}}>
                <img src={exportImg} className='object-contin'></img>
            </div>
            </div>
        </div>
    )
}

export {Home}