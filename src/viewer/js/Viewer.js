import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import config from './config';
import OpenSeadragon from 'openseadragon';
import './openseadragon-scalebar';
import { ApolloClient, InMemoryCache, useLazyQuery } from '@apollo/client';
import { GET_SLIDE } from './graphql/queries';

const client = new ApolloClient({
  uri: config.graphqlUri,
  cache: new InMemoryCache(),
  headers: {
    'x-api-key': config.apiKey
  }
});

const Viewer = () => {
    const [viewer, setViewer] = useState();
    const [imageIds, setImageIds] = useState([]);
    const [tileSources, setTileSources] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [getSlide, {loading, data}] = useLazyQuery(GET_SLIDE, {client});
    const [queryString, setQueryString] = useState(
        window.location.search
      );

    function parseQueryString() {
      let params = {};
      let search = queryString.slice(1);
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

    useEffect(() => {
        let params = parseQueryString();
        let imageIds = params["imageIds"] ? params["imageIds"].split(",") : [];
        setImageIds(imageIds);
        getSlide({ variables: {id: imageIds[0]}});
        let imageUrls = imageIds.map(imageId => config.imageUrlTemplate(imageId));
        setTileSources(imageUrls);
        initOpenSeadragon(imageUrls);
    }, [queryString]);
    
    function setScalebar() {
      viewer.scalebar({
        pixelsPerMeter: (1 / (parseFloat(data.getSlide.MPP) * 0.000001))
      });
    }

    function changePageHandler(e, page) {
      setCurrentPage(page);
      let id = imageIds[page];
      getSlide({ variables: {id}});
    }

    useEffect(() => {
      if (data) {
        let mpp = data.getSlide.MPP;
        setScalebar(mpp);
      }
    }, [data])

    function initOpenSeadragon(tileSources) {
    
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
        tileSources: tileSources,
        visibilityRatio: 0.5,
        sequenceMode: true,
        showReferenceStrip: true,
      });

      setViewer(osd);
      osd.addHandler('page', changePageHandler);

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
    }

  return html`
    <div id="main_viewer" className="main"></div>
  `;
};
export default Viewer;