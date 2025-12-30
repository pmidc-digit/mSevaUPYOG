import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  CardLabelError,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  RadioButtons,
  SearchIcon,
  Toast,
  CardSectionSubText
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";

const NOCApplicantDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, reset } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  useEffect(() => {
    console.log("currentStepData1", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      //console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  //For fetching user details
   const [mobileNo,setMobileNo]=useState("");
   const [showToast, setShowToast]=useState(null);
   const[userInfo, setUserInfo]=useState(null);

   const closeToast = () => {
    setShowToast(null);
   };

   const getOwnerDetails= async ()=>{
    if(mobileNo === "" || mobileNo.length!==10){
        setShowToast({ key: "true", error: true, message: "INVALID_MOBILE_NUMBER" });
        return;   
    }
   
    const userResponse = await Digit.UserService.userSearch(Digit.ULBService.getStateId(), {userName: mobileNo}, {});
    
    if (userResponse?.user?.length === 0) {
        setShowToast({ key: "true", warning: true, message: "ERR_MOBILE_NUMBER_NOT_REGISTERED" });
        return;
    }
    else{
       setUserInfo(userResponse?.user?.[0]);
    }
    
   }
    

   useEffect(()=>{
    if(userInfo){
      
     Object.entries(userInfo).forEach(([key,value])=>{
      if(key === "name"){
          setValue("applicantOwnerOrFirmName", value, { shouldValidate: true, shouldDirty: true });
      }
      else if(key ==="emailId"){
          setValue("applicantEmailId", value, { shouldValidate: true, shouldDirty: true });
      }
      else if(key ==="gender"){
          const genderObj=menu.find((obj)=> obj.code === value);
          setValue("applicantGender", genderObj, { shouldValidate: true, shouldDirty: true });
      }
      else if(key ==="dob"){
          setValue("applicantDateOfBirth", value, { shouldValidate: true, shouldDirty: true });
      }
      else if(key ==="fatherOrHusbandName"){
          setValue("applicantFatherHusbandName", value);
      }
      else if(key ==="permanentAddress"){
          setValue("applicantAddress", value, { shouldValidate: true, shouldDirty: true });
      }
     })
    }
   },[userInfo])

   const isEdit= window.location.pathname.includes("edit")

   //console.log("selectedGender", selectedGender);
  

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
      <div>
        { isEdit && (
          <CardSectionSubText style={{color:"red", margin:"10px 0px"}}> To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section
          </CardSectionSubText>
        )}
        
        <LabelFieldPair style={isMobile ? { position: "relative" } : {}}>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantMobileNumber"
              rules={{
                required: t("REQUIRED_FIELD"),
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: t("INVALID_MOBILE_NUMBER"),
                },
              }}
              render={(props) => 
              <TextInput
                  value={props.value}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setMobileNo(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                  disabled={isEdit}
              />
            }
            />
          </div>
          <div className="search-icon"
              style={isMobile ? { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", left: "auto", marginTop: "16px" } : {}}
              onClick={isEdit ? null : getOwnerDetails}>
                {" "}<SearchIcon />{" "}
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>


        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_FIRM_OWNER_NAME_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantOwnerOrFirmName"
              rules={{
                required: t("REQUIRED_FIELD"),
                maxLength: {
                  value: 100,
                  message: t("MAX_100_CHARACTERS_ALLOWED"),
                },
              }}
              render={(props) => (
                <TextInput
                  value={props.value || userInfo?.name}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                  disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_EMAIL_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantEmailId"
              rules={{
                required: t("REQUIRED_FIELD"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("INVALID_EMAIL_FORMAT"),
                },
              }}
              render={(props) => (
                <TextInput
                  value={props.value ||  userInfo?.emailId}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                  disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantEmailId?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantFatherHusbandName"
              render={(props) => (
                <TextInput
                  value={props.value || userInfo?.fatherOrHusbandName}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                  // disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>

         <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_PROPERTY_ID_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantPropertyId"
              rules={{
                required: t("REQUIRED_FIELD"),
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
                  t={t}
                  // disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantPropertyId?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_ADDRESS_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantAddress"
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
                  value={props.value || userInfo?.permanentAddress}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_DOB_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantDateOfBirth"
              rules={{ 
                required: t("REQUIRED_FIELD") ,
                validate: (value) => {
                    const today = new Date();
                    const dob = new Date(value);
                    const age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    const d = today.getDate() - dob.getDate();

                    const is18OrOlder = age >= 18 ||
                    (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                    return is18OrOlder || t("DOB_MUST_BE_18_YEARS_OLD");
                  },
              }}
              render={(props) => (
                <TextInput
                  type="date"
                  value={props.value || userInfo?.dob}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantDateOfBirth?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_GENDER_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantGender"
              rules={{ required: t("REQUIRED_FIELD") }}
              render={(props) => (
                <RadioButtons
                  t={t}
                  options={menu}
                  optionsKey="code"
                  value={props.value}
                  selectedOption={props.value}
                  onSelect={(e) => {
                    props.onChange(e);
                  }}
                  isDependent={true}
                  disabled={isEdit}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantGender?.message || ""}</CardLabelError>
      </div>
       {showToast && (
            <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
        )}
    </React.Fragment>
  );
};

export default NOCApplicantDetails;
