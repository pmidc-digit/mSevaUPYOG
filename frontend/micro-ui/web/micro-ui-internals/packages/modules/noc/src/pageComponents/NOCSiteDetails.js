import React, { useEffect, useState, useMemo } from "react";
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
import { formatDateForInput } from "../utils";
const NOCSiteDetails = (_props) => {
  let tenantId;
  if (window.location.pathname.includes("employee")) {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  } else {
    tenantId = window.localStorage.getItem("CITIZEN.CITY");
  }
  //console.log("tenantId here", tenantId);

  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, useFieldArray, watch } = _props;

  //logic for Net Plot Area After Widening (A-B)
  const [netPlotArea, setNetPlotArea] = useState("0.00");
  const NetTotalArea = watch("netTotalArea");
  const AreaLeftForRoadWidening = watch("areaLeftForRoadWidening");

  useEffect(() => {
    const a = parseFloat(NetTotalArea);
    const b = parseFloat(AreaLeftForRoadWidening);

    const diff = ((isNaN(a) ? 0 : a) - (isNaN(b) ? 0 : b)).toFixed(2);

    setNetPlotArea(diff);
    setValue("netPlotAreaAfterWidening", diff);
  }, [NetTotalArea, AreaLeftForRoadWidening]);

  /**Start - Floor Area Calculation Logic */
  const [totalArea, setTotalArea] = useState("");

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
  let { data: roadType, isLoading: isRoadTypeLoading } = Digit.Hooks.noc.useRoadType(stateId);

  const { data: ulbList, isLoading: isUlbListLoading } = Digit.Hooks.useTenants();

  const ulbListOptions = ulbList?.map((city) => ({
    ...city,
    displayName: t(city.i18nKey),
  }));

  if (roadType & !isRoadTypeLoading) {
    roadType = [...roadType].sort((a, b) => a.name.localeCompare(b.name));
  }


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
  console.log('allcities', allCities)
  const [cities, setcitiesopetions] = useState(allCities);
  
  const { data: zoneList, isLoading: isZoneListLoading } = Digit.Hooks.useCustomMDMS(stateId, "tenant", [
    { name: "zoneMaster", filter: `$.[?(@.tanentId == '${tenantId}')]` },
  ]);
  // const zoneOptions = zoneList?.tenant?.zoneMaster?.[0]?.zones || [];

  const [selectedCity, setSelectedCity] = useState(currentStepData?.siteDetails?.district || null);

  console.log('selectedCity', selectedCity)
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
  // if (fetchedLocalities?.length > 0) {
  //   setLocalities(fetchedLocalities);
  // }
  // }, [fetchedLocalities]);\

  //logic for default selection of district
  useEffect(() => {
    if (tenantId && allCities?.length > 0) {
      const defaultCity = allCities.find((city) => city.code === tenantId)?.city?.districtName;

      console.log('defaultCity', defaultCity)
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

  return (
    <React.Fragment>
      <div style={{ marginBottom: "16px" }}>
        <CardSectionHeader className="card-section-header">{t("NOC_SITE_DETAILS")}</CardSectionHeader>
        <div>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_PLOT_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              {errors?.plotNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.plotNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {t("NOC_PROPOSED_SITE_ADDRESS")}
              <span className="requiredField">*</span>
            </CardLabel>
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
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                {errors?.proposedSiteAddress ? errors.proposedSiteAddress.message : ""}
              </CardLabelError>
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_ULB_NAME_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
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
                    />
                  )}
                />
              )}
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{errors?.ulbName ? errors.ulbName.message : ""}</CardLabelError>
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_ULB_TYPE_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_KHASRA_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
                    value: 500,
                    message: t("MAX_500_CHARACTERS_ALLOWED"),
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
              {errors?.khasraNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.khasraNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_HADBAST_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
                  pattern: {
                    value: /^[0-9]+$/, // only digits allowed
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED"),
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
              {errors?.hadbastNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.hadbastNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_ROAD_TYPE_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              {!isRoadTypeLoading && (
                <Controller
                  control={control}
                  name={"roadType"}
                  rules={{
                    required: t("REQUIRED_FIELD"),
                  }}
                  render={(props) => (
                    <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" t={t} />
                  )}
                />
              )}
              {errors?.roadType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.roadType.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_NET_TOTAL_AREA_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
                // defaultValue={currentStepData?.siteDetails?.netTotalArea || "0.00"}
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
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{errors?.netTotalArea?.message || ""}</CardLabelError>
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_AREA_LEFT_FOR_ROAD_WIDENING_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
                  />
                )}
              />
              {errors?.areaLeftForRoadWidening && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.areaLeftForRoadWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_NET_PLOT_AREA_AFTER_WIDENING_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
                    disable="true"
                  />
                )}
              />
              {errors?.netPlotAreaAfterWidening && (
                <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.netPlotAreaAfterWidening.message}</p>
              )}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_ROAD_WIDTH_AT_SITE_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                {errors?.roadWidthAtSite ? errors.roadWidthAtSite.message : ""}
              </CardLabelError>
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_BUILDING_STATUS_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
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
                      t={t}
                    />
                  )}
                />
              )}
              {errors?.buildingStatus && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.buildingStatus.message}</p>}
            </div>
          </LabelFieldPair>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_IS_BASEMENT_AREA_PRESENT_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
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
                {errors?.ulbName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.ulbName.message}</p>}
              </div>
            </LabelFieldPair>
          )}

          {buildingStatus?.code === "BUILTUP" && isBasementAreaAvailable?.code === "YES" && (
            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">
                {`${t("NOC_BASEMENT_AREA_LABEL")}`}
                <span className="requiredField">*</span>
              </CardLabel>
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
                <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>
                  {errors?.basementArea ? errors.basementArea.message : ""}
                </CardLabelError>
              </div>
            </LabelFieldPair>
          )}

          {buildingStatus?.code === "BUILTUP" &&
            areaFields.map((field, index) => (
              <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                <CardLabel className="card-label-smaller">
                  {index === 0 ? "Ground" : `${index}`} Floor Area(sq mt)<span className="requiredField">*</span>
                </CardLabel>
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
                  <button type="button" onClick={() => removeFloor(index)}>
                    ❌
                  </button>
                </div>
              </div>
            ))}

          {buildingStatus?.code === "BUILTUP" && (
            <button type="button" onClick={() => addFloor({ value: "" })}>
              ➕ Add Floor
            </button>
          )}

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair style={{ marginBottom: "20px" }}>
              <CardLabel className="card-label-smaller">{`${t("NOC_TOTAL_FLOOR_BUILT_UP_AREA_LABEL")}`}</CardLabel>
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
          )}

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_SITE_WARD_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              {errors?.wardNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.wardNo.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_DISTRICT_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name={"district"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <TextInput
                    className="form-field"
                    value={selectedCity || props.value}
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
              {errors?.district && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.district.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_ZONE_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              {!isZoneListLoading && (
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
                      option={zoneList?.tenant?.zoneMaster?.[0]?.zones}
                      optionKey="code"
                      t={t}
                    />
                  )}
                />
              )}
              {errors?.zone && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.zone.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_SITE_VILLAGE_NAME_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              {errors?.villageName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.villageName.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_SITE_COLONY_NAME_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              {errors?.colonyName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.colonyName.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_SITE_VASIKA_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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
              {errors?.vasikaNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.vasikaNumber.message}</p>}
            </div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_VASIKA_DATE")}`}
              <span className="requiredField">*</span>
            </CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="vasikaDate"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  validate: (value) => {
                    // const today = new Date();
                    // const dob = new Date(value);
                    // const age = today.getFullYear() - dob.getFullYear();
                    // const m = today.getMonth() - dob.getMonth();
                    // const d = today.getDate() - dob.getDate();
                    // const is18OrOlder = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    // return is18OrOlder || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
                }}
                render={(props) => (
                  <TextInput
                    type="date"
                    value={formatDateForInput(props.value)} 
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    min="1900-01-01"
                    max={new Date().toISOString().split("T")[0]}
                  />
                )}
              />
              {errors?.vasikaDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors?.vasikaDate?.message}</p>}
            </div>
          </LabelFieldPair>

          <LabelFieldPair style={{ marginBottom: "20px" }}>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_SITE_KHEWAT_AND_KHATUNI_NO_LABEL")}`}
              <span className="requiredField">*</span>
            </CardLabel>
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

                  pattern: {
                    value: /^[0-9]+$/, // only digits allowed
                    message: t("ONLY_NUMERIC_VALUES_ALLOWED"),
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
              {errors?.khewatAndKhatuniNo && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.khewatAndKhatuniNo.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
        <BreakLine />
      </div>
    </React.Fragment>
  );
};

export default NOCSiteDetails;
