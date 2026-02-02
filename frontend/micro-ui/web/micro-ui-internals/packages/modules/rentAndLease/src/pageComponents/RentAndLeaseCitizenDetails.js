import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Controller, useForm, useFieldArray } from "react-hook-form";
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
  Dropdown,
} from "@mseva/digit-ui-react-components";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";

const RentAndLeaseCitizenDetails = ({ t, goNext, onGoBack, currentStepData, validateStep, config }) => {
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const dispatch = useDispatch();
  const { triggerLoader, triggerToast } = config?.currStepConfig[0];

  const ownershipOptions = [
    { code: "SINGLE", name: t("RAL_SINGLE") },
    { code: "MULTIPLE", name: t("RAL_MULTIPLE") },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
    reset,
  } = useForm({
    defaultValues: {
      ownershipType: "",
      applicants: [],
    },
    mode: "onChange", // 👈 validates on every change
    reValidateMode: "onChange", // 👈 re-validates when value changes
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "applicants",
  });

  const buildAllotmentPayload = ({ propertyDetails, applicants, tenantId, previousApplicationNumber = null }) => {
    const startDateEpoch = propertyDetails?.startDate ? new Date(propertyDetails?.startDate).getTime() : null;
    const endDateEpoch = propertyDetails?.endDate ? new Date(propertyDetails?.endDate).getTime() : null;

    return {
      propertyId: propertyDetails.propertyId,
      tenantId,
      previousApplicationNumber,
      startDate: startDateEpoch,
      endDate: endDateEpoch,
      penaltyType: propertyDetails.penaltyType,
      workflow: {
        action: "INITIATE",
        comments: "",
        status: "INITIATED",
      },
      // Document: [],
      ownerInfo: applicants?.map((a) => {
        return {
          // firstName: a?.name,
          // middleName: a?.name,
          // lastName: a?.name,
          // gender: a?.gender || "male", // default if not captured
          // isPrimaryOwner: true,
          // ownerType: a.ownerType || "INDIVIDUAL",
          // ownershipPercentage: Math?.floor(100 / applicants.length),
          // relationship: a?.relationship || "SELF",
          name: a?.name,
          mobileNo: a?.mobileNumber,
          emailId: a?.emailId,
          correspondenceAddress: {
            pinCode: a?.pincode,
            city: a?.city || "",
            addressId: a?.address,
          },
          permanentAddress: {
            pinCode: a?.pincode,
            city: a?.city || "",
            addressId: a?.address,
          },
        };
      }),
    };
  };

  const onSubmit = async (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors)?.length > 0) return;
    }

    // ✅ Check for duplicate mobile numbers
    const mobiles = data.applicants.map((a) => a.mobileNumber).filter(Boolean);
    const duplicateMobile = mobiles.find((m, i) => mobiles.indexOf(m) !== i);
    if (duplicateMobile) {
      triggerToast(t("RAL_DUPLICATE_MOBILE_ERROR"), true);
      return;
    }

    const additionalDetails = {
      arrear: currentStepData?.propertyDetails?.arrear,
      arrearDoc: currentStepData?.propertyDetails?.arrearDoc,
      arrearEndDate: currentStepData?.propertyDetails?.arrearEndDate,
      arrearStartDate: currentStepData?.propertyDetails?.arrearStartDate,
      arrearReason: currentStepData?.propertyDetails?.arrearReason?.code,
      applicationType: currentStepData?.propertyDetails?.applicationType?.code,
      remarks: currentStepData?.propertyDetails?.remarks,
    };

    console.log("currentStepData", currentStepData);

    const payload = buildAllotmentPayload({
      propertyDetails: currentStepData?.propertyDetails,
      applicants: data?.applicants,
      additionalDetails,
      tenantId,
    });

    // ✅ If booking already exists, skip slot_search & create
    const existingPropertyAlloted = currentStepData?.CreatedResponse?.AllotmentDetails?.[0]?.applicationNumber;
    if (existingPropertyAlloted) {
      goNext(data);
      return;
    }

    triggerLoader(true);
    try {
      // Call create API
      const response = await Digit.RentAndLeaseService.create({ AllotmentDetails: [payload] }, tenantId);

      const status = response?.ResponseInfo?.status;
      const isSuccess = typeof status === "string" && status.toLowerCase() === "successful";

      if (isSuccess) {
        const appData = Array.isArray(response?.AllotmentDetails) ? response.AllotmentDetails[0] : response?.AllotmentDetails;

        dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("CreatedResponse", response));
        goNext(data);
      } else {
        triggerToast(t("CORE_SOMETHING_WENT_WRONG"), true);
      }
    } catch (err) {
      triggerToast(t("CORE_SOMETHING_WENT_WRONG"), true);
    } finally {
      triggerLoader(false);
    }
  };

  const getErrorMessage = (fieldName, index) => {
    const error = errors?.applicants?.[index]?.[fieldName];
    if (!error) return null;
    return error.message || t("PTR_FIELD_REQUIRED");
  };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleMobileChange = async (value, index) => {
    if (!value || value.length < 10) return;
    triggerLoader(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      const user = userData?.user?.[0] || {};
      setValue(`applicants.${index}.name`, user.name || "", { shouldValidate: true });
      setValue(`applicants.${index}.emailId`, user.emailId || "", { shouldValidate: true });
      setValue(`applicants.${index}.address`, user.permanentAddress || user?.correspondenceAddress || "", { shouldValidate: true });
      setValue(`applicants.${index}.pincode`, user.permanentPinCode || user?.correspondencePinCode || "", { shouldValidate: true });
    } catch (error) {
      console.error(error);
    } finally {
      triggerLoader(false);
    }
  };

  const debouncedHandleMobileChange = React.useCallback(debounce(handleMobileChange, 600), []);

  useEffect(() => {
    const ownershipType = watch("ownershipType");

    if (ownershipType === "SINGLE") {
      // ensure exactly one applicant
      if (fields.length === 0) {
        append({ mobileNumber: "", emailId: "", name: "", address: "", pincode: "" });
      } else if (fields.length > 1) {
        reset({ ownershipType: "SINGLE", applicants: [fields[0]] });
      }
    }

    if (ownershipType === "MULTIPLE") {
      // ensure at least two applicants
      if (fields.length < 2) {
        reset({
          ownershipType: "MULTIPLE",
          applicants: [
            { mobileNumber: "", emailId: "", name: "", address: "", pincode: "" },
            { mobileNumber: "", emailId: "", name: "", address: "", pincode: "" },
          ],
        });
      }
    }
  }, [watch("ownershipType")]);

  useEffect(() => {
    const applicantsData = currentStepData?.applicantDetails?.applicants || [];
    const ownershipTypeData = currentStepData?.applicantDetails?.ownershipType || "";

    if (Array.isArray(applicantsData) && applicantsData.length > 0) {
      reset({
        ownershipType: ownershipTypeData, // 👈 restore select box
        applicants: applicantsData, // 👈 restore applicants
      });
    }
  }, [currentStepData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("RAL_CITIZEN_DETAILS")}</CardSectionHeader>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RAL_OWNERSHIP_TYPE") || "Tenant Type"} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="ownershipType"
          rules={{ required: t("PTR_FIELD_REQUIRED") || "Tenant Type is required" }}
          render={(props) => (
            <Dropdown
              className="form-field"
              select={(selected) => props.onChange(selected.code)} // store code in form
              selected={ownershipOptions.find((opt) => opt.code === props.value)}
              option={ownershipOptions}
              optionKey="name"
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors?.ownershipType && <CardLabelError className="ral-error-label">{errors.ownershipType.message}</CardLabelError>}
      {watch("ownershipType") &&
        fields?.map((field, index) => (
          <div key={field?.id} className="ral-applicant-container">
            <div className="ral-applicant-header-row">
              <CardSectionHeader>
                {t("RAL_APPLICANT")} #{index + 1}
              </CardSectionHeader>
              {/* Remove applicant */}
              {watch("ownershipType") === "MULTIPLE" && fields?.length > 2 && (
                <SubmitBar label={<span>❌</span>} className="ral-remove-btn" onSubmit={() => remove(index)} />
              )}
            </div>

            {/* Mobile Number */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_MOBILE_NO_LABEL")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`applicants.${index}.mobileNumber`}
                  rules={{
                    required: t("PTR_MOBILE_REQUIRED"),
                    pattern: { value: /^[6-9][0-9]{9}$/, message: t("PTR_MOBILE_INVALID") },
                  }}
                  render={({ value, onChange, onBlur }) => (
                    <MobileNumber
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        debouncedHandleMobileChange(e, index);
                      }}
                      onBlur={(e) => {
                        onBlur(e);
                        trigger(`applicants.${index}.mobileNumber`);
                      }}
                      t={t}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {getErrorMessage("mobileNumber", index) && (
              <CardLabelError className="ral-error-label">{getErrorMessage("mobileNumber", index)}</CardLabelError>
            )}

            {/* Name */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("ES_NEW_APPLICATION_APPLICANT_NAME")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`applicants.${index}.name`}
                  rules={{ required: t("PTR_FIRST_NAME_REQUIRED") }}
                  render={({ value, onChange, onBlur }) => (
                    <TextInput
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={(e) => {
                        onBlur(e);
                        trigger(`applicants.${index}.name`);
                      }}
                      t={t}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {getErrorMessage("name", index) && <CardLabelError className="ral-error-label">{getErrorMessage("name", index)}</CardLabelError>}

            {/* Email */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_EMAIL_LABEL")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`applicants.${index}.emailId`}
                  rules={{ required: t("PTR_EMAIL_REQUIRED") }}
                  render={({ value, onChange, onBlur }) => (
                    <TextInput
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={(e) => {
                        onBlur(e);
                        trigger(`applicants.${index}.emailId`);
                      }}
                      t={t}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {getErrorMessage("emailId", index) && <CardLabelError className="ral-error-label">{getErrorMessage("emailId", index)}</CardLabelError>}

            {/* Address */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("PT_COMMON_COL_ADDRESS")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`applicants.${index}.address`}
                  rules={{ required: t("PTR_ADDRESS_REQUIRED") }}
                  render={({ value, onChange, onBlur }) => (
                    <TextArea
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onBlur={(e) => {
                        onBlur(e);
                        trigger(`applicants.${index}.address`);
                      }}
                      t={t}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {getErrorMessage("address", index) && <CardLabelError className="ral-error-label">{getErrorMessage("address", index)}</CardLabelError>}

            {/* Pincode */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("CORE_COMMON_PINCODE")} <span className="mandatory-asterisk">*</span>
              </CardLabel>
              <div className="form-field">
                <Controller
                  control={control}
                  name={`applicants.${index}.pincode`}
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
                        trigger(`applicants.${index}.pincode`);
                      }}
                      t={t}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {getErrorMessage("pincode", index) && <CardLabelError className="ral-error-label">{getErrorMessage("pincode", index)}</CardLabelError>}
          </div>
        ))}

      {/* Add applicant */}
      {watch("ownershipType") === "MULTIPLE" && (
        <div className="ral-add-applicant-row">
          <SubmitBar
            label={<span>➕{t("RAL_ADD_APPLICANT")}</span>}
            className="ral-add-applicant-btn"
            onSubmit={() => append({ mobileNumber: "", emailId: "", name: "", address: "", pincode: "" })}
          />
        </div>
      )}

      <ActionBar>
        <SubmitBar label={t("Back")} className="ral-back-btn" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default RentAndLeaseCitizenDetails;
