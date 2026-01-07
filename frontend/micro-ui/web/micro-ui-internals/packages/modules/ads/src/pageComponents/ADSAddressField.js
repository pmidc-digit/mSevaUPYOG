// ADSAddressField.js
import React, { Fragment, useState, useEffect } from "react";
import { TextInput, LinkButton } from "@mseva/digit-ui-react-components";
import GIS from "./GIS";

const ADSAddressField = ({ value, onChange, onBlur, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const isCitizen = typeof window !== "undefined" && window.location?.href?.includes("citizen");

  // reflect incoming value to the display
  useEffect(() => {
    if (!value) {
      setPlaceName("");
      return;
    }
    if (typeof value === "string") setPlaceName(value);
    else setPlaceName(value.formattedAddress || (value.latitude && value.longitude ? `${value.latitude}, ${value.longitude}` : ""));
  }, [value]);

  const normalize = (geoLocationObj, pincode, place) => {
    // Ensure fields exist with common names
    const normalized = {
      formattedAddress: place || geoLocationObj?.formattedAddress || geoLocationObj?.place_name || "",
      latitude: geoLocationObj?.latitude ?? geoLocationObj?.lat ?? geoLocationObj?.y ?? null,
      longitude: geoLocationObj?.longitude ?? geoLocationObj?.lng ?? geoLocationObj?.x ?? null,
      placeId: geoLocationObj?.placeId || geoLocationObj?.id || null,
      raw: geoLocationObj || {},
      pincode: pincode || null,
    };
    return normalized;
  };

  const handleSave = (geoLocation, pincode, placeNameFromGis) => {
    const normalized = normalize(geoLocation, pincode, placeNameFromGis);
    setPlaceName(normalized.formattedAddress);
    onChange && onChange(normalized);
    setIsOpen(false);
  };

  return (
    <>
      <div style={{width:"100%",marginTop:"8px"}}>
        <TextInput
          value={placeName}
          onChange={() => {}}
          onBlur={onBlur}
          disabled={true}
          placeholder={t("ADS_LOCATION")}
         
        />
        {/* <div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            style={{
              padding: "8px 10px",
              background: "#0b74de",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            <span style={{ display: "inline-block", color: "#fff", textTransform: "none" }}>
              {(t && (t("VIEW_LOCATION_ON_MAP") || "View location on map")) || "View location on map"}
            </span>
          </button>
        </div> */}
      </div>

      {isOpen && (
        <GIS
          t={t}
          formData={{ address: { pincode: value?.pincode || "", geoLocation: value || {} } }}
          handleRemove={() => setIsOpen(false)}
          onSave={(geoLocation, pincode, place) => handleSave(geoLocation, pincode, place)}
        />
      )}
    </>
  );
};

export default ADSAddressField;
