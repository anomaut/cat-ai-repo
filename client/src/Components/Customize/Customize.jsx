import { useRef, useState, useEffect, Fragment } from "react";
import { useDocument } from "../../contexts/CustomizeContext";
import { HorizontalToolBar } from "./HorizontalToolbar";
import { VerticalToolbar } from "./VerticalToolbar";
import { TextElement } from "./TextElement";
import { ImageElement } from "./ImageElement";
import { Header } from "../Header"
import { Loading } from "../Loading";
import { Button, Typography } from "@mui/material";
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import API from "../../API/API.mjs";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

function Customize({fullScreen, setFullScreen}) {
    const {textBoxes,images,deleteTextBox,deleteImage, undo, redo, history, updateTextBoxes} = useDocument()

    const wrapperRef = useRef(null);
    const exerciseRef = useRef(null)
    const answerRef = useRef(null)
    const [selectedId, setSelectedId] = useState(null);
    const [textSelectedId, setTextSelectedId] = useState(null);
    const [imageSelectedId, setImageSelectedId] = useState(null);
    const [scale, setScale] = useState(1);
    const [offsetX, setOffsetX] = useState(0);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exercisePage, setExercisePage] = useState(1)
    const [snapX, setSnapX] = useState(null);
    const [snapY, setSnapY] = useState(null);

    const [regenOpen, setRegenOpen] = useState(null); 
    const [anchorEl, setAnchorEl] = useState(null); 
    const [regeneratedEl, setRegeneratedEl] = useState({}) 

    const ZOOM_STEP = 0.1;
    const MIN_ZOOM = 0.3;
    const MAX_ZOOM = 1.5;

    const zoomIn = () => setScale(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    const zoomOut = () => setScale(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));

    useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete") && selectedId && !textSelectedId) {
        // Verifica se l'id selezionato è una textbox o un'immagine
        const isText = textBoxes.some(el => el.id === selectedId);
        const isImage = images.some(img => img.id === selectedId);
        if (isText) deleteTextBox(selectedId);
        else if (isImage) {
            deleteImage(selectedId);
        }

        setSelectedId(null);
        setTextSelectedId(null);
      }

      else if (e.ctrlKey && e.key === 'z') {
        undo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        redo();
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteTextBox, deleteImage, textBoxes, images]);

    useEffect(() => {
        function handleResize() {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const availableWidth = wrapper.clientWidth;
        const newScale = Math.min(availableWidth / PAGE_WIDTH, 1);
        setScale(newScale);

        // Calcola offset orizzontale per centrare la pagina scalata
        const scaledWidth = PAGE_WIDTH * newScale;
        const horizontalOffset = (availableWidth - scaledWidth) / 2;
        setOffsetX(Math.max(horizontalOffset, 0)); // Evita valori negativi
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [fullScreen]);

    useEffect(()=>{
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const availableWidth = wrapper.clientWidth;
        const scaledWidth = PAGE_WIDTH * scale;
        const offset = (availableWidth - scaledWidth) / 2;
        setOffsetX(Math.max(offset, 0));
    },[scale])

    const handlePageSwitch = () => {
        if (exercisePage === 1){
            answerRef.current.scrollIntoView({ behavior: "smooth" });
        }
        else{
            exerciseRef.current.scrollIntoView({ behavior: "smooth" });
        }
        setExercisePage(prev => prev === 1? 2 : 1)
    }

    const handleSolutionCorrection = async () =>{
        try{
            setLoading(true)
            const corrections = await API.handleSolutionRegeneration(textBoxes)
            console.log(corrections)
            updateTextBoxes(corrections)
            
        }
        catch(err){
            console.log(err)
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <div className={`flex flex-col w-full ${fullScreen?"h-full":"h-[140%]"} items-center max-md:h-[100%]`}>
        {!fullScreen && <Header stepnumber={1}></Header>}
            {exporting && (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <Loading text={"Exporting Exercise"} />
            </div>
            )}
            <div className={`flex flex-col w-full ${fullScreen?"h-full":"h-[85%]"} items-center mb-3 ${exporting? "pointer-events-none":""}`}>
                <div className={`sticky top-0 z-10 flex ${fullScreen?"w-full":"w-[90%]"} justify-start py-2 max-md:w-full`}>
                <HorizontalToolBar 
                zoomIn={zoomIn} zoomOut={zoomOut} 
                scale={scale} 
                fullScreen={fullScreen} setFullScreen={setFullScreen} 
                setSelectedId={setSelectedId} 
                setTextSelectedId={setTextSelectedId} 
                setImageSelectedId={setImageSelectedId} 
                setExporting={setExporting}
                exercisePage={exercisePage}
                handlePageSwitch={handlePageSwitch}></HorizontalToolBar>
                </div>
                <div className="flex flex-row w-full h-full justify-center relative">
                    {/* Page Container*/}
                    <div
                    ref={wrapperRef}
                    className={`relative ${fullScreen? "w-full": "w-[85%]"} h-full overflow-auto bg-gray-100 pt-3`}
                    >
                        <div
                            className="absolute origin-top-left"
                            style={{
                            width: PAGE_WIDTH,
                            height: PAGE_HEIGHT,
                            transform: `translateX(${offsetX}px) scale(${scale})`,
                            
                            }}
                        >
                            {/**Pages */}
                            {[1,2].map((page)=>{
                                return(
                                <Fragment key={page}>
                                {page === 2 && loading? null: page === 2?
                                <div className="flex fixed -translate-y-8 h-24 w-fit max-w-60 duration-300 rounded-t-md hover:-translate-y-24"> 
                                    <Button onClick={handleSolutionCorrection} variant="contained" color="info" sx={{display: "flex", flexDirection: "column", justifyContent: "start", textTransform: "none", 
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
                                    }}}>
                                    <div className="flex flex-row gap-1">
                                        <SyncProblemIcon></SyncProblemIcon>
                                        <Typography variant="button">Re-Compute Solution</Typography>
                                    </div>
                                    <Typography variant="caption">The exercise is changed or the solution is unreliable?<br/> Regenerate Now</Typography>
                                    </Button>
                                </div>:null}
                                <div ref={page === 1? exerciseRef: answerRef} id={page === 1? "document": "answer"} className={`relative w-full h-full bg-white border-1 ${exercisePage === page && !loading?"border-gray-800":"border-gray-300"}  ${loading || exporting? "pointer-events-none":""} drop-shadow-md pb-24 mb-8 mt-4`}
                                onMouseDown={()=>setExercisePage(page)}
                                style={{
                                    cursor: exercisePage === page? "default": "pointer",
                                }}>
                                    {loading && (
                                    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-800/50 overflow-hidden">
                                        {/* Barra riflesso */}
                                        <div className="absolute inset-0">
                                        <div className="absolute bottom-0 left-0  w-[200%] h-[300%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-sheen" />
                                        </div>
                                    </div>
                                    )}
                                    {/**Snap bar X Y */}
                                    {exercisePage===page && snapX !== null && (
                                        <div style={{ position: 'absolute', left: snapX.center? PAGE_WIDTH/2 : snapX.x, top: 0, bottom: 0,width: 0, borderLeft: '2px dashed red', zIndex: 9999, pointerEvents: 'none'}}/>
                                        )}
                                    {exercisePage===page && snapY !== null && (
                                        <div style={{ position: 'absolute', top: snapY.center? PAGE_HEIGHT/2 : snapY.y, left: 0, right:0, height: 0, borderTop: '2px dashed red', zIndex: 9999, pointerEvents: 'none'}}/>
                                        )}
                                    {/**Content */}
                                    {textBoxes.map((el) => (  
                                        el.page===page ? <TextElement key={el.id} el={el} selectedId={selectedId} setSelectedId={setSelectedId} textSelectedId={textSelectedId} setTextSelectedId={setTextSelectedId} snapX={snapX} setSnapX={setSnapX} snapY={snapY} setSnapY={setSnapY}  setRegenOpen={setRegenOpen} setAnchorEl={setAnchorEl} regeneratedEl={regeneratedEl} setRegeneratedEl={setRegeneratedEl}></TextElement>
                                        : null
                                        
                                    ))}
                                    {images.map((el)=>(
                                        el.page===page ? <ImageElement key={el.id} el={el} selectedId={selectedId} setSelectedId={setSelectedId} imageSelectedId={imageSelectedId} setImageSelectedId={setImageSelectedId} snapX={snapX} setSnapX={setSnapX} snapY={snapY} setSnapY={setSnapY}></ImageElement>
                                        : null
                                        ))
                                    }
                                </div>
                                </Fragment>)
                            })}
                        </div>
                        
                    </div>
                    
                    <VerticalToolbar exercisePage={exercisePage} selectedId={selectedId} setSelectedId={setSelectedId} textSelectedId={textSelectedId} setTextSelectedId={setTextSelectedId} imageSelectedId={imageSelectedId} setImageSelectedId={setImageSelectedId} setLoading={setLoading} regenOpen={regenOpen} setRegenOpen={setRegenOpen} anchorEl={anchorEl} setAnchorEl={setAnchorEl} setRegeneratedEl={setRegeneratedEl}></VerticalToolbar>
                    
                </div>
            </div>
        </div>
    );
}

export {Customize}