import React, { useState, useRef, useEffect, useCallback } from 'react';
import OpenSeadragon from 'openseadragon';
import ReactDOM from 'react-dom'
import Box from '@material-ui/core/Box';

function createRuler(viewer) {
    let ruler = document.createElement('div');
    ruler.classList.add('ruler');

    const box = document.createElement('div');
    box.classList.add('box');
    const text = document.createElement('div');
    text.classList.add('text');
    box.appendChild(text);
    ruler.appendChild(box);

    const circle = document.createElement('div');
    circle.classList.add('circle');
    ruler.appendChild(circle);

    const scale = document.createElement('div');
    scale.classList.add('scale');
    
    const l = document.createElement('div');
    l.classList.add('l');
    scale.appendChild(l);

    const r = document.createElement('div');
    r.classList.add('r');
    scale.appendChild(r);
    ruler.appendChild(scale);

    const close = document.createElement('div');
    close.classList.add('material-icons');
    close.classList.add('md-12');
    close.classList.add('close');
    close.textContent = 'close';
    close.style.display = 'none';
    ruler.appendChild(close);
    ruler.style.zIndex = 101;

    ruler.addEventListener('mouseover', () => {close.style.display = ''});
    ruler.addEventListener('mouseout', () => {close.style.display = 'none'});
    close.addEventListener('click', (e) => {
        e.preventDefault();
        viewer.removeOverlay(ruler)
    });

    return ruler;
}

function getScaleUnit(value){
    if (value < 0.000001) {
        return (value * 1000000000).toFixed(3) + " fm";
    }
    if (value < 0.001) {
        return (value * 1000000).toFixed(3) + " pm";
    }
    if (value < 1) {
        return (value * 1000).toFixed(3) + " nm";
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(3) + " mm";
    }
    return (value).toFixed(3) + " μm";
}

function redrawRuler(currentRuler, viewerStart, viewerEnd, imageStart, imageEnd, mpp) {
    const w = Math.abs(viewerStart.x - viewerEnd.x);
    const h = Math.abs(viewerStart.y - viewerEnd.y);
    const z = Math.sqrt(w*w + h*h);

    const scale = currentRuler.querySelector('.scale');
    const circle = currentRuler.querySelector('.circle');
    circle.style.display = '';
    const text = currentRuler.querySelector('.text');
    text.textContent = getScaleUnit(Math.sqrt(w*w*mpp*mpp + h*h*mpp*mpp));

    if(imageStart.x == imageEnd.x && imageStart.y != imageEnd.y) {
        scale.classList.add('v');
        scale.classList.remove('h');
        scale.style.width = '2px';
        scale.style.transform = '';
        scale.style.left = 0;
        circle.style.width = currentRuler.offsetHeight+'px';
        circle.style.left = `-${currentRuler.offsetHeight/2}px`;
    }
    else if(imageStart.y == imageEnd.y && imageStart.x != imageEnd.x) {                
        scale.classList.add('h');
        scale.classList.remove('v');
        scale.style.width = '100%';
        scale.style.transform = '';
        scale.style.left = 0;
        circle.style.height = currentRuler.offsetWidth+'px';
        circle.style.top = `-${currentRuler.offsetWidth/2}px`;
    }
    else if((imageStart.x < imageEnd.x && imageStart.y < imageEnd.y) ||
        (imageStart.x > imageEnd.x && imageStart.y > imageEnd.y)) {
        scale.classList.add('h');
        scale.classList.remove('v');
        const w_percent = (z/w)*100;
        const h_percent = (z/h)*100;
        const left = -(50*z-50*w)/w;
        const top = -(50*z-50*h)/h;
        circle.style.width = `${w_percent}%`;
        circle.style.height = `${h_percent}%`;
        circle.style.top = `${top}%`;
        circle.style.left = `${left}%`;
        scale.style.width = `${w_percent}%`
        scale.style.transformOrigin = `0 0`;
        scale.style.left = 0;
        scale.style.transform= `rotate(${Math.atan(h/w)}rad)`;
    }
    else if((imageStart.x < imageEnd.x && imageStart.y > imageEnd.y) ||
        (imageStart.x > imageEnd.x && imageStart.y < imageEnd.y)) {
        scale.classList.add('h');
        scale.classList.remove('v');
        const w_percent = (z/w)*100;
        const h_percent = (z/h)*100;
        const left = -(50*z-50*w)/w;
        const top = -(50*z-50*h)/h;
        circle.style.width = `${w_percent}%`;
        circle.style.height = `${h_percent}%`;
        circle.style.top = `${top}%`;
        circle.style.left = `${left}%`;
        scale.style.width = `${w_percent}%`
        scale.style.transformOrigin = `0 0`;
        scale.style.left = `100%`;
        scale.style.transform= `rotate(${Math.PI - Math.atan(h/w)}rad)`;
    }
}

