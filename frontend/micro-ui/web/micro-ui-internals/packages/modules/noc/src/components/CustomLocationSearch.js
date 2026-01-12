import React, { useEffect } from "react";
import { SearchIconSvg } from "@mseva/digit-ui-react-components";
import { Loader } from "@googlemaps/js-api-loader";
import { useTranslation } from "react-i18next";

let defaultBounds = {};

const updateDefaultBounds = (center) => {
  if (!center.lat || !center.lng) {
    return;
  }
  defaultBounds = {
    north: center.lat + 0.1,
    south: center.lat - 0.1,
    east: center.lng + 0.1,
    west: center.lng - 0.1,
  };
};

const loadGoogleMaps = (callback) => {
  const key = globalConfigs?.getConfig("GMAPS_API_KEY");
  const loader = new Loader({
    apiKey: key,
    version: "weekly",
    libraries: ["places"],
  });

  loader
    .load()
    .then(() => {
      if (callback) callback();
    })
    .catch((e) => {
      // do something
    });
};

const mapStyles = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#f5f5f5",
      },
    ],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#bdbdbd",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#ffffff",
      },
    ],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#757575",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#dadada",
      },
    ],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#616161",
      },
    ],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [
      {
        color: "#e5e5e5",
      },
    ],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [
      {
        color: "#eeeeee",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#c9c9c9",
      },
    ],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9e9e9e",
      },
    ],
  },
];



const initAutocomplete = (position) => {
    const isMobile = window.Digit.Utils.browser.isMobile();
    if (position?.length === 0) return;
    const map = new window.google.maps.Map(document.getElementById("map"), {
        center: {
            lat: position[0]?.latitude,
            lng: position[0]?.longitude,
        },
        zoom: 15,
        mapTypeId: "roadmap",
        // styles: mapStyles,
    }); 

    
    let markers = []


    // position.forEach((loc, index) => {
    //     markers.push(
    //         new window.google.maps.Marker({
    //             map,
    //             title: `SITE_${index + 1}`,
    //             position: { lat: loc?.latitude, lng: loc?.longitude },
    //         })
    //     );
    // })

    position.forEach((loc, index) => {
        const marker = new window.google.maps.Marker({
            map,
            title: `SITE ${index + 1}`, // tooltip on hover
            position: { lat: loc?.latitude, lng: loc?.longitude },
        });

        const infowindow = new window.google.maps.InfoWindow({
            content: `<div className="obps-autocomplete-font-size">SITE ${index + 1}</div>`,
        });

        if (isMobile) {
            marker.addListener("click", () => {
                infowindow.open(map, marker);
            });
        } else {
            marker.addListener("mouseover", () => infowindow.open(map, marker));
            marker.addListener("mouseout", () => infowindow.close());
        }

        markers.push(marker);
    });


    

};

const CustomLocationSearch = (props) => {
  useEffect(() => {
    async function mapScriptCall() {
      const getLatLng = (position) => {
        initAutocomplete(position);
      };      

      const initMaps = () => {        
          getLatLng(props.position);        
      };

      loadGoogleMaps(initMaps);
    }
    mapScriptCall();
  }, [props?.position]);

  return (
    <div className="map-wrap">
      <div id="map" className="map"></div>
    </div>
  );
};

export default CustomLocationSearch;
