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
  CardSectionSubText,
  DeleteIcon,
  LinkButton,
  UploadFile,
} from "@mseva/digit-ui-react-components";
import { getPattern } from "../utils";

const LayoutApplicantDetails = (_props) => {
  const { t, goNext, currentStepData, Controller, control, setValue, errors, errorStyle } = _props;

  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const [mobileNo, setMobileNo] = useState("");
  const [showToast, setShowToast] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [applicants, setApplicants] = useState([{ name: "", mobileNumber: "", email: "", fatherHusbandName: "", address: "", dob: "", gender: "" }]);
  const [documentUploadedFiles, setDocumentUploadedFiles] = useState({});
  const [loader, setLoader] = useState(false);

  const closeToast = () => setShowToast(null);

  const { isLoading, data: genderTypeData } = Digit.Hooks.obps.useMDMS(stateId, "common-masters", ["GenderType"]);

  let menu = [];
  genderTypeData &&
    genderTypeData["common-masters"].GenderType.filter((data) => data.active).map((genderDetails) => {
      menu.push({ i18nKey: `COMMON_GENDER_${genderDetails.code}`, code: `${genderDetails.code}`, value: `${genderDetails.code}` });
    });

  // Define styles
  const sectionStyle = {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  };

  const HeadingStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#0B0C0C",
    marginBottom: "15px",
  };

  // Handle adding multiple applicants
  const handleAddApplicant = () => {
    setApplicants([...applicants, { name: "", mobileNumber: "", email: "", fatherHusbandName: "", address: "", dob: "", gender: "" }]);
  };

  // Handle removing applicant
  const handleRemoveApplicant = (index) => {
    if (applicants.length > 1) {
      const updatedApplicants = applicants.filter((_, i) => i !== index);
      setApplicants(updatedApplicants);
    }
  };

  // Update applicant field
  const updateApplicant = (index, field, value) => {
    const updatedApplicants = [...applicants];
    updatedApplicants[index][field] = value;
    setApplicants(updatedApplicants);
  };

  // Handle document file upload
  const handleDocumentUpload = async (docType, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setShowToast({ key: "true", error: true, message: "File size should be less than 5MB" });
      return;
    }
    try {
      setLoader(true);
      const response = await Digit.UploadServices.Filestorage("PT", file, stateId);
      setLoader(false);
      if (response?.data?.files?.length > 0) {
        setDocumentUploadedFiles((prev) => ({ ...prev, [docType]: response?.data?.files[0]?.fileStoreId }));
        setShowToast({ key: "true", error: false, message: t("FILE_UPLOAD_SUCCESS") });
      } else {
        setShowToast({ key: "true", error: true, message: t("CS_FILE_UPLOAD_ERROR") });
      }
    } catch (err) {
      setLoader(false);
      setShowToast({ key: "true", error: true, message: t("CS_FILE_UPLOAD_ERROR") });
    }
  };

  //   useEffect(() => {
  //   // <CHANGE> Added comprehensive debug logs
  //   console.log("  LayoutApplicantDetails - Full currentStepData:", currentStepData);
  //   console.log("  applicationDetails direct:", currentStepData?.applicationDetails);
  //   console.log("  formData nested:", currentStepData?.formData?.applicationDetails);

  //   const formattedData = currentStepData?.applicationDetails;

  //   if (formattedData) {
  //     console.log("  Found formattedData, setting values...");
  //     Object.entries(formattedData).forEach(([key, value]) => {
  //       console.log(`  Setting ${key}:`, value);
  //       setValue(key, value);
  //     });
  //   } else {
  //     console.log("  No formattedData found!");
  //   }
  // }, [currentStepData, setValue]);

  useEffect(() => {
    console.log("  LayoutApplicantDetails - Full currentStepData:", currentStepData);
    const formattedData = currentStepData?.applicationDetails;

    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData]);

  const getOwnerDetails = async () => {
    if (mobileNo === "" || mobileNo.length !== 10) {
      setShowToast({
        key: "true",
        error: true,
        message: t("INVALID_MOBILE_NUMBER"),
      });
      return;
    }

    const userResponse = await Digit.UserService.userSearch(stateId, { userName: mobileNo }, {});

    if (!userResponse?.user?.length) {
      setShowToast({
        key: "true",
        warning: true,
        message: t("ERR_MOBILE_NUMBER_NOT_REGISTERED"),
      });
      return;
    }

    setUserInfo(userResponse.user[0]);
  };

  // Prefill UI on userInfo
  useEffect(() => {
    if (userInfo) {
      Object.entries(userInfo).forEach(([key, value]) => {
        if (key === "name") setValue("applicantOwnerOrFirmName", value, { shouldValidate: true });

        if (key === "emailId") setValue("applicantEmailId", value, { shouldValidate: true });

        if (key === "dob") setValue("applicantDateOfBirth", value, { shouldValidate: true });

        if (key === "fatherOrHusbandName") setValue("applicantFatherHusbandName", value);

        if (key === "permanentAddress") setValue("applicantAddress", value, { shouldValidate: true });

        if (key === "gender") {
          const genderObj = menu.find((obj) => obj.code === value);
          if (genderObj) setValue("applicantGender", genderObj, { shouldValidate: true });
        }
      });
    }
  }, [userInfo]);

  const isEdit = window.location.pathname.includes("edit");

  return (
    <React.Fragment>
      <CardSectionHeader className="card-section-header">{t("BPA_APPLICANT_DETAILS")}</CardSectionHeader>

      {isEdit && (
        <CardSectionSubText style={{ color: "red", margin: "10px 0px" }}>
          {t("To update your Mobile No, Name, Email, Date of Birth, or Gender, please go the Citizen's Edit Profile section")}
        </CardSectionSubText>
      )}

      <div>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_MOBILE_NO_LABEL")}`}*</CardLabel>
          <div style={{display:"flex"}} className="field">
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
              // render={(props) => <MobileNumber value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} />}
              render={(props) => (
                <TextInput
                  value={props.value}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                    setMobileNo(e.target.value);
                  }}
                  onBlur={props.onBlur}
                  disabled={isEdit}
                  t={t}
                />
              )}
            />
              <div style={{marginTop:"17px"}} className="search-icon" onClick={isEdit ? null : getOwnerDetails}>
            <SearchIcon />
          </div>
          </div>
        
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantMobileNumber?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_FIRM_OWNER_NAME_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantOwnerOrFirmName"
              rules={{
                required: t("REQUIRED_FIELD"),
                maxLength: { value: 100, message: t("MAX_100_CHARACTERS_ALLOWED") },
              }}
              render={(props) => <TextInput value={props.value} onChange={props.onChange} onBlur={props.onBlur} disabled={isEdit} t={t} />}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantOwnerOrFirmName ? errors.applicantOwnerOrFirmName.message : ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_EMAIL_LABEL")}`}*</CardLabel>
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
                  value={props.value}
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
        <CardLabelError style={errorStyle}>{errors?.applicantEmailId?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_FATHER_HUSBAND_NAME_LABEL")}`}</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantFatherHusbandName"
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
                />
              )}
            />
          </div>
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NEW_LAYOUT_APPLICANT_ADDRESS_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantAddress"
              rules={{
                required: t("REQUIRED_FIELD"),
                maxLength: {
                  value: 100,
                  message: t("MAX_100_CHARACTERS_ALLOWED"),
                },
              }}
              render={(props) => <TextArea value={props.value} onChange={props.onChange} onBlur={props.onBlur} t={t} />}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantAddress?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_DOB_LABEL")}`}*</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="applicantDateOfBirth"
              rules={{
                required: t("REQUIRED_FIELD"),
                validate: (value) => {
                  const today = new Date();
                  const dob = new Date(value);
                  const age = today.getFullYear() - dob.getFullYear();
                  const m = today.getMonth() - dob.getMonth();
                  const d = today.getDate() - dob.getDate();
                  const valid = age >= 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));
                  return valid || t("DOB_MUST_BE_18_YEARS_OLD");
                },
              }}
              render={(props) => (
                <TextInput
                  type="date"
                  value={props.value}
                  onChange={props.onChange}
                  onBlur={props.onBlur}
                  disabled={isEdit}
                  min="1900-01-01"
                  max={new Date().toISOString().split("T")[0]}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        <CardLabelError style={errorStyle}>{errors?.applicantDateOfBirth?.message || ""}</CardLabelError>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("BPA_APPLICANT_GENDER_LABEL")}`}*</CardLabel>
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
      {/* TOAST */}
      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default LayoutApplicantDetails;
