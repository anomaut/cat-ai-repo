import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Tab, Tabs, Typography, Autocomplete, TextField } from "@mui/material";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import { useState } from "react";
import { GeneralSettings } from "./GeneralSettings";
import { StyleSettings } from "./StyleSettings";
import { AdvancedSettings } from "./AdvancedSettings";
import { useFormData } from "../../contexts/FormContext";

function Settings({isSettingOpened, setIsSettingOpened}) {
    const {formData, setFormData} = useFormData()

    const [currentSettingPage, setCurrentSettingPage] = useState(0)

    const [newSettings, setNewSettings] = useState(formData)
    
    const handleCancel = () =>{
        setIsSettingOpened(false)
        setNewSettings(formData)
    }

    const handleApply = () => {
        setIsSettingOpened(false)
        setFormData(newSettings)
    }

    return(
        <Dialog
        closeAfterTransition={false}
        open={isSettingOpened}
        >
            <DialogTitle className="flex items-center gap-3"><SettingsSuggestIcon />Generation Settings</DialogTitle>
            <DialogContent sx={{ paddingBottom: 0 }}>
                <Tabs variant="fullWidth" value={currentSettingPage}>
                    <Tab icon={<SettingsIcon/>} iconPosition="start" label="General" onClick={()=>setCurrentSettingPage(0)}/>
                    <Tab icon={<PaletteIcon/>} iconPosition="start" label="Style" onClick={()=>setCurrentSettingPage(1)}/>
                    <Tab icon={<TuneIcon/>} iconPosition="start" label="Advanced" onClick={()=>setCurrentSettingPage(2)}/>
                </Tabs>
                <TabPanel index={currentSettingPage} newSettings={newSettings} setNewSettings={setNewSettings}></TabPanel>
                <DialogActions>
                    <Button color="primary" variant="outlined" onClick={handleCancel}>Cancel</Button>
                    <Button color="primary" variant="contained" onClick={handleApply}>Apply</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

function TabPanel({index, newSettings, setNewSettings}){

    return(
        index === 0?
        <GeneralSettings newSettings={newSettings} setNewSettings={setNewSettings}></GeneralSettings>
        : index === 1?
        <StyleSettings newSettings={newSettings} setNewSettings={setNewSettings}></StyleSettings>
        : index === 2?
        <AdvancedSettings newSettings={newSettings} setNewSettings={setNewSettings}></AdvancedSettings>
        : <></>
    )
}

export {Settings}