export default function RulerTool({viewer, mpp, addOverlay}) {
    const [imageHeight] = useState(viewer.world.getItemAt(0).source.dimensions.x);
    const [imageWidth] = useState(viewer.world.getItemAt(0).source.dimensions.y);
    const [isDrawing, setIsDrawing] = useState(false);
    const [imagePoints, setImagePoints] = useState();
    const [viewerPoints, setViewerPoints] = useState();
    const container = useRef();
    const [currentRuler, setCurrentRuler] = useState();

    const startDrawing = useCallback(
        ({ clientX, clientY }) => {
            let point = new OpenSeadragon.Point(clientX, clientY);
            const imagePoint = viewer.viewport.windowToImageCoordinates(point);

            if( 0 > imagePoint.x || imageWidth < imagePoint.x || 0 > imagePoint.y || imageHeight < imagePoint.y )
                return;
            
            setViewerPoints([point, undefined]);
            setImagePoints([imagePoint, undefined]);
            setIsDrawing(true);
            viewer.canvas.style.cursor = 'crosshair'
            
            let ruler = createRuler(viewer);
            setCurrentRuler(ruler)
        }, [viewer, imageWidth, imageHeight]
    );

    const finishDrawing = useCallback(
        () => {
            setIsDrawing(false);
            viewer.canvas.style.cursor = 'pointer';
            currentRuler.querySelector('.circle').style.display='none';

            addOverlay(currentRuler);
            setViewerPoints([undefined, undefined]);
            setImagePoints([undefined, undefined]);
        },
        [addOverlay, currentRuler, viewer.canvas.style]
    );

    const cancelDrawing = useCallback(
        () => {
            setIsDrawing(false);
            setViewerPoints([undefined, undefined]);
            setImagePoints([undefined, undefined]);
        },
        []
    );

    const draw = useCallback(
        ({ clientX, clientY }) => {
            if(!isDrawing) return;
            // drawing
            const viewerEnd = new OpenSeadragon.Point(clientX, clientY);
            const imageEnd = viewer.viewport.windowToImageCoordinates(viewerEnd);
            if(0 > imageEnd.x || imageWidth < imageEnd.x || 0 > imageEnd.y || imageHeight < imageEnd.y )return;

            const [viewerStart] = viewerPoints;
            const [imageStart] = imagePoints;
            setViewerPoints(() => [viewerStart, viewerEnd]);
            setImagePoints(() => [imageStart, imageEnd]);
            if (!viewerStart) return;

            const x = Math.min(imageStart.x, imageEnd.x);
            const width = Math.abs(imageStart.x - imageEnd.x);
            const y = Math.min(imageStart.y, imageEnd.y);
            const height = Math.abs(imageStart.y - imageEnd.y);
            viewer.removeOverlay(currentRuler);
            viewer.addOverlay({
                element: currentRuler,
                location: viewer.viewport.imageToViewportRectangle(
                    new OpenSeadragon.Rect(x,y,width,height))
            });
            redrawRuler(currentRuler, viewerStart, viewerEnd, imageStart, imageEnd, mpp);
            currentRuler.querySelector('.text').textContent = getScaleUnit(Math.sqrt(mpp*mpp*width*width+mpp*mpp*height*height));
            currentRuler.style.display = 'flex';
        },
        [currentRuler, imageHeight, imagePoints, imageWidth, isDrawing, mpp, viewer, viewerPoints]
    );

    useEffect(() => {
        if (container == undefined) return;
        let foo = container.current;
        viewer.setMouseNavEnabled(false);
        foo.style.cursor = 'pointer';
        
        // Add event listener
        foo.addEventListener('mousedown', startDrawing);
        foo.addEventListener('mousemove', draw);
        foo.addEventListener('mouseup', finishDrawing);
        foo.addEventListener('mouseout', cancelDrawing);
        
        // Remove event listener on cleanup
        return () => {
            viewer.setMouseNavEnabled(true);
            foo.style.cursor = 'default';
            foo.removeEventListener('mousedown', startDrawing);
            foo.removeEventListener('mousemove', draw);
            foo.removeEventListener('mouseup', finishDrawing);
            foo.removeEventListener('mouseout', cancelDrawing);
        };
    }, [cancelDrawing, draw, finishDrawing, startDrawing, viewer]);
    
    return (
        ReactDOM.createPortal(
            <Box ref={container}
                    display='block'
                    position='absolute'
                    left={0} top={0}
                    width='100%' height='100%'
                    zIndex='drawer' />,
            viewer.canvas
        )
    )
}