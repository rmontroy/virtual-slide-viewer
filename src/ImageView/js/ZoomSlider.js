import { useMemo, useCallback } from 'react';
import { html } from 'htm/react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';

const boxShadow =
  '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const CustomSlider = withStyles({
  root: {
    color: '#3880ff',
    position: 'fixed',
    bottom: 100,
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


const ZoomSlider = (
  {
    appMag,
    zoom,
    zoomBounds,
    viewport
  }) => {

  // Conversion functions
  const flattenZoom = useCallback((zoom) => Math.log2(zoom/zoomBounds.min), [zoomBounds.min]);
  const expandZoom = (zoom) => 2 ** zoom * zoomBounds.min;
  const scaleToMag = (value) => Number(viewport.viewportToImageZoom(expandZoom(value)) * appMag).toFixed(1) + "X";

  
  function handleChange(event, newValue) {
    viewport.zoomTo(expandZoom(newValue), viewport.getCenter(), true);
  }

  let marks = useMemo(() => zoomBounds.min == 0 ? undefined : [1,5,10,20,appMag].map(x => ({
    value: flattenZoom(viewport.imageToViewportZoom(x/appMag)),
    label: x+'X'
  })), [zoomBounds.min, flattenZoom, viewport, appMag]);

  return html` 
    <${CustomSlider}
      min=${flattenZoom(zoomBounds.min)}
      max=${flattenZoom(zoomBounds.max)}
      scale=${scaleToMag}
      value=${flattenZoom(zoom)}
      onChange=${handleChange}
      step=${0.01}
      marks=${marks}
      valueLabelDisplay="on"
      orientation="vertical"
    />
  `;
};

export default ZoomSlider;