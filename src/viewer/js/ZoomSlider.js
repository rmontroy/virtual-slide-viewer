import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

const boxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const marks = [
    { value: 1 },
    { value: 5 },
    { value: 10 },
    { value: 20 },
];

const CustomSlider = withStyles({
    root: {
      color: '#3880ff',
      position: 'fixed',
      bottom: 40,
      '&&': {
        padding: '0 20px',
        height: '50vh',
        width: 2,
      },
    },
    thumb: {
      height: 28,
      width: 28,
      backgroundColor: '#fff',
      boxShadow: boxShadow,
      '&&': {
        marginBottom: -14,
        marginLeft: -12,
      },
      '&:focus, &:hover, &$active': {
        boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          boxShadow: boxShadow,
        },
      },
    },
    active: {},
    valueLabel: {
      top: 7,
      left: -2,
      '& *': {
        background: 'transparent',
        color: '#000',
      },
    },
    track: {
      width: 2,
    },
    rail: {
      width: 2,
      opacity: 0.5,
      backgroundColor: '#bfbfbf',
    },
  })(Slider);


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

    function sliderToMagZoom(value) {
        return Number(viewer.viewport.viewportToImageZoom(2 ** value * viewer.viewport.getMinZoom()) * appMag).toFixed(1) + "X";
    }

    function magToSliderZoom(mag) {
        return Math.log2(viewer.viewport.imageToViewportZoom(mag/appMag)/viewer.viewport.getMinZoom());
    }

    return (html`      
        <${CustomSlider}
            min=${0} max=${max} scale=${sliderToMagZoom}
            value=${value}
            onChange=${handleChange}
            step=${0.01}
            marks=${[1,5,10,20].map(x => ({value: magToSliderZoom(x), label: x+'X'}))}
            valueLabelDisplay="on"
            orientation="vertical"
        />
    `);
}

export default ZoomSlider;