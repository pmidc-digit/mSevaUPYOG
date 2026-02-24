import React, { useState } from "react";
//import LocationSearchCard from '../../../../react-components/src/molecules/LocationSearchCard';
//  import { LocationSearchCard } from "@mseva/digit-ui-react-components";
// import LocationSearchCard from "../../../../react-components/src/molecules/LocationSearchCard";
import LocationSearchCard from "../components/LocationSearchCard";
import Timeline from "../components/TLTimeline";

const TLSelectGeolocation = ({ t, config, onSelect, formData = {} }) => {
  const [pincode, setPincode] = useState(formData?.address?.pincode || "");
  const [geoLocation, setGeoLocation] = useState(formData?.address?.geoLocation || {});
  const tenants = Digit.Hooks.tl.useTenants();
  const [pincodeServicability, setPincodeServicability] = useState(null);
  let isEditProperty = window.location.href.includes("edit-application")||window.location.href.includes("renew-trade");
  const tenantId = Digit.ULBService.getCurrentPermanentCity() //Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: defaultConfig = {} } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "MapConfig");
  const defaultcoord = defaultConfig?.PropertyTax?.MapConfig;
  let defaultcoord1 = defaultcoord ? defaultcoord[0] : {};
  const onSkip = () => onSelect();
  const onChange = (code, location) => {
    setPincodeServicability(null);
    
    // Validate pincode format
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (code && !pincodeRegex.test(code)) {
      setPincodeServicability("CORE_COMMON_PINCODE_INVALID");
      return;
    }
    
    // Check if pincode exists in tenant master data
    const foundValue = tenants?.find((obj) => obj.pincode?.find((item) => item == code));
    if (!foundValue && code) {
      // Show warning but still allow if city/locality is valid
      console.warn("Pincode not found in master data:", code);
      setPincodeServicability("TL_COMMON_PINCODE_NOT_IN_MASTER");
      // Still set the values - validation will be done at city-locality level
      setPincode(code);
      setGeoLocation(location);
    } else {
      setPincode(code);
      setGeoLocation(location);
      setPincodeServicability(null);
    }
  };

  const isEmpRenewLicense =
    window.location.href.includes("/employee/tl/renew-application-details") || window.location.href.includes("/employee/tl/edit-application-details");

  return (
    <React.Fragment>
    {/* {window.location.href.includes("/citizen") ? <Timeline currentStep={2}/> : null} */}
    <LocationSearchCard
      header={t("TL_GEOLOCATION_HEADER")}
      cardText={t("TL_GEOLOCATION_TEXT")}
      nextText={t("CS_COMMON_NEXT")}
      skipAndContinueText={t("CORE_COMMON_SKIP_CONTINUE")}
      // skip={onSkip}
      t={t}
      position={geoLocation}
      onSave={() => onSelect(config.key, { geoLocation, pincode })}
      onChange={(code, location) => onChange(code, location)}
      disabled={isEmpRenewLicense || pincode === "" || isEditProperty}
      forcedError={t(pincodeServicability)}
      isPTDefault={true}
      PTdefaultcoord={defaultcoord1}
      onSelect={onSelect}
      //isPopUp={true}
    /> 
    </React.Fragment>
  );
};

export default TLSelectGeolocation;
