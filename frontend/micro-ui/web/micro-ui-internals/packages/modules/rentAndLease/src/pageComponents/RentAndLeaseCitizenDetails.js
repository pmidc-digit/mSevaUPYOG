// import React, { useEffect, useState } from "react";
// import {
//   TextInput,
//   CardLabel,
//   MobileNumber,
//   TextArea,
//   ActionBar,
//   SubmitBar,
//   CardLabelError,
//   LabelFieldPair,
//   CardSectionHeader,
// } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { Loader } from "../../../challanGeneration/src/components/Loader";

// const RentAndLeaseCitizenDetails = ({ t, goNext, onGoBack, currentStepData, validateStep }) => {
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const stateId = Digit.ULBService.getStateId();
//   const userInfo = Digit.UserService.getUser();
//   const { mobileNumber, emailId, name } = userInfo?.info || {};
//   const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);
//   const [isLoading, setIsLoading] = useState(false);

//   console.log('apiDataCheck', apiDataCheck)

//   const isCitizen = window.location.href.includes("citizen");
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//     trigger,
//   } = useForm({
//     defaultValues: isCitizen
//       ? {
//           mobileNumber: mobileNumber || "",
//           emailId: emailId || "",
//           name: name || "",
//         }
//       : {},
//   });

//   const onSubmit = (data) => {
//     console.log("RentAndLeaseCitizenDetails - onSubmit called with data:", data);
//     console.log("RentAndLeaseCitizenDetails - Form errors:", errors);
//     if (validateStep) {
//       const validationErrors = validateStep(data);
//       if (Object.keys(validationErrors).length > 0) {
//         console.log("RentAndLeaseCitizenDetails - Validation errors:", validationErrors);
//         return;
//       }
//     }
//     console.log("RentAndLeaseCitizenDetails - Calling goNext with data:", data);
//     goNext(data);
//   };

//   useEffect(() => {
//     const formattedData = apiDataCheck?.[0]?.applicant || currentStepData?.applicantDetails;
//     if (formattedData) {
//       Object.entries(formattedData).forEach(([key, value]) => {
//         setValue(key, value);
//       });
//       setValue("address", apiDataCheck?.[0]?.address?.addressId || currentStepData?.applicantDetails?.address || "");
//       setValue("pincode", apiDataCheck?.[0]?.address?.pincode || currentStepData?.applicantDetails?.pincode || "");
//     }
//   }, [apiDataCheck, currentStepData, setValue]);

//   const getErrorMessage = (fieldName) => {
//     if (!errors[fieldName]) return null;

//     const error = errors[fieldName];
//     if (error.message) return t(error.message);

//     const fallbackMessages = {
//       name: t("PTR_FIRST_NAME_REQUIRED"),
//       emailId: t("PTR_EMAIL_REQUIRED"),
//       mobileNumber: t("PTR_MOBILE_REQUIRED"),
//       address: t("PTR_ADDRESS_REQUIRED"),
//       pincode: t("PTR_PINCODE_REQUIRED"),
//     };

//     return fallbackMessages[fieldName] || t("PTR_FIELD_REQUIRED");
//   };

//   const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" ,color: "red"};
//   const mandatoryStyle = { color: "red" };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     console.log("RentAndLeaseCitizenDetails - Form submit triggered");
//     handleSubmit(onSubmit)(e);
//   };

//   const debounce = (func, delay) => {
//     let timer;
//     return (...args) => {
//       clearTimeout(timer);
//       timer = setTimeout(() => func(...args), delay);
//     };
//   };

