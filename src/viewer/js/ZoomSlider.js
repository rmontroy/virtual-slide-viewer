import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import Slider from '@material-ui/core/Slider';
import '@material/slider/dist/mdc.slider.css';


const ZoomSlider = ({viewer, appMag}) => {
    const [max, setMax] = useState(Math.log2(viewer.viewport.getMaxZoom()/viewer.viewport.getMinZoom()));
    const [value, setValue] = useState(0);
    
    useEffect(() => {
        viewer.addHandler('zoom', (e) => {
            let value = Math.log2(viewer.viewport.getZoom()/viewer.viewport.getMinZoom());
            setValue(value);
        });
        viewer.addHandler('resize', (e) => {
            setValue(Math.log2(viewer.viewport.getZoom()/viewer.viewport.getMinZoom()));
            setMax(Math.log2(viewer.viewport.getMaxZoom()/viewer.viewport.getMinZoom()));
        });
    }, [])

    function handleChange(event, newValue) {
        setValue(newValue);
        viewer.viewport.zoomTo(2**newValue * viewer.viewport.getMinZoom(), viewer.viewport.getCenter(), true);
    }

    function scaleConversion(x) {
        return Number(viewer.viewport.viewportToImageZoom(2 ** x * viewer.viewport.getMinZoom()) * appMag).toFixed(1) + "X";
    }

    return (html`
        <${Slider}
            min=${0} max=${max} scale=${scaleConversion}
            value=${value}
            onChange=${handleChange}
            valueLabelDisplay="on"
            orientation="vertical"
        />
    `);
}

export default ZoomSlider;