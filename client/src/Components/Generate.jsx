import { useEffect, useState } from "react"
import { Header } from "./Header"
import { FileUploader } from "./Uploader"
import Edit from "@mui/icons-material/Edit"
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import RuleIcon from '@mui/icons-material/Rule';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Button, Divider, IconButton, Typography, TextField, Autocomplete, Chip,FormControl, FormGroup, FormControlLabel, FormHelperText, Checkbox, LinearProgress, Tooltip, Card, Avatar, Box } from "@mui/material"
import UploadFileImg from "../assets/uploadfile.png"
import FillManuallyImg from "../assets/fillmanually.png"
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBaforeIcon from '@mui/icons-material/NavigateBefore'
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useFormData } from "../contexts/FormContext"
import { useExportData } from "../contexts/ExportData";
import API from "../API/API.mjs"
import { useDocument } from "../contexts/CustomizeContext"
import { Loading } from "./Loading"

function Generate(){
    const { formData, resetFormData } = useFormData();
    const {setExportData} = useExportData()
    const { setTextBoxes} = useDocument()
    const [generating, setGenerating] = useState(false)

    const initialFieldError = {
        exercisetext: false,
        exercisefeatures:false,
        goals:false,
        prerequisites:false,
        school:false,
        grade:false
    }

    const [fieldError, setFieldError] = useState(initialFieldError) 

    const navigate = useNavigate()

    const checkErrorNext = () => {
        const newErrors = {
            exercisetext: !Boolean(formData.exercisetext),
            exercisefeatures: !Boolean(formData.exercisefeatures.length),
        };

        setFieldError(newErrors);

        const values = Object.values(newErrors);
        const hasTrue = values.includes(true);

        return hasTrue;
    };

    const checkErrorInputParams = () => {
        const newErrors = {
            goals: !Boolean(formData.goals.length),
            prerequisites: !Boolean(formData.prerequisites.length),
            school: !Boolean(formData.school),
            grade: !Boolean(formData.grade)
        };

        setFieldError(newErrors);

        const values = Object.values(newErrors);
        const hasTrue = values.includes(true);

        return hasTrue;
    };

    const handleNext = () =>{
        if (checkErrorNext()) {
            console.log("has error")
            setTimeout(()=>{
                setFieldError(initialFieldError)
            },[4000])
            return false
        }
        return true
    }

    const handleSubmit = async (manual=false) =>{

        if (checkErrorInputParams()) {
            setTimeout(()=>{
                setFieldError(initialFieldError)
            },[4000])
            return
        }
        
        //resetFormData()
        setExportData((prev)=>({...prev, startTimeGeneration: Date.now()}))

        try{
            setGenerating(true)
            const res = await API.handleExerciseGeneration(formData, manual)
            //const finalres = await API.handleConfidenceFlags(res)
            setTextBoxes(res)
        }
        catch(err){
            console.log(err)
        }
        setGenerating(false)
        
        setExportData((prev)=>({...prev, startTimeEdit: Date.now()}))

        navigate("/customize")
    }

    return(
    <Routes>
        <Route element={
            <div className="flex flex-col w-full h-full items-center">
                <Header stepnumber={0}></Header>
                <div className="flex flex-col w-[80%] h-full">
                    <Outlet/>
                </div>
            </div>
        }>

            <Route index element={
            <ModeButtons></ModeButtons>
            } />

            <Route path="/upload" element={
            <UploadMode handleSubmit={handleSubmit} handleNext={handleNext} generating={generating} fieldError={fieldError}></UploadMode>
            } />

            <Route path="/manual" element={
            <ManualMode handleSubmit={handleSubmit} generating={generating} fieldError={fieldError}></ManualMode>
            }/>
            
        </Route>
    </Routes>
    )
}

