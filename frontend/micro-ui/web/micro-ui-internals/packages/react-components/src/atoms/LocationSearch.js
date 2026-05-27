import React, { useEffect } from "react";
import { SearchIconSvg } from "./svgindex";

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
const GetPinCode = (places) => {
  let postalCode = null;
  places?.address_components?.forEach((place) => {
    let hasPostalCode = place.types.includes("postal_code");
    postalCode = hasPostalCode ? place.long_name : null;
  });
  return postalCode;
};

const getName = (places) => {
  let name = "";
  places?.address_components?.forEach((place) => {
    let hasName = place.types.includes("sublocality_level_2") || place.types.includes("sublocality_level_1");
    if (hasName) {
      name = hasName ? place.long_name : null;
    }
  });
  return name;
};

const loadGoogleMaps = (callback, onError) => {
  const tryLoad = (apiKey) => {
    // Create the global callback function that Google Maps will call when it's ready
    window.__googleMapsCallback = () => {
      if (window.google && window.google.maps) {
        if (callback) callback();
      } else {
        handleFail();
      }
    };

    const handleFail = () => {
      console.warn("Google Maps failed to load correctly with key:", apiKey);
      if (apiKey !== "") {
        // Clear all previous maps scripts and window variables
        const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        scripts.forEach((s) => s.remove());
        
        // Clean up global objects
        if (window.google) {
          try { delete window.google; } catch (e) { window.google = undefined; }
        }
        try { delete window.__googleMapsCallback; } catch (e) { window.__googleMapsCallback = undefined; }
        
        // Retry with blank key
        console.log("Retrying load without API key...");
        tryLoad("");
      } else if (onError) {
        onError(new Error("maps object is undefined even without API key"));
      }
    };

    // Construct the URL
    const url = `https://maps.googleapis.com/maps/api/js?v=weekly&libraries=places&callback=__googleMapsCallback${apiKey ? `&key=${apiKey}` : ""}`;

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      script.remove();
      handleFail();
    };

    document.head.appendChild(script);
  };

  // Check if already loaded
  if (window.google && window.google.maps) {
    if (callback) callback();
    return;
  }

  let key = window.globalConfigs?.getConfig("GMAPS_API_KEY") || "";
  tryLoad(key);
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

const setLocationText = (location, onChange, isPlaceRequired=false) => {
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode(
    {
      location,
    },
    function (results, status) {
      if (status === "OK") {
        if (results[0]) {
          let pincode = GetPinCode(results[0]);
          const infoWindowContent = document.getElementById("pac-input");
          if (infoWindowContent) {
            infoWindowContent.value = getName(results[0]);
          }
          if (onChange) {
            if(isPlaceRequired)
            onChange(pincode, { longitude: location.lng, latitude: location.lat }, infoWindowContent?.value);
            else
            onChange(pincode, { longitude: location.lng, latitude: location.lat });
          }
        }
      } else {
        console.warn("Geocoder failed with status:", status);
        if (onChange) {
          if (isPlaceRequired) {
            onChange(null, { longitude: location.lng, latitude: location.lat }, "");
          } else {
            onChange(null, { longitude: location.lng, latitude: location.lat });
          }
        }
      }
    }
  );
};

const onMarkerDragged = (marker, onChange, isPlaceRequired = false) => {
  if (!marker) return;
  const { latLng } = marker;
  const currLat = latLng.lat();
  const currLang = latLng.lng();
  const location = {
    lat: currLat,
    lng: currLang,
  };
  if(isPlaceRequired)
  setLocationText(location, onChange, true);
  else
  setLocationText(location, onChange);
};