//   const handleMobileChange = async (value) => {
//     // only proceed if we have at least 10 digits
//     if (!value || value.length < 10) return;
//     setIsLoading(true);
//     try {
//       const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
//       const user = userData?.user?.[0] || {};
//       setValue("name", user.name || "");
//       setValue("emailId", user.emailId || "");
//       setValue("address", user.permanentAddress || "");
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const debouncedHandleMobileChange = React.useCallback(
//     debounce(handleMobileChange, 600),
//     [] // add dependencies here if handleMobileChange depends on props/state
//   );

//   return (
//     <React.Fragment>
//       <form onSubmit={handleFormSubmit}>
//         <CardSectionHeader className="card-section-header">{t("RAL_CITIZEN_DETAILS")}</CardSectionHeader>
//         {/* Mobile Number */}
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}  <span style={mandatoryStyle}>*</span></CardLabel>
//           <div className="field">
//             <Controller
//               control={control}
//               name="mobileNumber"
//               rules={{
//                 required: t("PTR_MOBILE_REQUIRED"),
//                 pattern: {
//                   value: /^[6-9][0-9]{9}$/,
//                   message: t("PTR_MOBILE_INVALID"),
//                 },
//                 minLength: { value: 10, message: t("PTR_MOBILE_MIN_LENGTH") },
//                 maxLength: { value: 10, message: t("PTR_MOBILE_MAX_LENGTH") },
//               }}
//               render={({ value, onChange, onBlur }) => (
//                 <MobileNumber
//                   value={value}
//                   onChange={
//                     !isCitizen &&
//                     ((e) => {
//                       onChange(e);
//                       debouncedHandleMobileChange(e);
//                     })
//                   }
//                   onBlur={
//                     isCitizen &&
//                     ((e) => {
//                       onBlur(e);
//                       trigger("mobileNumber");
//                     })
//                   }
//                   t={t}
//                 />
//               )}
//             />
//           </div>
//         </LabelFieldPair>
//         {errors.mobileNumber && <CardLabelError style={errorStyle}>{getErrorMessage("mobileNumber")}</CardLabelError>}
//         {/* Applicant Name */}
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{`${t("ES_NEW_APPLICATION_APPLICANT_NAME")}`} <span style={mandatoryStyle}>*</span></CardLabel>
//           <div className="field">
//             <Controller
//               control={control}
//               name="name"
//               rules={{
//                 required: t("PTR_FIRST_NAME_REQUIRED"),
//                 pattern: {
//                   value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/,
//                   message: t("PTR_FIRST_NAME_INVALID"),
//                 },
//                 maxLength: { value: 100, message: "Maximum 100 characters" },
//                 minLength: { value: 2, message: "Minimum 2 characters" },
//               }}
//               render={({ value, onChange, onBlur }) => (
//                 <TextInput
//                   value={value}
//                   onChange={(e) => onChange(e.target.value)}
//                   onBlur={(e) => {
//                     onBlur(e);
//                     trigger("name");
//                   }}
//                   t={t}
//                 />
//               )}
//             />
//           </div>
//         </LabelFieldPair>
//         {errors.name && <CardLabelError style={errorStyle}>{getErrorMessage("name")}</CardLabelError>}

//         {/* Email */}
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} <span style={mandatoryStyle}>*</span></CardLabel>
//           <div className="field">
//             <Controller
//               control={control}
//               name="emailId"
//               rules={{
//                 required: t("PTR_EMAIL_REQUIRED"),
//                 pattern: {
//                   value: /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
//                   message: t("PTR_EMAIL_INVALID"),
//                 },
//                 maxLength: { value: 100, message: t("PTR_EMAIL_MAX_LENGTH") },
//               }}
//               render={({ value, onChange, onBlur }) => (
//                 <TextInput
//                   value={value}
//                   onChange={(e) => onChange(e.target.value)}
//                   onBlur={(e) => {
//                     onBlur(e);
//                     trigger("emailId");
//                   }}
//                   t={t}
//                 />
//               )}
//             />
//           </div>
//         </LabelFieldPair>
//         {errors.emailId && <CardLabelError style={errorStyle}>{getErrorMessage("emailId")}</CardLabelError>}

