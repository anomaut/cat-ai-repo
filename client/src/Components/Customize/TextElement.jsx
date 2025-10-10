import Draggable from 'react-draggable';
import { TextareaAutosize } from "@mui/material"
import { useState, useEffect, useRef } from "react";
import { useDocument } from "../../contexts/CustomizeContext";
import { useFormData } from "../../contexts/FormContext";
import { contentChecker } from './utils.mjs';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DoneIcon from '@mui/icons-material/Done';
import { Button, Alert } from '@mui/material';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

function TextElement({el, selectedId, setSelectedId, textSelectedId, setTextSelectedId, snapX, setSnapX,snapY, setSnapY, setRegenOpen ,setAnchorEl, regeneratedEl, setRegeneratedEl}){
    const ref = useRef(null);
    const nodeRef = useRef(null);
    const checker = contentChecker();
    const [lowConfidence, setLowConfidence] = useState(false)
    const {updateTextBox, textBoxes, images} = useDocument()
    const {formData} = useFormData()

    useEffect(() => {
    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target) && !event.target.closest('[data-ignore-click-outside]')) {
        // Ritarda leggermente il reset per far eseguire prima altri onClick
        setSelectedId(null)
        setTextSelectedId(null)
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setSelectedId]);

    const checkAlignmentX = (x, w) => {
      const SNAP_THRESHOLD = 5;
      const pageCenter = PAGE_WIDTH / 2;

      // Centro del blocco corrente
      const currentCenter = x + w / 2;
      // Verifica allineamento con il centro della pagina
      if (Math.abs(currentCenter - pageCenter) < SNAP_THRESHOLD) {
        return {x : pageCenter - w / 2, center: true}; // Snap al centro
      }
      // Verifica allineamento con sinistra di altri blocchi
      for (const box of textBoxes) {
        if (box.id === el.id || box.page !== el.page) continue; // ignora se stesso e le altre pagine

        if (Math.abs(x - box.position.x) < SNAP_THRESHOLD) {
          return {x : box.position.x, center: false}; // Snap alla sinistra di un altro box
        }
      }
      for (const box of images) {
        if (Math.abs(x - box.position.x) < SNAP_THRESHOLD) {
          return {x : box.position.x, center: false}; // Snap alla sinistra di un altro box
        }
      }
      return null;
    };

    const checkAlignmentY = (y, h) => {
      const SNAP_THRESHOLD = 5;
      const pageCenter = PAGE_HEIGHT / 2;

      // Centro del blocco corrente
      const currentCenter = y + h / 2;
      // Verifica allineamento con il centro della pagina
      if (Math.abs(currentCenter - pageCenter) < SNAP_THRESHOLD) {
        return {y : pageCenter - h / 2, center: true}; // Snap al centro
      }
      // Verifica allineamento con sinistra di altri blocchi
      for (const box of textBoxes) {
        if (box.id === el.id || box.page !== el.page) continue; // ignora se stesso e le altre pagine

        if (Math.abs(y - box.position.y) < SNAP_THRESHOLD) {
          return {y : box.position.y, center: false}; // Snap alla sinistra di un altro box
        }
      }
      for (const box of images) {
        if (Math.abs(y - box.position.y) < SNAP_THRESHOLD) {
          return {y : box.position.y, center: false}; // Snap alla sinistra di un altro box
        }
      }
      return null;
    };

    const handleDoubleClick = () => {
        setTextSelectedId(el.id)
        // Focus dopo un tick per assicurarsi che il componente venga aggiornato
        setTimeout(() => {
        const length = ref.current?.value.length;
        ref.current?.focus();
        ref.current?.setSelectionRange(length, length);
        }, 0);
    };

    const handleSingleClick = () =>{
        if (textSelectedId !== el.id) setTextSelectedId(null)
        setSelectedId(el.id)
    }

  const borderClass =
  textSelectedId === el.id
    ? 'border-2 border-[#2196f3]'
    : selectedId === el.id
    ? 'border-2 border-[#888]'
    : (snapY?.y === el.position.y || snapX?.x === el.position.x) && selectedId !== el.id?
    'border-2 border-[#ccc]'
    : 'hover:border-2 hover:border-[#ccc] border-2 border-transparent';

  const getFontClass = (font) => {
        return font ? `font-${font}` : '';
    };

  useEffect(()=>{
    const cmodel = (el.modelconfidence || 1) / 7;
    const cnumeric = checker(el) ? 0.9 : 0.3;
    const confidence = 0.5 * cnumeric + 0.5 * cmodel;
    setLowConfidence((confidence<0.6 || Math.random()<0) && !regeneratedEl[el.id])
  },[])

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      disabled={textSelectedId === el.id}
      position={{ x: el.position.x, y: el.position.y }}
      onStop={(e, data) => {
        updateTextBox(el.id, {
          position: { x: snapX? snapX.x : data.x, y: snapY? snapY.y : data.y },
        })
        if (snapX) setSnapX(null)
        if (snapY) setSnapY(null)
      }}
      onDrag={(e, data) => {
      const snapx = checkAlignmentX(data.x, el.w);
      setSnapX(snapx);
      const snapy = checkAlignmentY(data.y, el.h);
      setSnapY(snapy);
    }}
    >
      <div ref={nodeRef} style={{ position: 'absolute' }} data-ignore-click-outside>
        {lowConfidence && !regeneratedEl[el.id] ? (
          <div
            id="confidenceflag"
            className="absolute h-4 w-4 z-[999] rounded-md bg-transparent -translate-x-4 translate-y-3 transition-all duration-300 overflow-visible group flex items-center justify-center"
            style={{ transformOrigin: 'bottom left' }}
          >
            <PriorityHighIcon color='warning' fontSize='small'/>
            <Alert severity="warning" className="flex absolute bottom-full items-center gap-1 left-0 w-max opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <div className='flex flex-col gap-1'>
              <div className="text-xs text-center">
                {el.rationale} <br/> <span className='font-bold'>If you are not satisfied you can fix this part!</span>
              </div>
              <div className='flex flex-row justify-center'>
              <Button onClick={()=>{setLowConfidence(false);setRegeneratedEl(prev=>({...prev,[el.id]:true}))}} variant='text' color='inherit' size='small'>Checked</Button>
              <Button onClick={()=>{setSelectedId(el.id);setRegenOpen("element");setAnchorEl(ref.current)}} variant='text' color='warning' size='small'>Fix</Button>
              </div>
              </div>
            </Alert>
          </div>
        ): regeneratedEl[el.id]? 
        (<div
            id="confidenceflag"
            className="absolute h-4 w-4 z-[999] rounded-md bg-transparent -translate-x-4 translate-y-3 transition-all duration-300 overflow-visible group flex items-center justify-center"
            style={{ transformOrigin: 'bottom left' }}
          >
            <DoneIcon color="success" fontSize='small'/>
            <Alert severity='success' className="flex absolute bottom-full items-center gap-1 left-0 w-max opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-lg">
              <div className='flex flex-col gap-1'>
              <div className="text-xs text-center">
                This {el.page===1?"exercise": "solution"} part has been checked
              </div>
              </div>
            </Alert>
          </div>):
         null}
        {textSelectedId === el.id ? (
          <TextareaAutosize
            ref={ref}
            id={el.id}
            minRows={1}
            value={el.content}
            onChange={(e) => {
              console.log(e.target.value)
              updateTextBox(el.id, {
                content: e.target.value,
              })
            }
            }
            onMouseUp={() => {
              if (ref.current ) {
                const { offsetWidth, offsetHeight } = ref.current;
                if (el.w - offsetWidth>1 || el-h - offsetHeight>1){
                updateTextBox(el.id, {
                  w: offsetWidth,
                  h: offsetHeight,
                });
              }
              }
            }}
            placeholder="Text..."
            className={` rounded border-dashed ${borderClass} ${getFontClass(formData.style[formData.selectedStyle].font.value)}`}
            style={{
              width: el.w,
              height: el.h -16,
              cursor: 'text',
              fontSize: el.textSize,
              fontWeight: el.bold ? 'bold' : 'normal',
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underlined ? 'underline' : 'none',
              color: el.textColor,
              padding: '8px',
              outline: 'none',
              resize: 'both',
              minHeight: 50,
              minWidth: 100,
              maxWidth: PAGE_WIDTH - el.position.x ,
              maxHeight: PAGE_HEIGHT - el.position.y ,
              boxSizing: 'border-box',
              zIndex: 200
            }}
          />
        ) : (
          <div
          onClick={handleSingleClick}
          onDoubleClick={handleDoubleClick}
          ref={ref}
          className={` rounded border-dashed ${borderClass} ${getFontClass(formData.style[formData.selectedStyle].font.value)}`}
            style={{
              cursor: selectedId !== el.id? "move" : "pointer",
              width: el.w,
              height: el.h,
              minHeight: 50,
              minWidth: 100,
              whiteSpace: 'pre-wrap', // 🔥 Questo è ciò che rende visibili gli \n
              fontSize: el.textSize,
              fontWeight: el.bold ? 'bold' : 'normal',
              fontStyle: el.italic ? 'italic' : 'normal',
              textDecoration: el.underlined ? 'underline' : 'none',
              color: el.content? el.textColor: "#888",
              padding: '8px',
              
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            {el.content || 'Text...'}
          </div>
        )}
      </div>
    </Draggable>

  );
}

export {TextElement}