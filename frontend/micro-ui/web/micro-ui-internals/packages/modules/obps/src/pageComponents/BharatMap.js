import React from "react";

const BharatMap = ({mapUrl}) => {
  return (
    <div style={{ width: "100%", height: "400px", borderRadius: "8px", overflow: "hidden" }}>
      <iframe
        src={`https://bharatmaps.gov.in/BharatMaps/Home/Map?${mapUrl}`} // You can replace this with any BharatMap embed URL or GIS portal link
        width="100%"
        height="100%"
        style={{ border: "none" }}
        allowFullScreen
        loading="lazy"
        title="Bharat Map"
      ></iframe>
    </div>
  );
};

export default BharatMap;