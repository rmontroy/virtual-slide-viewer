import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import OpenSeadragon from 'openseadragon';
import config from './config';

const Viewer = () => {
    const [openSeadragonInstance, setOpenSeadragonInstance] = useState();
    const [imageIds, setImageIds] = useState([]);
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
        // Initialize OpenSeadragon instance
        let imageUrls = imageIds.map(imageId => config.imageUrlTemplate(imageId));
        initOpenSeadragon(imageUrls);
    }, [queryString]);
    
    function initOpenSeadragon(tileSources) {
    
        setOpenSeadragonInstance(
          OpenSeadragon({
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
          })
        );
      }

  return html`
    <div id="main_viewer" className="main"></div>
  `;
};
export default Viewer;