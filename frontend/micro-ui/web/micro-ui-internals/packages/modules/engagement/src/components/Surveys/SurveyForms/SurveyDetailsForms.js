import { CardLabelError, Dropdown, RemoveableTag, TextInput, MultiSelectDropdown, TextArea } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../utils/index";

import { fieldChange } from "../../../redux/actions/surveyFormActions";
const SurveyDetailsForms = ({
  t,
  registerRef,
  controlSurveyForm,
  surveyFormState,
  surveyFormData,
  disableInputs,
  enableDescriptionOnly,
  readOnly,
}) => {
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //const cityNameSplit= tenantId.split(".")
  // const cityName= cityNameSplit[1];
  const { data: cities, isLoading } = Digit.Hooks.useTenants();

  console.log("cities", cities);

  let cityName = "";

  useEffect(() => {
    // if (!isLoading && cities?.length) {
    //   cities.map((item) => {
    //     if (item.code.toString() === tenantId.toString()) {
    //       cityName = item;
    //       return;
    //     }
    //   });
    // }
    if (!isLoading && cities?.length && !surveyDetails?.ulb) {
      const matchedCity = cities?.find((city) => city.code === tenantId);
      if (matchedCity) {
        dispatch(fieldChange(surveyDetails.id, { ulb: matchedCity }));
      }
    }
  }, [cities, isLoading, tenantId]);

  const userInfo = Digit.UserService.getUser().info;
  const dispatch = useDispatch();
  const surveyDetails = useSelector((state) => state.engagement.surveyForm.surveyDetails[0]);

  console.log("surveyDetails====", surveyDetails);

  const userUlbs = ulbs
    .filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);

  console.log("userulbs", userUlbs);
  const selectedTenat = useMemo(() => {
    const filtered = ulbs.filter((item) => item.code === tenantId);
    return filtered;
  }, [ulbs]);
  const checkRemovableTagDisabled = (isFormDisabled, isActiveSurveyEdit) => {
    //survey details page
    if (!isActiveSurveyEdit && isFormDisabled) {
      return true;
    }
    //active survey editing
    else if (isActiveSurveyEdit) {
      return true;
    }
    //inactive survey editing
    return false;
  };

  // useEffect(() => {
  //   console.log("cityName", cityName);
  //   dispatch(fieldChange(surveyDetails.id, { ["ulb"]: cityName }));
  // }, []);

  const handleULBChange = (e, name) => {
    console.log("eeee", e, name);
    const temp = surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || [];
    console.log("temp", temp);
    const value = surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || [];
    dispatch(fieldChange(surveyDetails.id, { [name]: value }));
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    dispatch(fieldChange(surveyDetails.id, { [name]: value }));
  };

  const handleDropdownChange = (name, event) => {
    dispatch(fieldChange(surveyDetails.id, { [name]: event }));
  };

  console.log("survey deta", surveyDetails);
  console.log("bb", surveyFormData, surveyFormState, registerRef, controlSurveyForm);
  return (
    <div
      //className="surveydetailsform-wrapper"
      className="create-survey-card"
    >
      {/* <span 
      style={{  
        display: "flex",
  flexDirection: "column",
  gap: "16px",
  alignItems: "flex-start",
  justifyContent: "center",
  alignSelf: "stretch",
  flexShrink: 0,
  position: "relative"}}
  className="surveyformfield"
   > */}
      <div
        className="survey-row"
        //  style={{display: "flex",
        // justifyContent: "space-between"}}
      >
        <div
          className="survey-column"
          //   style={{display: "flex",
          // flexDirection: "column",
          // gap: "10px",
          // width:" 45%"}}
        >
          <label>City</label>
          {/* <Controller
          name="ulb"
          control={controlSurveyForm}
          // defaultValue={selectedTenat}
          defaultValue={surveyDetails.ulb||[]}
          rules={{ required: true }}
          render={(props) => {
            console.log("props render",props)
            
            const renderRemovableTokens = useMemo(
              () =>
                props?.value?.map((ulb, index) => {
                  return (
                    <RemoveableTag
                      key={index}
                      text={ulb.name}
                      disabled = {checkRemovableTagDisabled(disableInputs,enableDescriptionOnly)}
                      onClick={() => {
                        props.onChange(props?.value?.filter((loc) => loc.code !== ulb.code));
                      }}
                    />
                  );
                }),
              [props?.value]
            );
         console.log("prop",props?.value) */}
          {/* return ( */}
          {/* <div style={{ display: "grid", gridAutoFlow: "row" }}> */}
          {/* <Dropdown
                  allowMultiselect={true}
                  optionKey={"i18nKey"}
                  option={userUlbs}
                  placeholder={t("ES_COMMON_USER_ULBS")}
                  select={(e) => {
                    props.onChange([...(surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || []), e]);
                  
                  }}
                  selected={props?.value}
                
                  keepNull={true}
                  disable={disableInputs}
                 
                  t={t}
                />  */}
          {/* <MultiSelectDropdown
                  options={userUlbs}
                  isSurvey={true}
                  optionsKey="i18nKey"
                  props={props}
                  isPropsNeeded={true}
                  onSelect={(e) => {
                    // props.onChange([...(surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || []), e]);
                    handleULBChange(e,"ulb")
                  }}
                  name="ulb"
                 //  selected={props?.value}
                 
                  selected={surveyDetails.ulb?.city?.name||[]}
                  defaultLabel={t("ES_COMMON_USER_ULBS")}
                  defaultUnit={t("CS_SELECTED_TEXT")}
                  readOnly={readOnly||false}
                  disable={readOnly||false}
                /> */}

          <Dropdown
            required={true}
            id="ulb"
            name="ulb"
            option={cities}
            className="cityCss"
            select={(e) => handleDropdownChange("ulb", e)}
            placeholder={"Select City"}
            optionKey="i18nKey"
            t={t}
            // disable={usageCategoryMajorMenu(usagecat)?.length === 1}
            selected={surveyDetails.ulb}
          />
          {/* <TextInput
          name="ulb"
          type="text"
          inputRef={registerRef({
            required: t("ES_ERROR_REQUIRED"),
           
          
          })}
          readOnly={true}
          value={surveyDetails.ulb}
          defaultValue={cityName}
         // onChange={handleFieldChange}
          // disable={disableInputs}
          disable={true}
        /> */}
          {/* <div className="tag-container">{renderRemovableTokens}</div> */}
          {/* </div>
            );
          }}
        /> */}

          {surveyFormState?.errors?.tenantIds && <CardLabelError>{t("ES_ERROR_REQUIRED")}</CardLabelError>}
        </div>
        <div className="survey-column">
          {/* <span className="surveyformfield"> */}
          <label>
            {t("CS_SURVEY_NAME")} <span style={{ color: "red" }}>*</span>
          </label>
          <TextInput
            name="name"
            type="text"
            inputRef={registerRef({
              required: t("ES_ERROR_REQUIRED"),
              maxLength: {
                value: 500,
                message: t("Survey Name length should be less than or equal to 500 characters"), //t("EXCEEDS_60_CHAR_LIMIT"),
              },
              pattern: {
                value: /^[A-Za-z_-][A-Za-z0-9_\ -]*$/,
                message: t("ES_SURVEY_DONT_START_WITH_NUMBER"),
              },
            })}
            readOnly={readOnly || false}
            value={surveyDetails.name}
            onChange={handleFieldChange}
            placeholder={"Enter Survey Name"}
            // disable={disableInputs}
            disable={readOnly || false}
          />
          {surveyFormState?.errors?.title && <CardLabelError>{surveyFormState?.errors?.["title"]?.message}</CardLabelError>}
        </div>
      </div>
      {/* <span className="surveyformfield"> */}
      <div className="survey-column" style={{ width: "100%" }}>
        <label>{t("CS_SURVEY_DESCRIPTION")}</label>
        <TextInput
          name="description"
          type="text"
          inputRef={registerRef({
            //required: t("ES_ERROR_REQUIRED"),
            maxLength: {
              value: 500,
              message: t("Survey Description length should be less than or equal to 500 characters"), //t("EXCEEDS_140_CHAR_LIMIT"),
            },
            pattern: {
              value: /^[A-Za-z_-][A-Za-z0-9_\ -]*$/,
              message: t("ES_SURVEY_DONT_START_WITH_NUMBER"),
            },
          })}
          readOnly={readOnly || false}
          value={surveyDetails.description}
          onChange={handleFieldChange}
          placeholder={"Enter Survey Description"}
          // disable={enableDescriptionOnly ?  !enableDescriptionOnly : disableInputs}
          disable={readOnly || false}
        />
        {surveyFormState?.errors?.description && <CardLabelError>{surveyFormState?.errors?.["description"]?.message}</CardLabelError>}
        {/* </span> */}
      </div>
    </div>
  );
};

export default SurveyDetailsForms;
