import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { UPDATE_NOCNewApplication_FORM } from "../redux/action/NOCNewApplicationActions";
import { useLocation } from "react-router-dom";
// import { Loader } from "../components/Loader";

export const PropertySearchBathinda = ({ key = "cpt", onSelect, formData, setApiLoading, menuList }) => {
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

  const uidParts = searchPropertyId?.split("-") || [];

  const Uidno = uidParts[0];
  const Uidno1 = uidParts[1] || "000";
  const Uidno2 = uidParts[2] || "000";

  const uidIsValid = Boolean(Uidno && Uidno.trim() !== "");

  // const {
  //   isLoading,
  //   isError,
  //   error,
  //   data: propertyDetailsFetch
  // } = Digit.Hooks.pt.useBathindaPropertySearch(
  //   {
  //     filters: { Uidno, Uidno1, Uidno2 },
  //   },
  //   {
  //     enabled: uidIsValid
  //   }
  // );

  const { isLoading, isError, error, data: propertyDetailsFetch } = Digit.Hooks.pt.useLudhianaPropertSearch(
    {
      filters: {
        ulb: "MCB",
        uidNo: `${Uidno}-${Uidno1}-${Uidno2}`
      }
    },
    {
    //   filters: { propertyIds: searchPropertyId },
    //   tenantId: tenantId,
      enabled: uidIsValid
    //   privacy: Digit.Utils.getPrivacyObject(),
    }
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
        if (children?.children?.some(child => child?.code === formData?.cpt?.details?.address?.locality?.code)) {
          ward = children
          return true
        } else {
          return false
        }
      }));
      dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], zonalMapping: { zone, ward } }));
    }
  }, [menuList, formData?.cpt?.details?.address?.locality]);

    useEffect(() => {
      if (!isLoading && propertyDetailsFetch?.status === "1") {
        const { Nameofpropertyowner, Nameoffather,Mobile, Locality, Sublocality, Zone, Roadname, Pincode, Fulladdress, Uidno, Uidno1, Uidno2 } = propertyDetailsFetch?.data;
        const owners = [{
          mobileNumber: Mobile,
          name: Nameofpropertyowner,
          fatherOrHusbandName: Nameoffather,
          isPrimaryOwner: true,
          landArea: propertyDetailsFetch?.data?.Totalplotareasqyd

        }]
        const address = {
          // doorNo: [PropertyNo, Block, ColonyName ].filter(Boolean).join(", "),
          tenantId: tenantId,
          street: Roadname,
          pincode: Pincode,
          doorNo: Fulladdress,
        }
        setPropertyDetails({
          propertyId: `${Uidno}-${Uidno1}-${Uidno2}`,
          owners,
          address
        });
        dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], zonalMapping: {zone: Zone} }));
        if (onSelect) {
          onSelect({
            propertyId: `${Uidno}-${Uidno1}-${Uidno2}`,
            owners,
            address
          });
        }
      //   setCheckStats(true);
      }else if(!isLoading && propertyDetailsFetch?.status === "0"){
        setPropertyDetails({});
        setShowToast({ error: true, label: propertyDetailsFetch?.message || "CS_PT_NO_PROPERTIES_FOUND" });
      }
       else if (!isLoading) {
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
    dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], details: propertyDetails, id: propertyId }));
  }, [propertyDetails, pathname]);

  //   useEffect(() => {
  //     onSelect(key, { ...formData[key], dues: propertyDues?.dues });
  //   }, [propertyDues, pathname]);

  // const searchProperty = () => {
  //   if (!propertyId) {
  //     setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
  //     return;
  //   }

  //   if (propertyId !== searchPropertyId) {
  //     setPropertyDetails({ Properties: [] });
  //     setSearchPropertyId(propertyId);
  //     //   setIsSearchClicked(true);
  //     //   setPropertyDues({ dues: null });

  //     // 🔑 Clear PropertyDetails from formData
  //     //   dispatch(RESET_OBPS_FORM());
  //     // refetch();
  //   }
  // };
  const searchProperty = () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }

    // Split parts
    const parts = propertyId.split("-");

    const UidNo = parts[0];        // required
    const UidNo1 = parts[1] || "000";
    const UidNo2 = parts[2] || "000";

    // ---------------- Validation ----------------

    // 1. UidNo must exist and be 7 alphanumeric characters
    if (!UidNo || UidNo.length !== 7 || !/^[A-Za-z0-9]{7}$/.test(UidNo)) {
      setShowToast({
        error: true,
        label: t("Invalid UID: UidNo must be 7 alphanumeric characters")
      });
      return;
    }

    // 2. If provided, UidNo1 must be exactly 3 digits
    if (parts[1] && !/^[0-9]{3}$/.test(UidNo1)) {
      setShowToast({
        error: true,
        label: t("Invalid UID: UidNo1 must be 3 numeric digits")
      });
      return;
    }

    // 3. If provided, UidNo2 must be exactly 3 digits
    if (parts[2] && !/^[0-9]{3}$/.test(UidNo2)) {
      setShowToast({
        error: true,
        label: t("Invalid UID: UidNo2 must be 3 numeric digits")
      });
      return;
    }

    // ---------------- If valid, proceed ----------------
    if (propertyId !== searchPropertyId) {
      setPropertyDetails({ Properties: [] });
      setSearchPropertyId(propertyId);
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
    dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], [input]: value }));
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
  }, [isLoading])

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