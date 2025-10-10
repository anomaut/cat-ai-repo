import { useEffect, useState, useRef } from "react";
import "./App.css";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { NavBar } from "./Components/Navbar";
import { Settings } from "./Components/Settings/Settings";
import { Generate } from "./Components/Generate";
import { Customize } from "./Components/Customize/Customize";
import { Export } from "./Components/Export";
import { Home } from "./Components/Home";
import { Routes, Route, Outlet } from "react-router-dom";
import { Container } from "@mui/material";
import Box from '@mui/material/Box';
import { FormProvider } from "./contexts/FormContext";
import { DocumentProvider } from "./contexts/CustomizeContext";
import { ExportProvider } from "./contexts/ExportData";

function App() {
    const [fullScreen, setFullScreen] = useState(false)
    const [isSettingOpened, setIsSettingOpened] = useState(false)
    return (
      <DocumentProvider>
        <FormProvider>
          <ExportProvider>
            <Routes>
            <Route element={
              <>
              {!fullScreen && <NavBar setIsSettingOpened={setIsSettingOpened}/>}
              <Settings isSettingOpened={isSettingOpened} setIsSettingOpened={setIsSettingOpened}></Settings>
              <Container>
                <Box sx={{ height: fullScreen? "100vh":"calc(100vh - 64px)" }} >
                  <Outlet/>
                </Box>
              </Container>
              </>
            }>
              <Route index element={
                <Home></Home>
              } />

              <Route path="/generate/*" element={
                <Generate></Generate>
              } />

              <Route path="/customize" element={
                <Customize fullScreen={fullScreen} setFullScreen={setFullScreen}></Customize>
              } />

              <Route path="/export" element={
                <Export></Export>
              } />
              
            </Route>
          </Routes>
        </ExportProvider>
      </FormProvider>
    </DocumentProvider>
    );
}

export default App;
