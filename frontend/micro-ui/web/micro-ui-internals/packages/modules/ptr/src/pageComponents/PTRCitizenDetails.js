import React, { useEffect } from "react";
import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const PTRCitizenDetails = ({ t, goNext, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const userInfo = Digit.UserService.getUser();
  const mobileNumber = userInfo?.info?.mobileNumber;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      mobileNumber: mobileNumber || "", // prefill here
    },
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

  const errorStyle = { width: "70%", marginLeft: "2%", fontSize: "12px", marginTop: "-21px" };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* First Name */}
          <CardLabel>{`${t("NDC_FIRST_NAME")}`} *</CardLabel>
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: t("PTR_FIRST_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                message: t("PTR_FIRST_NAME_INVALID"),
              },
              minLength: { value: 3, message: t("PTR_FIRST_NAME_MIN_LENGTH") },
              maxLength: { value: 40, message: t("PTR_FIRST_NAME_MAX_LENGTH") },
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

          {errors.firstName && <CardLabelError style={errorStyle}>{getErrorMessage("firstName")}</CardLabelError>}

          {/* Last Name */}
          <CardLabel>{`${t("NDC_LAST_NAME")}`} *</CardLabel>
          <Controller
            control={control}
            name="lastName"
            rules={{
              required: t("PTR_LAST_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                message: t("PTR_FIRST_NAME_INVALID"),
              },
              minLength: { value: 3, message: t("PTR_LAST_NAME_MIN_LENGTH") },
              maxLength: { value: 40, message: t("PTR_LAST_NAME_MAX_LENGTH") },
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
          {errors.lastName && <CardLabelError style={errorStyle}>{getErrorMessage("lastName")}</CardLabelError>}

          {/* Email */}
          <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} *</CardLabel>
          <Controller
            control={control}
            name="emailId"
            rules={{
              required: t("PTR_EMAIL_REQUIRED"),
              pattern: {
                value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
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
          {errors.emailId && <CardLabelError style={errorStyle}>{getErrorMessage("emailId")}</CardLabelError>}

          {/* Mobile Number */}
          <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} *</CardLabel>
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
          {errors.mobileNumber && <CardLabelError style={errorStyle}>{getErrorMessage("mobileNumber")}</CardLabelError>}

          {/* Father/Husband Name */}
          <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`} *</CardLabel>
          <Controller
            control={control}
            name="fatherOrHusbandName"
            rules={{
              required: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                message: t("PTR_FATHER_HUSBAND_NAME_INVALID"),
              },
              minLength: { value: 1, message: t("PTR_FATHER_HUSBAND_NAME_MIN_LENGTH") },
              maxLength: { value: 50, message: t("PTR_FATHER_HUSBAND_NAME_MAX_LENGTH") },
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
          {errors.fatherOrHusbandName && <CardLabelError style={errorStyle}>{getErrorMessage("fatherOrHusbandName")}</CardLabelError>}

          {/* Address */}
          <CardLabel>{`${t("PROPERTY_ADDRESS")}`} *</CardLabel>
          <Controller
            control={control}
            name="address"
            rules={{
              required: t("NDC_MESSAGE_ADDRESS"),
              pattern: {
                value: /^[A-Za-z0-9\s.,'/-]{10,}$/,
                message: t("PTR_ADDRESS_INVALID"),
              },
              minLength: { value: 10, message: t("PTR_ADDRESS_MIN_LENGTH") },
              maxLength: { value: 500, message: t("PTR_ADDRESS_MAX_LENGTH") },
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
          {errors.address && <CardLabelError style={errorStyle}>{getErrorMessage("address")}</CardLabelError>}

          {/* Pincode */}
          <CardLabel>{`${t("CORE_COMMON_PINCODE")}`} *</CardLabel>
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
                // onChange={(e) => onChange(e.target.value)}
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
          {errors.pincode && <CardLabelError style={errorStyle}>{getErrorMessage("pincode")}</CardLabelError>}
        </div>

        <ActionBar>
          <SubmitBar label={t("Next")} submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default PTRCitizenDetails;
