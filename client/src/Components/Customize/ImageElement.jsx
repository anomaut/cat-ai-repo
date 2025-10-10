import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { useDocument } from '../../contexts/CustomizeContext';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

function ImageElement({ el, selectedId, setSelectedId, imageSelectedId, setImageSelectedId, snapX, setSnapX, snapY, setSnapY }) {
  const nodeRef = useRef(null);
  const containerRef = useRef(null);
  const { updateImage, images, textBoxes } = useDocument();

  const [size, setSize] = useState({ width: el.w, height: el.h });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        nodeRef.current &&
        !nodeRef.current.contains(event.target) &&
        !event.target.closest('[data-ignore-click-outside]')
      ) {
        setSelectedId(null);
        setImageSelectedId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectedId]);

  const handleResize = () => {
    if (containerRef.current && imageSelectedId === el.id) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setSize({ width: offsetWidth, height: offsetHeight });

      updateImage(el.id, {
        w: offsetWidth,
        h: offsetHeight,
      });
    }
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
      if (Math.abs(x - box.position.x) < SNAP_THRESHOLD) {
        return {x : box.position.x, center: false}; // Snap alla sinistra di un altro box
      }
    }
    for (const box of images) {
      if (box.id === el.id || box.page !== el.page) continue; // ignora se stesso e le altre pagine

      if (Math.abs(x - box.position.x) < SNAP_THRESHOLD) {
        return {x : box.position.x, center: false}; // Snap alla sinistra di un altro box
      }
    }
    return null;
  };

  const handleSingleClick = () => {
    if (imageSelectedId !== el.id) setImageSelectedId(null);
    setSelectedId(el.id);
  };

  const handleDoubleClick = () => {
    setImageSelectedId(el.id);
  };

  const borderClass =
  imageSelectedId === el.id
    ? 'border-2 border-[#2196f3]'
    : selectedId === el.id
    ? 'border-2 border-[#888]'
    : (snapY?.y === el.position.y || snapX?.x === el.position.x) && selectedId !== el.id?
    'border-2 border-[#ccc]'
    : 'hover:border-2 hover:border-[#ccc] border-2 border-transparent';

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="parent"
      disabled={imageSelectedId === el.id}
      position={{ x: el.position.x, y: el.position.y }}
      onStop={(e, data) => {
        updateImage(el.id, {
          position: { x: snapX? snapX.x : data.x, y: snapY? snapY.y : data.y },
        })
        if (snapX) setSnapX(null)
        if (snapY) setSnapY(null)
      }}
      onDrag={(e, data) => {
      const snapx = checkAlignmentX(data.x, el.w);
      setSnapX(snapx);
      const snapy = checkAlignmentY(data.y, el.h);
      console.log(snapy)
      setSnapY(snapy);
    }}
    >
      <div
        ref={nodeRef}
        data-ignore-click-outside
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
        className={`absolute rounded border-dashed p-0 ${borderClass}`}
        style={{
          cursor: imageSelectedId === el.id ? 'default' : 'move',
          backgroundColor: 'transparent',
        }}
      >
        <div
          ref={containerRef}
          onMouseUp={handleResize}
          style={{
            resize: imageSelectedId === el.id ? 'both' : 'none',
            overflow: 'hidden',
            width: el.w,
            height: el.h,
            minWidth: 50,
            minHeight: 50,
            maxWidth: PAGE_WIDTH - el.position.x,
            maxHeight: PAGE_HEIGHT - el.position.y,
          }}
        >
          <img
            src={el.url}
            alt="editable"
            draggable={false} // <- ✅ previene il drag nativo dell’immagine
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              display: 'block',
              pointerEvents: imageSelectedId === el.id ? 'auto' : 'none', // blocca interazioni quando non selezionata
              userSelect: 'none',
            }}
          />
        </div>
      </div>
    </Draggable>
  );
}

export { ImageElement };
