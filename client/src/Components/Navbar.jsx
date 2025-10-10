import AppBar from "@mui/material/AppBar";
import Typography from '@mui/material/Typography';
import { IconButton, Toolbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SettingsIcon from '@mui/icons-material/Settings';
import LogoCatAI from "../assets/CAT-AI.png"

function NavBar({setIsSettingOpened}){
    const navigate = useNavigate()

    return ( 
        <AppBar position="static">
            <Toolbar>
            <img onClick={()=>navigate("/")} src={LogoCatAI} className="max-h-10 invert brightness-0 mr-2 cursor-pointer">
            </img>
            <Typography onClick={()=>navigate("/")} className="cursor-pointer" variant="h6" component="div" sx={{
              mr: 2,
              display: "flex",
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1 
            }}>
                CAT-AI
            </Typography>
            <IconButton color="inherit" size="large" onClick={()=>{setIsSettingOpened(true)}}><SettingsIcon></SettingsIcon></IconButton>
            
            </Toolbar>
        </AppBar>
    )
}

export {NavBar}