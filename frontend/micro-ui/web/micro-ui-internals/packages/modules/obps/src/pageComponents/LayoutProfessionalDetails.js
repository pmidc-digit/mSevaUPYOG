import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { UPDATE_LayoutNewApplication_FORM } from "../redux/actions/LayoutNewApplicationActions";

const LayoutProfessionalDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle, watch } = _props;
  const dispatch = useDispatch();

  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const [profData, setProfData] = useState(null);
  const [regId, setRegId] = useState(null);
  const [address, setAddress] = useState(null);
  const [licenseValidity, setLicenseValidity] = useState(null);

  const userInfo = Digit.UserService.getUser();
  console.log("userInfo here", userInfo);
  const [userPhoto, setUserPhoto] = useState(null);
  const [documents, setDocuments] = useState({});

  // Watch all professional fields to capture them for Redux
  const professionalName = watch?.("professionalName");
  const professionalEmailId = watch?.("professionalEmailId");
  const professionalRegId = watch?.("professionalRegId");
  const professionalMobileNumber = watch?.("professionalMobileNumber");
  const professionalAddress = watch?.("professionalAddress");
  const professionalRegistrationValidity = watch?.("professionalRegistrationValidity");

  const isUserArchitect = userInfo?.info?.roles?.find((item) => item?.code === "BPA_ARCHITECT");
  const { data: professionalData, isLoading: professionalDataLoading } = Digit.Hooks.obps.useBPAREGSearch(
    isUserArchitect ? "pb.punjab" : tenantId,
    {},
    { mobileNumber: userInfo?.info?.mobileNumber },
    { cacheTime: 0 }
  );

  console.log("Professional==>", professionalData);

  useEffect(() => {
    if (professionalData?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.photo) {
      const photoFileStoreId = professionalData?.Licenses[0]?.tradeLicenseDetail?.owners[0]?.photo;
      Digit.UploadServices.Filefetch([photoFileStoreId], tenantId.split(".")[0]).then((res) => {
        setDocuments(res?.data);
        if (res?.data?.[photoFileStoreId]) {
          setUserPhoto(res.data[photoFileStoreId]?.split(",")[0]);
        }
      });
    }
  }, [professionalData]);

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.applicationDetails;
    if (formattedData) {
      // console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    if (professionalData) {
      for (let i = 0; i < professionalData?.Licenses?.length; i++) {
        if (professionalData?.Licenses?.[i]?.status === "APPROVED") {
          setProfData(professionalData?.Licenses?.[i]);
          break;
        }
      }
    }
  }, [professionalData]);

  useEffect(() => {
    if (profData) {
      if (isUserArchitect) {
        setRegId(profData?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo);
      } else {
        setRegId(profData?.licenseNumber);
      }

      setAddress(profData?.tradeLicenseDetail?.owners?.[0]?.permanentAddress || profData?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress);
      setLicenseValidity(Digit.DateUtils.ConvertEpochToDate(profData?.validTo));
    }
  }, [profData]);

  useEffect(() => {
    if (regId) {
      setValue("professionalRegId", regId, { shouldValidate: true, shouldDirty: false });
      setValue("professionalAddress", address);
      setValue("professionalRegistrationValidity", licenseValidity, { shouldValidate: true, shouldDirty: false });
    }
  }, [address, regId, setValue, licenseValidity]);

  // Dispatch professional details to Redux whenever they change
  useEffect(() => {
    const professionalDetails = {
      professionalName,
      professionalEmailId,
      professionalRegId,
      professionalMobileNumber,
      professionalAddress,
      professionalRegistrationValidity,
    };
    
    // Only dispatch if at least one field has a value
    if (Object.values(professionalDetails).some(val => val)) {
      dispatch(UPDATE_LayoutNewApplication_FORM("professionalDetails", professionalDetails));
    }
  }, [professionalName, professionalEmailId, professionalRegId, professionalMobileNumber, professionalAddress, professionalRegistrationValidity, dispatch]);

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_PROFESSIONAL_DETAILS")}</CardSectionHeader>
      <div>
        {userPhoto && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
            <div style={{ position: "relative", width: "120px" }}>
              <img
                src={userPhoto}
                alt="User Photo"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #ccc",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "14px",
                  fontWeight: "500",
                  width: "150px",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userInfo?.info?.name}
              </div>
            </div>
          </div>
        )}
      </div>

      <LabelFieldPair>
        <CardLabel>
          {`${t("BPA_PROFESSIONAL_NAME_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
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
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalName ? errors.professionalName.message : ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {`${t("BPA_PROFESSIONAL_EMAIL_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
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
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalEmailId?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {`${t("BPA_PROFESSIONAL_REGISTRATION_ID_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
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
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalRegId?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {`${t("BPA_PROFESSIONAL_REG_VALIDITY_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="professionalRegistrationValidity"
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
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalRegistrationValidity?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {`${t("BPA_PROFESSIONAL_MOBILE_NO_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
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
            render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} disable="true" />}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalMobileNumber?.message || ""}</CardLabelError>

      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {`${t("BPA_PROFESSIONAL_ADDRESS_LABEL")}`}
          <span className="requiredField">*</span>
        </CardLabel>
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
                // disabled="true"
                // disable="true"
              />
            )}
          />
        </div>
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{errors?.professionalAddress?.message || ""}</CardLabelError>
    </React.Fragment>
  );
};

export default LayoutProfessionalDetails;
