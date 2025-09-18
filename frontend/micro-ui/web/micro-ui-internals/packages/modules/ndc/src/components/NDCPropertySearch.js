import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Loader, Toast } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { resetNDCForm } from "../redux/actions/NDCFormActions";
import { useLocation } from "react-router-dom";

const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${
    address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
  }`;
};

export const PropertySearchNSummary = ({ config, onSelect, formData }) => {
  const { t } = useTranslation();
  const myElementRef = useRef(null);
  const dispatch = useDispatch();
  let { pathname, state } = useLocation();
  state = state && (typeof state === "string" || state instanceof String) ? JSON.parse(state) : state;
  const apiDataCheck = useSelector((state) => state.ndc.NDCForm?.formData?.responseData);
  const isEditScreen = pathname.includes("/modify-application/");
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const search = useLocation().search;
  const urlPropertyId = new URLSearchParams(search).get("propertyId");
  const isfirstRender = useRef(true);

  const ptFromApi = apiDataCheck?.[0]?.NdcDetails?.find((item) => item.businessService == "PT");

  console.log("ptFromApi", ptFromApi);

  const [propertyId, setPropertyId] = useState(formData?.cpt?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || ptFromApi?.consumerCode || "");
  const [searchPropertyId, setSearchPropertyId] = useState(
    formData?.cpt?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || ptFromApi?.consumerCode || ""
  );
  const [showToast, setShowToast] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(() => {
    if (formData?.cpt?.details && Object.keys(formData?.cpt?.details).length > 0) {
      return { Properties: [{ ...formData?.cpt?.details }] };
    } else {
      return {
        Properties: [],
      };
    }
  });
  const [propertyDues, setPropertyDues] = useState(() => {
    if (formData?.cpt?.dues && Object.keys(formData?.cpt?.dues).length > 0) {
      return { dues: { ...formData?.cpt?.dues } };
    } else {
      return {
        dues: {},
      };
    }
  });

  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [getNoDue, setNoDue] = useState(false);
  const [getCheckStatus, setCheckStats] = useState(false);
  const [getPayDuesButton, setPayDuesButton] = useState(false);

  const { isLoading, isError, error, data: propertyDetailsFetch } = Digit.Hooks.pt.usePropertySearch(
    { filters: { propertyIds: searchPropertyId }, tenantId: tenantId },
    {
      filters: { propertyIds: searchPropertyId },
      tenantId: tenantId,
      enabled: searchPropertyId ? true : false,
      privacy: Digit.Utils.getPrivacyObject(),
    }
  );

  console.log("apiDataCheck", apiDataCheck);

  useEffect(() => {
    if (ptFromApi?.consumerCode) {
      setIsSearchClicked(true);
      setPropertyId(ptFromApi.consumerCode);
      setSearchPropertyId(ptFromApi.consumerCode);
      setNoDue(true);
      onSelect(config.key, { ...formData[config.key], id: ptFromApi.consumerCode });
    }
  }, [ptFromApi]);

  useEffect(() => {
    if (propertyDetailsFetch && propertyDetailsFetch?.Properties && propertyDetailsFetch?.Properties?.length > 0) {
      setPropertyDetails(propertyDetailsFetch);
      setShowToast(null);
      setCheckStats(true);
    } else {
      if (isfirstRender.current) {
        isfirstRender.current = false;
        return;
      }
      if (!formData?.cpt?.details) {
        setPropertyDetails({});
        setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
      }
    }
  }, [propertyDetailsFetch]);

  useEffect(() => {
    if (propertyId && (window.location.href.includes("/renew-application-details/") || window.location.href.includes("/edit-application-details/")))
      setSearchPropertyId(propertyId);
  }, [propertyId]);

  useEffect(() => {
    if (isLoading == false && error && error == true && propertyDetails?.Properties?.length == 0) {
      setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
    }
  }, [error, propertyDetails]);

  useEffect(() => {
    onSelect(config.key, { ...formData[config.key], details: propertyDetails?.Properties?.[0] });
  }, [propertyDetails, pathname]);

  useEffect(() => {
    onSelect(config.key, { ...formData[config.key], dues: propertyDues?.dues });
  }, [propertyDues, pathname]);

  const searchProperty = () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }

    if (propertyId !== searchPropertyId) {
      setPropertyDetails({ Properties: [] });
      setSearchPropertyId(propertyId);
      setIsSearchClicked(true);

      dispatch(resetNDCForm());
    }
  };

  const handlePropertyChange = (e) => {
    setPropertyId(e.target.value);
    setValue(e.target.value, propertyIdInput.name);
    setIsSearchClicked(false); // ✅ show button again when input changes
    setNoDue(false);
    setCheckStats(false);
    setPayDuesButton(false);
  };

  if (isEditScreen) {
    return <React.Fragment />;
  }

  let propertyAddress = "";

  if (propertyDetails && propertyDetails?.Properties?.length) {
    propertyAddress = getAddress(propertyDetails?.Properties?.[0]?.address, t);
  }
  const getInputStyles = () => {
    if (window.location.href.includes("/ws/")) {
      return { fontWeight: "700" };
    } else return {};
  };

  let clns = "";
  if (window.location.href.includes("/ws/")) clns = ":";

  const propertyIdInput = {
    label: "PROPERTY_ID",
    type: "text",
    name: "id",
  };

  function setValue(value, input) {
    onSelect(config.key, { ...formData[config.key], [input]: value });
  }

  function getValue(input) {
    return formData && formData[config.key] ? formData[config.key][input] : undefined;
  }

  async function fetchBill() {
    try {
      const result = await Digit.PaymentService.fetchBill(tenantId, {
        businessService: "PT",
        consumerCode: formData?.cpt?.id,
      });
      if (result?.Bill?.length > 0) {
        if (result?.Bill[0]?.totalAmount > 0) {
          setShowToast({ error: true, label: t("NDC_MESSAGE_DUES_FOUND_PLEASE_PAY") });
          setPayDuesButton(true);
        } else {
          setShowToast({ error: false, label: t("NDC_NO_BILLS_FOUND_PROPERTY") });
          setNoDue(true);
          setCheckStats(false);
        }
        setPropertyDues({ dues: result?.Bill[0] });
      } else if (result?.Bill) {
        setShowToast({ error: false, label: t("NDC_NO_BILLS_FOUND_PROPERTY") });
        setPropertyDues({ dues: { totalAmount: 0 } });
        setNoDue(true);
        setCheckStats(false);
      } else {
        setShowToast({ error: false, label: t("NDC_NO_BILLS_FOUND_PROPERTY") });
        setPropertyDues({ dues: { totalAmount: 0 } });
        setNoDue(true);
        setCheckStats(false);
      }
    } catch (error) {
      setShowToast({ error: true, label: t("NDC_MESSAGE_FETCH_FAILED") });
    }
  }

  function redirectToPayBill(billData, index, isEdit) {
    const userType = window.location.href.includes("employee") ? "employee" : "citizen";

    const payUrl =
      "https://sdc-uat.lgpunjab.gov.in" +
      `/${userType}/egov-common/pay?consumerCode=${formData?.cpt?.id}&tenantId=${formData?.cpt?.details?.tenantId}&businessService=PT`;

    window.open(payUrl, "_blank");
    setPropertyDues({});
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000); // auto close after 3 sec

      return () => clearTimeout(timer); // cleanup
    }
  }, [showToast]);

  return (
    <React.Fragment>
      {isLoading && <Loader />}
      <div style={{ marginBottom: "16px" }}>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller ndc_card_labels" style={getInputStyles()}>
            {`${t(propertyIdInput.label)}`}
            {propertyIdInput.isMandatory ? "*" : null}
          </CardLabel>
          <div
            className="field ndc_property_search"
            style={{ marginTop: "20px", display: "flex", gap: "16px", alignItems: "baseline", width: "100%" }}
            ref={myElementRef}
            id="search-property-field"
          >
            <TextInput
              key={propertyIdInput.name}
              value={propertyId} //{propertyId}
              onChange={handlePropertyChange}
              disable={false}
              // maxlength={16}
              defaultValue={undefined}
              {...propertyIdInput.validation}
            />

            {!isSearchClicked && (
              <button className="submit-bar" type="button" style={{ color: "white", width: "100%", maxWidth: "100px" }} onClick={searchProperty}>
                {`${t("PT_SEARCH")}`}
              </button>
            )}

            {!apiDataCheck?.[0]?.NdcDetails && getCheckStatus && !getPayDuesButton && (
              <button
                className="submit-bar"
                type="button"
                style={{ color: "white", fontSize: "13px", width: "100%", maxWidth: "180px" }}
                onClick={() => {
                  fetchBill("PT", formData?.cpt?.id);
                }}
              >
                {`${t("CHECK_STATUS_PROPERTY")}`}
                {/* Check Status */}
              </button>
            )}
            {getPayDuesButton && (
              <button
                className="submit-bar"
                type="button"
                style={{ color: "white", width: "100%", maxWidth: "190px" }}
                onClick={() => {
                  redirectToPayBill(formData?.cpt?.dues?.totalAmount);
                  setPayDuesButton(false);
                }}
              >
                {`${t("PAY_DUES")} (Rs.${formData?.cpt?.dues?.totalAmount})`}
              </button>
            )}
            {getNoDue && <div style={{ color: "green", width: "100%", maxWidth: "75px" }}>{t("NO_DUES_FOUND_FOR_PROPERTY")}</div>}
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
