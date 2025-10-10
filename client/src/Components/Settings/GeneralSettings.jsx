import { Typography, Autocomplete, TextField } from "@mui/material";

function GeneralSettings({newSettings, setNewSettings}){

    const handleAutocompleteChange = (name) => (event,value) => {
        setNewSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return(
        <div className="flex flex-col">
            <div className="flex flex-row justify-around pt-3">
                <div className="flex justify-start w-1/2">
                <Typography>Difficulty Level</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                <Autocomplete 
                fullWidth
                name="exercise_level"
                disableClearable
                value={newSettings.exercise_level}
                options={["Easy", "Medium", "Challenge"]} 
                sx={{ maxWidth: 150 }}
                onChange={handleAutocompleteChange("exercise_level")}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Select" size="small"/>
                )}></Autocomplete>
                </div>
            </div> 
            <div className="flex flex-row justify-around pt-3">
                <div className="flex justify-start w-1/2">
                <Typography>Question per Exercise</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                <Autocomplete 
                name="n_questions"
                fullWidth
                disableClearable
                value={newSettings.n_questions}
                options={["1","2","3","4","5"]} 
                sx={{ maxWidth: 150 }}
                onChange={handleAutocompleteChange("n_questions")}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Select" size="small"/>
                )}></Autocomplete>
                </div>
            </div> 
            <div className="flex flex-row justify-around py-3">
                <div className="flex justify-start w-1/2">
                <Typography>Vocabulary</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                <Autocomplete 
                fullWidth
                name="vocabulary"
                disableClearable
                value={newSettings.vocabulary}
                options={["Colloquial", "Playful","Formal"]}
                sx={{ maxWidth: 150 }} 
                onChange={handleAutocompleteChange("vocabulary")}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Select" size="small"/>
                )}></Autocomplete>
                </div>
            </div>
        </div>
    )
}

export {GeneralSettings}