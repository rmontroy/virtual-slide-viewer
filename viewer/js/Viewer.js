import { useEffect, useState } from 'react';
import { html } from 'htm/react';
import OpenSeadragon from 'openseadragon';
import config from './config';

const Viewer = () => {
    const [openSeadragonInstance, setOpenSeadragonInstance] = useState();
    const [imagePrefix, setImagePrefix] = useState(config.imagePrefix);
    const [imageSuffix, setImageSuffix] = useState(config.imageSuffix);
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
        let imageId = params["imageId"];
        let imageUrl = [imagePrefix, imageId, imageSuffix].join('/');
        // Initialize OpenSeadragon instance
        initOpenSeadragon(imageUrl);
    }, []);
    
    function initOpenSeadragon(imageUrl) {
    
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
            tileSources: imageUrl,
            visibilityRatio: 0.5,
          })
        );
      }

  return html`
    <div id="main_viewer" class="main"></div>
  `;
};
export default Viewer;