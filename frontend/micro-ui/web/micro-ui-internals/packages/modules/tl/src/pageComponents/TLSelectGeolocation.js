import React, { useState } from "react";
//import LocationSearchCard from '../../../../react-components/src/molecules/LocationSearchCard';
 import { LabelFieldPair, CardLabel, TextInput, Modal,Heading } from "@mseva/digit-ui-react-components";
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
  const [fullscreen, setFullscreen] = useState(false);
  const [popup, setPopup] = useState(false);
  const onChange = (code, location) => {
    console.log("Geolocation:",code,location);
    setPincodeServicability(null);
    const foundValue = tenants?.find((obj) => obj.pincode?.find((item) => item == code));
    if (!foundValue) {
      setPincodeServicability("TL_COMMON_PINCODE_NOT_SERVICABLE");
      setPincode("");
      setGeoLocation({});
    } else {
      setPincode(code);
      setGeoLocation(location);
      // console.log("GeoLocation key", config.key);
      // onSelect(config.key, { geoLocation: location });
    }
  };

  console.log("GeoLocation formdata", config.key, formData);
  const isEmpRenewLicense =
    window.location.href.includes("/employee/tl/renew-application-details") || window.location.href.includes("/employee/tl/edit-application-details");


    function open (){
      setPopup(true);
    }
  function close(state) {
    switch (state) {
      case fullscreen:
        setFullscreen(!fullscreen);
        break;
      case popup:
        setPopup(!popup);
        break;
      default:
        break;
    }
  }

  return (
    <React.Fragment>
    {/* {window.location.href.includes("/citizen") ? <Timeline currentStep={2}/> : null} */}
    <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("GIS_Coordinates")}`}
            </CardLabel>
            <div className="field" style={{ marginTop: "20px", display: "flex" }}  id="search-property-field">
              <TextInput
              />
              <button className="submit-bar" type="button" style={{ color: "white" }} onClick={() => {open()}}  disabled={isEmpRenewLicense}>
                {`${t("GEO_LOCATION_SEARCH")}`}
              </button>
            </div>
      </LabelFieldPair>
    {popup ? <Modal
          actionCancelLabel={t("CS_COMMON_CANCEL")}
          actionCancelOnSubmit={() => close(popup)}
          actionSaveLabel={ t("CS_COMMON_PICK")}
          actionSaveOnSubmit={() => {
            console.log("geoLocationInThisModal", geoLocation)
            onSelect(config.key, { geoLocation, pincode })
            close(popup)
          }}
        >
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
          disabled={isEmpRenewLicense || isEditProperty}
          forcedError={t(pincodeServicability)}
          isPTDefault={true}
          PTdefaultcoord={defaultcoord1}
          onSelect={onSelect}
          //isPopUp={true}
        /> 
        </Modal>: null}
    </React.Fragment>
  );
};

export default TLSelectGeolocation;
