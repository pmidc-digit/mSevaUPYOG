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

const NOCSiteDetails = (_props) => {
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

  const allCities = Digit.Hooks.noc.useTenants();
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


  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{t("NOC_SITE_DETAILS")}</CardSectionHeader>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_PLOT_NO_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{t("NOC_PROPOSED_SITE_ADDRESS")}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_ULB_NAME_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_ULB_TYPE_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_KHASRA_NO_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_HADBAST_NO_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_ROAD_TYPE_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")}`}</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_ROAD_WIDTH_AT_SITE_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_BUILDING_STATUS_LABEL")}`}*</CardLabel>
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
              <CardLabel className="card-label-smaller">{`${t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")}`} *</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_BASEMENT_AREA_LABEL")}`}*</CardLabel>
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
              <CardLabel className="card-label-smaller">{`${t("NOC_TOTAL_FLOOR_AREA_LABEL")}`}</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_WARD_NO_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_DISTRICT_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_ZONE_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_VILLAGE_NAME_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_COLONY_NAME_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="colonyName"
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
          <CardLabelError style={errorStyle}>{errors?.colonyName?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_VASIKA_NO_LABEL")}`}*</CardLabel>
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
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="khewatAndKhatuniNo"
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
          <CardLabelError style={errorStyle}>{errors?.khewatAndKhatuniNo?.message || ""}</CardLabelError>
        </div>
        <BreakLine />
      </div>
    </React.Fragment>
  );
};

export default NOCSiteDetails;
