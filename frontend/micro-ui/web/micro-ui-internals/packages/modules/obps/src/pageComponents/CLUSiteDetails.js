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

const CLUSiteDetails = (_props) => {
  let tenantId;
  
  if(window.location.pathname.includes("employee")){
   tenantId = window.localStorage.getItem("Employee.tenant-id");
  }else{
   tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }

  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch } = _props;

  //logic for TotalArea(A+B)
  const [netArea, setNetArea] = useState("0.00");
  const NetPlotArea = watch("netPlotAreaAfterWidening");
  const AreaLeftForRoadWidening = watch("areaLeftForRoadWidening");

  useEffect(() => {
    const a = parseFloat(NetPlotArea);
    const b = parseFloat(AreaLeftForRoadWidening);

    const sum = ((isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)).toFixed(2);

    setNetArea(sum);
    setValue("netTotalArea", sum);
  }, [NetPlotArea, AreaLeftForRoadWidening]);

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
      const numericValue = parseFloat(item?.value);
      return acc + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);

    const numericBasementArea = isNaN(basementAreaValues) ? 0 : basementAreaValues;
    const finalSum = (sum + parseFloat(numericBasementArea)).toFixed(2);
    setTotalArea(finalSum);

    // Update form value so it gets saved
    setValue("totalFloorArea", finalSum);
  }, [floorAreaValues, basementAreaValues]);

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
    if (ulbName) {
      const ulbTypeFormatted = ulbName?.city?.ulbType;
      setUlbType(ulbTypeFormatted);
      setValue("ulbType", ulbTypeFormatted);
    }
  }, [ulbName, setValue]);

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

  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [{name:"zoneMaster",filter: `$.[?(@.tanentId == '${tenantId}')]`}]);
  // const zoneOptions = zoneList?.tenant?.zoneMaster?.[0]?.zones || [];

  const [selectedCity, setSelectedCity] = useState(currentStepData?.siteDetails?.district || null);
  // const [localities, setLocalities] = useState([]);

  // const { data: fetchedLocalities } = Digit.Hooks.useBoundaryLocalities(
  //   selectedCity?.code,
  //   "revenue",
  //   {
  //     enabled: !!selectedCity,
  //   },
  //   t
  // );

  // useEffect(() => {
  //   if (fetchedLocalities?.length > 0) {
  //     setLocalities(fetchedLocalities);
  //   }
  // }, [fetchedLocalities]);


  //logic for default selection of district
   useEffect(() => {
    if (tenantId && allCities?.length > 0) {
      const defaultCity = allCities.find((city) => city.code === tenantId);
      if (defaultCity) {
        setSelectedCity(defaultCity);
        setValue("district", defaultCity); // sets default in react-hook-form
      }
    }
  }, [tenantId, allCities]);

  useEffect(() => {
    //console.log("currentStepData3", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        if (key !== "floorArea") setValue(key, value);
      });

      // Handle floorArea
      if (Array.isArray(formattedData.floorArea)) {
        // Clear existing fields
        for (let i = areaFields.length - 1; i >= 0; i--) {
          removeFloor(i);
        }

        // Append each floorArea item with correct structure
        formattedData.floorArea.forEach((item) => {
          addFloor({ value: item.value || "" }); // Ensure value is passed correctly
        });
      }
    }
  }, [currentStepData, setValue, addFloor, removeFloor]);

  const { data: buildingCategory, isLoading: isBuildingCategoryLoading, error: buildingCategoryError } = Digit.Hooks.noc.useBuildingCategory(stateId);

  const { data: mdmsData, isLoading: isMdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "CLU", [{ name: "AppliedCategory" }]);


  return (
    <React.Fragment>
      <div>
        <CardSectionHeader className="card-section-header">{t("BPA_SITE_DETAILS")}</CardSectionHeader>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="plotNo"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
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
          <CardLabelError style={errorStyle}>{errors?.plotNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_PLOT_AREA_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="plotArea"
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
          <CardLabelError style={errorStyle}>{errors?.plotArea?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_KHEWAT_KHATUNI_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khewatOrKhatuniNo"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
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
          <CardLabelError style={errorStyle}>{errors?.khewatOrKhatuniNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_CORE_AREA_LABEL")}`}*</CardLabel>
              <Controller
                control={control}
                name="coreArea"
                rules={{required: t("REQUIRED_FIELD")}}
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
          <CardLabelError style={errorStyle}>{errors?.coreArea?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("BPA_PROPOSED_SITE_ADDRESS")}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="proposedSiteAddress"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
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
                    // select={props.onChange}
                    select={(e) => {
                      setUlbName(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={ulbListOptions}
                    optionKey="displayName"
                    t={t}
                    disable={currentStepData?.apiData?.Clu?.[0]?.applicationNo ? true: false}
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
                render={(props) => (
                  <TextInput
                    // value={props.value}
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
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
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
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
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
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" t={t}/>
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.roadType?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaLeftForRoadWidening"
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
                    disable={currentStepData?.apiData?.Clu?.[0]?.applicationNo ? true: false}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.areaLeftForRoadWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netPlotAreaAfterWidening"
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
                    disable={currentStepData?.apiData?.Clu?.[0]?.applicationNo ? true: false}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.netPlotAreaAfterWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_TOTAL_AREA_LABEL")}`}*</CardLabel>
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
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disabled="true"
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.netTotalArea?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_WIDTH_AT_SITE_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="roadWidthAtSite"
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
          <CardLabelError style={errorStyle}>{errors?.roadWidthAtSite ? errors.roadWidthAtSite.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_WARD_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="wardNo"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 2,
                  //   message: t("MIN_2_CHARACTERS_REQUIRED"),
                  // },
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
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.district?.message || ""}</CardLabelError>

         {!isZoneListLoading &&  (<LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ZONE_LABEL")}`}*</CardLabel>
            <Controller
              control={control}
              name={"zone"}
              rules={{
                required: t("REQUIRED_FIELD"),
              }}
              render={(props) => (
                <Dropdown className="form-field" select={props.onChange} selected={props.value} option={zoneList?.tenant?.zoneMaster?.[0]?.zones} optionKey="code" t={t}/>
              )}
            />
          </LabelFieldPair>
           )}
          <CardLabelError style={errorStyle}>{errors?.zone?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_VASIKA_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaNumber"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
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
          <CardLabelError style={errorStyle}>{errors?.vasikaNumber?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_SITE_VILLAGE_NAME_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="villageName"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
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
            <CardLabel className="card-label-smaller">{`${t("BPA_OWNERSHIP_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="ownershipInPct"
                rules={{
                  validate: (value) => {
                    if (!value) return true;
                    const regex = /^\d+(\.\d{1,2})?$/;
                    const isValidFormat = regex.test(value);
                    const isWithinRange = parseFloat(value) <= 100;
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
          <CardLabelError style={errorStyle}>{errors?.ownershipInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_PROPOSED_ROAD_WIDTH_AFTER_WIDENING_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="proposedRoadWidthAfterWidening"
                rules={{
                  //required: t("REQUIRED_FIELD"),
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
          <CardLabelError style={errorStyle}>{errors?.proposedRoadWidthAfterWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_CATEGORY_APPLIED_FOR_CLU_LABEL")}`}*</CardLabel>
            {!isMdmsLoading && (
              <Controller
                control={control}
                name={"appliedCluCategory"}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={mdmsData?.CLU?.AppliedCategory}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.appliedCluCategory?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_CATEGORY_LABEL")}`}*</CardLabel>
            {!isBuildingCategoryLoading && buildingCategory.length > 0 && (
              <Controller
                control={control}
                name={"buildingCategory"}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={buildingCategory.filter((item)=> item.code !== "RESIDENTIAL_INDEPENDENT_FLOORS")} optionKey="name" t={t} disable={currentStepData?.apiData?.Clu?.[0]?.applicationNo ? true: false}/>
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.buildingCategory?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_PROPERTY_UID_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="propertyUid"
                rules={{
                  // required: t("REQUIRED_FIELD"),
                  // minLength: {
                  //   value: 4,
                  //   message: t("MIN_4_CHARACTERS_REQUIRED"),
                  // },
                  maxLength: {
                    value: 100,
                    message: t("MAX_100_CHARACTERS_ALLOWED"),
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
          <CardLabelError style={errorStyle}>{errors?.propertyUid?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_STATUS_LABEL")}`}*</CardLabel>
            {!isBuildingTypeLoading && (
              <Controller
                control={control}
                name={"buildingStatus"}
                rules={{ required: t("REQUIRED_FIELD") }}
                render={(props) => (
                  <Dropdown
                    className="form-field"
                    select={(e) => {
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={buildingType}
                    optionKey="name"
                    t={t}
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.buildingStatus?.message || ""}</CardLabelError>

           <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_IS_ORIGINAL_CATEGORY_AGRICULTURE_LABEL")}`} *</CardLabel>
             <Controller
              control={control}
              name={"isOriginalCategoryAgriculture"}
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
          <CardLabelError style={errorStyle}>{errors?.isOriginalCategoryAgriculture?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_RESTRICTED_AREA_LABEL")}`} *</CardLabel>
             <Controller
              control={control}
              name={"restrictedArea"}
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
          <CardLabelError style={errorStyle}>{errors?.restrictedArea?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_IS_SITE_UNDER_MASTER_PLAN_LABEL")}`} *</CardLabel>
             <Controller
              control={control}
              name={"isSiteUnderMasterPlan"}
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
          <CardLabelError style={errorStyle}>{errors?.isSiteUnderMasterPlan?.message || ""}</CardLabelError>


        </div>
        <BreakLine />
      </div>
    </React.Fragment>
  );
};

export default CLUSiteDetails;
