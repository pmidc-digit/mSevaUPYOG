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
  UploadFile
} from "@mseva/digit-ui-react-components";

const LayoutSiteDetails = (_props) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch } = _props;

  /**Start - Floor Area Calculation Logic */
  const [totalArea, setTotalArea] = useState("0.00");

  const { fields: areaFields, append: addFloor, remove: removeFloor} = useFieldArray({
    control,
    name: "floorArea",
  });

const floorAreaValues = watch("floorArea");
const basementAreaValues= watch("basementArea");

 useEffect(() => {
    const sum = floorAreaValues?.reduce((acc, item) => {
    const numericValue = parseFloat(item?.value);
    return acc + (isNaN(numericValue) ? 0 : numericValue);
  }, 0);
  
  const numericBasementArea=(isNaN(basementAreaValues) ? 0 : basementAreaValues);
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
  const [selectedCity, setSelectedCity]=useState(currentStepData?.siteDetails?.district || null);
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
 }, [selectedCity]);


  useEffect(() => {
    //console.log("currentStepData3", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        if(key!== "floorArea")setValue(key, value);
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
  const { data: mdmsData, isLoading: mdmsLoading } = Digit.Hooks.useCustomMDMS(stateId, "BPA", [{ name: "LayoutType" }]);

  const schemeTypeOptions=mdmsData?.BPA?.LayoutType?.[0]?.schemeType || [];

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
          <CardLabelError style={errorStyle}>{errors?.plotNo ? errors.plotNo.message : ""}</CardLabelError>

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
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" />
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
          <CardLabelError style={errorStyle}>{errors?.areaLeftForRoadWidening?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_NET_PLOT_AREA_AFTER_WIDENING_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="netPlotAreaAfterWidening"
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

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_ROAD_WIDTH_AT_SITE_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="roadWidthAtSite"
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
          <CardLabelError style={errorStyle}>{errors?.roadWidthAtSite ? errors.roadWidthAtSite.message : ""}</CardLabelError>

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
                      setBuildingStatus(e);
                      props.onChange(e);
                    }}
                    selected={props.value}
                    option={buildingType}
                    optionKey="name"
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.buildingStatus?.message || ""}</CardLabelError>
          
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
                rules={{
                  required: t("REQUIRED_FIELD"),
                  pattern: {
                    value: /^[0-9]*\.?[0-9]+$/,
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED_MSG"),
                  },
                  // minLength: {
                  //   value: 1,
                  //   message: t("MIN_1_CHARACTER_REQUIRED"),
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
          
            )
          }
          <CardLabelError style={errorStyle}>{errors?.basementArea ? errors.basementArea.message : ""}</CardLabelError>
          
          
          {buildingStatus?.code === "BUILTUP" && areaFields.map((field, index) => (
            <div style={{ display: "flex", gap: "10px", flexDirection:"column" }}>
            <CardLabel className="card-label-smaller">{ index === 0 ? "Ground":`${index}`} Floor Area*</CardLabel>
            <div key={field.id} className="field" style={{ display: "flex", gap: "10px" }}>
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
                  // minLength: {
                  //   value: 1,
                  //   message: t("MIN_1_CHARACTER_REQUIRED"),
                  // },
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
              <button type="button" onClick={() => removeFloor(index)}>❌</button>
            </div>
            </div>
           ))}

           {buildingStatus?.code === "BUILTUP" && 
            (
             <button  type="button" onClick={() => addFloor({ value: "" })}>➕ Add Floor</button>
            )
           }
          
          {buildingStatus?.code === "BUILTUP" &&
           (
             <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_FLOOR_AREA_LABEL")}`}</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="totalFloorArea"
                  defaultValue={totalArea}
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
           )
          }
          
          
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
                  select={(e)=>{
                    setSelectedCity(e)
                    props.onChange(e)
                  }} 
                  selected={props.value} 
                  option={cities.sort((a, b) => a.name.localeCompare(b.name))} 
                  optionKey="name" />
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
                  <Dropdown 
                  className="form-field" 
                  select={props.onChange} 
                  selected={props.value} 
                  option={localities} 
                  optionKey="i18nkey" />
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
            <CardLabel className="card-label-smaller">{`${t("BPA_BUILDING_CATEGORY_LABEL")}`}*</CardLabel>
              {!isBuildingCategoryLoading && buildingCategory.length > 0 && (
                <Controller
                  control={control}
                  name={"buildingCategory"}
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={buildingCategory} optionKey="name" />
                   )}
                    />
                  )}
                   
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>
            {errors?.buildingCategory?.message || ""}
          </CardLabelError>

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
                  />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.schemeType?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_TOTAL_AREA_UNDER_LAYOUT_IN_SQ_M_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="totalAreaUnderLayout"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderEWSInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_BALANCE_AREA_IN_SQ_M_LABEL")}`}*</CardLabel>
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
            </div>
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.balanceAreaInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderResidentialUseInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderResidentialUseInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_RESIDENTIAL_USE_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderResidentialUseInPct"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderResidentialUseInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderCommercialUseInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderCommercialUseInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMERCIAL_USE_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderCommercialUseInPct"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderCommercialUseInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderInstutionalUseInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderInstutionalUseInSqM?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_INSTUTIONAL_USE_IN_PCT_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderInstutionalUseInPct"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderInstutionalUseInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_COMMUNITY_CENTER_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderCommunityCenterInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderCommunityCenterInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARK_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_ROAD_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderRoadInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderRoadInPct?.message || ""}</CardLabelError>


          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_PARKING_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderParkingInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderParkingInPct?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("BPA_AREA_UNDER_OTHER_AMENITIES_IN_SQ_M_LABEL")}`}</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="areaUnderOtherAmenitiesInSqM"
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
          <CardLabelError style={errorStyle}>{errors?.areaUnderOtherAmenitiesInPct?.message || ""}</CardLabelError>

        </div>
        <BreakLine />
      </div>
    </React.Fragment>
  );
};

export default LayoutSiteDetails;
