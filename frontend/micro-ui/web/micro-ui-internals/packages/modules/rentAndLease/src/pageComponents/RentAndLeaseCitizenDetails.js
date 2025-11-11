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
import { Loader } from "../../../challanGeneration/src/components/Loader";

const RentAndLeaseCitizenDetails = ({ t, goNext, onGoBack, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const userInfo = Digit.UserService.getUser();
  const { mobileNumber, emailId, name } = userInfo?.info || {};
  const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);
  const [isLoading, setIsLoading] = useState(false);

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
          name: name || "",
        }
      : {},
  });

  const onSubmit = (data) => {
    console.log("RentAndLeaseCitizenDetails - onSubmit called with data:", data);
    console.log("RentAndLeaseCitizenDetails - Form errors:", errors);
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) {
        console.log("RentAndLeaseCitizenDetails - Validation errors:", validationErrors);
        return;
      }
    }
    console.log("RentAndLeaseCitizenDetails - Calling goNext with data:", data);
    goNext(data);
  };

  useEffect(() => {
    const formattedData = apiDataCheck?.[0]?.applicant || currentStepData?.applicantDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
      setValue("address", apiDataCheck?.[0]?.address?.addressId || currentStepData?.applicantDetails?.address || "");
      setValue("pincode", apiDataCheck?.[0]?.address?.pincode || currentStepData?.applicantDetails?.pincode || "");
    }
  }, [apiDataCheck, currentStepData, setValue]);

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;

    const error = errors[fieldName];
    if (error.message) return t(error.message);

    const fallbackMessages = {
      name: t("PTR_FIRST_NAME_REQUIRED"),
      emailId: t("PTR_EMAIL_REQUIRED"),
      mobileNumber: t("PTR_MOBILE_REQUIRED"),
      address: t("PTR_ADDRESS_REQUIRED"),
      pincode: t("PTR_PINCODE_REQUIRED"),
    };

    return fallbackMessages[fieldName] || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("RentAndLeaseCitizenDetails - Form submit triggered");
    handleSubmit(onSubmit)(e);
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleMobileChange = async (value) => {
    // only proceed if we have at least 10 digits
    if (!value || value.length < 10) return;
    setIsLoading(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      const user = userData?.user?.[0] || {};
      setValue("name", user.name || "");
      setValue("emailId", user.emailId || "");
      setValue("address", user.permanentAddress || "");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedHandleMobileChange = React.useCallback(
    debounce(handleMobileChange, 700),
    [] // add dependencies here if handleMobileChange depends on props/state
  );

  return (
    <React.Fragment>
      <form onSubmit={handleFormSubmit}>
        <CardSectionHeader className="card-section-header">{t("PTR_CITIZEN_DETAILS")}</CardSectionHeader>
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
                  onChange={
                    !isCitizen &&
                    ((e) => {
                      onChange(e);
                      debouncedHandleMobileChange(e);
                    })
                  }
                  onBlur={
                    isCitizen &&
                    ((e) => {
                      onBlur(e);
                      trigger("mobileNumber");
                    })
                  }
                  t={t}
                />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.mobileNumber && <CardLabelError style={errorStyle}>{getErrorMessage("mobileNumber")}</CardLabelError>}
        {/* Applicant Name */}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("ES_NEW_APPLICATION_APPLICANT_NAME")}`} *</CardLabel>
          <div className="field">
            <Controller
              control={control}
              name="name"
              rules={{
                required: t("PTR_FIRST_NAME_REQUIRED"),
                pattern: {
                  value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
                  message: t("PTR_FIRST_NAME_INVALID"),
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
          </div>
        </LabelFieldPair>
        {errors.name && <CardLabelError style={errorStyle}>{getErrorMessage("name")}</CardLabelError>}

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
          </div>
        </LabelFieldPair>
        {errors.emailId && <CardLabelError style={errorStyle}>{getErrorMessage("emailId")}</CardLabelError>}

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
          </div>
        </LabelFieldPair>
        {errors.pincode && <CardLabelError style={errorStyle}>{getErrorMessage("pincode")}</CardLabelError>}

        <ActionBar>
          <SubmitBar
            label="Back"
            style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "5px" }}
            onSubmit={onGoBack}
          />
          <SubmitBar label={t("Next")} submit="submit" />
        </ActionBar>
        {isLoading && <Loader page={true} />}
      </form>
    </React.Fragment>
  );
};

export default RentAndLeaseCitizenDetails;
