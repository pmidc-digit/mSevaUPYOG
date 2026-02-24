import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

const PropertySearchSummary = ({ config, onSelect, userType, formData, setError, formState, clearErrors }) => {
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
  const [propertyId, setPropertyId] = useState(formData?.cptId?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || "");
  const [searchPropertyId, setSearchPropertyId] = useState(
    (urlPropertyId !== "null" ? urlPropertyId : "")
    || formData?.cpt?.details?.propertyId
    || formData?.cptId?.id
    || ""
  );
 const [showToast, setShowToast] = useState(null);
  const isMobile = window.Digit.Utils.browser.isMobile();
  const serachParams = window.location.href.includes("?")
    ? window.location.href.substring(window.location.href.indexOf("?") + 1, window.location.href.length)
    : "";
  const myElementRef = useRef(null);
  const prevPropertyRef = useRef(null);
  const scrollLockRef = useRef(false);

  // Lock scroll position — intercept any scroll-to-top during parent re-render
  useEffect(() => {
    if (!scrollLockRef.current) return;

    const savedY = scrollLockRef.current;

    const handleScroll = () => {
      if (window.scrollY === 0 && savedY > 0) {
        window.scrollTo(0, savedY);
      }
    };

    window.addEventListener("scroll", handleScroll);

    const timer = setTimeout(() => {
      window.removeEventListener("scroll", handleScroll);
      scrollLockRef.current = false;
    }, 300);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  });

  const { isLoading, isError, error, data: propertyDetails } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: searchPropertyId }, tenantId: tenantId },
    {
      filters: { propertyIds: searchPropertyId },
      tenantId: tenantId,
      enabled: searchPropertyId ? true : false,
      privacy: Digit.Utils.getPrivacyObject(),
    }
  );

  useEffect(() => {
    if (propertyId && (window.location.href.includes("/renew-application-details/") || window.location.href.includes("/edit-application-details/")))
      setSearchPropertyId(propertyId);
  }, [propertyId]);

  const getOwnerNames = (propertyData) => {
    const getActiveOwners = propertyData?.owners?.filter((owner) => owner?.active);
    const getOwnersList = getActiveOwners
      ?.sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      ?.map((activeOwner) => activeOwner?.name)
      ?.join(",");
    return getOwnersList ? getOwnersList : t("NA");
  };

  let propertyAddress = "";
  if (propertyDetails && propertyDetails?.Properties?.length) {
    propertyAddress = getAddress(propertyDetails?.Properties[0]?.address, t);
  }

  useEffect(() => {
    if (isLoading === false && searchPropertyId) {
      if ((error && error === true) || propertyDetails?.Properties?.length === 0) {
        setShowToast({ error: true, label: "PT_ENTER_VALID_PROPERTY_ID" });
      }
    }
  }, [isLoading, error]);

  useEffect(() => {
    const currentProperty = propertyDetails?.Properties?.[0];
    const currentPropertyId = currentProperty?.propertyId;
    const prevPropertyId = prevPropertyRef.current?.propertyId;

    // Only update parent if property actually changed
    if (!currentPropertyId || currentPropertyId === prevPropertyId) return;

    prevPropertyRef.current = currentProperty;

    // Lock scroll position BEFORE onSelect triggers parent re-render
    scrollLockRef.current = window.scrollY;

    onSelect(config.key, { ...formData[config.key], details: currentProperty });
    sessionStorage.setItem("Digit_FSM_PT", JSON.stringify(currentProperty));
    localStorage.setItem("pgrProperty", JSON.stringify(currentProperty));
    sessionStorage.setItem("wsProperty", JSON.stringify(currentProperty));
  }, [propertyDetails]);

  const searchProperty = () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }
    setSearchPropertyId(propertyId);

    // --- URL navigation commented out to prevent scroll-to-top on search ---
    // const currentUrl = window.location.pathname;
    // const currentSearch = new URLSearchParams(window.location.search);
    // const currentPropertyId = currentSearch.get("propertyId");

    // // If propertyId already matches, no URL update needed
    // if (currentPropertyId === propertyId) return;

    // // Update URL without triggering scroll reset
    // if (currentUrl.includes("/tl/new-application")) {
    //   history.replace(`/digit-ui/employee/tl/new-application?propertyId=${propertyId}`);
    //   return;
    // }

    // if (currentUrl.includes("/tl/tradelicence/new-application")) {
    //   history.replace(`/digit-ui/citizen/tl/tradelicence/new-application?propertyId=${propertyId}`);
    //   return;
    // }

    // if (currentUrl.includes("/ws/new-application")) {
    //   history.replace(`/digit-ui/employee/ws/new-application?propertyId=${propertyId}`);
    //   return;
    // }

    // // Fallback: scroll to section for other routes
    // setTimeout(scrollToSearchSection, 200);
    // --- End commented out URL navigation ---
  };

  const propertyIdInput = {
    label: "PT_PROPERTY_UNIQUE_ID",
    type: "text",
    name: "id",
    validation: {},
    isMandatory: false,
    placeholder: "TL_NEW_TRADE_DETAILS_PT_ID_PLACEHOLDER"
  };

  function setValue(value, input) {
    onSelect(config.key, { ...formData[config.key], [input]: value });
  }

  function getValue(input) {
    return formData && formData[config.key] ? formData[config.key][input] : undefined;
  }

  function handleSearchProperty() {
    if (window.location.href.includes("digit-ui/citizen")) {
      history.push(`/digit-ui/citizen/commonpt/property/citizen-search?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
    if (window.location.href.includes("digit-ui/employee")) {
      history.push(`/digit-ui/employee/commonpt/search?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
  }

  function handleCreateProperty() {
    if (window.location.href.includes("digit-ui/citizen")) {
      history.push(`/digit-ui/citizen/commonpt/property/new-application?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
    if (window.location.href.includes("digit-ui/employee")) {
      history.push(`/digit-ui/employee/commonpt/new-application?redirectToUrl=${redirectBackUrl}&${serachParams}`, { ...state });
    }
  }

  function handleViewProperty() {
    if (window.location.href.includes("digit-ui/citizen")) {
    }
    if (window.location.href.includes("digit-ui/employee")) {
    }
  }

  return (
    <React.Fragment>
      {(window.location.href.includes("/tl/")
        ? !(formData?.tradedetils?.[0]?.structureType?.code === "MOVABLE") && (isEmpNewApplication || isEmpRenewLicense)
        : true) && (
        <div>
          <LabelFieldPair>
            {/* <CardLabel className="card-label-smaller" style={getInputStyles()}>
              {`${t(propertyIdInput.label)}`} }
              {propertyIdInput.isMandatory ? "*" : null}
            </CardLabel> */}
              <div className="form-field TL-property-search-field" ref={myElementRef} id="search-property-field">
              <TextInput
                key={propertyIdInput.name}
                value={getValue(propertyIdInput.name)} //{propertyId}
                onChange={(e) => {
                  setPropertyId(e.target.value);
                  // onSelect(config.key, { id: e.target.value });
                  setValue(e.target.value, propertyIdInput.name);
                }}
                disable={isEmpRenewLicense}
                defaultValue={undefined}
                style={{ width: "80%", float: "left", marginRight: "20px" }}
                {...propertyIdInput.validation}
                placeholder={t(`${propertyIdInput.placeholder}`)}
              />
              <button className="submit-bar TL-btn-white" type="button" onClick={searchProperty} disabled={isEmpRenewLicense}>
                {`${t("PT_SEARCH")}`}
              </button>
            </div>
          </LabelFieldPair>
          {/* <span onClick={handleSearchProperty}>
            <LinkButton label={t("CPT_SEARCH_PROPERTY")} style={{ color: "#a82227", display: "inline-block" }} />
          </span> */}
          {/* &nbsp; {window.location.href.includes("/pgr/") ? "" : "|"}
          &nbsp; */}
          {/* {window.location.href.includes("/pgr/") ? (
            ""
          ) : (
            <span onClick={handleCreateProperty}>
              <LinkButton label={t("CPT_CREATE_PROPERTY")} style={{ color: "#a82227", display: "inline-block" }} />
            </span>
          )} */}
          {propertyDetails && propertyDetails?.Properties.length ? (
            <React.Fragment>
              <header className="card-section-header" >
                {t("PT_DETAILS")}
              </header>
              <StatusTable>
                  <Row
                    className="border-none"
                    // labelStyle={isMobile ? { width: "40%" } : {}}
                    label={t(`PROPERTY_ID`)}
                    text={propertyDetails?.Properties[0]?.propertyId}
                  />
                  <Row
                    className="border-none"
                    // labelStyle={isMobile ? { width: "40%" } : {}}
                    label={t(`OWNER_NAME`)}
                    text={getOwnerNames(propertyDetails?.Properties[0])}
                  />
                  {/* <span style={{ display: "inline-flex", width: "fit-content"}}> */}
                  <Row
                    className="border-none"
                    // labelStyle={isMobile ? { width: "40%" } : {}}
                    textStyle={{ wordBreak: "break-word" }}
                    label={t(`PROPERTY_ADDRESS`)}
                    text={propertyAddress}
                    privacy={{
                      uuid: propertyDetails?.Properties[0]?.owners?.[0]?.uuid,
                      fieldName: ["doorNo", "street", "landmark"],
                      model: "Property",
                      showValue: true,
                      loadData: {
                        serviceName: "/property-services/property/_search",
                        requestBody: {},
                        requestParam: { tenantId: propertyDetails?.Properties[0]?.tenantId, propertyIds: propertyDetails?.Properties[0]?.propertyId },
                        jsonPath: "Properties[0].address.street",
                        d: (res) => {
                          let resultString =
                            (_.get(res, "Properties[0].address.doorNo") ? `${_.get(res, "Properties[0].address.doorNo")}, ` : "") +
                            (_.get(res, "Properties[0].address.street") ? `${_.get(res, "Properties[0].address.street")}, ` : "") +
                            (_.get(res, "Properties[0].address.landmark") ? `${_.get(res, "Properties[0].address.landmark")}` : "");
                          return resultString;
                        },
                        isArray: false,
                      },
                    }}
                  />
              </StatusTable>
              <Link
                to={`/digit-ui/${
                  window.location.href.includes("employee") ? "employee" : "citizen"
                }/commonpt/view-property?propertyId=${propertyId}&tenantId=${tenantId}&from=${
                  window.location.pathname?.includes("employee/tl/new-application")
                    ? "ES_TITLE_NEW_TRADE_LICESE_APPLICATION"
                    : window.location.pathname?.includes("/citizen/tl/tradelicence/new-application")
                    ? "CITIZEN_TL_NEW_APPLICATION"
                    : ""
                }`}
              >
                {/* <LinkButton label={t("CPT_COMPLETE_PROPERTY_DETAILS")} /> */}              
              </Link>
            </React.Fragment>
          ) : null}
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
      )}
    </React.Fragment>
  );
};

export default PropertySearchSummary;