//         {/* Address */}
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{`${t("PT_COMMON_COL_ADDRESS")}`} <span style={mandatoryStyle}>*</span></CardLabel>
//           <div className="field">
//             <Controller
//               control={control}
//               name="address"
//               rules={{
//                 required: t("NDC_MESSAGE_ADDRESS"),
//                 pattern: {
//                   value: /^[A-Za-z0-9\s.,'/-]+$/,
//                   message: t("PTR_ADDRESS_INVALID"),
//                 },
//                 maxLength: { value: 500, message: "Maximum 500 characters" },
//                 minLength: { value: 5, message: "Minimum 5 characters" },
//               }}
//               render={({ value, onChange, onBlur }) => (
//                 <TextArea
//                   value={value}
//                   onChange={(e) => onChange(e.target.value)}
//                   onBlur={(e) => {
//                     onBlur(e);
//                     trigger("address");
//                   }}
//                   t={t}
//                 />
//               )}
//             />
//           </div>
//         </LabelFieldPair>
//         {errors.address && <CardLabelError style={errorStyle}>{getErrorMessage("address")}</CardLabelError>}

//         {/* Pincode */}
//         <LabelFieldPair>
//           <CardLabel className="card-label-smaller">{`${t("CORE_COMMON_PINCODE")}`} <span style={mandatoryStyle}>*</span></CardLabel>
//           <div className="field">
//             <Controller
//               control={control}
//               name="pincode"
//               rules={{
//                 required: t("PTR_PINCODE_REQUIRED"),
//                 pattern: {
//                   value: /^[1-9][0-9]{5}$/,
//                   message: t("PTR_PINCODE_INVALID"),
//                 },
//               }}
//               render={({ value, onChange, onBlur }) => (
//                 <TextInput
//                   value={value}
//                   maxlength={6}
//                   onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
//                   onBlur={(e) => {
//                     onBlur(e);
//                     trigger("pincode");
//                   }}
//                   t={t}
//                 />
//               )}
//             />
//           </div>
//         </LabelFieldPair>
//         {errors.pincode && <CardLabelError style={errorStyle}>{getErrorMessage("pincode")}</CardLabelError>}

//         <ActionBar>
//           <SubmitBar
//             label="Back"
//             style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "5px" }}
//             onSubmit={onGoBack}
//           />
//           <SubmitBar label={t("Next")} submit="submit" />
//         </ActionBar>
//         {isLoading && <Loader page={true} />}
//       </form>
//     </React.Fragment>
//   );
// };

// export default RentAndLeaseCitizenDetails;

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
  Dropdown,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Loader } from "../../../challanGeneration/src/components/Loader";

