import React, { useEffect, useState } from "react";
import {
  TextInput,
  CardLabel,
  MobileNumber,
  TextArea,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Loader } from "../components/Loader";

const PTRCitizenDetails = ({ t, goNext, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const userInfo = Digit.UserService.getUser();
  console.log("userInfo?.info", userInfo?.info);
  const { mobileNumber, emailId, name } = userInfo?.info;
  const apiDataCheck = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData?.responseData);
  const [loader, setLoader] = useState(false);

  // Split full name into firstName (all but last word) and lastName (last word)
  // const [firstName, lastName] = [(name || "").trim().split(" ").slice(0, -1).join(" "), (name || "").trim().split(" ").slice(-1).join(" ")];

  const isCitizen = window.location.href.includes("citizen");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
    clearErrors,
  } = useForm({
    defaultValues: isCitizen
      ? {
          mobileNumber: mobileNumber || "",
          emailId: emailId || "",
          name: name || "",
          // lastName: lastName || "",
        }
      : {},
  });

  const onSubmit = (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    goNext(data);
  };

  useEffect(() => {
    const formattedData = apiDataCheck?.[0]?.owner || currentStepData?.ownerDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
      setValue("address", apiDataCheck?.[0]?.address?.addressId || currentStepData?.ownerDetails?.address || "");
      setValue("pincode", apiDataCheck?.[0]?.address?.pincode || currentStepData?.ownerDetails?.pincode || "");
    }
  }, [apiDataCheck, currentStepData, setValue]);

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;

    const error = errors[fieldName];
    if (error.message) return t(error.message);

    const fallbackMessages = {
      name: t("PTR_FIRST_NAME_REQUIRED"),
      // lastName: t("PTR_LAST_NAME_REQUIRED"),
      emailId: t("PTR_EMAIL_REQUIRED"),
      mobileNumber: t("PTR_MOBILE_REQUIRED"),
      fatherOrHusbandName: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
      address: t("PTR_ADDRESS_REQUIRED"),
      pincode: t("PTR_PINCODE_REQUIRED"),
    };

    return fallbackMessages[fieldName] || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  const handleMobileChange = async (value) => {
    setLoader(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      console.log("userData", userData);
      if (userData?.user?.[0]) {
        setValue("name", userData.user[0].name);
        setValue("emailId", userData.user[0].emailId);
        setValue("address", userData.user[0].permanentAddress);
        clearErrors(["name", "emailId"]);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  return (
    <React.Fragment>
      <form className="card" onSubmit={handleSubmit(onSubmit)}>
        <CardSectionHeader className="card-section-header">{t("PTR_CITIZEN_DETAILS")}</CardSectionHeader>

        {/* Mobile Number */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: t("PTR_MOBILE_REQUIRED"),
                pattern: {
                  value: /^[6-9][0-9]{9}$/,
                  message: t("PTR_MOBILE_INVALID"),
                },
              }}
              render={({ value, onChange, onBlur }) => (
                <MobileNumber
                  value={value}
                  onChange={(e) => {
                    onChange(e);
                    setValue("name", "");
                    // ✅ updates react-hook-form
                    if (e.length === 10) {
                      handleMobileChange(e); // 🔥 only then fire API
                    }
                  }}
                  onBlur={(e) => {
                    onBlur(e);
                    // trigger("mobileNumber");
                  }}
                  t={t}
                />
              )}
            />
            {errors.mobileNumber && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("mobileNumber")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        {/* First Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("ES_NEW_APPLICATION_APPLICANT_NAME")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="name"
              rules={{
                required: t("Applicant Name is Required"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("Applicant Name is Invalid"),
                },
                maxLength: { value: 100, message: "Maximum 100 characters" },
                minLength: { value: 2, message: "Minimum 2 characters" },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("name");
                  }}
                  t={t}
                />
              )}
            />
            {errors.name && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("name")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        {/* Email */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="emailId"
              rules={{
                required: t("PTR_EMAIL_REQUIRED"),
                pattern: {
                  value: /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
                  message: t("PTR_EMAIL_INVALID"),
                },
                maxLength: { value: 100, message: t("PTR_EMAIL_MAX_LENGTH") },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("emailId");
                  }}
                  t={t}
                />
              )}
            />
            {errors.emailId && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("emailId")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        {/* Father/Husband Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="fatherOrHusbandName"
              rules={{
                required: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("PTR_FATHER_HUSBAND_NAME_INVALID"),
                },
                maxLength: { value: 100, message: "Maximum 100 characters" },
                minLength: { value: 2, message: "Minimum 2 characters" },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("fatherOrHusbandName");
                  }}
                  t={t}
                />
              )}
            />
            {errors.fatherOrHusbandName && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("fatherOrHusbandName")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        {/* Address */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("PT_COMMON_COL_ADDRESS")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="address"
              rules={{
                required: t("NDC_MESSAGE_ADDRESS"),
                pattern: {
                  value: /^[A-Za-z0-9\s.,'/-]+$/,
                  message: t("PTR_ADDRESS_INVALID"),
                },
                maxLength: { value: 500, message: "Maximum 500 characters" },
                minLength: { value: 5, message: "Minimum 5 characters" },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextArea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("address");
                  }}
                  t={t}
                />
              )}
            />
            {errors.address && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("address")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        {/* Pincode */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("CORE_COMMON_PINCODE")}`} *</CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="pincode"
              rules={{
                required: t("PTR_PINCODE_REQUIRED"),
                pattern: {
                  value: /^[1-9][0-9]{5}$/,
                  message: t("PTR_PINCODE_INVALID"),
                },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  maxlength={6}
                  onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("pincode");
                  }}
                  t={t}
                />
              )}
            />
            {errors.pincode && <CardLabelError style={{ fontSize: "12px", marginTop: "4px" }}>{getErrorMessage("pincode")}</CardLabelError>}
          </div>
        </LabelFieldPair>

        <ActionBar>
          <SubmitBar label={t("Next")} submit="submit" />
        </ActionBar>
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default PTRCitizenDetails;