function ModeButtons(){
    const navigate = useNavigate()

    return(
                
        <div className="flex flex-row w-full h-[60%]">
            <div className="flex w-[50%] m-[2%]">
                <Button variant="contained" color="primary" sx={{textTransform:"none"}} onClick={()=>navigate("upload")}>
                    <div className="flex w-full h-full max-md:flex-col-reverse">
                        <div className="flex w-1/3 h-full justify-center items-center max-md:w-full">
                            <img src={UploadFileImg} className="max-w-[80%]"></img>
                        </div>
                        <div className="flex flex-col w-2/3 h-full items-start place-content-center max-md:w-full max-md:items-center">
                            <Typography variant="h6" className="mb-2 font-black">
                                UPLOAD A FILE
                            </Typography>
                            <Typography variant="subtitle2" className="w-full max-h-[60%] text-left max-md:hidden line-clamp-6">
                                Generate a exercise starting from a 
                                reference. Upload a file containing your 
                                exercise. Automatically create a new 
                                one with same topic, vocabulary, goals. 
                            </Typography>
                        </div>
                    </div>
                </Button>
            </div>
            <div className="flex w-[50%] m-[2%]">
                <Button variant="contained" color="inherit" sx={{textTransform:"none"}} onClick={()=>navigate("manual")}>
                    <div className="flex w-full h-full max-md:flex-col-reverse">
                        <div className="flex w-1/3 h-full justify-center items-center max-md:w-full">
                            <img src={FillManuallyImg} className="max-w-[80%]"></img>
                        </div>
                        <div className="flex flex-col w-2/3 h-full items-start place-content-center max-md:w-full max-md:items-center">
                            <Typography variant="h6" className="mb-2 font-black">
                                COMPILE MANUALLY                                   
                            </Typography>
                            <Typography variant="subtitle2" className="w-full max-h-[60%] text-left max-md:hidden line-clamp-6">
                                Generate a exercise compiling the given 
                                form. Fill all the required fields.
                                Create a new exercise choosing topic, 
                                vocabulary, goals. 
                            </Typography>
                        </div>
                    </div>
                </Button>
            </div>
        </div>
    )
}

