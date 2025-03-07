import { CardLabelError, Dropdown, RemoveableTag, TextInput, MultiSelectDropdown } from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useSelector, useDispatch } from 'react-redux';
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../utils/index";

import { fieldChange} from '../../../redux/actions/surveyFormActions';
const SurveyDetailsForms = ({ t, registerRef, controlSurveyForm, surveyFormState, surveyFormData, disableInputs, enableDescriptionOnly,readOnly }) => {
  const ulbs = Digit.SessionStorage.get("ENGAGEMENT_TENANTS");
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser().info;
   const dispatch = useDispatch();
  const surveyDetails = useSelector(state => state.engagement.surveyForm.surveyDetails[0]);
  const userUlbs = ulbs
    .filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code))
    .sort(alphabeticalSortFunctionForTenantsBasedOnName);

    console.log("userulbs",userUlbs)
  const selectedTenat = useMemo(() => {
    const filtered = ulbs.filter((item) => item.code === tenantId);
    return filtered;
  }, [ulbs]);
  const checkRemovableTagDisabled = (isFormDisabled, isActiveSurveyEdit) => {

    //survey details page 
    if (!isActiveSurveyEdit && isFormDisabled){
      return true
    }
    //active survey editing
    else if(isActiveSurveyEdit){
      return true
    }
    //inactive survey editing
    return false
  }
  useEffect(()=>{
    dispatch(fieldChange(surveyDetails.id, { ["ulb"]: tenantId }));
  },[])
  const handleULBChange=(e,name)=>{
    console.log("eeee",e,name)
    const temp=   surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || [];
    console.log("temp",temp)
     const value=  surveyFormData("tenantIds")?.filter?.((f) => e.code !== f?.code) || []
     dispatch(fieldChange(surveyDetails.id,{[name]:value}))
     }

       const handleFieldChange = (e) => {
         const { name, value } = e.target;
         dispatch(fieldChange(surveyDetails.id, { [name]: value }));
       };
     console.log("survey deta",surveyDetails)
console.log("bb",surveyFormData,surveyFormState,registerRef,controlSurveyForm)
  return (
    <div className="surveydetailsform-wrapper">
      <span className="surveyformfield">
        <label>{`${t("LABEL_FOR_ULB")} * `}</label>
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


<TextInput
          name="ulb"
          type="text"
          inputRef={registerRef({
            required: t("ES_ERROR_REQUIRED"),
           
          
          })}
          readOnly={true}
          value={surveyDetails.ulb}
          defaultValue={tenantId}
         // onChange={handleFieldChange}
          // disable={disableInputs}
          disable={true}
        />
                {/* <div className="tag-container">{renderRemovableTokens}</div> */}
              {/* </div>
            );
          }}
        /> */}
        
        {surveyFormState?.errors?.tenantIds && <CardLabelError>{t("ES_ERROR_REQUIRED")}</CardLabelError>}
      </span>

      <span className="surveyformfield">
        <label>{`${t("CS_SURVEY_NAME")} * `}</label>
        <TextInput
          name="name"
          type="text"
          inputRef={registerRef({
            required: t("ES_ERROR_REQUIRED"),
            maxLength: {
              value: 60,
              message: t("EXCEEDS_60_CHAR_LIMIT"),
            },
            pattern:{
              value: /^[A-Za-z_-][A-Za-z0-9_\ -]*$/,
              message: t("ES_SURVEY_DONT_START_WITH_NUMBER")
            }
          })}
          readOnly={readOnly||false}
          value={surveyDetails.name}
          onChange={handleFieldChange}
          // disable={disableInputs}
          disable={readOnly||false}
        />
        {surveyFormState?.errors?.title && <CardLabelError>{surveyFormState?.errors?.["title"]?.message}</CardLabelError>}
      </span>
      <span className="surveyformfield">
        <label>{`${t("CS_SURVEY_DESCRIPTION")} `}</label>
        <TextInput
          name="description"
          type="text"
          inputRef={registerRef({
            //required: t("ES_ERROR_REQUIRED"),
            maxLength: {
              value: 140,
              message: t("EXCEEDS_140_CHAR_LIMIT"),
            },
            pattern:{
              value: /^[A-Za-z_-][A-Za-z0-9_\ -]*$/,
              message: t("ES_SURVEY_DONT_START_WITH_NUMBER")
            }
          })}
          readOnly={readOnly||false}
          value={surveyDetails.description}
          onChange={handleFieldChange}
          // disable={enableDescriptionOnly ?  !enableDescriptionOnly : disableInputs}
          disable={readOnly||false}
        />
        {surveyFormState?.errors?.description && <CardLabelError>{surveyFormState?.errors?.["description"]?.message}</CardLabelError>}
      </span>
    </div>
  );
};

export default SurveyDetailsForms;
