import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DeleteIcon from '@mui/icons-material/Delete';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined'
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import UploadIcon from '@mui/icons-material/Upload';
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';
import { useDocument } from "../../contexts/CustomizeContext";
import { useFormData } from '../../contexts/FormContext';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import GeneratingTokensIcon from '@mui/icons-material/GeneratingTokens';
import { useState, useEffect, useRef } from "react";
import { Stack, ToggleButton, ToggleButtonGroup, Tooltip, Box, TextField, Popover, Typography, Button } from '@mui/material';
import { ColorPicker } from './ColorPicker';
import API from '../../API/API.mjs';

function VerticalToolbar({exercisePage, selectedId, setSelectedId, textSelectedId, setTextSelectedId, imageSelectedId,  setImageSelectedId, setLoading, regenOpen, setRegenOpen, anchorEl, setAnchorEl, setRegeneratedEl}) {
    const {textBoxes, images, updateTextBox, setTextBoxes, deleteTextBox, addTextBox, updateImage, deleteImage, addImage} = useDocument()
    const {formData} = useFormData()
    const [textFormat, setTextFormat] = useState([]);
    const [increseEnabled, setIncreaseEnabled] = useState(true)
    const [decreseEnabled, setDecreaseEnabled] = useState(true)
    
    const imageInputRef = useRef(null);
    
    const [imageAnchor, setImageAnchor] = useState(null)

    const isText = textBoxes.some(el => el.id === selectedId);
    const isImage = images.some(img => img.id === selectedId);

    //------REGENERATION --------------

    const handleRegenToggle = (event, newValue) => {
    if (regenOpen === newValue) {
        setRegenOpen(null);
        setAnchorEl(null);
    } else {
        setRegenOpen(newValue);
        setAnchorEl(event.currentTarget);
    }
    };

    const handlePopoverClose = () => {
        setRegenOpen(null);
        setAnchorEl(null);
    };

    const handleRegeneration = async (prompt) =>{
        try{
            setLoading(true)
            setRegenOpen(null)
        
            if (regenOpen === "full") {
                const res = await API.handleExerciseRegeneration(textBoxes,prompt)
                console.log(res)
                setTextBoxes(res)
            }
            if (regenOpen ==="element") {
                const res = await API.handleElementRegeneration(textBoxes,selectedId,prompt)
                updateTextBox(selectedId,res)
                setRegeneratedEl(prev=>({
                    ...prev,
                    [selectedId]: true
                }))
            }
        }
        catch(err){
            console.log(err)
        }
        finally{
            setLoading(false)
        }
    }
    //-----HANDLE IMAGE -----------

    const handleImageOpen = (event) =>{
        setImageAnchor(event.currentTarget)
    }

    const handleImageClose = () =>{
        setImageAnchor(null)
    }

    const handleImageGeneration = async (prompt) =>{
        try{
            setLoading(true)
            const res = await API.handleImageGeneration(prompt,formData.style[formData.selectedStyle]?.palette.filter(Boolean))
            console.log(res)
            const newid = addImage(res.url, exercisePage)
            setSelectedId(newid)
        }catch(err){
            console.log(err)
        }
        finally{
            setLoading(false)
        }
    }

    const handleImage = async (selectedImage) =>{
        if (!selectedImage) return;
    const data = new FormData();
    data.append('file', selectedImage);

    try {
      const file = await API.handleUploadFile(data); // chiamata fetch
      const newid = addImage(file.url, exercisePage)
      setSelectedId(newid)
    } catch (err) {
        console.log(err);
    } 
    }

    const handleFileSelect = async (event) => {
        const selected = event.target.files[0];
        handleImage(selected)
    };


    //-----DELETE ELEMENT---------

    const handleDelete= async () =>{

        if (isText) deleteTextBox(selectedId);
        else if (isImage) {
            // const img = images.find(e => e.id === selectedId)
            // const relativePath = new URL(img.url).pathname.replace(/^\/+/, '');
            // await API.handleDeleteFile(relativePath)
            deleteImage(selectedId);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }

        setSelectedId(null);
        setTextSelectedId(null);
        setImageSelectedId(null);
    }

    useEffect(() => {
    const handleKeyDown = async (e) => {
      if ((e.key === "Delete") && selectedId && !textSelectedId && !imageSelectedId) {
        // Verifica se l'id selezionato è una textbox o un'immagine
        const isText = textBoxes.some(el => el.id === selectedId);
        const isImage = images.some(img => img.id === selectedId);

        if (isText) deleteTextBox(selectedId);
        else if (isImage) {
            // const img = images.find(e => e.id === selectedId)
            // const relativePath = new URL(img.url).pathname.replace(/^\/+/, '');
            // await API.handleDeleteFile(relativePath)
            deleteImage(selectedId);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }

        setSelectedId(null);
        setTextSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedId, deleteTextBox, deleteImage, textBoxes, images]);

    const handleFontSize = (increase) =>{
        const elem = textBoxes.find(e => e.id === selectedId)
        if (!elem) return;

        if (increase){
            updateTextBox(selectedId,{
                textSize: elem.textSize + 2
            })
            if (elem.textSize + 2 >= 24) setIncreaseEnabled(false)
            if (!decreseEnabled) setDecreaseEnabled(true)
        }
        else{
            updateTextBox(selectedId,{
                textSize: elem.textSize - 2
            })
            if (elem.textSize - 2 <= 12) setDecreaseEnabled(false)
            if (!increseEnabled) setIncreaseEnabled(true)
        }
    }

    //----HANDLE TEXT--------

    const handleText = () =>{
        const newid = addTextBox(exercisePage)
        console.log(newid)
        setSelectedId(newid)
    }

    const handleTextFormat = (event, newFormats) => {
        setTextFormat(newFormats);

        const elem = textBoxes.find(e => e.id === selectedId);
        if (!elem) return;

        updateTextBox(selectedId, {
            bold: newFormats.includes("bold"),
            italic: newFormats.includes("italic"),
            underlined: newFormats.includes("underlined"),
        });
    };

    useEffect(()=>{
        if (isText) {
            const elem = textBoxes.find(e => e.id === selectedId);
            if (!elem) return;
            let elemFormat = []
            if (elem.bold) elemFormat.push('bold')
            if (elem.italic) elemFormat.push('italic')
            if (elem.underlined) elemFormat.push('underlined')
            setTextFormat(elemFormat)
        }
        else(
            setTextFormat([])
        )
    },[selectedId, textBoxes])

    return (
        <Stack direction="column"
        className='sticky w-16 top-12 self-start max-md:w-14'
        spacing={1} sx={{
            display:"flex",
            alignItems: 'center',
            py:1,
            zIndex: 10,
        }}>
            <ToggleButtonGroup
            orientation="vertical"
            exclusive
            value={regenOpen}
            onChange={handleRegenToggle}
            >
                <Tooltip title="Regenerate All" placement="right">
                    <ToggleButton data-ignore-click-outside value="full" sx={{
                        color: 'white',
                        backgroundImage: 'linear-gradient(135deg, #ff69b4, #8a2be2)',
                        backgroundSize: '100% 100%',
                        transition: 'background-image 0.3s ease',
                        '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #ff4fa3, #6c22cc)', // hover più scuro
                        },
                        '&.Mui-selected': {
                        backgroundImage: 'linear-gradient(135deg, #ff85c1, #a366f5)', // selected più chiaro
                        color: 'white',
                        '&:hover': {
                            backgroundImage: 'linear-gradient(135deg, #ff69b4, #8a2be2)',
                        },
                        },
                    }}
                    >
                    <AutoModeIcon />
                    </ToggleButton>
                </Tooltip>

                <Tooltip title="Regenerate Element" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="element" disabled={!isText} sx={{
                        color: 'white',
                        backgroundImage: 'linear-gradient(135deg, #ff69b4, #8a2be2)',
                        backgroundSize: '100% 100%',
                        transition: 'background-image 0.3s ease',
                        '&:hover': {
                        backgroundImage: 'linear-gradient(135deg, #ff4fa3, #6c22cc)', // hover più scuro
                        },
                        '&.Mui-selected': {
                        backgroundImage: 'linear-gradient(135deg, #ff85c1, #a366f5)', // selected più chiaro
                        color: 'white',
                        '&:hover': {
                            backgroundImage: 'linear-gradient(135deg, #ff69b4, #8a2be2)',
                        },
                        },
                    }}
                    >
                    <GeneratingTokensIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>
            </ToggleButtonGroup>

            <RegenPopover
            anchorEl={anchorEl}
            open={Boolean(regenOpen)}
            onClose={handlePopoverClose}
            mode={regenOpen}
            handleRegeneration={handleRegeneration}
            />

            <ToggleButtonGroup orientation="vertical" className='bg-white'>
                <Tooltip title="Add Text" placement="right">
                    <ToggleButton value="text" onClick={()=>handleText()} data-ignore-click-outside>
                    <TextFieldsIcon />
                    </ToggleButton>
                </Tooltip>

                <Tooltip title="Add Image" placement="right">
                    <ToggleButton value="image" onClick={handleImageOpen} data-ignore-click-outside>
                    <AddPhotoAlternateIcon />
                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        style={{display:"none"}}
                        onChange={handleFileSelect}
                    />
                    </ToggleButton>
                </Tooltip>

                <ImagePopover 
                open={Boolean(imageAnchor)}
                anchorEl={imageAnchor}
                onClose={handleImageClose}
                imageInputRef={imageInputRef}
                handleImageGeneration={handleImageGeneration}>
                </ImagePopover>

                <Tooltip title="Delete" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="delete" disabled={selectedId===null} onClick={()=>handleDelete()}>
                    <DeleteIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>
            </ToggleButtonGroup>

             {isText &&
            <ToggleButtonGroup orientation="vertical" className='bg-white'>
                <Tooltip title="Decrease Text Size" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="increase" disabled={!isText || !decreseEnabled} onClick={()=>handleFontSize(false)}>
                    <TextDecreaseIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>

                <Tooltip title="Increase Text Size" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="decrease" disabled={!isText || !increseEnabled} onClick={()=>handleFontSize(true)}>
                    <TextIncreaseIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>

                <TextColorButton selectedId={selectedId} isText={isText}></TextColorButton>
            </ToggleButtonGroup>
            }
            {isText &&
            <ToggleButtonGroup orientation="vertical" className='bg-white'
            value={isText? textFormat: []} 
            onChange={handleTextFormat}>
                <Tooltip title="Bold" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="bold" disabled={!isText}>
                    <FormatBoldIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>

                <Tooltip title="Italic" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="italic" disabled={!isText} >
                    <FormatItalicIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>

                <Tooltip title="Underlined" placement="right">
                    <div data-ignore-click-outside>
                    <ToggleButton value="underlined" disabled={!isText}>
                    <FormatUnderlinedIcon />
                    </ToggleButton>
                    </div>
                </Tooltip>
            </ToggleButtonGroup>
        }
        </Stack>
    );
}

const TextColorButton = ({ selectedId, isText }) => {
  const { textBoxes, updateTextBox } = useDocument();
  const [isOpen, setIsOpen] = useState(null);
  const [currentColor, setCurrentColor] = useState("#000000")

  const handleOpen = (event) => {
    setIsOpen(event.currentTarget);
  };

  const handleClose = () => {
    setIsOpen(null);
    if (selectedId) {
      updateTextBox(selectedId, { textColor: currentColor });
    }
}
  const handleColorChange = (e) => {
    setCurrentColor(e.target.value)
  };

  const onColorClick = (color) => {
    
    if (selectedId) {
      updateTextBox(selectedId, { textColor: color });
    }
    setCurrentColor(color)
  }

  useEffect(()=>{
    const buttonColor = textBoxes.find(e => e.id === selectedId)?.textColor
    setCurrentColor(buttonColor)
  },[selectedId])

  return (
    <>
      <Tooltip title="Change Text Color" placement="right">
        <div data-ignore-click-outside>
          <ToggleButton
            value="textcolor"
            disabled={!isText}
            onClick={handleOpen}
            sx={{
                color: currentColor
            }}
          >
            <FormatColorTextIcon />
          </ToggleButton>
        </div>
      </Tooltip>

      <ColorPicker
        anchorEl={isOpen}
        open={Boolean(isOpen)}
        onClose={handleClose}
        color={currentColor}
        onChange={handleColorChange}
        onColorClick={onColorClick}
      />
    </>
  );
};

function ImagePopover({anchorEl,open, onClose, imageInputRef, handleImageGeneration}){
    const [generateImage, setGenerateImage] = useState(false)
    const [imagePrompt, setImagePrompt] = useState("")

    return(
      <Popover 
        data-ignore-click-outside
        open={open}
        anchorEl={anchorEl}
        onClose={()=>{onClose(), setGenerateImage(false)}}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        >   
            {generateImage? 
            <Box sx={{
                width: 300,
                height:280,
                p:2,
                backgroundColor: "#efefef",
                
            }}>
            <Stack direction="column" spacing={2}>
                <div className="flex flex-row justify-start items-center">
                    <PhotoFilterIcon fontSize="small" className="mr-2 align-middle"></PhotoFilterIcon>
                    <Typography variant="body1">Generate Image</Typography>
                </div>
                <TextField onChange={(e)=>setImagePrompt(e.target.value)} value={imagePrompt} multiline minRows={4} maxRows={4} variant="outlined" color="primary" placeholder="A dog..." helperText="Specify image features" 
                ></TextField>
                <Button disabled={imagePrompt===""} variant="contained" onClick={()=>{
                    handleImageGeneration(imagePrompt);
                    setImagePrompt("");
                    setGenerateImage(false)}}
                    >Generate</Button>

            </Stack>
            </Box> :
            <div className='flex flex-col p-1 gap-1'>
            <Button color='inherit' variant='contained' endIcon={<UploadIcon></UploadIcon>} onClick={()=>imageInputRef.current.click()} sx={{'&:hover': {transform: 'scale(1.02)',
                }}}>Upload</Button>
            <Button
            endIcon={<PhotoFilterIcon />}
            onClick={() => setGenerateImage(true)}
            sx={{
                color: 'white',
                backgroundImage: 'linear-gradient(135deg, #ff69b4, #8a2be2)',
                backgroundSize: '100% 100%',
                transition: 'background-image 0.3s ease, transform 0.2s ease',
                '&:hover': {
                backgroundImage: 'linear-gradient(135deg, #ff4fa3, #6c22cc)',
                transform: 'scale(1.02)',
                },
                '&:active': {
                backgroundImage: 'linear-gradient(135deg, #ff85c1, #a366f5)',
                transform: 'scale(0.98)',
                },
            }}
            >
            Generate
            </Button>
            </div>}
        </Popover>
    )
}

function RegenPopover({anchorEl,open, onClose, mode, handleRegeneration}){
    const [regenMode, setRegenMode] = useState(null)
    const [regenPrompt, setRegenPrompt] = useState("")

    useEffect(()=>{
        if (mode==="full") setRegenMode("Exercise")
        if (mode ==="element") setRegenMode("Element")

    },[mode])

    return(
        <Popover
        data-ignore-click-outside
        open = {open}
        anchorEl={anchorEl}
        onClose={()=>{onClose(); setRegenPrompt("")}}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}>
            <Box sx={{
                width: 300,
                height:280,
                p:2,
                backgroundColor: "#efefef",
                
            }}>
            <Stack direction="column" spacing={2}>
                <div className="flex flex-row justify-start items-center">
                    {regenMode==="Exercise"?<AutoModeIcon fontSize="small" className="mr-2 align-middle"/>:<GeneratingTokensIcon fontSize="small" className="mr-2 align-middle"></GeneratingTokensIcon>}
                    <Typography variant="body1">Regenerate {regenMode}</Typography>
                </div>
                <TextField onChange={(e)=>setRegenPrompt(e.target.value)} value={regenPrompt} multiline minRows={4} maxRows={4} variant="outlined" color="primary" placeholder="I would like..." helperText="Specify what you would like to change" 
                ></TextField>
                <Button disabled={regenPrompt===""} variant="contained" onClick={()=>{
                    handleRegeneration(regenPrompt);
                    setRegenPrompt("");}}
                    >Regenerate</Button>

            </Stack>
            </Box>
        </Popover>
    )
}

export {VerticalToolbar}