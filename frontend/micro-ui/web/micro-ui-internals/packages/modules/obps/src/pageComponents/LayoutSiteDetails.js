import React, { useEffect, useState, useRef } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  Dropdown,
  TextArea,
  BreakLine,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  UploadFile,
} from "@mseva/digit-ui-react-components";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

const LayoutSiteDetails = (_props) => {
  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }
  //console.log("tenantId here", tenantId);

  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch } = _props;
  console.log(currentStepData, "DTATA TO BE MAPPED");
  const applicationNo = currentStepData?.applicationNo || watch("applicationNo");
  console.log(applicationNo, "applicationNo in layout site details");
  const isEditMode = !!applicationNo;
  const [netArea, setNetArea] = useState("0.00");
  const AreaLeftForRoadWidening = watch("areaLeftForRoadWidening"); // A = Total Plot Area
  const NetPlotArea = watch("netPlotAreaAfterWidening"); // B = Net Plot Area After Widening

  console.log("STEPERDFATA", currentStepData);

  console.log(isEditMode, "LOOK EDIT");

  /**Start - Floor Area Calculation Logic */
  const [totalArea, setTotalArea] = useState("0.00");
  const [floorAreaExceedsError, setFloorAreaExceedsError] = useState(null);

  const { fields: areaFields, append: addFloor, remove: removeFloor } = useFieldArray({
    control,
    name: "floorArea",
  });

  const floorAreaValues = watch("floorArea");
  const basementAreaValues = watch("basementArea");

  // Watch percentage fields to display calculated values
  const watchedEWSPct = watch("areaUnderEWSInPct");
  const watchedResidentialPct = watch("areaUnderResidentialInPct");
  const watchedCommercialPct = watch("areaUnderCommercialInPct");
  const watchedInstitutionalPct = watch("areaUnderInstitutionalInPct");
  const watchedCommunityCenterPct = watch("areaUnderCommunityCenterInPct");
  const watchedParkPct = watch("areaUnderParkInPct");
  const watchedRoadPct = watch("areaUnderRoadInPct");
  const watchedParkingPct = watch("areaUnderParkingInPct");
  const watchedOtherAmenitiesPct = watch("areaUnderOtherAmenitiesInPct");

  useEffect(() => {
    const sum = floorAreaValues?.reduce((acc, item) => {
      const numericValue = Number.parseFloat(item?.value);
      return acc + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const numericBasementArea = isNaN(basementAreaValues) ? 0 : basementAreaValues;
    const finalSum = (sum + Number.parseFloat(numericBasementArea)).toFixed(2);
    const balanceArea = parseFloat(netArea) || 0;
    
    setTotalArea(finalSum);
    setValue("totalFloorArea", finalSum);

    // Validate that total floor area doesn't exceed balance area (C)
    if (parseFloat(finalSum) > balanceArea) {
      setFloorAreaExceedsError(`Total floor area (${finalSum} Sq M) cannot exceed balance area (${balanceArea.toFixed(2)} Sq M)`);
    } else {
      setFloorAreaExceedsError(null);
    }
  }, [floorAreaValues, basementAreaValues, setValue, netArea]);

  /**Start - ULB Name and Type caculation logic */

  const [ulbName, setUlbName] = useState(currentStepData?.siteDetails?.ulbName || null);
  const [ulbType, setUlbType] = useState(currentStepData?.siteDetails?.ulbType || "");
  const [buildingStatus, setBuildingStatus] = useState(currentStepData?.siteDetails?.buildingStatus || null);

  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.obps.useLayoutBuildingType(stateId);
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.obps.useLayoutRoadType(stateId);

  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  useEffect(() => {
    const a = parseFloat(AreaLeftForRoadWidening); // A = Total Plot Area
    const b = parseFloat(NetPlotArea); // B = Net Plot Area After Widening

    const sum = ((isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b)).toFixed(2); // C = A - B = Balance Area

    setNetArea(sum);
    setValue("netTotalArea", sum);
  }, [NetPlotArea, AreaLeftForRoadWidening, setValue]);

  useEffect(() => {
    if (ulbName) {
      const ulbTypeFormatted = ulbName?.city?.ulbType;
      setUlbType(ulbTypeFormatted);
      setValue("ulbType", ulbTypeFormatted);
    }
  }, [ulbName, setValue]);

  // Auto-fetch ULB Name based on tenantId if not already set
  useEffect(() => {
    if (!isEditMode && ulbList && ulbList.length > 0 && !currentStepData?.siteDetails?.ulbName) {
      const matchedULB = ulbList.find((ulb) => ulb.code === tenantId);
      if (matchedULB) {
        setUlbName(matchedULB);
        setValue("ulbName", matchedULB);
      }
    }
  }, [ulbList, tenantId, isEditMode, currentStepData?.siteDetails?.ulbName, setValue]);

  // Watch all SqM fields for auto-calculation of percentages
  const areaUnderEWSInSqM = watch("areaUnderEWSInSqM");
  const areaUnderResidentialUseInSqM = watch("areaUnderResidentialUseInSqM");
  const areaUnderCommercialUseInSqM = watch("areaUnderCommercialUseInSqM");
  const areaUnderInstutionalUseInSqM = watch("areaUnderInstutionalUseInSqM");
  const areaUnderCommunityCenterInSqM = watch("areaUnderCommunityCenterInSqM");
  const areaUnderParkInSqM = watch("areaUnderParkInSqM");
  const areaUnderRoadInSqM = watch("areaUnderRoadInSqM");
  const areaUnderParkingInSqM = watch("areaUnderParkingInSqM");
  const areaUnderOtherAmenitiesInSqM = watch("areaUnderOtherAmenitiesInSqM");
  const watchedNetArea = watch("netTotalArea");

  // Auto-calculate percentage fields from SqM fields and netSiteArea sum
  useEffect(() => {
    const netArea = parseFloat(watchedNetArea) || 0;
    
    // Calculate sum of all 9 area categories (netSiteArea = 1+2+3+4+5+6+7+8+9)
    const ews = parseFloat(areaUnderEWSInSqM) || 0;
    const residential = parseFloat(areaUnderResidentialUseInSqM) || 0;
    const commercial = parseFloat(areaUnderCommercialUseInSqM) || 0;
    const institutional = parseFloat(areaUnderInstutionalUseInSqM) || 0;
    const communityCenter = parseFloat(areaUnderCommunityCenterInSqM) || 0;
    const park = parseFloat(areaUnderParkInSqM) || 0;
    const road = parseFloat(areaUnderRoadInSqM) || 0;
    const parking = parseFloat(areaUnderParkingInSqM) || 0;
    const otherAmenities = parseFloat(areaUnderOtherAmenitiesInSqM) || 0;
    
    const totalAreaSum = (ews + residential + commercial + institutional + communityCenter + park + road + parking + otherAmenities).toFixed(2);
    setValue("netSiteArea", totalAreaSum);
    
    if (netArea > 0) {
      const calculatePercentage = (sqmValue) => {
        const val = parseFloat(sqmValue) || 0;
        return ((val / netArea) * 100).toFixed(2);
      };

      setValue("areaUnderEWSInPct", calculatePercentage(areaUnderEWSInSqM));
      setValue("areaUnderResidentialUseInPct", calculatePercentage(areaUnderResidentialUseInSqM));
      setValue("areaUnderCommercialUseInPct", calculatePercentage(areaUnderCommercialUseInSqM));
      setValue("areaUnderInstutionalUseInPct", calculatePercentage(areaUnderInstutionalUseInSqM));
      setValue("areaUnderCommunityCenterInPct", calculatePercentage(areaUnderCommunityCenterInSqM));
      setValue("areaUnderParkInPct", calculatePercentage(areaUnderParkInSqM));
      setValue("areaUnderRoadInPct", calculatePercentage(areaUnderRoadInSqM));
      setValue("areaUnderParkingInPct", calculatePercentage(areaUnderParkingInSqM));
      setValue("areaUnderOtherAmenitiesInPct", calculatePercentage(areaUnderOtherAmenitiesInSqM));
    }
  }, [
    areaUnderEWSInSqM,
    areaUnderResidentialUseInSqM,
    areaUnderCommercialUseInSqM,
    areaUnderInstutionalUseInSqM,
    areaUnderCommunityCenterInSqM,
    areaUnderParkInSqM,
    areaUnderRoadInSqM,
    areaUnderParkingInSqM,
    areaUnderOtherAmenitiesInSqM,
    watchedNetArea,
    setValue,
  ]);

  // <CHANGE> Set default district based on tenantId like NOC form

  /**Start - District and Zone caculation logic */
  const [isBasementAreaAvailable, setIsBasementAreaAvailable] = useState(currentStepData?.siteDetails?.isBasementAreaAvailable || null);

  const options = [
    {
      code: "YES",
      i18nKey: "YES",
    },
    {
      code: "NO",
      i18nKey: "NO",
    },
  ];

  const allCities = Digit.Hooks.obps.useTenants();
  const [cities, setcitiesopetions] = useState(allCities);
  const [selectedCity, setSelectedCity] = useState(currentStepData?.siteDetails?.district || null);
  const [localities, setLocalities] = useState([]);
  const [isDistrictInitialized, setIsDistrictInitialized] = useState(false);

  // Zone dropdown from MDMS (like CLU) - REMOVED
  // const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{name:"zoneMaster",filter: `$.[?(@.tanentId == '${tenantId}')]`}]);

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity?.code,
    },
    t
  );

  useEffect(() => {
    if (fetchedLocalities?.length > 0) {
      setLocalities(fetchedLocalities);
    }
  }, [fetchedLocalities]);

  // Only clear localities when user manually changes district (not on initial load)
  const prevSelectedCityRef = useRef(selectedCity);
  useEffect(() => {
    if (isDistrictInitialized && prevSelectedCityRef.current?.code !== selectedCity?.code) {
      setLocalities([]);
      setValue("zone", null);
    }
    prevSelectedCityRef.current = selectedCity;
  }, [selectedCity, setValue, isDistrictInitialized]);

  // <CHANGE> Auto-select district based on login tenantId (not ULB)
  useEffect(() => {
    // Skip if already initialized or if currentStepData has district
    if (isDistrictInitialized) return;

    // First priority: restore from currentStepData
    if (currentStepData?.siteDetails?.district) {
      setSelectedCity(currentStepData.siteDetails.district);
      setValue("district", currentStepData.siteDetails.district);
      setIsDistrictInitialized(true);
      return;
    }

    // Second priority: auto-select based on tenantId
    if (tenantId && allCities?.length > 0) {
      const defaultCity = allCities.find((city) => city.code === tenantId);
      console.log(defaultCity, "DDDDD");
      if (defaultCity) {
        setSelectedCity(defaultCity);
        setValue("district", defaultCity);
        setIsDistrictInitialized(true);
      }
    }
  }, [tenantId, allCities, currentStepData, isDistrictInitialized]);

  const { data: buildingCategory, isLoading: isBuildingCategoryLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);
  const { data: mdmsData, isLoading: mdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);

  const schemeTypeOptions = mdmsData?.BPA?.LayoutType?.[0]?.schemeType || [];

  const [selectedBuildingCategory, setSelectedBuildingCategory] = useState(currentStepData?.siteDetails?.buildingCategory || null);

  useEffect(() => {
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key !== "floorArea") {
          setValue(key, value);
        }
      });

      // Set state variables to ensure dropdowns are pre-filled
      if (formattedData.buildingStatus) {
        setBuildingStatus(formattedData.buildingStatus);
      }
      if (formattedData.buildingCategory) {
        setSelectedBuildingCategory(formattedData.buildingCategory);
      }
      if (formattedData.ulbName) {
        setUlbName(formattedData.ulbName);
      }
      if (formattedData.isBasementAreaAvailable) {
        setIsBasementAreaAvailable(formattedData.isBasementAreaAvailable);
      }
      if (formattedData.district) {
        setSelectedCity(formattedData.district);
      }

      if (Array.isArray(formattedData.floorArea) && formattedData.floorArea.length > 0) {
        for (let i = areaFields.length - 1; i >= 0; i--) {
          removeFloor(i);
        }
        formattedData.floorArea.forEach((item) => {
          addFloor({ value: item.value || item || "" });
        });
      }
    }
  }, []);

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{t("BPA_SITE_DETAILS")}</CardSectionHeader>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="plotNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 200,
                    message: t("MAX_200_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.plotNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.plotNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("BPA_PROPOSED_SITE_ADDRESS")} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="proposedSiteAddress"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 200,
                    message: t("MAX_200_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextArea
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.proposedSiteAddress && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.proposedSiteAddress.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ULB_NAME_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            {!isUlbListLoading && (
              <Controller
                control={control}
                name={"ulbName"}
                rules={{ required: t("REQUIRED_FIELD") }}
                defaultValue={ulbName}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={ulbListOptions}
                    optionKey="name"
                    t={t}
                    disable="true"
                  />
                )}
              />
            )}
            {errors?.ulbName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.ulbName.message}</p>}
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ULB_TYPE_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="ulbType"
                defaultValue=""
                render={(props) => (
                  <TextInput
                    value={ulbType || props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />
            </div>
          </LabelFieldPair>

          {/* District - Non-editable, auto-fetched from tenantId */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_DISTRICT_LABEL")}`}<span className="requiredField">*</span></CardLabel>
            <Controller 
              control={control}
              name={"district"}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                  <TextInput
                    className="form-field"
                    value={selectedCity?.city?.districtName || selectedCity?.districtName || props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
              )}
            />
          </LabelFieldPair>
          {errors?.district && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.district.message}</p>}

          {/* Ward No */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_WARD_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="wardNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.wardNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.wardNo.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Khatuni No */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_KHATUNI_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khanutiNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextArea
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.khanutiNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.khanutiNo.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Village Name */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_VILLAGE_NAME_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="villageName"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.villageName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.villageName.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_KHASRA_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khasraNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextArea
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.khasraNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.khasraNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_HADBAST_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="hadbastNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),

                  maxLength: {
                    value: 200,
                    message: t("MAX_200_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.hadbastNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.hadbastNo.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Vasika Number */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_VASIKA_NUMBER_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaNumber"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.vasikaNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.vasikaNumber.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Vasika Date */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_VASIKA_DATE_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaDate"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <TextInput
                    type="date"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />
              {errors?.vasikaDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.vasikaDate.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_TYPE_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              {!isRoadTypeLoading && (
                <Controller
                  control={control}
                  name={"roadType"}
                  defaultValue={
                    currentStepData?.siteDetails?.roadType || currentStepData?.apiData?.layoutDetails?.additionalDetails?.siteDetails?.roadType || ""
                  }
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                    <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" t={t} />
                  )}
                />
              )}
              {errors?.roadType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.roadType.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Is Area Under Master Plan - Yes/No Dropdown */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_IS_AREA_UNDER_MASTER_PLAN_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <Controller
              control={control}
              name={"isAreaUnderMasterPlan"}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={options}
                  optionKey="i18nKey"
                  t={t}
                />
              )}
            />
          </LabelFieldPair>
          {errors?.isAreaUnderMasterPlan && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.isAreaUnderMasterPlan.message}</p>}

          {/* SECTION: Area Calculation (A-B=C) */}
          <CardSectionHeader>{t("BPA_AREA_CALCULATION_LABEL")}</CardSectionHeader>

          {/* <CHANGE> Add Area Left For Road Widening field (A) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_PLOT_AREA_LABEL_A")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaLeftForRoadWidening"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable={currentStepData?.apiData?.applicationNo ? true : false}
                  />
                )}
              />

              {errors?.areaLeftForRoadWidening && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaLeftForRoadWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* <CHANGE> Add Net Plot Area After Widening field (B) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_AREA_ROAD_WIDENING_LABEL_B")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netPlotAreaAfterWidening"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable={currentStepData?.apiData?.applicationNo ? true : false}
                  />
                )}
              />

              {errors?.netPlotAreaAfterWidening && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.netPlotAreaAfterWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          {/* <CHANGE> Add Net Total Area field (A+B) - disabled/readonly */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_TOTAL_AREA_LABEL_A-B")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netTotalArea"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                defaultValue={netArea}
                render={(props) => (
                  <TextInput
                    value={netArea} // <CHANGE> Use netArea state directly like NOC
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disabled="true" // <CHANGE> Use disabled instead of disable
                  />
                )}
              />

              {errors?.netTotalArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.netTotalArea.message}</p>}
            </div>
          </LabelFieldPair>

          {/* <CHANGE> Remove old areaLeftForRoadWidening, netPlotAreaAfterWidening fields if they exist elsewhere */}

          {errors?.areaLeftForRoadWidening && (
            <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaLeftForRoadWidening.message}</p>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_WIDTH_AT_SITE_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="roadWidthAtSite"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.roadWidthAtSite && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.roadWidthAtSite.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_STATUS_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              {!isBuildingTypeLoading && (
                <Controller
                  control={control}
                  name={"buildingStatus"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  defaultValue={currentStepData?.siteDetails?.layoutNonSchemeType || null}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        setBuildingStatus(e);
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={buildingType}
                      optionKey="name"
                      disable={isEditMode}
                      t={t}
                    />
                  )}
                />
              )}
              {errors?.buildingStatus && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.buildingStatus.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_CATEGORY_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              {!isBuildingCategoryLoading && buildingCategory.length > 0 && (
                <Controller
                  control={control}
                  name={"buildingCategory"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  defaultValue={
                    currentStepData?.siteDetails?.buildingCategory ||
                    currentStepData?.apiData?.layoutDetails?.additionalDetails?.siteDetails?.buildingCategory ||
                    ""
                  }
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(e) => {
                        setSelectedBuildingCategory(e);
                        props.onChange(e);
                      }}
                      selected={props.value}
                      option={buildingCategory}
                      optionKey="name"
                      t={t}
                      disable={currentStepData?.apiData?.Clu?.applicationNo ? true : false}
                    />
                  )}
                />
              )}
              {errors?.buildingCategory && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.buildingCategory.message}</p>}
            </div>
          </LabelFieldPair>

          {(selectedBuildingCategory?.name?.toLowerCase().includes("residential") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("residential") && <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderResidentialUseInSqM"
                    defaultValue=""
                    rules={{
                      required: selectedBuildingCategory?.name?.toLowerCase().includes("residential") ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !selectedBuildingCategory?.name?.toLowerCase().includes("residential") || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                      />
                    )}
                  />

                  {errors?.areaUnderResidentialUseInSqM && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderResidentialUseInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("residential") && <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderResidentialUseInPct"
                    rules={{
                      required: selectedBuildingCategory?.name?.toLowerCase().includes("residential") ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !selectedBuildingCategory?.name?.toLowerCase().includes("residential") || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedResidentialPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        disable="true"
                      />
                    )}
                  />

                  {errors?.areaUnderResidentialUseInPct && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderResidentialUseInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          {(selectedBuildingCategory?.name?.toLowerCase().includes("commercial") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("commercial") && <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommercialUseInSqM"
                    defaultValue=""
                    rules={{
                      required: selectedBuildingCategory?.name?.toLowerCase().includes("commercial") ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !selectedBuildingCategory?.name?.toLowerCase().includes("commercial") || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                      />
                    )}
                  />

                  {errors?.areaUnderCommercialUseInSqM && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderCommercialUseInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("commercial") && <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommercialUseInPct"
                    rules={{
                      required: selectedBuildingCategory?.name?.toLowerCase().includes("commercial") ? t("REQUIRED_FIELD") : false,
                      validate: (value) => {
                        if (!value) return !selectedBuildingCategory?.name?.toLowerCase().includes("commercial") || t("REQUIRED_FIELD");
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedCommercialPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        disable="true"
                      />
                    )}
                  />

                  {errors?.areaUnderCommercialUseInPct && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderCommercialUseInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          {(selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
            selectedBuildingCategory?.name?.toLowerCase().includes("warehouse") ||
            selectedBuildingCategory?.name?.toLowerCase().includes("institutional") ||
            !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL")}`}
                  {(selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                    selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")) &&
                    <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderInstutionalUseInSqM"
                    defaultValue=""
                    rules={{
                      required:
                        selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                        selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")
                          ? t("REQUIRED_FIELD")
                          : false,
                      validate: (value) => {
                        if (!value)
                          return (
                            !(
                              selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                              selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")
                            ) || t("REQUIRED_FIELD")
                          );
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                      />
                    )}
                  />

                  {errors?.areaUnderInstutionalUseInSqM && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderInstutionalUseInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL")}`}
                  {(selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                    selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")) &&
                    <span className="requiredField">*</span>}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderInstutionalUseInPct"
                    rules={{
                      required:
                        selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                        selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")
                          ? t("REQUIRED_FIELD")
                          : false,
                      validate: (value) => {
                        if (!value)
                          return (
                            !(
                              selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                              selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")
                            ) || t("REQUIRED_FIELD")
                          );
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedInstitutionalPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        disable="true"
                      />
                    )}
                  />

                  {errors?.areaUnderInstutionalUseInPct && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderInstutionalUseInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TYPE_OF_SCHEME_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              {!mdmsLoading && (
                <Controller
                  control={control}
                  name={"schemeType"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={props.onChange}
                      selected={props.value}
                      option={schemeTypeOptions}
                      optionKey="name"
                      t={t}
                      disable={isEditMode}
                    />
                  )}
                />
              )}
              {errors?.schemeType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.schemeType.message}</p>}
            </div>
          </LabelFieldPair>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_IS_BASEMENT_AREA_PRESENT_LABEL")}`} <span className="requiredField">*</span></CardLabel>
              <Controller
                control={control}
                name={"isBasementAreaAvailable"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setIsBasementAreaAvailable(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={options}
                    optionKey="i18nKey"
                    t={t}
                  />
                )}
              />
            </LabelFieldPair>
          )}
          {errors?.isBasementAreaAvailable && (
            <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.isBasementAreaAvailable.message}</p>
          )}

          {buildingStatus?.code === "BUILTUP" && isBasementAreaAvailable?.code === "YES" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_BASEMENT_AREA_LABEL")}`} <span className="requiredField">*</span></CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="basementArea"
                  defaultValue=""
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                    },
                    maxLength: {
                      value: 100,
                      message: t("MAX_100_CHARACTERS_ALLOWED"),
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                    />
                  )}
                />
                {errors?.basementArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.basementArea.message}</p>}
              </div>
            </LabelFieldPair>
          )}

          {/* SECTION: Floor Details */}
          {buildingStatus?.code === "BUILTUP" && <CardSectionHeader>{t("BPA_FLOOR_DETAILS_LABEL")}</CardSectionHeader>}

          {buildingStatus?.code === "BUILTUP" &&
            areaFields.map((field, index) => (
              <div key={field.id} style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <CardLabel className="card-label-smaller">{index === 0 ? "Ground" : `${index}`} Floor Area <span className="requiredField">*</span></CardLabel>
                <div className="field" style={{ display: "flex", gap: "10px" }}>
                  <Controller
                    control={control}
                    name={`floorArea.${index}.value`}
                    defaultValue={field.value}
                    rules={{
                      required: t("REQUIRED_FIELD"),
                      pattern: {
                        value: /^[0-9]*\.?[0-9]+$/,
                        message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                      },
                      maxLength: {
                        value: 100,
                        message: t("MAX_100_CHARACTERS_ALLOWED"),
                      },
                      validate: (value) => {
                        const floorValue = parseFloat(value) || 0;
                        const balanceArea = parseFloat(netArea) || 0;
                        // Check if any single floor exceeds balance area
                        if (floorValue > balanceArea) {
                          const floorName = index === 0 ? "Ground" : `${index}`;
                          return `${floorName} floor area cannot exceed balance area (${balanceArea.toFixed(2)} Sq M)`;
                        }
                        return true;
                      },
                    }}
                    render={(props) => (
                      <React.Fragment>
                        <TextInput
                          value={props.value}
                          onChange={(e) => {
                            props.onChange(e.target.value);
                          }}
                          onBlur={(e) => {
                            props.onBlur(e);
                          }}
                        />

                        {errors?.floorArea?.[index]?.value && (
                          <CardLabelError className={errorStyle}>{errors.floorArea[index].value.message}</CardLabelError>
                        )}
                      </React.Fragment>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => removeFloor(index)}
                    style={{
                     
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

          {buildingStatus?.code === "BUILTUP" && (
            <button
              type="button"
              onClick={() => addFloor({ value: "" })}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Add Floor
            </button>
          )}

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_FLOOR_AREA_LABEL")}`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="totalFloorArea"
                  defaultValue={totalArea}
                  rules={{
                    pattern: {
                      value: /^[0-9]*\.?[0-9]+$/,
                      message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                    },
                    maxLength: {
                      value: 200,
                      message: t("MAX_200_CHARACTERS_ALLOWED"),
                    },
                  }}
                  render={(props) => (
                    <TextInput
                      value={props.value}
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      disable="true"
                    />
                  )}
                />
                {floorAreaExceedsError ? (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{floorAreaExceedsError}</p>
                ) : (
                  <p style={{ color: "green", marginTop: "4px", marginBottom: "0" }}>✓ Total floor area is within balance area</p>
                )}
              </div>
            </LabelFieldPair>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_WARD_NO_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="wardNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.wardNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.wardNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_DISTRICT_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"district"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setSelectedCity(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={cities.sort((a, b) => a.name.localeCompare(b.name))}
                    optionKey="name"
                    disable="true"
                    t={t}
                  />
                )}
              />
              {errors?.district && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.district.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ZONE_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"zone"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown 
                    className="form-field" 
                    select={props.onChange} 
                    selected={props.value} 
                    option={localities} 
                    optionKey="code" 
                    t={t} 
                  />
                )}
              />
              {errors?.zone && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.zone.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="totalAreaUnderLayout"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    if (!value) return false;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.totalAreaUnderLayout && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.totalAreaUnderLayout.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_WIDENING_IN_SQ_M_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadWidening"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    if (!value) return false;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderRoadWidening && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderRoadWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netSiteArea"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    if (!value) return false;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.netSiteArea && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.netSiteArea.message}</p>}
            </div>
          </LabelFieldPair>

          {/* SECTION: Area Distribution across 9 Categories */}
          <CardSectionHeader>{t("BPA_AREA_DISTRIBUTION_LABEL")}</CardSectionHeader>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_EWS_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderEWSInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderEWSInSqM && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderEWSInSqM.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderEWSInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedEWSPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BALANCE_AREA_IN_SQ_M_LABEL")}`} <span className="requiredField">*</span></CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="balanceAreaInSqM"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    if (!value) return false;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.balanceAreaInSqM && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.balanceAreaInSqM.message}</p>}
            </div>
          </LabelFieldPair>

          {(selectedBuildingCategory?.name?.toLowerCase().includes("community") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL")}`}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommunityCenterInSqM"
                    defaultValue=""
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const regex = /^\d+(\.\d{1,2})?$/;
                        return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                      />
                    )}
                  />

                  {errors?.areaUnderCommunityCenterInSqM && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderCommunityCenterInSqM.message}</p>
                  )}
                </div>
              </LabelFieldPair>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL")}`}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommunityCenterInPct"
                    rules={{
                      validate: (value) => {
                        if (!value) return true;
                        const regex = /^\d+(\.\d{1,2})?$/;
                        const isValidFormat = regex.test(value);
                        const isWithinRange = Number.parseFloat(value) <= 100;
                        if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                        if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                        return true;
                      },
                    }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={watchedCommunityCenterPct || ""}
                        onChange={(e) => {
                          props.onChange(e.target.value);
                        }}
                        onBlur={(e) => {
                          props.onBlur(e);
                        }}
                        disable="true"
                      />
                    )}
                  />

                  {errors?.areaUnderCommunityCenterInPct && (
                    <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderCommunityCenterInPct.message}</p>
                  )}
                </div>
              </LabelFieldPair>
            </React.Fragment>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderParkInSqM && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderParkInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedParkPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />

              {errors?.areaUnderParkInPct && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderParkInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderRoadInSqM && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderRoadInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedRoadPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />

              {errors?.areaUnderRoadInPct && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderRoadInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderParkingInSqM && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderParkingInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedParkingPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />

              {errors?.areaUnderParkingInPct && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderParkingInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInSqM"
                defaultValue=""
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    return regex.test(value) || t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                  />
                )}
              />

              {errors?.areaUnderOtherAmenitiesInSqM && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderOtherAmenitiesInSqM.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = Number.parseFloat(value) <= 100;
                    if (!isValidFormat) return t("ONLY_NUMBERS_UPTO_TWO_DECIMALS_ALLOWED");
                    if (!isWithinRange) return t("VALUE_SHOULD_BE_LESS_THAN_OR_EQUAL_TO_100");
                    return true;
                  },
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={watchedOtherAmenitiesPct || ""}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disable="true"
                  />
                )}
              />

              {errors?.areaUnderOtherAmenitiesInPct && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}> {errors.areaUnderOtherAmenitiesInPct.message}</p>
              )}
            </div>
          </LabelFieldPair>
        </div>
        <BreakLine />
        {}
      </div>
    </React.Fragment>
  );
};

export default LayoutSiteDetails;
