import React, { useEffect, useState } from "react";
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
  CardLabelError,
  UploadFile,
} from "@mseva/digit-ui-react-components";

const LayoutSiteDetails = (_props) => {
  let tenantId;
    if(window.location.pathname.includes("employee")){
    tenantId = window.localStorage.getItem("Employee.tenant-id");
    }else{
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
    }
  //console.log("tenantId here", tenantId);

  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch } = _props;

  const applicationNo = currentStepData?.applicationNo || watch("applicationNo");
  console.log(applicationNo, "applicationNo in layout site details");
  const isEditMode = !!applicationNo;
  const [netArea, setNetArea] = useState("0.00");
  const NetPlotArea = watch("netPlotAreaAfterWidening");
  const AreaLeftForRoadWidening = watch("areaLeftForRoadWidening");

  /**Start - Floor Area Calculation Logic */
  const [totalArea, setTotalArea] = useState("0.00");

  const { fields: areaFields, append: addFloor, remove: removeFloor } = useFieldArray({
    control,
    name: "floorArea",
  });

  const floorAreaValues = watch("floorArea");
  const basementAreaValues = watch("basementArea");

  useEffect(() => {
    const sum = floorAreaValues?.reduce((acc, item) => {
      const numericValue = Number.parseFloat(item?.value);
      return acc + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const numericBasementArea = isNaN(basementAreaValues) ? 0 : basementAreaValues;
    const finalSum = (sum + Number.parseFloat(numericBasementArea)).toFixed(2);
    setTotalArea(finalSum);

    setValue("totalFloorArea", finalSum);
  }, [floorAreaValues, basementAreaValues, setValue]);

  /**Start - ULB Name and Type caculation logic */

  const [ulbName, setUlbName] = useState(currentStepData?.siteDetails?.ulbName || null);
  const [ulbType, setUlbType] = useState(currentStepData?.siteDetails?.ulbType || "");
  const [buildingStatus, setBuildingStatus] = useState(currentStepData?.siteDetails?.buildingStatus || null);

  const { data: buildingType, isLoading: isBuildingTypeLoading } = Digit.Hooks.noc.useBuildingType(stateId);
  const { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.noc.useRoadType(stateId);

  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  useEffect(() => {
    const a = parseFloat(NetPlotArea);
    const b = parseFloat(AreaLeftForRoadWidening);

    const sum = ((isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)).toFixed(2);

    setNetArea(sum);
    setValue("netTotalArea", sum);
  }, [NetPlotArea, AreaLeftForRoadWidening]);

  useEffect(() => {
    if (ulbName) {
      const ulbTypeFormatted = ulbName?.city?.ulbType;
      setUlbType(ulbTypeFormatted);
      setValue("ulbType", ulbTypeFormatted);
    }
  }, [ulbName, setValue]);

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

  const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
    selectedCity?.code,
    "revenue",
    {
      enabled: !!selectedCity,
    },
    t
  );

  useEffect(() => {
    if (fetchedLocalities?.length > 0) {
      setLocalities(fetchedLocalities);
    }
  }, [fetchedLocalities]);

  useEffect(() => {
    setLocalities([]);
    setValue("zone", null);
  }, [selectedCity, setValue]);

  // <CHANGE> Auto-select district based on login tenantId (not ULB)
 useEffect(() => {
  if (tenantId && allCities?.length > 0) {
    const defaultCity = allCities.find((city) => city.code === tenantId);
    console.log(defaultCity, 'DDDDD');
    if (defaultCity) {
      setSelectedCity(defaultCity);
      setValue("district", defaultCity); // sets default in react-hook-form
    }
  }
}, [tenantId, allCities]);

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
            <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="plotNo"
                defaultValue=""
                rules={{
                required: t("REQUIRED_FIELD"),
                // <CHANGE> Add pattern validation for numeric values
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.plotNo ? errors.plotNo.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("BPA_PROPOSED_SITE_ADDRESS")}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.proposedSiteAddress ? errors.proposedSiteAddress.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ULB_NAME_LABEL")}`}*</CardLabel>
            {!isUlbListLoading && (
              <Controller
                control={control}
                name={"ulbName"}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      setUlbName(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={ulbListOptions}
                    optionKey="displayName"
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.ulbName ? errors.ulbName.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ULB_TYPE_LABEL")}`}*</CardLabel>
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

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_KHASRA_NO_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.khasraNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_HADBAST_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="hadbastNo"
                defaultValue=""
                rules={{
                  required: t("REQUIRED_FIELD"),
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
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.hadbastNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_TYPE_LABEL")}`}*</CardLabel>
            {!isRoadTypeLoading && (
              <Controller
                control={control}
                name={"roadType"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.roadType?.message || ""}</CardLabelError>

          <CardLabelError style={errorStyle}>{errors?.roadType?.message || ""}</CardLabelError>

          {/* <CHANGE> Add Area Left For Road Widening field (A) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaLeftForRoadWidening"
                defaultValue=""
                rules={{
<<<<<<< HEAD
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
                  },
=======
                   pattern: {
                  value: /^[0-9]*\.?[0-9]+$/,
                  message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                },
                maxLength: {
                  value: 200,
                  message: t("MAX_200_CHARACTERS_ALLOWED"),
                },
>>>>>>> 10821ee6c24e40c17b8def866d8eda66c92f8fad
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaLeftForRoadWidening?.message || ""}</CardLabelError>

          {/* <CHANGE> Add Net Plot Area After Widening field (B) */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")}`}*</CardLabel>
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
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.netPlotAreaAfterWidening?.message || ""}</CardLabelError>

          {/* <CHANGE> Add Net Total Area field (A+B) - disabled/readonly */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_TOTAL_AREA_LABEL")}`}</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.netTotalArea?.message || ""}</CardLabelError>

          {/* <CHANGE> Remove old areaLeftForRoadWidening, netPlotAreaAfterWidening fields if they exist elsewhere */}

          <CardLabelError style={errorStyle}>{errors?.areaLeftForRoadWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_WIDTH_AT_SITE_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.roadWidthAtSite ? errors.roadWidthAtSite.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_STATUS_LABEL")}`}*</CardLabel>
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
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.buildingStatus?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_CATEGORY_LABEL")}`}*</CardLabel>
            {!isBuildingCategoryLoading && buildingCategory.length > 0 && (
              <Controller
                control={control}
                name={"buildingCategory"}
                rules={{ required: t("REQUIRED_FIELD") }}
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
                    disable={isEditMode}
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.buildingCategory?.message || ""}</CardLabelError>

          {(selectedBuildingCategory?.name?.toLowerCase().includes("residential") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("residential") && "*"}
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderResidentialUseInSqM?.message || ""}</CardLabelError>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("residential") && "*"}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderResidentialUseInPct"
                    defaultValue=""
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderResidentialUseInPct?.message || ""}</CardLabelError>
            </React.Fragment>
          )}

          {(selectedBuildingCategory?.name?.toLowerCase().includes("commercial") || !selectedBuildingCategory) && (
            <React.Fragment>
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("commercial") && "*"}
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderCommercialUseInSqM?.message || ""}</CardLabelError>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL")}`}
                  {selectedBuildingCategory?.name?.toLowerCase().includes("commercial") && "*"}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommercialUseInPct"
                    defaultValue=""
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderCommercialUseInPct?.message || ""}</CardLabelError>
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
                    "*"}
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderInstutionalUseInSqM?.message || ""}</CardLabelError>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {`${t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL")}`}
                  {(selectedBuildingCategory?.name?.toLowerCase().includes("industrial") ||
                    selectedBuildingCategory?.name?.toLowerCase().includes("warehouse")) &&
                    "*"}
                </CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderInstutionalUseInPct"
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderInstutionalUseInPct?.message || ""}</CardLabelError>
            </React.Fragment>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SCHEME_TYPE_LABEL")}`}*</CardLabel>
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
                    disable={isEditMode}
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.schemeType?.message || ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_IS_BASEMENT_AREA_PRESENT_LABEL")}`} *</CardLabel>
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
                  />
                )}
              />
            </LabelFieldPair>
          )}
          <CardLabelError style={errorStyle}>{errors?.isBasementAreaAvailable?.message || ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" && isBasementAreaAvailable?.code === "YES" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_BASEMENT_AREA_LABEL")}`}*</CardLabel>
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
              </div>
            </LabelFieldPair>
          )}
          <CardLabelError style={errorStyle}>{errors?.basementArea ? errors.basementArea.message : ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" &&
            areaFields.map((field, index) => (
              <div key={field.id} style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <CardLabel className="card-label-smaller">{index === 0 ? "Ground" : `${index}`} Floor Area*</CardLabel>
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
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      background: "#fff",
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
              </div>
            </LabelFieldPair>
          )}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_WARD_NO_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.wardNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_DISTRICT_LABEL")}`}*</CardLabel>
            <Controller
                           control={control}
                           name={"district"}
                           rules={{
                             required: t("REQUIRED_FIELD"),
                           }}
                           render={(props) => (
                             <Dropdown 
                             className="form-field" 
                             select={(e)=>{
                               setSelectedCity(e)
                               props.onChange(e)
                             }} 
                             selected={props.value} 
                             option={cities.sort((a, b) => a.name.localeCompare(b.name))} 
                             optionKey="name" 
                             disable="true"
                             t={t}
                             />
                             
                           )}
                         />
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.district?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ZONE_LABEL")}`}*</CardLabel>
            <Controller
              control={control}
              name={"zone"}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                <Dropdown className="form-field" select={props.onChange} selected={props.value} option={localities} optionKey="i18nkey" />
              )}
            />
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.zone?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_VILLAGE_NAME_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.villageName?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.totalAreaUnderLayout?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_WIDENING_IN_SQ_M_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderRoadWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_SITE_AREA_IN_SQ_M_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.netSiteArea?.message || ""}</CardLabelError>

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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderEWSInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_EWS_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderEWSInPct"
                defaultValue=""
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderEWSInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BALANCE_AREA_IN_SQ_M_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="balanceAreaInSqM"
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.balanceAreaInSqM?.message || ""}</CardLabelError>

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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderCommunityCenterInSqM?.message || ""}</CardLabelError>

              <LabelFieldPair>
                <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_PCT_LABEL")}`}</CardLabel>
                <div className="field">
                  <Controller
                    control={control}
                    name="areaUnderCommunityCenterInPct"
                    defaultValue=""
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
                </div>
              </LabelFieldPair>
              <CardLabelError style={errorStyle}>{errors?.areaUnderCommunityCenterInPct?.message || ""}</CardLabelError>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInPct"
                defaultValue=""
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkInPct?.message || ""}</CardLabelError>

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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderRoadInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInPct"
                defaultValue=""
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderRoadInPct?.message || ""}</CardLabelError>

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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkingInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInPct"
                defaultValue=""
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkingInPct?.message || ""}</CardLabelError>

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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderOtherAmenitiesInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInPct"
                defaultValue=""
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaUnderOtherAmenitiesInPct?.message || ""}</CardLabelError>
        </div>
        <BreakLine />
        {}
      </div>
    </React.Fragment>
  );
};

export default LayoutSiteDetails;
