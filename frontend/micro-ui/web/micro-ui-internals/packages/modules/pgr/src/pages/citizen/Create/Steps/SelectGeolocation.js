import React from "react";
import { LocationSearchCard } from "@mseva/digit-ui-react-components";

const SelectGeolocation = ({ onSelect, onSkip, value, t, onChange }) => {
  //let pincode = "";
  return (
    <LocationSearchCard
      header={t("CS_ADDCOMPLAINT_SELECT_GEOLOCATION_HEADER")}
      cardText={t("CS_ADDCOMPLAINT_SELECT_GEOLOCATION_TEXT")}
      nextText={t("CS_COMMON_NEXT")}
      // skipAndContinueText={t("CS_COMMON_SKIP")}
      skip={false}
      isPlaceRequired = {false}
      onSave={() => onSelect()}
      isPTDefault={false}
      PTdefaultcoord={false}
       position={{
         latitude: value?.location?.latitude,
         longitude: value?.location?.longitude,
       }}
      onChange={(val, location, place) => {
        onChange(val, location, place)
      }}
    />
  );
};

export default SelectGeolocation;