const initAutocomplete = (onChange, position, isPlaceRequired = false, mapElement, inputElement, mapRefInstance, markersRefInstance) => {
  if (!mapElement || !inputElement) {
    mapElement = document.getElementById("map");
    inputElement = document.getElementById("pac-input");
  }

  if (!mapElement || !inputElement) {
    console.warn("Map container or Input element not found, retrying...");
    setTimeout(() => initAutocomplete(onChange, position, isPlaceRequired, mapElement, inputElement, mapRefInstance, markersRefInstance), 100);
    return;
  }

  const map = new window.google.maps.Map(mapElement, {
    center: position,
    zoom: 15,
    mapTypeId: "roadmap",
    styles: mapStyles,
  }); // Create the search box and link it to the UI element.

  if (mapRefInstance) mapRefInstance.current = map;

  updateDefaultBounds(position);
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "in" },
    fields: ["address_components", "geometry", "icon", "name"],
    origin: position,
    strictBounds: false,
  };
  const searchBox = new window.google.maps.places.Autocomplete(inputElement, options);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input); // Bias the SearchBox results towards current map's viewport.

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [
    new window.google.maps.Marker({
      map,
      title: "a",
      position: position,
      draggable: true,
      clickable: true,
    }),
  ];
  if (markersRefInstance) markersRefInstance.current = markers;

  if(isPlaceRequired)
  setLocationText(position, onChange,true);
  else
  setLocationText(position, onChange);

  // Listen for map click to place the pointer
  map.addListener("click", (event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    if (markers.length > 0 && markers[0]) {
      markers[0].setPosition(event.latLng);
    }
    if (isPlaceRequired) {
      setLocationText(clickedLocation, onChange, true);
    } else {
      setLocationText(clickedLocation, onChange);
    }
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  markers[0].addListener("dragend", (marker) => onMarkerDragged(marker, onChange, isPlaceRequired));
  searchBox.addListener("place_changed", () => {
    const place = searchBox.getPlace();

    if (!place) {
      return;
    } // Clear out the old markers.
    let pincode = GetPinCode(place);
    const { geometry } = place;
    if (geometry && geometry.location) {
      const geoLocation = {
        latitude: geometry.location.lat(),
        longitude: geometry.location.lng(),
      };
      if (isPlaceRequired) {
        onChange(pincode, geoLocation, place.name);
      } else {
        onChange(pincode, geoLocation);
      }
    }
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = []; // For each place, get the icon, name and location.

    const bounds = new window.google.maps.LatLngBounds();
    if (!place.geometry) {
      return;
    }

    markers.push(
      new window.google.maps.Marker({
        map,
        title: place.name,
        position: place.geometry.location,
        draggable: true,
        clickable: true,
      })
    );
    if (markersRefInstance) markersRefInstance.current = markers;
    markers[0].addListener("dragend", (marker) => onMarkerDragged(marker, onChange, isPlaceRequired));
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });
};

const LocationSearch = (props) => {
  const mapRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const mapRefInstance = React.useRef(null);
  const markersRefInstance = React.useRef([]);

  const handleManualSearch = () => {
    const query = inputRef.current?.value;
    if (!query) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query, componentRestrictions: { country: "in" } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const clickedLocation = {
          lat: location.lat(),
          lng: location.lng(),
        };

        const map = mapRefInstance.current;
        const markers = markersRefInstance.current;

        if (map) {
          map.setCenter(location);
          map.setZoom(15);
        }

        if (markers && markers.length > 0 && markers[0]) {
          markers[0].setPosition(location);
        }

        let pincode = GetPinCode(results[0]);
        if (props.onChange) {
          if (props.isPlaceRequired) {
            props.onChange(pincode, { longitude: clickedLocation.lng, latitude: clickedLocation.lat }, results[0].formatted_address);
          } else {
            props.onChange(pincode, { longitude: clickedLocation.lng, latitude: clickedLocation.lat });
          }
        }
      } else {
        console.warn("Manual Geocode failed for:", query, "Status:", status);
      }
    });
  };

  useEffect(() => {
    async function mapScriptCall() {
      const getLatLng = (position) => {
        try {
          initAutocomplete(props.onChange, { lat: position.coords.latitude, lng: position.coords.longitude }, props.isPlaceRequired, mapRef.current, inputRef.current, mapRefInstance, markersRefInstance);
        } catch (err) {
          console.error("Map init failed:", err);
          setErrorMsg("Init Error: " + err.message);
        }
      };
      const getLatLngError = (error) => {
        try {
          let defaultLatLong = {};
          if (props?.isPTDefault) {
            defaultLatLong = props?.PTdefaultcoord?.defaultConfig || { lat: 31.6160638, lng: 74.8978579 };
          } else {
            defaultLatLong = {
              lat: 31.6160638,
              lng: 74.8978579,
            };
          }
          initAutocomplete(props.onChange, defaultLatLong, props.isPlaceRequired, mapRef.current, inputRef.current, mapRefInstance, markersRefInstance);
        } catch (err) {
          console.error("Map init fallback failed:", err);
          setErrorMsg("Init Fallback Error: " + err.message);
        }
      };

      const initMaps = () => {
        try {
          if (props.position?.latitude && props.position?.longitude) {
            getLatLng({ coords: props.position });
          } else if (navigator?.geolocation) {
            navigator.geolocation.getCurrentPosition(getLatLng, getLatLngError, { timeout: 3000 });
          } else {
            getLatLngError();
          }
        } catch (err) {
          setErrorMsg("InitMaps Error: " + err.message);
        }
      };

      try {
        loadGoogleMaps(initMaps, (err) => {
          setErrorMsg("Load Error: " + (err.message || String(err)));
        });
      } catch (err) {
        setErrorMsg("Loader Init Error: " + err.message);
      }
    }
    mapScriptCall();
  }, []);

  return (
    <div className="map-wrap">
      {errorMsg && (
        <div style={{ color: "red", padding: "12px", background: "#fee", border: "1px solid red", marginBottom: "12px", borderRadius: "4px", fontSize: "14px" }}>
          <strong>Map Component Error:</strong> {errorMsg}
        </div>
      )}
      <div className="map-search-bar-wrap" style={{ display: "flex", gap: "8px", background: "none", boxShadow: "none", width: "100%", padding: "0 0 10px 0" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #ccc", borderRadius: "4px", padding: "0 10px", flex: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <SearchIconSvg className="map-search-bar-icon" style={{ fill: "#464646", marginRight: "8px" }} />
          <input
            ref={inputRef}
            id="pac-input"
            className="map-search-bar"
            type="text"
            placeholder="Search Address"
            style={{ border: "none", outline: "none", flex: 1, height: "40px", padding: "0" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManualSearch();
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={handleManualSearch}
          style={{
            background: "#a82227",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "0 20px",
            cursor: "pointer",
            fontWeight: "bold",
            height: "42px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          Search
        </button>
      </div>
      <div ref={mapRef} id="map" className="map"></div>
    </div>
  );
};

export default LocationSearch;