const RentAndLeaseCitizenDetails = ({ t, goNext, onGoBack, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [isLoading, setIsLoading] = useState(false);

  console.log("currentStepData", currentStepData);

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

  const onSubmit = (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors)?.length > 0) return;
    }

    // ✅ Check for duplicate mobile numbers
    const mobiles = data.applicants.map((a) => a.mobileNumber).filter(Boolean);
    const duplicateMobile = mobiles.find((m, i) => mobiles.indexOf(m) !== i);
    if (duplicateMobile) {
      alert(t("RAL_DUPLICATE_MOBILE_ERROR")); // or set a form error
      return;
    }

    // ✅ Check for duplicate emails
    const emails = data.applicants.map((a) => a.emailId).filter(Boolean);
    const duplicateEmail = emails.find((e, i) => emails.indexOf(e) !== i);
    if (duplicateEmail) {
      alert(t("RAL_DUPLICATE_EMAIL_ERROR"));
      return;
    }
    goNext(data);
  };

  useEffect(() => {
  const applicantsData = currentStepData?.applicantDetails?.applicants || [];
  const ownershipTypeData = currentStepData?.applicantDetails?.ownershipType || "";

  if (Array.isArray(applicantsData) && applicantsData.length > 0) {
    reset({
      ownershipType: ownershipTypeData,   // 👈 restore select box
      applicants: applicantsData          // 👈 restore applicants
    });
  }
}, [currentStepData, reset]);


  const getErrorMessage = (fieldName, index) => {
    const error = errors?.applicants?.[index]?.[fieldName];
    if (!error) return null;
    return error.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px", color: "red" };
  const mandatoryStyle = { color: "red" };

  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const handleMobileChange = async (value, index) => {
    if (!value || value.length < 10) return;
    setIsLoading(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      const user = userData?.user?.[0] || {};
      setValue(`applicants.${index}.name`, user.name || "", { shouldValidate: true });
      setValue(`applicants.${index}.emailId`, user.emailId || "", { shouldValidate: true });
      setValue(`applicants.${index}.address`, user.permanentAddress || "", { shouldValidate: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedHandleMobileChange = React.useCallback(debounce(handleMobileChange, 600), []);

  useEffect(() => {
    const ownershipType = watch("ownershipType");
    if (ownershipType === "MULTIPLE" && fields.length < 2) {
      append({ mobileNumber: "", emailId: "", name: "", address: "", pincode: "" });
      append({ mobileNumber: "", emailId: "", name: "", address: "", pincode: "" });
    }
    if (ownershipType === "SINGLE" && fields.length > 1) {
      reset({ ownershipType: "SINGLE", applicants: [fields[0]] });
    }
  }, [watch("ownershipType")]);

  const ownershipOptions = [
    { code: "SINGLE", name: t("RAL_SINGLE") },
    { code: "MULTIPLE", name: t("RAL_MULTIPLE") },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("RAL_CITIZEN_DETAILS")}</CardSectionHeader>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RAL_OWNERSHIP_TYPE") || "Ownership Type"} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="ownershipType"
          rules={{ required: t("PTR_FIELD_REQUIRED") || "Ownership Type is required" }}
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
      {watch("ownershipType") &&
        fields?.map((field, index) => (
          <div key={field?.id} style={{ border: "1px solid #ddd", padding: "12px", marginBottom: "16px", borderRadius: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <CardSectionHeader>
                {t("RAL_APPLICANT")} #{index + 1}
              </CardSectionHeader>
              {/* Remove applicant */}
              {(watch("ownershipType") === "MULTIPLE" ? fields.length > 1 : fields.length > 2) && (
                <SubmitBar
                  label={<span>❌{t("RAL_Remove_APPLICANT")}</span>}
                  style={{ border: "1px solid #d33", background: "transparent", color: "#d33" }}
                  onSubmit={() => remove(index)}
                />
              )}
            </div>

            {/* Mobile Number */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_MOBILE_NO_LABEL")} <span style={mandatoryStyle}>*</span>
              </CardLabel>
              <div className="field">
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
            {getErrorMessage("mobileNumber", index) && <CardLabelError style={errorStyle}>{getErrorMessage("mobileNumber", index)}</CardLabelError>}

            {/* Name */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("ES_NEW_APPLICATION_APPLICANT_NAME")} <span style={mandatoryStyle}>*</span>
              </CardLabel>
              <div className="field">
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
            {getErrorMessage("name", index) && <CardLabelError style={errorStyle}>{getErrorMessage("name", index)}</CardLabelError>}

            {/* Email */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("NOC_APPLICANT_EMAIL_LABEL")} <span style={mandatoryStyle}>*</span>
              </CardLabel>
              <div className="field">
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
            {getErrorMessage("emailId", index) && <CardLabelError style={errorStyle}>{getErrorMessage("emailId", index)}</CardLabelError>}

            {/* Address */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("PT_COMMON_COL_ADDRESS")} <span style={mandatoryStyle}>*</span>
              </CardLabel>
              <div className="field">
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
            {getErrorMessage("address", index) && <CardLabelError style={errorStyle}>{getErrorMessage("address", index)}</CardLabelError>}

            {/* Pincode */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {t("CORE_COMMON_PINCODE")} <span style={mandatoryStyle}>*</span>
              </CardLabel>
              <div className="field">
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
            {getErrorMessage("pincode", index) && <CardLabelError style={errorStyle}>{getErrorMessage("pincode", index)}</CardLabelError>}
          </div>
        ))}

      {/* Add applicant */}
      {watch("ownershipType") === "MULTIPLE" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <SubmitBar
            label={<span>➕{t("RAL_ADD_APPLICANT")}</span>}
            style={{ border: "1px solid #2947a3", background: "transparent", color: "#2947a3" }}
            onSubmit={() => append({ mobileNumber: "", emailId: "", name: "", address: "", pincode: "" })}
          />
        </div>
      )}

      <ActionBar>
        <SubmitBar
          label={t("Back")}
          style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "8px" }}
          onSubmit={onGoBack}
        />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>

      {isLoading && <Loader page={true} />}
    </form>
  );
};

export default RentAndLeaseCitizenDetails;
