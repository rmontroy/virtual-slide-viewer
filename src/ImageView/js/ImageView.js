import { useEffect, useState, useRef, useCallback } from 'react';
import { html } from 'htm/react';
import config from './config';
import OpenSeadragon from 'openseadragon';
import './plugins/openseadragon-scalebar';
import './plugins/openseadragon-measurement-tool';
import '../css/openseadragon-measurement-tool.css'
import { useQuery, useMutation } from '@apollo/client';
import { GET_SLIDES, UPDATE_SLIDE_STATUS } from './graphql/queries';
import ZoomSlider from './ZoomSlider';
import AppBar from './AppBar';
import RulerTool from './Ruler';
import Box from "@material-ui/core/Box";

const parseQueryString = () => {
  let params = {};
  let search = window.location.search.slice(1);
  if (search) {
    let parts = search.split("&");

    parts.forEach(function (part) {
      let subparts = part.split("=");
      let key = subparts[0];
      let value = subparts[1];
      params[key] = value;
    });
  }
  return params;
}

const getImageIds = () => {
  let params = parseQueryString();
  return params["imageIds"] ? params["imageIds"].split(",") : [];  
}

const ImageView = () => {
  const [imageIds] = useState(getImageIds());
  const [tileSources, setTileSources] = useState([]);
  const [page, setPage] = useState(0);
  const prevPageRef = useRef();
  const {loading, data} = useQuery(GET_SLIDES, { variables: { ImageIDs: imageIds} });
  const [updateSlideStatus] = useMutation(UPDATE_SLIDE_STATUS);
  const [viewer, setViewer] = useState();
  const [zoom, setZoom] = useState(0);
  const savedViewsRef = useRef([]);
  const [zoomBounds, setZoomBounds] = useState({min:0, max:0});
  const [rulerActive, setRulerActive] = useState(false);
  const [mpp, setMpp] = useState(1);

  useEffect(() => {
    // Need to wait until mounting element is rendered before creating viewer
    let viewer = initOpenSeadragon();
    setViewer(viewer);

    // Be careful to add OSD handlers only once (after initializing viewer)
    viewer.addHandler('zoom', (e) => {
      setZoom(e.zoom);
    });
    viewer.addHandler('page', (e) => {
      savedViewsRef.current[prevPageRef.current] = {zoom: viewer.viewport.getZoom(), center: viewer.viewport.getCenter()};
      setPage(e.page);
      prevPageRef.current = e.page;
    });
    viewer.addHandler('open', () => {
      setZoomBounds({min: viewer.viewport.getMinZoom(), max: viewer.viewport.getMaxZoom()});
      let savedView = savedViewsRef.current[viewer.currentPage()] || {zoom: viewer.viewport.getZoom(), center: viewer.viewport.getCenter()};
      setZoom(savedView.zoom);
      viewer.viewport.zoomTo(savedView.zoom, savedView.center, true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setViewer])

  useEffect(() => {
    setTileSources(imageIds.map(imageId => config.imageUrlTemplate(imageId)));
    savedViewsRef.current = imageIds.map(() => 0);
    prevPageRef.current = 0;
  }, [imageIds])
  
  useEffect(() => {
    if (!viewer || !tileSources) return;
    viewer.open(tileSources);
  }, [tileSources, viewer]);
  
  useEffect(() => {
    if (!data) return;

    let mpp = data.Slides[page].MPP;
    setMpp(mpp);
    viewer.scalebar({
      pixelsPerMeter: (1 / (parseFloat(mpp) * 0.000001))
    });
    
  }, [page, data, loading, viewer]);
      
  const initOpenSeadragon = useCallback(() => {
    
    let osd = OpenSeadragon({
      constrainDuringPan: true,
      //ajaxWithCredentials: true,
      //crossOriginPolicy: "Anonymous",
      //defaultZoomLevel: 0,
      id: 'openseadragon1',
      //loadTilesWithAjax: true,
      navigatorPosition: 'BOTTOM_RIGHT',
      navigatorAutoFade: false,
      showNavigator: true,
      showNavigationControl: false,
      tileSources: [],
      maxZoomPixelRatio: 1,
      visibilityRatio: 0.5,
      sequenceMode: true,
      showSequenceControl: true,
      previousButton: 'prevSlide',
      nextButton: 'nextSlide'
    });
    
    try {
      osd.scalebar({
        type: OpenSeadragon.ScalebarType.MAP,
        //pixelsPerMeter: (1 / (parseFloat(data.getSlide.MPP) * 0.000001)),
        xOffset: 5,
        yOffset: 10,
        stayInsideImage: true,
        color: 'rgb(150,150,150)',
        fontColor: 'rgb(100,100,100)',
        backgroundColor: 'rgba(255,255,255,0.5)',
        barThickness: 2,
      });
    } catch (ex) {
      console.log('scalebar err: ', ex.message);
    }
    
    return osd;
  }, []);
  
  const handleKeyDown = useCallback((e) => {
      if (e.ctrlKey && 'j' == e.key.toLocaleLowerCase()) {
        e.preventDefault();
        setRulerActive((active) => !active);
        return;
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  })

  let currentSlide = !data ? {} : data.Slides[page];
  
  return html`
      <${Box} display='flex' flexDirection='column-reverse' className='container'>
        <${AppBar} currentSlide=${currentSlide} updateStatus=${updateSlideStatus} />
        <div id="openseadragon1" className="main" />
        ${rulerActive && html`<${RulerTool} viewer=${viewer} mpp=${mpp} addOverlay=${() => {}} />`}
        ${!viewer || loading ? html`<p>Loading...</p>` : html`
          <${ZoomSlider}
            appMag=${Number(currentSlide.AppMag)}
            zoom=${zoom}
            zoomBounds=${zoomBounds}
            viewport=${viewer.viewport}
          />
        `}
      <//>
  `;
};
export default ImageView;