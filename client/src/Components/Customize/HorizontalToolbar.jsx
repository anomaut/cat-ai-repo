import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Tooltip, TextField, Button, IconButton } from '@mui/material';
import { useDocument } from '../../contexts/CustomizeContext';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import API from '../../API/API.mjs';
import { useExportData } from '../../contexts/ExportData';
import { useState } from 'react';

function HorizontalToolBar({zoomIn,zoomOut,scale,fullScreen,setFullScreen, setSelectedId, setTextSelectedId, setImageSelectedId, setExporting,exercisePage, handlePageSwitch}){
    const navigate = useNavigate()
    const [title, setTitle] = useState("Exercise")
    const {undo, redo, history, redoStack} = useDocument()
    const {exportData, setExportData} = useExportData()

    const generatePdfFromDocument = async (element, headingHTML, title) => {
        // Clona solo l'elemento da esportare (già passato come param: document o answer)
        const clone = element.cloneNode(true);
        clone.style.border = "none";
       
        clone.querySelectorAll('#confidenceflag').forEach(el => el.remove());

        // Crea un contenitore neutro (nessuna trasformazione o scaling)
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = `${element.offsetWidth}px`;
        wrapper.style.height = `${element.offsetHeight}px`;
        wrapper.style.background = 'white';
        wrapper.style.zIndex = '-1';
        wrapper.style.pointerEvents = 'none'; // evita interazioni
        wrapper.style.opacity = '0'; // invisibile ma visibile al DOM
        wrapper.appendChild(clone);

        // Aggiungi heading se presente
        if (headingHTML !== "") {
            const heading = document.createElement('div');
            heading.innerHTML = headingHTML;
            clone.insertBefore(heading, clone.firstChild);
        }

        // Inserisci nel DOM temporaneamente
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            windowWidth: element.scrollWidth, // forza larghezza piena
        });

        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const pxPerMm = 96 / 25.4;
        const imgWidthMm = canvas.width / pxPerMm;
        const imgHeightMm = canvas.height / pxPerMm;

        const ratio = Math.min(pageWidth / imgWidthMm, pageHeight / imgHeightMm);
        const imgScaledWidth = imgWidthMm * ratio;
        const imgScaledHeight = imgHeightMm * ratio;

        const marginX = (pageWidth - imgScaledWidth) / 2;
        const marginY = (pageHeight - imgScaledHeight) / 2;

        pdf.addImage(imgData, 'PNG', marginX, marginY, imgScaledWidth, imgScaledHeight);

        // Pulizia
        document.body.removeChild(wrapper);

        const blob = pdf.output('blob');
        const formData = new FormData();
        formData.append('file', blob, `document_${title}.pdf`);

        try {
            const response = await API.handleUploadFile(formData);
            console.log('PDF salvato su:', response.url);
            return response.url;
        } catch (error) {
            console.error('Errore durante upload PDF:', error);
        }
    };


    const headingHTML = `
        <div style="border-bottom: 1px solid #ccc; padding: 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
            <div><strong>Nome:</strong></div>
            <div><strong>Cognome:</strong></div>
            <div style="margin-right:100px;"><strong>Data:</strong></div>
        </div>
        </div>
    `;

    const handleExport = async () =>{

        await setSelectedId(null);
        await setTextSelectedId(null);
        await setImageSelectedId(null);

        setExportData((prev)=>({...prev, startTimeExport: Date.now()}))

        const exercise = document.getElementById('document');
        const answer = document.getElementById('answer');

        setExporting(true)
        
        const url = await generatePdfFromDocument(exercise,"","exercise")
        const urlHeading = await generatePdfFromDocument(exercise,headingHTML,"heading")
        const urlAnswer = await generatePdfFromDocument(answer,"","answer")

        setExportData(prev => ({
            ...prev,
            url,
            urlHeading,
            urlAnswer,
        }))

        setTimeout(()=>{
            navigate("/export")
            setExporting(false)
        },[1000])
    }

    return(
        <div className={`flex ${fullScreen? "w-[95%]": "w-[90%]"} h-fit justify-between max-md:w-[85%]`}>
            <div className="flex items-center md:gap-2" data-ignore-click-outside>
                <Tooltip title="Undo" placement="bottom">
                    <div>
                    <IconButton onClick={undo} disabled={history.length === 0}>
                    <UndoIcon />
                    </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Redo" placement="bottom" className="mr-2">
                    <div>
                    <IconButton onClick={redo} disabled={redoStack.length === 0}>
                    <RedoIcon />
                    </IconButton>
                    </div>
                </Tooltip>

                <Tooltip title="Zoom Out" placement="bottom">
                    <IconButton onClick={zoomOut}>
                    <ZoomOutIcon />
                    </IconButton>
                </Tooltip>
                <span className='max-md:hidden'>{Math.round(scale * 100)}%</span>
                <Tooltip title="Zoom In" placement="bottom" className="mr-2">
                    <IconButton onClick={zoomIn}>
                    <ZoomInIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={fullScreen? "Reduce":"Expand"} placement="bottom" className="mr-2">
                <IconButton onClick={()=>setFullScreen((prev)=>!prev)}>
                    {fullScreen?
                    <FullscreenExitIcon></FullscreenExitIcon>:
                    <FullscreenIcon></FullscreenIcon>}
                </IconButton>
                </Tooltip>
            </div>
            
            <div className="flex items-center md:gap-3" data-ignore-click-outside>
                <Button className='max-md:hidden' onClick={handlePageSwitch} variant="outlined" endIcon={<SwapVertIcon className={`${exercisePage === 1 && "-scale-x-[1]"}`}></SwapVertIcon>}>{exercisePage===1?"Solution":"Exercise"}</Button>
                <Button className='max-md:hidden' onClick={handleExport} variant="contained" endIcon={<NavigateNextIcon></NavigateNextIcon>}>Export</Button>
                <Tooltip title={exercisePage===1? "Go to Solution":"Go to Exercise"} placement="bottom" className="mr-2">
                <IconButton name="switch to solution" onClick={handlePageSwitch} className='hidden max-md:flex'><SwapVertIcon className={`${exercisePage === 1 && "-scale-x-[1]"}`}></SwapVertIcon></IconButton>
                </Tooltip>
                <Tooltip title="Export" placement="bottom" className="mr-2">
                <IconButton onClick={handleExport} color='primary' className='hidden max-md:flex'><ExitToAppIcon></ExitToAppIcon></IconButton>
                </Tooltip>
            </div>
        </div>
    )
}

export {HorizontalToolBar}
