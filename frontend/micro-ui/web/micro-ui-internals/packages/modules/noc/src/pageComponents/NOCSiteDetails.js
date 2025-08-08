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
} from "@mseva/digit-ui-react-components";

const NOCSiteDetails = (_props) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;
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

  // const allCities = Digit.Hooks.obps.useTenants();
  // const [cities, setcitiesopetions] = useState(allCities);
  // console.log("cities here ", cities);
  //const [localities, setLocalities] = useState();

  useEffect(() => {
    //console.log("currentStepData3", currentStepData);
    const formattedData = currentStepData?.siteDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    if (ulbName) {
      const ulbTypeFormatted = ulbName?.city?.ulbType;
      setUlbType(ulbTypeFormatted);
      setValue("ulbType", ulbTypeFormatted);
    }
  }, [ulbName, setValue]);

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
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.plotNo ? errors.plotNo.message : ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{t("NOC_PROPOSED_SITE_ADDRESS")}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="proposedSiteAddress"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
                  },
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
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.khasraNo?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_HADBAST_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="hadbastNo"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
              <CardLabel className="card-label-smaller">{`${t("NOC_FIRST_FLOOR_AREA_LABEL")}`}*</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="firstFloorArea"
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    minLength: {
                      value: 4,
                      message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.firstFloorArea?.message || ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("NOC_SECOND_FLOOR_AREA_LABEL")}`}*</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="secondFloorArea"
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    minLength: {
                      value: 4,
                      message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.secondFloorArea?.message || ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("NOC_THIRD_FLOOR_AREA_LABEL")}`}*</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="thirdFloorArea"
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    minLength: {
                      value: 4,
                      message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.thirdFloorArea?.message || ""}</CardLabelError>

          {buildingStatus?.code === "BUILTUP" && (
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">{`${t("NOC_TOTAL_FLOOR_AREA_LABEL")}`}*</CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="totalFloorArea"
                  rules={{
                    required: t("REQUIRED_FIELD"),
                    minLength: {
                      value: 4,
                      message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.totalFloorArea?.message || ""}</CardLabelError>

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_WARD_NO_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="wardNo"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  minLength: {
                    value: 2,
                    message: t("MIN_2_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.wardNo?.message || ""}</CardLabelError>

          {/**District - dropdown */}

          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_DISTRICT_LABEL")}`}*</CardLabel>
            {!isRoadTypeLoading && (
              <Controller
                control={control}
                name={"district"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.district?.message || ""}</CardLabelError> */}

          {/* <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_ZONE_LABEL")}`}*</CardLabel>
            {!isRoadTypeLoading && (
              <Controller
                control={control}
                name={"zone"}
                rules={{
                  required: t("REQUIRED_FIELD"),
                }}
                render={(props) => (
                  <Dropdown className="form-field" select={props.onChange} selected={props.value} option={roadType} optionKey="name" />
                )}
              />
            )}
          </LabelFieldPair>
          <CardLabelError style={errorStyle}>{errors?.zone?.message || ""}</CardLabelError> */}

          {/**Zone - dropdown */}

          <LabelFieldPair>
            <CardLabel className="card-label-smaller">{`${t("NOC_SITE_VILLAGE_NAME_LABEL")}`}*</CardLabel>
            <div className="field">
              <Controller
                control={control}
                name="villageName"
                rules={{
                  required: t("REQUIRED_FIELD"),
                  minLength: {
                    value: 4,
                    message: t("MIN_4_CHARACTERS_REQUIRED"),
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
          <CardLabelError style={errorStyle}>{errors?.villageName?.message || ""}</CardLabelError>
        </div>
        <BreakLine />
      </div>
    </React.Fragment>
  );
};

export default NOCSiteDetails;
