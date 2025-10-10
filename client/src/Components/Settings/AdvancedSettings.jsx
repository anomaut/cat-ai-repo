import { Typography, Autocomplete, TextField, InputAdornment, Switch, Box } from "@mui/material";

const countries = [
    { code: 'IT', label: 'Italian' },
    { code: 'GB', label: 'English' },
]

function AdvancedSettings({newSettings, setNewSettings}){

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
                <Typography>Exercise Language</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                    <Autocomplete
                    onChange={handleAutocompleteChange("language")}
                    value={newSettings.language}
                    fullWidth
                    disableClearable
                    options={countries}
                    sx={{ maxWidth: 150 }}
                    isOptionEqualToValue={(option, value) => option.code === value.code}
                    getOptionLabel={(option) => option.label}
                    renderOption={(props, option) => {
                        const { key, ...optionProps } = props;
                        return (
                        <Box
                            key={key}
                            component="li"
                            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                            {...optionProps}
                        >
                            <img
                            loading="lazy"
                            width="20"
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            alt=""
                            />
                            {option.label}
                        </Box>
                        );
                    }}
                    renderInput={(params) => {
                        return (
                        <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            label="Select"
                            slotProps={{
                            input: {
                            ...params.InputProps,
                            startAdornment: newSettings.language ? (
                            <img
                                loading="lazy"
                                width="20"
                                style={{ marginRight: 8 }}
                                srcSet={`https://flagcdn.com/w40/${newSettings.language.code.toLowerCase()}.png 2x`}
                                src={`https://flagcdn.com/w20/${newSettings.language.code.toLowerCase()}.png`}
                                alt=""
                            />
                            ) : null,
                            }}}
                        />);
                    }}/>
                </div>
            </div> 
            <div className="flex flex-row justify-around pt-3">
                <div className="flex flex-col justify-start w-1/2">
                <Typography>Dislexia Inclusive</Typography>
                <Typography variant="caption">Big font - High Contrast</Typography>
                </div>
                <div className="flex justify-start w-1/2">
                    <Switch
                        checked={newSettings.dislexiaInclusive}
                        onChange={(e) =>
                        setNewSettings((prev) => ({
                            ...prev,
                            dislexiaInclusive: e.target.checked,
                        }))
                        }
                    />
                </div>
            </div> 
            <div className="flex flex-row justify-around py-3">
                
                
            </div>
        </div>
    )
}

export {AdvancedSettings}