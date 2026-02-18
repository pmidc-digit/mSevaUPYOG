import React, { useEffect, useState } from "react";
import {
  LabelFieldPair,
  TextInput,
  CardLabel,
  BreakLine,
  Dropdown,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardSectionHeader,
  CardLabelError,
} from "@mseva/digit-ui-react-components";

const CLUProfessionalDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [profData, setProfData] = useState(null);
  const [regId, setRegId]= useState(null);
  const [address, setAddress] = useState(null);
  const [licenseValidity, setLicenseValidity]=useState(null);

  const userInfo = Digit.UserService.getUser();
 // console.log("userInfo here", userInfo);
  
  const isUserArchitect = userInfo?.info?.roles?.find((item) => item?.code === "BPA_ARCHITECT");
  const { data: professionalData, isLoading: professionalDataLoading } = Digit.Hooks.obps.useBPAREGSearch(isUserArchitect? "pb.punjab" : tenantId, {}, {mobileNumber: userInfo?.info?.mobileNumber}, {cacheTime : 0});

  //console.log("Professional==>", professionalData);

  useEffect(() => {
    console.log("currentStepData2", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);


  useEffect(() => {
      if(professionalData){
        for (let i = 0; i < professionalData?.Licenses?.length; i++) {
        if (professionalData?.Licenses?.[i]?.status === "APPROVED") {
          setProfData(professionalData?.Licenses?.[i]);
          break;
        }
      }}
  }, [professionalData]);

  useEffect(()=>{
    if(profData){
     if(isUserArchitect){
      setRegId(profData?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo);
     }
     else{
      setRegId(profData?.licenseNumber);
     }

     setAddress(profData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || profData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress);
     setLicenseValidity( Digit.DateUtils.ConvertEpochToDate(profData?.validTo));
    }
  },[profData]);
  
  useEffect(() => {
    if (regId) {
      setValue("professionalRegId", regId, { shouldValidate: true, shouldDirty: false });
      setValue("professionalAddress", address);
      setValue("professionalRegIdValidity", licenseValidity, { shouldValidate: true, shouldDirty: false });
    }
  }, [address,regId, setValue,licenseValidity]);

  //console.log("profData=>>", profData);



  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_PROFESSIONAL_DETAILS")}</CardSectionHeader>

      <LabelFieldPair style={{ marginBottom: "20px" }}>
        <CardLabel>{`${t("BPA_PROFESSIONAL_NAME_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalName"
            defaultValue={userInfo?.info?.name}
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
                t={t}
                disabled="true"
              />
            )}
          />
          <p style={errorStyle}>{errors?.professionalName?.message}</p>
        </div>
      </LabelFieldPair>

      <LabelFieldPair style={{ marginBottom: "20px" }}>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_EMAIL_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalEmailId"
            defaultValue={userInfo?.info?.emailId}
            rules={{
              required: t("REQUIRED_FIELD"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("INVALID_EMAIL_FORMAT"),
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
                t={t}
                disabled="true"
              />
            )}
          />
          <p style={errorStyle}>{errors?.professionalEmailId?.message}</p>
        </div>
      </LabelFieldPair>

      <LabelFieldPair style={{ marginBottom: "20px" }}>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalRegId"
            rules={{
              required: t("REQUIRED_FIELD"),
              // pattern: {
              //   value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              //   message: t("INVALID_EMAIL_FORMAT"),
              // },
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
                disabled="true"
              />
            )}
          />
          <p style={errorStyle}>{errors?.professionalRegId?.message}</p>
        </div>
      </LabelFieldPair>

      <LabelFieldPair style={{ marginBottom: "20px" }}>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_REGISTRATION_ID_VALIDITY_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalRegIdValidity"
            rules={{
              required: t("REQUIRED_FIELD"),
              // pattern: {
              //   value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              //   message: t("INVALID_EMAIL_FORMAT"),
              // },
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
                disabled="true"
              />
            )}
          />
          <p style={errorStyle}>{errors?.professionalRegIdValidity?.message}</p>
        </div>
      </LabelFieldPair>

      <LabelFieldPair style={{ marginBottom: "20px" }}>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalMobileNumber"
            defaultValue={userInfo?.info?.mobileNumber}
            rules={{
              required: t("REQUIRED_FIELD"),
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: t("INVALID_MOBILE_NUMBER"),
              },
            }}
            render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} disable="true"/>}
          />
          <p style={errorStyle}>{errors?.professionalMobileNumber?.message}</p>
        </div>
      </LabelFieldPair>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("BPA_PROFESSIONAL_ADDRESS_LABEL")}`}<span className="requiredField">*</span></CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalAddress"
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
                t={t}
                disabled="true"
                disable="true"
              />
            )}
          />
          <p style={errorStyle}>{errors?.professionalAddress?.message}</p>
        </div>
      </LabelFieldPair>
      <BreakLine />
    </React.Fragment>
  );
};

export default CLUProfessionalDetails;
