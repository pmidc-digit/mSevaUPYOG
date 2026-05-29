import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionBar, SubmitBar, Dropdown, CardLabel, LabelFieldPair, CardSectionHeader, TextInput, Toast } from "@mseva/digit-ui-react-components";
import { 
  UPDATE_NOCNewApplication_FORM,
  UPDATE_NOCNewApplication_CoOrdinates,
  UPDATE_NOC_OwnerIds,
  UPDATE_NOC_OwnerPhotos
} from "../../redux/action/NOCNewApplicationActions";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { formatDateForInput } from "../../utils";

const NewNOCStepFormNocDetails = ({ config, onGoNext }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [provisionalSearchNo, setProvisionalSearchNo] = useState("");
  const [oldNocSearchNo, setOldNocSearchNo] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData?.nocDetails || {};
  });

  const apiData = useSelector(
    (state) => state?.noc?.NOCNewApplicationFormReducer?.formData?.apiData
  );
  const applicationStatus = apiData?.FireNOCs?.[0]?.applicationStatus || apiData?.FireNOCs?.[0]?.fireNOCDetails?.status || "";
  const isSentBack = ["CITIZENACTIONREQUIRED", "SENDBACKTOCITIZEN", "CITIZEN_ACTION_REQUIRED"].includes(applicationStatus) || window.location.href.includes("/edit-application/");

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fireNOCType: currentStepData?.fireNOCType || null,
      firestationId: currentStepData?.firestationId || null,
      provisionalNocNumber: currentStepData?.provisionalNocNumber || "",
      oldFireNocNumber: currentStepData?.oldFireNocNumber || "",
    },
  });

  const selectedNocType = watch("fireNOCType");
  
  let tenantId;
  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else { tenantId = window.localStorage.getItem("Employee.tenant-id"); }


  /* ── Fire Station MDMS ── */
  const stateId = Digit.ULBService.getStateId();
  const { data: fireStationData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "FireStations" }], {
    select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
  });
  const { data: nocTypeOptions = [] } = Digit.Hooks.useCustomMDMS(stateId, "FireNoc", [{ name: "Documents" }], {
  select: (d) =>
    (d?.FireNoc?.Documents || []).map((e) => ({
      code: e.applicationType,
      name: t(`NOC_${e.applicationType}`),
    })),
});

  const fireStationOptions = useMemo(() => {
    if (!fireStationData?.length) return [];
    return fireStationData
      .filter((s) => s.tenantId === tenantId)
      .map((s) => ({ code: s.id, name: s.name || s.id }));
  }, [fireStationData, tenantId]);

  const { data: ulbList } = Digit.Hooks.useTenants();
  const ulbListOptions = useMemo(() => {
    return ulbList?.map((city) => ({
      ...city,
      displayName: t(city.i18nKey),
    }));
  }, [ulbList]);

  const autofillNocData = (nocObject) => {
    if (!nocObject) return;

    const fireNOCDetails = nocObject?.fireNOCDetails || {};
    const applicantDetails = fireNOCDetails?.applicantDetails || {};
    const address = fireNOCDetails?.propertyDetails?.address || {};
    const documents = nocObject?.documents || fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [];
    const coordinates = fireNOCDetails?.additionalDetail?.coordinates || {};
    const ownerPhotoList = fireNOCDetails?.additionalDetail?.ownerPhotos || [];
    const ownerIdList = fireNOCDetails?.additionalDetail?.ownerIds || [];

    const formattedDocuments = {
      documents: {
        documents: documents?.map((doc) => {
          const fileId = doc?.fileStoreId || doc?.filestoreId || doc?.documentUid || doc?.uuid || "";
          return {
            documentType: doc?.documentType || "",
            uuid: doc?.uuid || "",
            documentUid: fileId,
            documentAttachment: fileId,
            filestoreId: fileId,
          };
        }),
      },
    };

    Object.entries(coordinates).forEach(([key, value]) => {
      dispatch(UPDATE_NOCNewApplication_CoOrdinates(key, value));
    });

    dispatch(UPDATE_NOC_OwnerIds("ownerIdList", ownerIdList));
    dispatch(UPDATE_NOC_OwnerPhotos("ownerPhotoList", ownerPhotoList));

    const formattedOwners = fireNOCDetails?.applicantDetails?.owners?.map((owner) => ({
      mobileNumber: owner?.mobileNumber || "",
      name: owner?.name || "",
      gender: owner?.gender ? { code: owner.gender, i18nKey: `COMMON_GENDER_${owner.gender}` } : null,
      dateOfBirth: owner?.dob ? formatDateForInput(new Date(owner.dob)) : "",
      emailId: owner?.emailId || "",
      fatherOrHusbandName: owner?.fatherOrHusbandName || "",
      relationship: owner?.relationship ? { code: owner.relationship.toUpperCase(), i18nKey: `COMMON_RELATION_${owner.relationship.toUpperCase()}` } : null,
      panNo: owner?.pan || owner?.panNo || "",
      address: owner?.correspondenceAddress || "",
    })) || [];

    const ownerShipType = fireNOCDetails?.applicantDetails?.ownerShipType || "";
    const ownerShipMajorType = fireNOCDetails?.applicantDetails?.ownerShipMajorType || ownerShipType.split(".")[0];

    const updatedApplicantDetails = {
      applicantType: ownerShipMajorType ? {
        code: ownerShipMajorType,
        name: `COMMON_MASTERS_OWNERSHIPCATEGORY_${ownerShipMajorType}`,
        i18nKey: ownerShipMajorType,
      } : null,
      applicantSubtype: ownerShipType ? {
        code: ownerShipType,
        name: `COMMON_MASTERS_OWNERSHIPCATEGORY_${ownerShipType.replaceAll(".", "_")}`,
        i18nKey: ownerShipType,
      } : null,
      owners: formattedOwners,
    };

    const selectedCity = ulbListOptions?.find((obj) => obj.code === address?.city) || null;
    const selectedSubDistrictCity = ulbListOptions?.find((obj) => obj.code === address?.subDistrict) || null;
    const districtName = selectedCity ? {
      code: selectedCity?.city?.districtTenantCode,
      name: selectedCity?.city?.districtName || selectedCity?.city?.districtTenantCode,
    } : null;

    const mohallaCode = address?.locality?.code || (typeof address?.locality === "string" ? address?.locality : "") || (address?.areaType?.toUpperCase() !== "RURAL" ? address?.addressLine2 : "") || "";
    const cityNameCode = address?.city || "";
    const i18nkey = cityNameCode && mohallaCode ? `${cityNameCode.toUpperCase().split(".").join("_")}_REVENUE_${mohallaCode}` : "";
    const mohalla = mohallaCode ? {
      code: mohallaCode,
      name: address?.locality?.name || mohallaCode,
      i18nkey: i18nkey,
    } : null;

    const formattedBuildings = fireNOCDetails?.buildings?.map((b) => {
      const heightVal = b?.uoms?.find((u) => u.code === "HEIGHT_OF_BUILDING")?.value || "";
      const floorsVal = b?.uoms?.find((u) => u.code === "NO_OF_FLOORS")?.value || "";
      const basementsVal = b?.uoms?.find((u) => u.code === "NO_OF_BASEMENTS")?.value || "";
      const builtUpAreaVal = b?.uoms?.find((u) => u.code === "BUILTUP_AREA")?.value || "";
      return {
        buildingName: b?.name || "",
        buildingUsageType: b?.usageType ? { code: b.usageType, name: b.usageType } : null,
        buildingUsageSubType: b?.usageSubType ? { code: b.usageSubType, name: b.usageSubType } : null,
        noOfFloors: floorsVal ? { code: String(floorsVal), name: String(floorsVal) } : null,
        noOfBasements: basementsVal ? { code: String(basementsVal), name: String(basementsVal) } : { code: "0", name: "0" },
        heightOfBuilding: heightVal,
        landArea: b?.landArea || "",
        totalCoveredArea: b?.totalCoveredArea || "",
        parkingArea: b?.parkingArea || "",
        leftSurrounding: b?.leftSurrounding || "",
        rightSurrounding: b?.rightSurrounding || "",
        frontSurrounding: b?.frontSurrounding || "",
        backSurrounding: b?.backSurrounding || "",
        groundFloorBuiltupArea: builtUpAreaVal,
      };
    }) || [];

    const getAreaTypeObj = (areaTypeStr) => {
      if (!areaTypeStr) return null;
      const upper = areaTypeStr.toUpperCase();
      if (upper === "URBAN") return { code: "URBAN", name: "Urban" };
      if (upper === "RURAL") return { code: "RURAL", name: "Rural" };
      return { code: upper, name: areaTypeStr };
    };

    const updatedSiteDetails = {
      areaType: getAreaTypeObj(address?.areaType),
      districtName: districtName,
      cityName: selectedSubDistrictCity 
        ? { code: selectedSubDistrictCity.code, name: selectedSubDistrictCity.name || selectedSubDistrictCity.code } 
        : (selectedCity ? { code: selectedCity.code, name: selectedCity.name || selectedCity.code } : null),
      villageName: address?.areaType?.toUpperCase() === "RURAL" ? address?.addressLine2 : "",
      mohalla: mohalla,
      pincode: address?.pincode || "",
      doorHouseNo: address?.doorNo || "",
      streetName: address?.street || "",
      landmarkName: address?.landmark || "",
      propertyId: fireNOCDetails?.propertyDetails?.propertyId || fireNOCDetails?.propertyId || "",
      plotSurveyNo: address?.doorNo || "",
      geoLocation: fireNOCDetails?.propertyDetails?.geoLocation || 
                   (fireNOCDetails?.propertyDetails?.latitude && fireNOCDetails?.propertyDetails?.longitude ? { latitude: Number(fireNOCDetails.propertyDetails.latitude), longitude: Number(fireNOCDetails.propertyDetails.longitude) } : null) ||
                   (address?.latitude && address?.longitude ? { latitude: Number(address.latitude), longitude: Number(address.longitude) } : null) ||
                   (coordinates?.latitude && coordinates?.longitude ? { latitude: Number(coordinates.latitude), longitude: Number(coordinates.longitude) } : null) || null,
      fireStationId: fireNOCDetails?.firestationId || "",
      noOfBuildings: fireNOCDetails?.noOfBuildings || "SINGLE",
      buildings: formattedBuildings,
    };

    dispatch(UPDATE_NOCNewApplication_FORM("applicationDetails", updatedApplicantDetails));
    dispatch(UPDATE_NOCNewApplication_FORM("siteDetails", updatedSiteDetails));
    dispatch(UPDATE_NOCNewApplication_FORM("documents", formattedDocuments));
    dispatch(UPDATE_NOCNewApplication_FORM("uploadedDocuments", { documents: formattedDocuments.documents.documents }));
    dispatch(UPDATE_NOCNewApplication_FORM("apiData", { FireNOCs: [nocObject] }));
  };

  useEffect(() => {
    if (currentStepData?.fireNOCType) {
      setValue("fireNOCType", currentStepData.fireNOCType);
    }
    if (currentStepData?.firestationId) {
      setValue("firestationId", currentStepData.firestationId);
    }
    if (currentStepData?.provisionalNocNumber) {
      setValue("provisionalNocNumber", currentStepData.provisionalNocNumber);
    }
    if (currentStepData?.oldFireNocNumber) {
      setValue("oldFireNocNumber", currentStepData.oldFireNocNumber);
    }
  }, [currentStepData, setValue]);

  // Hook for provisional NOC search
  const {
    data: provisionalData,
    refetch: refetchProvisional,
    isFetching: isFetchingProvisional,
  } = Digit.Hooks.firenoc.useNOCSearchByNumber({
    tenantId,
    filters: { fireNOCNumber: provisionalSearchNo },
    config: { enabled: false },
  });

  // Hook for old NOC search (renewal)
  const {
    data: oldNocData,
    refetch: refetchOldNoc,
    isFetching: isFetchingOldNoc,
  } = Digit.Hooks.firenoc.useNOCSearchByNumber({
    tenantId,
    filters: { fireNOCNumber: oldNocSearchNo },
    config: { enabled: false },
  });

  const hasProvisionalResult = !!currentStepData?.provisionalNocData || !!provisionalData?.FireNOCs?.length;
  const hasOldNocResult = !!currentStepData?.oldNocData || !!oldNocData?.FireNOCs?.length;

  // Handle provisional search response
  useEffect(() => {
    if (provisionalData) {
      if (provisionalData?.FireNOCs?.length > 0) {
        setShowToast({ success: true, message: "NOC_PROVISIONAL_NUMBER_FOUND" });
        const nocObj = provisionalData.FireNOCs[0];
        dispatch(UPDATE_NOCNewApplication_FORM(config.key, {
          ...watch(),
          provisionalNocData: nocObj,
        }));
        autofillNocData(nocObj);
      } else {
        setShowToast({ error: true, message: "NOC_PROVISIONAL_NUMBER_NOT_FOUND" });
      }
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [provisionalData]);

  // Handle old NOC search response
  useEffect(() => {
    if (oldNocData) {
      if (oldNocData?.FireNOCs?.length > 0) {
        setShowToast({ success: true, message: "NOC_OLD_NOC_NUMBER_FOUND" });
        const nocObj = oldNocData.FireNOCs[0];
        dispatch(UPDATE_NOCNewApplication_FORM(config.key, {
          ...watch(),
          oldNocData: nocObj,
        }));
        autofillNocData(nocObj);
      } else {
        setShowToast({ error: true, message: "NOC_OLD_NOC_NUMBER_NOT_FOUND" });
      }
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [oldNocData]);

  const handleProvisionalSearch = () => {
    const nocNumber = watch("provisionalNocNumber");
    if (!nocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_PLEASE_ENTER_PROVISIONAL_NUMBER" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setProvisionalSearchNo(nocNumber.trim());
    setTimeout(() => refetchProvisional(), 0);
  };

  const handleOldNocSearch = () => {
    const nocNumber = watch("oldFireNocNumber");
    if (!nocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_PLEASE_ENTER_OLD_NOC_NUMBER" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setOldNocSearchNo(nocNumber.trim());
    setTimeout(() => refetchOldNoc(), 0);
  };

  const onSubmit = (data) => {
    if (data.fireNOCType?.code === "RENEWAL" && !data.oldFireNocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_OLD_NOC_NUMBER_REQUIRED" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    onGoNext();
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <CardSectionHeader>{t("NOC_NOC_DETAILS_HEADER")}</CardSectionHeader>
          <p style={{ color: "#717171", fontSize: "14px", marginBottom: "16px", marginTop: "-8px" }}>
            {t("After filling the old Firenoc number please click search icon that is next to the filled NoC number")}
          </p>

          <div>
            {/* NOC Type Dropdown */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC Type")}`}<span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="fireNOCType"
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(val) => {
                        props.onChange(val);
                        setValue("provisionalNocNumber", "");
                        setValue("oldFireNocNumber", "");
                      }}
                      selected={props.value}
                      option={nocTypeOptions}
                      optionKey="name"
                      t={t}
                      placeholder={t("NOC_SELECT_NOC_TYPE_PLACEHOLDER")}
                      disable={props.value?.code === "RENEWAL" || props.value === "RENEWAL" || isSentBack}
                    />
                  )}
                />
                {errors?.fireNOCType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.fireNOCType.message}</p>
                )}
              </div>
            </LabelFieldPair>

            {/* Fire Station Dropdown */}
            {/* <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("Fire Station")}<span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="firestationId"
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={props.onChange}
                      selected={props.value}
                      option={fireStationOptions}
                      optionKey="name"
                      t={t}
                      placeholder={t("Select Fire Station")}
                    />
                  )}
                />
                {errors?.firestationId && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.firestationId.message}</p>
                )}
              </div>
            </LabelFieldPair> */}

            {/* Provisional fire NoC number - shown when NEW is selected */}
            {selectedNocType?.code === "NEW" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {t("Provisional fire NoC number")}
                </CardLabel>
                <div className="field" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Controller
                    control={control}
                    name="provisionalNocNumber"
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        placeholder={t("Enter Provisional fire NoC number")}
                        style={{ flex: 1 }}
                        disable={hasProvisionalResult}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleProvisionalSearch}
                    disabled={hasProvisionalResult}
                    style={{
                      background: hasProvisionalResult ? "#ccc" : "linear-gradient(135deg, #2563eb, #1e40af)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 20px",
                      cursor: hasProvisionalResult ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("SEARCH")}
                  </button>
                </div>
              </LabelFieldPair>
            )}

            {/* Old fire NoC number - shown when RENEWAL is selected */}
            {selectedNocType?.code === "RENEWAL" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {t("old fire NoC number")}<span className="requiredField">*</span>
                </CardLabel>
                <div className="field" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Controller
                    control={control}
                    name="oldFireNocNumber"
                    rules={{ required: t("REQUIRED_FIELD") }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        placeholder={t("Enter old fire NoC number")}
                        style={{ flex: 1 }}
                        disable={hasOldNocResult}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleOldNocSearch}
                    disabled={hasOldNocResult}
                    style={{
                      background: hasOldNocResult ? "#ccc" : "linear-gradient(135deg, #2563eb, #1e40af)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 20px",
                      cursor: hasOldNocResult ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("SEARCH")}
                  </button>
                </div>
                {errors?.oldFireNocNumber && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.oldFireNocNumber.message}</p>
                )}
              </LabelFieldPair>
            )}
          </div>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && (
        <Toast
          error={showToast?.error}
          success={showToast?.success}
          label={t(showToast?.message)}
          isDleteBtn={true}
          onClose={() => setShowToast(null)}
        />
      )}
    </React.Fragment>
  );
};

export default NewNOCStepFormNocDetails;
