import { useEffect, useState, useRef, useCallback } from 'react';
import { html } from 'htm/react';
import config from './config';
import OpenSeadragon from 'openseadragon';
import './plugins/openseadragon-scalebar';
import './plugins/openseadragon-measurement-tool';
import '../css/openseadragon-measurement-tool.css'
import { ApolloClient, InMemoryCache, useQuery } from '@apollo/client';
import { GET_SLIDES } from './graphql/queries';
import slideIdStyle from '../css/slideidtag.module.css';
import ZoomSlider from './ZoomSlider';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

const Viewer = () => {
  const [imageIds, setImageIds] = useState([]);
  const [tileSources, setTileSources] = useState([]);
  const [page, setPage] = useState(0);
  const prevPageRef = useRef();
  const {loading, data} = useQuery(GET_SLIDES, { variables: { ids: imageIds}, client});
  const [viewer, setViewer] = useState();
  const [zoom, setZoom] = useState(0);
  const savedViewsRef = useRef([]);
  const [zoomBounds, setZoomBounds] = useState();
  
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

  const parseQueryString = useCallback(() => {
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
  }, []);
  
  const getImageIds = useCallback(() => {
    let params = parseQueryString();
    return params["imageIds"] ? params["imageIds"].split(",") : [];  
  }, [parseQueryString]);
    
  useEffect(() => {
    setImageIds(getImageIds());
  }, [getImageIds])

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
    if (loading) return;

    let mpp = data.Slides[page].MPP;
    viewer.scalebar({
      pixelsPerMeter: (1 / (parseFloat(mpp) * 0.000001))
    });
      
    // viewer.measurementTool({
    //     mpp: {
    //         x: mpp,
    //         y: mpp,
    //       },
    //     });
    
  }, [page, data, loading, viewer]);
      
  const initOpenSeadragon = useCallback(() => {
    
    let osd = OpenSeadragon({
      constrainDuringPan: true,
      //ajaxWithCredentials: true,
      //crossOriginPolicy: "Anonymous",
      //defaultZoomLevel: 0,
      id: "openseadragon1",
      //loadTilesWithAjax: true,
      navigatorPosition: "BOTTOM_RIGHT",
      navigatorAutoFade: false,
      showNavigator: true,
      showNavigationControl: false,
      //toolbar: "toolbarDiv",
      tileSources: [],
      maxZoomPixelRatio: 1,
      visibilityRatio: 0.5,
      sequenceMode: true,
      showReferenceStrip: true,
      showSequenceControl: false
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

  let currentSlide = loading ? {} : data.Slides[page];
    
  return html`
    <div id="openseadragon1" className="main" />
    ${!viewer || loading ? html`<p>Loading...</p>` : html`
      <div className=${slideIdStyle.tag}>${currentSlide.SlideID}</div>
      <${ZoomSlider} 
        appMag=${Number(currentSlide.AppMag)}
        zoom=${zoom}
        zoomBounds=${zoomBounds}
        viewport=${viewer.viewport}
      />
    `}
  `;
};
export default Viewer;