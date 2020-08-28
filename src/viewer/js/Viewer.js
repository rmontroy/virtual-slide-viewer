import { useEffect, useState } from 'react';
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
import zoomStyle from '../css/zoomslider.module.css';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

const Viewer = () => {
  const [imageIds, setImageIds] = useState(getImageIds);
  const [tileSources, setTileSources] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const {loading, data} = useQuery(GET_SLIDES, { variables: { ids: imageIds}, client});
  const [viewer, setViewer] = useState();

  useEffect(() => {
    initOpenSeadragon();
    setTileSources(imageIds.map(imageId => config.imageUrlTemplate(imageId)));
  }, [])

  function parseQueryString() {
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

  function getImageIds() {
    let params = parseQueryString();
    return params["imageIds"] ? params["imageIds"].split(",") : [];  
  }

  useEffect(() => {
      if (viewer) viewer.open(tileSources);
  }, [tileSources]);
  

  function changePageHandler(e) {
    setCurrentPage(e.page);
  }

  useEffect(() => {
    if (data) {
      let mpp = data.Slides[currentPage].MPP;
      viewer.scalebar({
        pixelsPerMeter: (1 / (parseFloat(mpp) * 0.000001))
      });
      
      // viewer.measurementTool({
      //   mpp: {
      //     x: mpp,
      //     y: mpp,
      //   },
      // });
    }
  }, [currentPage, data, tileSources])

  function initOpenSeadragon() {
  
    let osd = OpenSeadragon({
      constrainDuringPan: true,
      //ajaxWithCredentials: true,
      //crossOriginPolicy: "Anonymous",
      //defaultZoomLevel: 0,
      id: "main_viewer",
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

    setViewer(osd);
    osd.addHandler('page', changePageHandler);
    //osd.addHandler('open', openHandler);

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
  }

  return html`
    <div id="main_viewer" className="main"></div>
    ${data && data.Slides && html`
      <div className=${slideIdStyle.tag}>${data ? data.Slides[currentPage].SlideID : ""}</div>
      ${viewer && viewer.viewport && html`
        <div className=${zoomStyle.slider}>
          <${ZoomSlider} viewer=${viewer} appMag=${Number(data.Slides[currentPage].AppMag)} />
        </div>
      `}
    `}
  `;
};
export default Viewer;