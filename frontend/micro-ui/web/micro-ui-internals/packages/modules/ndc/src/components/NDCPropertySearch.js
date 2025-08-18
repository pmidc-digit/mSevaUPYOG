import React, { useState, useEffect, useMemo, useCallback, useRef, use } from "react";
import {
  CardLabel,
  LabelFieldPair,
  SearchAction,
  Dropdown,
  TextInput,
  LinkButton,
  CardLabelError,
  MobileNumber,
  DatePicker,
  Loader,
  Toast,
  StatusTable,
  Row,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation, Link, useHistory } from "react-router-dom";
const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${
    address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
  }`;
};

export const PropertySearchNSummary = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
  const { t } = useTranslation();
  const history = useHistory();
  let { pathname, state } = useLocation();
  state = state && (typeof state === "string" || state instanceof String) ? JSON.parse(state) : state;
  const isEditScreen = pathname.includes("/modify-application/");
  const tenantId = Digit.ULBService.getCurrentPermanentCity(); //Digit.ULBService.getCurrentTenantId();
  const isEmpNewApplication =
    window.location.href.includes("/employee/tl/new-application") || window.location.href.includes("/citizen/tl/tradelicence/new-application");
  const isEmpRenewLicense =
    window.location.href.includes("/employee/tl/renew-application-details") || window.location.href.includes("/employee/tl/edit-application-details");
  const search = useLocation().search;
  const urlPropertyId = new URLSearchParams(search).get("propertyId");
  const [propertyId, setPropertyId] = useState(formData?.cpt?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || "");
  const [searchPropertyId, setSearchPropertyId] = useState(formData?.cpt?.id || urlPropertyId !== "null" ? urlPropertyId : "");
  const [showToast, setShowToast] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(() => {
    if( formData?.cpt?.details && Object.keys(formData?.cpt?.details).length > 0) {
      return { Properties: [{...formData?.cpt?.details}] };
    } else{
      return {
        Properties: [],
      };
    }});
  const isMobile = window.Digit.Utils.browser.isMobile();
  const serachParams = window.location.href.includes("?")
    ? window.location.href.substring(window.location.href.indexOf("?") + 1, window.location.href.length)
    : "";
  const myElementRef = useRef(null);

  const { isLoading, isError, error, data: propertyDetailsFetch } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: searchPropertyId }, tenantId: tenantId },
    {
      filters: { propertyIds: searchPropertyId },
      tenantId: tenantId,
      enabled: searchPropertyId ? true : false,
      privacy: Digit.Utils.getPrivacyObject(),
    }
  );

  const isfirstRender = useRef(true);

  useEffect(() => {
    if (propertyDetailsFetch && propertyDetailsFetch?.Properties && propertyDetailsFetch?.Properties?.length > 0) {
      setPropertyDetails(propertyDetailsFetch);
      setShowToast(null);
    } else {
      if(isfirstRender.current){
        isfirstRender.current = false;
        return;
      }
      if(!formData?.cpt?.details){
        console.log("Property Id not found in response", propertyId);
        setPropertyDetails({});
        setShowToast({ error: true, label: "PT_ENTER_VALID_PROPERTY_ID" });
      }
    }
  }, [propertyDetailsFetch]);

  useEffect(() => {
    if (propertyId && (window.location.href.includes("/renew-application-details/") || window.location.href.includes("/edit-application-details/")))
      setSearchPropertyId(propertyId);
  }, [propertyId]);

  useEffect(() => {
    if ((isLoading == false && error && error == true) && propertyDetails?.Properties?.length == 0) {
      console.log("Error Caught",error, propertyDetails);
      setShowToast({ error: true, label: "PT_ENTER_VALID_PROPERTY_ID" });
    }
  }, [error, propertyDetails]);
  useEffect(() => {
    onSelect(config.key, { ...formData[config.key], details: propertyDetails?.Properties?.[0] });
    // sessionStorage.setItem("Digit_FSM_PT", JSON.stringify(propertyDetails?.Properties[0]));
    // localStorage.setItem("pgrProperty", JSON.stringify(propertyDetails?.Properties[0]));
    // sessionStorage.setItem("wsProperty", JSON.stringify(propertyDetails?.Properties[0]));

  }, [propertyDetails, pathname]);

  const searchProperty = () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }
    if(propertyId !== searchPropertyId){ 
      setPropertyDetails({
        Properties: [],
      })
      setSearchPropertyId(propertyId);
    }
    // if (window.location.pathname.includes("/tl/new-application")) {
    //   history.push(`/digit-ui/employee/tl/new-application?propertyId=${propertyId}`);
    //   const scrollConst = 1600;
    //   setTimeout(() => window.scrollTo(0, scrollConst), 0);
    // }

    // if (window.location.pathname.includes("/tl/tradelicence/new-application")) {
    //   history.push(`/digit-ui/citizen/tl/tradelicence/new-application?propertyId=${propertyId}`);
    //   const scrollConst = 1600;
    //   setTimeout(() => window.scrollTo(0, scrollConst), 0);
    //   // const offsetTop= myElementRef.current.offsetTop;
    //   // setTimeout(() => window.scrollTo({top: offsetTop, behavior: "smooth"}),0);
    //   // const element=document.getElementById("search-property-field");
    //   // element.scrollIntoView({behavior:"smooth"})
    // }

    // if (window.location.pathname.includes("/ws/new-application")) history.push(`/digit-ui/employee/ws/new-application?propertyId=${propertyId}`);
    // const scrollConst = 460;
    // setTimeout(() => window.scrollTo(0, scrollConst), 0);
  };

  if (isEditScreen) {
    return <React.Fragment />;
  }

  const redirectBackUrl = window.location.pathname;

  let propertyAddress = "";

  if (propertyDetails && propertyDetails?.Properties?.length) {
    propertyAddress = getAddress(propertyDetails?.Properties?.[0]?.address, t);
  }
  const getInputStyles = () => {
    if (window.location.href.includes("/ws/")) {
      return { fontWeight: "700" };
    } else return {};
  };

  const getOwnerNames = (propertyData) => {
    const getActiveOwners = propertyData?.owners?.filter((owner) => owner?.active);
    const getOwnersList = getActiveOwners
      .sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      ?.map((activeOwner) => activeOwner?.name)
      ?.join(",");
    return getOwnersList ? getOwnersList : t("NA");
  };

  let clns = "";
  if (window.location.href.includes("/ws/")) clns = ":";


  const propertyIdInput = {
    label: "PROPERTY_ID",
    type: "text",
    name: "id",
    validation: {
      // isRequired: true,
      // pattern: Digit.Utils.getPattern('Name'),
      // title: t("CORE_COMMON_APPLICANT_NAME_INVALID"),
    },
    // isMandatory: isPropertyIdMandatory,
  };

  function setValue(value, input) {
    onSelect(config.key, { ...formData[config.key], [input]: value });
  }

  function getValue(input) {
    return formData && formData[config.key] ? formData[config.key][input] : undefined;
  }

  // function handleSearchProperty() {
  //   if (window.location.href.includes("digit-ui/citizen")) {
  //     history.replace(`/digit-ui/citizen/commonpt/property/citizen-search?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
  //   }
  //   if (window.location.href.includes("digit-ui/employee")) {
  //     history.replace(`/digit-ui/employee/commonpt/search?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
  //   }
  // }

  function handleCreateProperty() {
    if (window.location.href.includes("digit-ui/citizen")) {
      history.replace(`/digit-ui/citizen/commonpt/property/new-application?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
    if (window.location.href.includes("digit-ui/employee")) {
      history.replace(`/digit-ui/employee/commonpt/new-application?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
  }

  return (
    <React.Fragment>
        <div style={{ marginBottom: "16px" }}>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller" style={getInputStyles()}>
              {`${t(propertyIdInput.label)}`}
              {propertyIdInput.isMandatory ? "*" : null}
            </CardLabel>
            <div className="field" style={{ marginTop: "20px", display: "flex" }} ref={myElementRef} id="search-property-field">
              <TextInput
                key={propertyIdInput.name}
                value={getValue(propertyIdInput.name)} //{propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  // onSelect(config.key, { id: e.target.value });
                  setValue(e.target.value, propertyIdInput.name);
                }}
                disable={false}
                defaultValue={undefined}
                style={{ width: "80%", float: "left", marginRight: "20px" }}
                {...propertyIdInput.validation}
              />
              <button className="submit-bar" type="button" style={{ color: "white" }} onClick={searchProperty}>
                {`${t("PT_SEARCH")}`}
              </button>
            </div>
          </LabelFieldPair>
          
          {showToast && (
            <Toast
              isDleteBtn={true}
              labelstyle={{ width: "100%" }}
              error={showToast.error}
              warning={showToast.warning}
              label={t(showToast.label)}
              onClose={() => {
                setShowToast(null);
              }}
            />
          )}
        </div>
    </React.Fragment>
  );
};