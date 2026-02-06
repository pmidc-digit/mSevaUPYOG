import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable  } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { useLocation } from "react-router-dom";
// import { Loader } from "../components/Loader";

export const PropertySearchLudhiana = ({ key = "cpt", onSelect, formData, setApiLoading, menuList, confirmPropertyChange, option }) => {
  const { t } = useTranslation();
  const myElementRef = useRef(null);
  const dispatch = useDispatch();
  let { pathname, state } = useLocation();
  state = state && (typeof state === "string" || state instanceof String) ? JSON.parse(state) : state;
  const apiDataCheck = useSelector((state) => state?.obps?.OBPSFormReducer?.formData?.createdResponse);
  console.log("StateInPropertySearch", formData, key);
  const isEditScreen = pathname.includes("/modify-application/");
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const search = useLocation().search;
  const urlPropertyId = new URLSearchParams(search).get("propertyId");
  const isfirstRender = useRef(true);
  const [getLoader, setLoader] = useState(false);
  const [zone, setZone] = useState(formData?.cpt?.zonalMapping?.zone || "");

  const ptFromApi = apiDataCheck?.additionalDetails?.propertyuid;

  const [propertyId, setPropertyId] = useState(formData?.cpt?.id || ptFromApi || "");
  const [searchPropertyId, setSearchPropertyId] = useState(
    formData?.cpt?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || ptFromApi || ""
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

//   const [propertyDues, setPropertyDues] = useState(() => {
//     if (formData?.cpt?.dues && Object.keys(formData?.cpt?.dues).length > 0) {
//       return { dues: { ...formData?.cpt?.dues } };
//     } else {
//       return {
//         dues: {},
//       };
//     }
//   });

  const [isSearchClicked, setIsSearchClicked] = useState(false);
//   const [getNoDue, setNoDue] = useState(false);
//   const [getCheckStatus, setCheckStats] = useState(false);
//   const [getPayDuesButton, setPayDuesButton] = useState(false);

  const { isLoading, isError, error, data: propertyDetailsFetch } = Digit.Hooks.pt.useLudhianaPropertSearch(
    {
      filters: {
        ulb: "MCL",
        uidNo: searchPropertyId
      }
    },
    // {
    //   filters: { propertyIds: searchPropertyId },
    //   tenantId: tenantId,
    //   enabled: searchPropertyId ? true : false,
    //   privacy: Digit.Utils.getPrivacyObject(),
    // }
  );

  console.log("propertyDetailsFetch", propertyDetailsFetch)

//   useEffect(() => {
//     if (ptFromApi) {
//     //   setIsSearchClicked(true);
//       setPropertyId(ptFromApi);
//       setSearchPropertyId(ptFromApi);
//     //   setNoDue(true);
//     //   setPropertyDues({ dues: { totalAmount: 0 } });
//       dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], id: ptFromApi }));
//     }
//   }, [ptFromApi]);

useEffect(() => {
  if (menuList && formData?.cpt?.details?.address?.locality
    //  && !formData?.createdResponse?.additionalDetails
    ) {
    const boundary = menuList?.["egov-location"]?.TenantBoundary?.find(item => item?.hierarchyType?.code === "REVENUE")?.boundary;
    let ward = {}
    const zone = boundary?.children?.find(item => item?.children?.some((children) => {
      if(children?.children?.some(child => child?.code === formData?.cpt?.details?.address?.locality?.code)){
        ward = children
        return true
      }else{
        return false
      }
    }));
    dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], zonalMapping: {zone, ward} }));
  }
}, [menuList, formData?.cpt?.details?.address?.locality]);

  useEffect(() => {
    if (!isLoading && propertyDetailsFetch?.IsSuccess && propertyDetailsFetch?.Record) {
      const { OwnerName, MobileNo, Zone, Block, ColonyName, PropertyNo } = propertyDetailsFetch?.Record;
      const owners = [{
        mobileNumber: MobileNo,
        name: OwnerName?.split(",")?.[0]
      }]
      const address = {
        doorNo: [PropertyNo, Block, ColonyName ].filter(Boolean).join(", ")
      }
      setPropertyDetails({
        propertyId: propertyDetailsFetch?.Record?.UIDNo,
        owners,
        address
      });
      dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], zonalMapping: {zone: Zone} })); 
    //   setCheckStats(true);
    } else if (!isLoading) {
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
    const oldPropertyId = formData?.cpt?.id;
    dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], details: propertyDetails, id: propertyId }));
    // console.log("PropertyDetailsInUseEffect", propertyDetails, propertyId, oldPropertyId, formData);
    // if (formData?.createdResponse?.applicationNo && !propertyDetails?.Properties && oldPropertyId !== propertyId) {
      // confirmPropertyChange(option);
      // console.log("ConfirmPropertyChangeCalled");
    // }
  }, [propertyDetails, pathname]);

//   useEffect(() => {
//     onSelect(key, { ...formData[key], dues: propertyDues?.dues });
//   }, [propertyDues, pathname]);

  const searchProperty = () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }

    if (propertyId !== searchPropertyId) {
      setPropertyDetails({ Properties: [] });
      setSearchPropertyId(propertyId);
    //   setIsSearchClicked(true);
    //   setPropertyDues({ dues: null });

      // 🔑 Clear PropertyDetails from formData
    //   dispatch(RESET_OBPS_FORM());
      // refetch();
    }
  };

  const handlePropertyChange = (e) => {
    setPropertyId(e.target.value);
    setValue(e.target.value, propertyIdInput.name);
    // setIsSearchClicked(false); // ✅ show button again when input changes
    // setNoDue(false);
    // setCheckStats(false);
    // setPayDuesButton(false);
  };

  if (isEditScreen) {
    return <React.Fragment />;
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
    isMandatory: false
  };

  function setValue(value, input) {
    dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], [input]: value }));
  }

  function getValue(input) {
    return formData && formData[key] ? formData[key][input] : undefined;
  }


  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(null);
      }, 3000); // auto close after 3 sec

      return () => clearTimeout(timer); // cleanup
    }
  }, [showToast]);

  useEffect(() => {
    setApiLoading(isLoading);
  },[isLoading])

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px", marginTop: "20px" }}>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller ndc_card_labels" style={getInputStyles()}>
            {`${t(propertyIdInput.label)}`}
            {propertyIdInput.isMandatory ? "*" : null}
          </CardLabel>
          <div
            className="field ndc_property_search"
            style={{ display: "flex", gap: "16px", alignItems: "baseline", width: "100%" }}
            ref={myElementRef}
            id="search-property-field"
          >
            <TextInput
              key={propertyIdInput.name}
              value={propertyId} //{propertyId}
              onChange={handlePropertyChange}
              disable={false}
              // maxlength={16}
              placeholder={t("PT_PROPERTY_ID_PLACEHOLDER")}
              defaultValue={undefined}
              {...propertyIdInput.validation}
            />

            {!isSearchClicked && !isLoading && (
              <button className="submit-bar" type="button" style={{ color: "white", width: "100%", maxWidth: "100px" }} onClick={searchProperty}>
                {`${t("PT_SEARCH")}`}
              </button>
            )}
            {isLoading && <Loader />}

          </div>
        </LabelFieldPair>
        {/* {formData?.cpt?.details && <StatusTable><Row className="border-none" label={t(`PT_ACKNOWLEDGEMENT_NUMBER`)} text={formData?.cpt?.details?.acknowldgementNumber || "NA"} /></StatusTable>} */}

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
      {/* {(isLoading || getLoader) && <Loader page={true} />} */}
    </React.Fragment>
  );
};