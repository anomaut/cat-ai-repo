import { Typography, Autocomplete, TextField, Box, Stack, IconButton } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";
import AddIcon from '@mui/icons-material/Add';
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import debounce from "lodash.debounce"; 

const fontOptions = [
  { label: "Inter", value: "inter" },
  { label: "Roboto", value: "roboto" },
  { label: "Open Sans", value: "opensans" },
  { label: "Lato", value: "lato" },
  { label: "Montserrat", value: "montserrat" },
  { label: "Poppins", value: "poppins" },
  { label: "Raleway", value: "raleway" },
  { label: "Merriweather", value: "merriweather" },
  { label: "Playfair Display", value: "playfair" },
  { label: "Fira Code", value: "firacode" }
];

function StyleSettings({newSettings, setNewSettings}){
    
    const [currentFont, setCurrentFont] = useState(newSettings.style[newSettings.selectedStyle].font.value)
    const [cSelected, setCSelected] = useState(null)
    const [nColor, setNColor] = useState(newSettings.style[newSettings.selectedStyle].palette.filter((e)=>e!=="").length)
    
    const getFontClass = (font) => {
        return font ? `font-${font}` : '';
    };

    useEffect(()=>{
        const fontClass = getFontClass(newSettings.style[newSettings.selectedStyle].font.value);
        setCurrentFont(fontClass)
    },[newSettings.style[newSettings.selectedStyle].font])
       
    useEffect(()=>{
         setNColor(newSettings.style[newSettings.selectedStyle].palette.filter((e)=>e!=="").length)
    },[newSettings.style[newSettings.selectedStyle].palette])

    const handleStyleChange = (name) => (event,value) => {
        
        setNewSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFontChange = (selectedStyle) => (event, value) => {
        setNewSettings(prev => ({
            ...prev,
            style: {
            ...prev.style,
            [selectedStyle]: {
                ...prev.style[selectedStyle],
                font: value
            }
            }
        }));
        };

    const debouncedColorChange = useCallback(
        debounce((selectedStyle, value, setNewSettings, cSelected, nColor) => {
            const c_i = cSelected === null? nColor : cSelected
            if (cSelected===null) setCSelected(nColor)
            setNewSettings(prev => ({
            ...prev,
            style: {
                ...prev.style,
                [selectedStyle]: {
                ...prev.style[selectedStyle],
                palette: prev.style[selectedStyle].palette.map((c, i) =>
                    i === c_i ? value : c
                ),
                },
            },
            }));
        }, 50),
        []
        );

    const handleColorChange = (selectedStyle) => (e) =>{
        const value = e.target.value;
        debouncedColorChange(selectedStyle, value, setNewSettings, cSelected, nColor);

    }

    const handleColorDelete = (selectedStyle) =>{
        setNewSettings(prev => ({
            ...prev,
            style: {
                ...prev.style,
                [selectedStyle]: {
                ...prev.style[selectedStyle],
                palette: prev.style[selectedStyle].palette.map((c, i) =>
                    i === cSelected ? "" : c
                ),
                },
            },
            }));
        setCSelected(null)
    }

    return(
        <div className="flex flex-col">
            <div className="flex flex-row justify-around pt-3">
                <div className="flex justify-start w-1/2">
                <Typography>Style</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                <Autocomplete 
                fullWidth
                name="style"
                disableClearable
                value={newSettings.style[newSettings.selectedStyle].name}
                options={["MyStyle", "Formal", "Playful"]} 
                sx={{ maxWidth: 150 }}
                onChange={handleStyleChange("selectedStyle")}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Select" size="small"/>
                )}></Autocomplete>
                </div>
            </div> 
            <div className="flex flex-row justify-around pt-3">
                <div className="flex justify-start w-1/2">
                <Typography>Font</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                <Autocomplete 
                className={`${currentFont}`}
                name="font"
                fullWidth
                disableClearable
                value={newSettings.style[newSettings.selectedStyle].font}
                options={fontOptions} 
                getOptionLabel={(option) => option.label}
                sx={{ maxWidth: 150 }}
                onChange={handleFontChange(newSettings.selectedStyle)}
                renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return(
                    <Box
                        key={key}
                        component="li"
                        {...optionProps}
                        className={`p-1 cursor-pointer ${getFontClass(option.value)} hover:bg-gray-100`}
                    >
                        {option.label}
                    </Box>
                    )
                }}
                renderInput={(params) => (
                <TextField
                {...params}
                variant="outlined"
                label="Select"
                size="small"
                slotProps={{
                    input:{
                        ...params.InputProps,
                        className: `${params.InputProps?.className || ''} ${currentFont}`,
                    }
                }}
                />
                )}
                ></Autocomplete>
                </div>
            </div>
            <div className="flex flex-row justify-around py-3">
                <div className="flex justify-start w-1/3">
                <Typography>Palette</Typography>
                </div>

                <div className="flex justify-end w-2/3 ">
                <div className="flex items-center overflow-x-auto scrollbar-none">
                 {
                    newSettings.style[newSettings.selectedStyle].palette.map((e,i)=>{
                        const ColorRef = useRef(null)

                        useEffect(() => {
                        const handleClickOutside = (event) => {
                            if (ColorRef.current && !ColorRef.current.contains(event.target) && !event.target.closest('[data-ignore-click-outside]')) {
                            
                            setCSelected(null)
                            }
                        };

                        document.addEventListener('mousedown', handleClickOutside);
                        return () => document.removeEventListener('mousedown', handleClickOutside);
                        }, []);

                        return (e !== "" &&
                        <IconButton ref={ColorRef} key={i} onClick={()=>setCSelected(prev=> prev === i? null: i)} size="small">
                            <CircleIcon fontSize="small" sx={{color: e, border: cSelected === i? "2px solid #888" : "2px solid #ccc", borderRadius: "50%"}}/>
                        </IconButton>)
                        
                    })
                 }
                 </div>
                
                {/* Bottone con icona palette */}
                <IconButton data-ignore-click-outside disabled={cSelected===null && nColor>=5}>
                {cSelected !== null ?<EditIcon/>: <AddIcon/>}
                <input
                    type="color"
                    onInput={handleColorChange(newSettings.selectedStyle)}
                    style={{
                    opacity: 0,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    }}
                />
                </IconButton>
                {cSelected !== null && <IconButton data-ignore-click-outside onClick={()=>handleColorDelete(newSettings.selectedStyle)} disabled={nColor<=1}>
                    <DeleteIcon></DeleteIcon>
                </IconButton>}

                </div>
            </div>
            
        </div>
    )
}

export {StyleSettings}