function ChangeHeader (){
    return(
        <Card variant="outlined" className="drop-shadow-sm rounded-md" sx={{ p: 1, px:2, display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#fff', color: 'primary.main', mr: 2 }}>
            <InfoOutlineIcon></InfoOutlineIcon>
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" className='line-clamp-1'>Fill the form with your desired features to create a brand new exercise</Typography>
            <Typography variant="caption" color="text.secondary">
                The generated exercise TOPICS and COMPLEXITY will depend on the following features
            </Typography>
            </Box>
        </Card>
    )
}

function UploadMode({handleSubmit, handleNext, generating, fieldError}){
    const [uploading, setUploading] = useState(false);
    const [textChecked, setTextChecked] = useState(false);
    const { formData, setFormData } = useFormData();

    return(
        <div className="flex flex-col w-full">
        { generating? <Loading text={"Generating exercise, can take a minute"}></Loading>
        : uploading? <Loading text={"Extracting informations"}></Loading>
        : 
        <div>
    
        {!textChecked? <FileUploader setUploading={setUploading}></FileUploader>
        : <ChangeHeader></ChangeHeader>}
        <div className="flex justify-center">
        {formData.file.url && !textChecked? <Chip icon={<RuleIcon></RuleIcon>} label="WHAT TO KEEP" sx={{ width:"100%", borderRadius: "0.5rem", my: 1, px:2,'& .MuiChip-label': {fontWeight: 600, fontSize: 16}}}></Chip>
        : formData.file.url && textChecked? <Chip icon={<EditNoteIcon></EditNoteIcon>} label="WHAT TO CHANGE" sx={{width:"100%", borderRadius: "0.5rem", my: 1, px:2,'& .MuiChip-label': {fontWeight: 600, fontSize: 16}}}></Chip> : null }
        </div>
        {formData.file.url? 
            <GenerationForm fieldError={fieldError} textChecked={textChecked}></GenerationForm> : null}
            <div className="flex justify-end w-full pb-4">
                {
                    textChecked?
                    <div className="flex flex-row gap-2">
                    <Button onClick={()=>setTextChecked(false)} size="medium" variant="contained" color="inherit" startIcon={<NavigateBaforeIcon/>} disabled={!formData.file.url || uploading || generating}>Back</Button>
                    <Button onClick={()=>handleSubmit()} size="medium" variant="contained" endIcon={<NavigateNextIcon/>} disabled={!formData.file.url || uploading || generating}>Generate</Button>
                    </div>
                    :
                    <Button onClick={()=>{if (handleNext()) setTextChecked(true)}} size="medium" variant="contained" endIcon={<NavigateNextIcon/>} disabled={!formData.file.url || uploading || generating}>Next</Button>
                }
            </div>
        </div>
        }
        </div>
    )
}

function ManualMode({handleSubmit, generating, fieldError}){
    return(
        <div className="flex flex-col w-full">
        {generating ? 
        <Loading text={"Generating exercise"}></Loading>
        : 
        <div>
            <ChangeHeader></ChangeHeader>
            <GenerationForm fieldError={fieldError} textChecked={true}/>
            <div className="flex items-center justify-end w-full pb-4">
                <Button onClick={()=>handleSubmit(true)} size="medium" variant="contained" endIcon={<NavigateNextIcon/>} disabled={generating}>Generate</Button>
            </div>
            </div>}
        </div>
    )
}

function GenerationForm({fieldError, textChecked}){

    const { formData, setFormData } = useFormData();

    const textFeatures = ["exercise structure","exercise typology","exercise vocabulary"]

    const handleTextChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleAutocompleteChange = (name) => (event, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSchoolChange = (name) => (event, value) => {
        setFormData(prev => prev.grade !== ""?  ({
            ...prev,
            [name]: value,
            grade: ""
        })
        : ({
            ...prev,
            [name]: value
        })
    );
    };

    const handleCheckboxChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.checked
        }));
    };

    const handleFeatureChange = (feature) => {
        const isFPresent = formData.exercisefeatures.find(e => e === feature)
        setFormData(prev => ({
            ...prev,
            exercisefeatures: isFPresent ? prev.exercisefeatures.filter(e => e!== feature) : [...prev.exercisefeatures, feature]
        }));
    }

    return(
        <div className="relative w-full overflow-hidden">
            
            <div className="flex flex-row w-[200%] max-md:pb-2 transition-all duration-300"  
            style={{
                transform: textChecked ? "translateX(-50%)" : "translateX(0)",
            }}>
                <div className="flex flex-col w-1/2 px-2 gap-4 md:flex-row max-md:mb-3">
                <div className="flex flex-col w-3/5 max-md:w-full">
                    <div className="flex flex-row items-center gap-1 mb-1">
                        <Typography variant="subtitle1" className="font-semibold">Exercise Text</Typography>
                        <Tooltip title="The exercise text to take inspiration from" placement="right">
                            <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                        </Tooltip>
                    </div>
                    <TextField multiline label="Text" rows={13} className="w-full" 
                    error={fieldError.exercisetext}
                    name="exercisetext" 
                    onChange={handleTextChange} 
                    value={formData.exercisetext || ""}
                    helperText={fieldError.exercisetext && "Mandatory field"}>
                    </TextField>
                </div>
                <div className="flex flex-col w-2/5 gap-3 max-md:w-full">
                    <div className="flex flex-col gap-1 mb-1">
                        <Typography variant="subtitle1" className="font-semibold text-center">DESIRED FEATURES</Typography>
                        <Typography variant="subtitle2" className="font-medium text-center">Select the features that you would like to keep from the input exercise text</Typography>
                    </div>
                    <div className="flex flex-col gap-3">
                        {textFeatures.filter(f => formData.exercisefeatures.includes(f)).map((e,i)=>(
                            <Button key={i} onClick={()=>handleFeatureChange(e)} variant="contained" color="success">{e}</Button>
                        ))}
                        <Divider className="bg-black"></Divider>
                    </div>
                    <div className="flex flex-col gap-3">
                        {textFeatures.filter(f => !formData.exercisefeatures.includes(f)).map((e,i)=>(
                            <Button key={i} onClick={()=>handleFeatureChange(e)} variant="outlined" color={fieldError.exercisefeatures? "error":"success"}>{e}</Button>
                        ))}
                    </div>
                    {fieldError.exercisefeatures && <FormHelperText error>Select at least 1 feature to keep</FormHelperText>}
                </div>
                </div>

                <div className="w-1/2 px-2">
                    <div className="flex flex-col relative w-full">
                        <div className="flex flex-col mb-2">
                        
                        <div className="flex flex-row w-full justify-between">
                            <div className="flex flex-col w-[60%]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                            <Typography variant="subtitle1" className="font-semibold">School</Typography>
                            <Tooltip title="The target school for the exercise" placement="right">
                                <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                            </Tooltip>
                            </div>
                            <Autocomplete
                            fullWidth
                            name="school"
                            onChange={handleSchoolChange("school")}
                            value={formData.school}
                            options={["elementary","middle"]}
                            
                            renderInput={(params) => (
                                <TextField {...params} 
                                variant="outlined" 
                                label="Insert" 
                                placeholder="school" 
                                error={fieldError.school} 
                                helperText={fieldError.school && "Mandatory field"}/>
                            )}></Autocomplete>
                            </div>
                            <div className="flex-col w-[30%]">
                            <div className="flex flex-row items-center gap-1 mb-1">
                            <Typography variant="subtitle1" className="font-semibold">Grade</Typography>
                            <Tooltip title="School grade: 1-5 for elementary 1-3 for middle" placement="right">
                                <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                            </Tooltip>
                            </div>
                            <Autocomplete
                            fullWidth
                            disabled={formData.school===""}
                            name="school"
                            onChange={handleAutocompleteChange("grade")}
                            value={formData.grade}
                            options={formData.school==="elementary"?
                                ["1","2","3","4","5"]:["1","2","3"]
                            }
                            
                            renderInput={(params) => (
                                <TextField {...params} 
                                variant="outlined" 
                                label="Insert" 
                                placeholder="grade" 
                                error={fieldError.grade}
                                helperText={fieldError.grade && "Mandatory field"}/>
                            )}></Autocomplete>
                            </div>
                        </div>
                        </div>
                        <div className="flex flex-col mb-2">
                        <div className="flex flex-row items-center gap-1 mb-1">
                            <Typography variant="subtitle1" className="font-semibold">Learning-Goals</Typography>
                            <Tooltip title="What the student is expected to learn from the new exercise" placement="right">
                                <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                            </Tooltip>
                        </div>
                        <Autocomplete multiple freeSolo
                        name="goals"
                        onChange={handleAutocompleteChange("goals")}
                        value={formData.goals || []}
                        options={[]}
                        renderValue={(value, getItemProps) =>
                            value.map((option, index) => {
                                const { key, ...itemProps } = getItemProps({ index });
                                return (
                                <Chip variant="outlined" label={option} key={key} {...itemProps} />
                                );
                            })
                            } 
                        renderInput={(params) => (
                            <TextField {...params} 
                            variant="outlined" 
                            label="Insert" 
                            placeholder="goal" 
                            error={fieldError.goals}
                            helperText={fieldError.goals && "Mandatory field"}/>
                        )}></Autocomplete>
                        </div>
                        <div className="flex flex-col mb-2">
                        <div className="flex flex-row items-center gap-1 mb-1">
                            <Typography variant="subtitle1" className="font-semibold">Pre-Requisites</Typography>
                            <Tooltip title="Skills or knowledge needed to do the new exercise" placement="right">
                                <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                            </Tooltip>
                        </div>
                        <Autocomplete multiple freeSolo
                        name="prerequisites"
                        onChange={handleAutocompleteChange("prerequisites")}
                        value={formData.prerequisites || []}
                        options={[]}
                        renderValue={(value, getItemProps) =>
                            value.map((option, index) => {
                                const { key, ...itemProps } = getItemProps({ index });
                                return (
                                <Chip variant="outlined" label={option} key={key} {...itemProps} />
                                );
                            })
                            } 
                        renderInput={(params) => (
                            <TextField {...params} 
                            variant="outlined" 
                            label="Insert" 
                            placeholder="pre-requisite" 
                            error={fieldError.prerequisites}
                            helperText={fieldError.prerequisites && "Mandatory field"}/>
                        )}></Autocomplete>
                        </div>
                        <div className="flex flex-col">
                        <div className="flex flex-row items-center mb-1">
                            <Typography variant="subtitle1" className="font-semibold">Features</Typography>
                            <Tooltip title="Choose to add a reminder concerning the pre-requites or a worked exercise example to help students" placement="right">
                                <InfoOutlineIcon fontSize="small"></InfoOutlineIcon>
                            </Tooltip>
                        </div>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={formData.reminder} onChange={handleCheckboxChange} name="reminder"/>} label="Reminder"></FormControlLabel>
                            <FormControlLabel control={<Checkbox checked={formData.example} onChange={handleCheckboxChange} name="example"/>} label="Worked Example"></FormControlLabel>
                        </FormGroup>
                        
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {Generate}