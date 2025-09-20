import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

import Card from "../../../../react-components/src/atoms/Card";
import CardHeader from "../../../../react-components/src/atoms/CardHeader";
import CardText from "../../../../react-components/src/atoms/CardText";
import CardLabelError from "../../../../react-components/src/atoms/CardLabelError";
import LocationSearch from "./LocationSearch";
// removed SubmitBar import usage
import LinkButton from "../../../../react-components/src/atoms/LinkButton";

const LocationSearchCard = ({
  header,
  cardText,
  nextText,
  t,
  skipAndContinueText,
  forcedError,
  skip,
  onSave,
  onChange,
  position,
  onSelect,
  disabled,
  cardBodyStyle = {},
  isPTDefault,
  PTdefaultcoord,
  isPlaceRequired,
  handleRemove,
  Webview = false,
  isPopUp = false,
}) => {
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- reactive disabled state (syncs to incoming `disabled` prop) ---
  const [isDisabledState, setIsDisabledState] = useState(Boolean(disabled || false));
  useEffect(() => {
    if (isMounted.current) setIsDisabledState(Boolean(disabled || false));
  }, [disabled]);

  const [geoLocation, setGeoLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [code, setCode] = useState();
  const [_place, setPlace] = useState();

  const safeSetCode = (val) => {
    if (isMounted.current) setCode(val);
  };
  const safeSetGeo = (val) => {
    if (isMounted.current) setGeoLocation(val);
  };
  const safeSetPlace = (val) => {
    if (isMounted.current) setPlace(val);
  };

  // when child LocationSearch calls onChange
  const onLocationChange = (val, location) => {
    safeSetCode(val);
    safeSetGeo(location);
    // enable button when we have a code (pincode)
    if (isMounted.current) setIsDisabledState(!val);
  };

  const onLocationChangewithPlace = (val, location, place) => {
    safeSetCode(val);
    safeSetGeo(location);
    safeSetPlace(place);
    if (isMounted.current) setIsDisabledState(!val);
  };

  const onSubmit = () => {
    // Build payload as before
    const payload = { geoLocation };

    // Prefer onSelect (old behavior), then onSave, then onChange
    if (typeof onSelect === "function") {
      onSelect("address", payload);
      return;
    }
    if (typeof onSave === "function") {
      // Some callers pass onSave expecting (geoLocation, pincode, place)
      // but some wrappers call onSave() without args. Call in a safe way:
      try {
        // try calling with separate values first
        onSave(geoLocation, code, _place);
      } catch (e) {
        // fallback - call with single payload if previous failed
        try {
          onSave(payload);
        } catch (err) {
          // swallow - nothing else to do
          console.warn("LocationSearchCard: onSave call failed", err);
        }
      }
      return;
    }
    if (typeof onChange === "function") {
      if (_place && Object.keys(_place).length) {
        onChange(code, geoLocation, _place);
      } else {
        onChange(code, geoLocation);
      }
      return;
    }
    console.warn("LocationSearchCard: no submit callback provided by parent.");
  };

  return (
    <Card style={{ position: "relative" }}>
      <div style={{ display: "flex" }}>
        <svg
          style={{ marginTop: Webview ? "16px" : "8px" }}
          width="24"
          height="24"
          viewBox="0 0 30 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.9999 9.66666C12.0533 9.66666 9.66658 12.0533 9.66658 15C9.66658 17.9467 12.0533 20.3333 14.9999 20.3333C17.9466 20.3333 20.3333 17.9467 20.3333 15C20.3333 12.0533 17.9466 9.66666 14.9999 9.66666ZM26.9199 13.6667C26.3066 8.10666 21.8933 3.69333 16.3333 3.07999V0.333328H13.6666V3.07999C8.10658 3.69333 3.69325 8.10666 3.07992 13.6667H0.333252V16.3333H3.07992C3.69325 21.8933 8.10658 26.3067 13.6666 26.92V29.6667H16.3333V26.92C21.8933 26.3067 26.3066 21.8933 26.9199 16.3333H29.6666V13.6667H26.9199ZM14.9999 24.3333C9.83992 24.3333 5.66658 20.16 5.66658 15C5.66658 9.83999 9.83992 5.66666 14.9999 5.66666C20.1599 5.66666 24.3333 9.83999 24.3333 15C24.3333 20.16 20.1599 24.3333 14.9999 24.3333Z"
            fill="#505A5F"
          />
        </svg>
        <CardHeader>{header}</CardHeader>
      </div>

      <div style={cardBodyStyle}>
        {isPopUp && (
          <button
            type="button"
            onClick={() => handleRemove && handleRemove()}
            style={{
              position: "absolute",
              left: 12,
              top: 12,
              padding: "8px 10px",
              background: "#fff",
              color: "#0b74de",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              lineHeight: "16px",
              zIndex: 9999,
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage: "none",
              textTransform: "none",
            }}
            aria-label="Close"
            title="Close"
          >
            <span style={{ color: "red", display: "inline-block" }}>Close</span>
          </button>
        )}

        <CardText>{cardText}</CardText>

        <LocationSearch
          onChange={isPlaceRequired ? onLocationChangewithPlace : onLocationChange}
          position={position}
          isPTDefault={isPTDefault}
          PTdefaultcoord={PTdefaultcoord}
          isPlaceRequired={isPlaceRequired}
        />
        {forcedError && <CardLabelError>{t(forcedError)}</CardLabelError>}
      </div>

      {/* BUTTON: use type="button" so it never submits parent form */}
      <div style={{ padding: "12px" }}>
        {(() => {
          const rawLabel = nextText ?? (t ? t("ADS_PIN_LOCATION_LABEL") : null);
          const labelText = typeof rawLabel === "string" && rawLabel.trim() ? rawLabel : t ? t("ADS_PIN_LOCATION_LABEL") || "Pick" : "Pick";

          return (
            <button
              type="button"
              onClick={(e) => {
                e && e.preventDefault();
                e && e.stopPropagation();
                onSubmit();
              }}
              disabled={isDisabledState}
              aria-disabled={isDisabledState}
              style={{
                display: "inline-block",
                width: "100%",
                padding: "10px 12px",
                background: isDisabledState ? "#ddd" : "#0b74de",
                color: isDisabledState ? "#666" : "#fff",
                border: "none",
                borderRadius: 6,
                cursor: isDisabledState ? "not-allowed" : "pointer",
                textAlign: "center",
                fontWeight: 700,
                fontSize: 14,
                lineHeight: "20px",
                WebkitTextFillColor: isDisabledState ? "#666" : "#fff",
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage: "none",
                textTransform: "none",
              }}
            >
              {labelText || "Pick"}{" "}
            </button>
          );
        })()}
      </div>

      {/* optional skip link previously used */}
      {/* {skip ? <LinkButton onClick={skip} label={skipAndContinueText} /> : null} */}
    </Card>
  );
};

LocationSearchCard.propTypes = {
  header: PropTypes.string,
  cardText: PropTypes.string,
  nextText: PropTypes.string,
  t: PropTypes.func,
  skipAndContinueText: PropTypes.string,
  skip: PropTypes.func,
  onSave: PropTypes.func,
  onChange: PropTypes.func,
  position: PropTypes.any,
  onSelect: PropTypes.func,
  isPTDefault: PropTypes.any,
  PTdefaultcoord: PropTypes.any,
  isPlaceRequired: PropTypes.any,
  handleRemove: PropTypes.func,
  Webview: PropTypes.bool,
  isPopUp: PropTypes.bool,
};

LocationSearchCard.defaultProps = {
  header: "",
  cardText: "",
  nextText: "",
  skipAndContinueText: "",
  onSelect: null,
  skip: () => {},
  onSave: null,
  onChange: () => {},
  position: undefined,
  isPTDefault: false,
  PTdefaultcoord: {},
  isPlaceRequired: false,
  handleRemove: () => {},
  Webview: false,
  isPopUp: false,
};

export default LocationSearchCard;
