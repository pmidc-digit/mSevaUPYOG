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
  const isEditScreen = pathname.includes("/modify-application/");
  const tenantId = window.location.href.includes("employee")
    ? Digit.ULBService.getCurrentPermanentCity()
    : localStorage.getItem("CITIZEN.CITY");

  const search = useLocation().search;
  const urlPropertyId = new URLSearchParams(search).get("propertyId");
  const ptFromApi = apiDataCheck?.additionalDetails?.propertyuid;

  const [propertyId, setPropertyId] = useState(formData?.cpt?.id || ptFromApi || "");
  const [searchPropertyId, setSearchPropertyId] = useState(
    formData?.cpt?.id || (urlPropertyId !== "null" ? urlPropertyId : "") || ptFromApi || ""
  );
  const [showToast, setShowToast] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(
    formData?.cpt?.details && Object.keys(formData?.cpt?.details).length > 0
      ? { ...formData?.cpt?.details }
      : {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ keep uidParts splitting
  // const uidParts = searchPropertyId?.split("-") || [];
  // const Uidno = uidParts[0];
  // const Uidno1 = uidParts[1] || "000";
  // const Uidno2 = uidParts[2] || "000";

  // 🔹 Zone mapping effect
  // useEffect(() => {
  //   if (menuList && formData?.cpt?.details?.address?.locality) {
  //     const boundary = menuList?.["egov-location"]?.TenantBoundary?.find(
  //       (item) => item?.hierarchyType?.code === "REVENUE"
  //     )?.boundary;

  //     let ward = {};
  //     const zone = boundary?.children?.find((item) =>
  //       item?.children?.some((children) => {
  //         if (children?.children?.some((child) => child?.code === formData?.cpt?.details?.address?.locality?.code)) {
  //           ward = children;
  //           return true;
  //         }
  //         return false;
  //       })
  //     );

  //     dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], zonalMapping: { zone, ward } }));
  //   }
  // }, [menuList]);

  // 🔹 Update form when propertyDetails changes
  useEffect(() => {
     console.log('useffect b1')
    if (propertyDetails?.propertyId) {
      dispatch(
        UPDATE_NOCNewApplication_FORM(key, {
          ...formData[key],
          details: propertyDetails,
          id: propertyId,
        })
      );
    }
  }, [propertyDetails?.propertyId]);
  const propertyIdInput = {
    label: "PROPERTY_ID",
    type: "text",
    name: "id",
    isMandatory: false
  };

  // 🔹 Search function using Digit.PTService.ludhianaSearch
  const searchProperty = async () => {
    if (!propertyId) {
      setShowToast({ error: true, label: "PT_ENTER_PROPERTY_ID_AND_SEARCH" });
      return;
    }

    const parts = propertyId.split("-");
    const UidNo = parts[0];
    const UidNo1 = parts[1] || "000";
    const UidNo2 = parts[2] || "000";

    // ✅ UID validation logic unchanged
    if (!UidNo || UidNo.length !== 7 || !/^[A-Za-z0-9]{7}$/.test(UidNo)) {
      setShowToast({ error: true, label: t("Invalid UID: UidNo must be 7 alphanumeric characters") });
      return;
    }
    if (parts[1] && !/^[0-9]{3}$/.test(UidNo1)) {
      setShowToast({ error: true, label: t("Invalid UID: UidNo1 must be 3 numeric digits") });
      return;
    }
    if (parts[2] && !/^[0-9]{3}$/.test(UidNo2)) {
      setShowToast({ error: true, label: t("Invalid UID: UidNo2 must be 3 numeric digits") });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await Digit.PTService.ludhianaSearch({
        filters: { ulb: "MCB", uidNo: `${UidNo}-${UidNo1}-${UidNo2}` },
      });

      if (response?.status === "1" && response?.data) {
        const {
          Nameofpropertyowner,
          Nameoffather,
          Mobile,
          Zone,
          Roadname,
          Pincode,
          Fulladdress,
          Uidno,
          Uidno1,
          Uidno2,
          Totalplotareasqyd,
        } = response.data;

        const owners = [
          {
            mobileNumber: Mobile,
            name: Nameofpropertyowner,
            fatherOrHusbandName: Nameoffather,
            isPrimaryOwner: true,
          },
        ];

        const address = {
          street: Roadname,
          pincode: Pincode,
          doorNo: Fulladdress,
        };

        setPropertyDetails({
          propertyId: `${Uidno}-${Uidno1}-${Uidno2}`,
          owners,
          address,
          landArea: Totalplotareasqyd,
        });

        dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], zonalMapping: { zone: Zone } }));
      } else {
        setPropertyDetails({});
        setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
      }
    } catch (err) {
      console.error("Property search failed", err);
      setError(err);
      setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyChange = (e) => {
    setPropertyId(e.target.value);
    // dispatch(UPDATE_NOCNewApplication_FORM(key, { ...formData[key], id: e.target.value }));
  };

  if (isEditScreen) return <React.Fragment />;

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // useEffect(() => {
  //   setApiLoading(isLoading);
  // }, [isLoading]);

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px", marginTop: "20px" }}>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller ndc_card_labels">{t("PROPERTY_ID")}</CardLabel>
          <div
            className="field ndc_property_search"
            style={{ display: "flex", gap: "16px", alignItems: "baseline", width: "100%" }}
            ref={myElementRef}
            id="search-property-field"
          >
            <TextInput
              key={propertyIdInput.name}
              value={propertyId}
              onChange={handlePropertyChange}
              disable={false}
              placeholder={t("PT_PROPERTY_ID_PLACEHOLDER")}
             {...propertyIdInput.validation}
            />

            {!isLoading && (
              <button
                className="submit-bar"
                type="button"
                style={{ color: "white", width: "100%", maxWidth: "100px" }}
                onClick={searchProperty}
              >
                {t("PT_SEARCH")}
              </button>
            )}

            {isLoading && <Loader />}
          </div>
        </LabelFieldPair>

        {showToast && (
          <Toast
            isDleteBtn={true}
            labelstyle={{ width: "100%" }}
            error={showToast.error}
            warning={showToast.warning}
            label={t(showToast.label)}
            onClose={() => setShowToast(null)}
          />
        )}
      </div>
    </React.Fragment>
  );
};
