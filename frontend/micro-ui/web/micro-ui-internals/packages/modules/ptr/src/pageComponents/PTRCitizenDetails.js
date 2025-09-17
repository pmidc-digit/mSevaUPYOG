import React, { useEffect } from "react";
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

const PTRCitizenDetails = ({ t, goNext, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const userInfo = Digit.UserService.getUser();
  console.log("userInfo?.info", userInfo?.info);
  const { mobileNumber, emailId, name } = userInfo?.info;
  // Split full name into firstName (all but last word) and lastName (last word)
  const [firstName, lastName] = [(name || "").trim().split(" ").slice(0, -1).join(" "), (name || "").trim().split(" ").slice(-1).join(" ")];

  const isCitizen = window.location.href.includes("citizen");
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: isCitizen
      ? {
          mobileNumber: mobileNumber || "",
          emailId: emailId || "",
          firstName: firstName || "",
          lastName: lastName || "",
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
    const formattedData = currentStepData?.ownerDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;

    const error = errors[fieldName];
    if (error.message) return t(error.message);

    const fallbackMessages = {
      firstName: t("PTR_FIRST_NAME_REQUIRED"),
      lastName: t("PTR_LAST_NAME_REQUIRED"),
      emailId: t("PTR_EMAIL_REQUIRED"),
      mobileNumber: t("PTR_MOBILE_REQUIRED"),
      fatherOrHusbandName: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
      address: t("PTR_ADDRESS_REQUIRED"),
      pincode: t("PTR_PINCODE_REQUIRED"),
    };

    return fallbackMessages[fieldName] || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardSectionHeader className="card-section-header">{t("PTR_CITIZEN_DETAILS")}</CardSectionHeader>

        {/* First Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NDC_FIRST_NAME")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="firstName"
              rules={{
                required: t("PTR_FIRST_NAME_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("PTR_FIRST_NAME_INVALID"),
                },
                maxLength: { value: 18, message: "Maximum 18 characters" },
                minLength: { value: 2, message: "Minimum 2 characters" },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("firstName");
                  }}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.firstName && <CardLabelError style={errorStyle}>{getErrorMessage("firstName")}</CardLabelError>}

        {/* Last Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NDC_LAST_NAME")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="lastName"
              rules={{
                required: t("PTR_LAST_NAME_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("PTR_FIRST_NAME_INVALID"),
                },
                maxLength: { value: 18, message: "Maximum 18 characters" },
                minLength: { value: 2, message: "Minimum 2 characters" },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("lastName");
                  }}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.lastName && <CardLabelError style={errorStyle}>{getErrorMessage("lastName")}</CardLabelError>}

        {/* Email */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="emailId"
              rules={{
                required: t("PTR_EMAIL_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
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
          </div>
        </LabelFieldPair>
        {errors.emailId && <CardLabelError style={errorStyle}>{getErrorMessage("emailId")}</CardLabelError>}

        {/* Mobile Number */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: t("PTR_MOBILE_REQUIRED"),
                pattern: {
                  value: /^[6-9][0-9]{9}$/,
                  message: t("PTR_MOBILE_INVALID"),
                },
                minLength: { value: 10, message: t("PTR_MOBILE_MIN_LENGTH") },
                maxLength: { value: 10, message: t("PTR_MOBILE_MAX_LENGTH") },
              }}
              render={({ value, onChange, onBlur }) => (
                <MobileNumber
                  value={value}
                  onChange={onChange}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("mobileNumber");
                  }}
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.mobileNumber && <CardLabelError style={errorStyle}>{getErrorMessage("mobileNumber")}</CardLabelError>}

        {/* Father/Husband Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="fatherOrHusbandName"
              rules={{
                required: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("PTR_FATHER_HUSBAND_NAME_INVALID"),
                },
                maxLength: { value: 18, message: "Maximum 18 characters" },
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
          </div>
        </LabelFieldPair>
        {errors.fatherOrHusbandName && <CardLabelError style={errorStyle}>{getErrorMessage("fatherOrHusbandName")}</CardLabelError>}

        {/* Address */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("PT_COMMON_COL_ADDRESS")}`} *</CardLabel>
          <div className="field">
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
          </div>
        </LabelFieldPair>
        {errors.address && <CardLabelError style={errorStyle}>{getErrorMessage("address")}</CardLabelError>}

        {/* Pincode */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("CORE_COMMON_PINCODE")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="pincode"
              rules={{
                required: t("PTR_PINCODE_REQUIRED"),
                pattern: {
                  value: /^[1-9][0-9]{5}$/,
                  message: t("PTR_PINCODE_INVALID"),
                },
                minLength: { value: 6, message: t("PTR_PINCODE_MIN_LENGTH") },
                maxLength: { value: 6, message: t("PTR_PINCODE_MAX_LENGTH") },
              }}
              render={({ value, onChange, onBlur }) => (
                <TextInput
                  value={value}
                  onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                  onBlur={(e) => {
                    onBlur(e);
                    trigger("pincode");
                  }}
                  t={t}
                  maxLength={6}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.pincode && <CardLabelError style={errorStyle}>{getErrorMessage("pincode")}</CardLabelError>}

        <ActionBar>
          <SubmitBar label={t("Next")} submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default PTRCitizenDetails;
