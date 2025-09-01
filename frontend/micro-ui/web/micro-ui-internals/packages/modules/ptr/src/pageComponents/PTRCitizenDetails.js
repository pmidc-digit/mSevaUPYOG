// import React, { useEffect, useState } from "react";
// import {
//   TextInput,
//   CardLabel,
//   MobileNumber,
//   TextArea,
//   ActionBar,
//   SubmitBar,
//   Toast,
// } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";

// const PTRCitizenDetails = ({ t, goNext, currentStepData }) => {
//   const { control, handleSubmit, setValue, getValues,errors } = useForm();
//   const [showToast, setShowToast] = useState(false);
//   const [error, setError] = useState("");
//   console.log('errors', errors)

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const stateId = Digit.ULBService.getStateId();

//   useEffect(() => {
//     const formattedData = currentStepData?.ownerDetails;
//     if (formattedData) {
//       Object.entries(formattedData).forEach(([key, value]) => {
//         setValue(key, value);
//       });
//     }
//   }, [currentStepData, setValue]);

//   const validateData = (data) => {
//     const missingFields = [];

//     if (!data.firstName) missingFields.push("First Name");
//     if (!data.lastName) missingFields.push("Last Name");
//     if (!data.emailId) missingFields.push("Email ID");
//     if (!data.mobileNumber) missingFields.push("Mobile Number");
//     if (!data.fatherName) missingFields.push("Father/Husband Name");
//     if (!data.address) missingFields.push("Address");

//     return missingFields;
//   };

//   const onSubmit = () => {
//     console.log("submit")
//     const data = getValues();
//     console.log('data', data)
//     const missingFields = validateData(data);
//     console.log('missingFields', missingFields)

//     if (missingFields.length > 0) {
//       setError(`Please fill the following fields: ${missingFields.join(", ")}`);
//       setShowToast(true);
//       return;
//     }

//     goNext(data);
//   };

//   const closeToast = () => {
//     setShowToast(false);
//     setError("");
//   };

//   const errorStyle = { width: "70%", fontSize: "12px", marginTop: "-21px",color: "red" };

//   return (
//     <React.Fragment>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div>
//           <CardLabel >{`${t("NDC_FIRST_NAME")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="firstName"
//            rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 100, message: t("MAX_LENGTH_100") },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <TextInput value={value} onChange={onChange} onBlur={onBlur} t={t}/>
//             )}

//           />
//           {errors.firstName && <p style={errorStyle}>{t(errors.firstName.message)}</p>}

//           <CardLabel>{`${t("NDC_LAST_NAME")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="lastName"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: {
//                 value: 100,
//                 message: t("MAX_LENGTH_100"),
//               },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <TextInput value={value} onChange={onChange} onBlur={onBlur} t={t} />
//             )}
//           />
//             {errors.lastName && <p style={errorStyle}>{t(errors.lastName.message)}</p>}

//           <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="emailId"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               pattern: {
//                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                 message: t("INVALID_EMAIL_FORMAT"),
//               },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <TextInput value={value} onChange={onChange} onBlur={onBlur} t={t} />
//             )}
//           />
//            {errors.emailId && <p style={errorStyle}>{t(errors.emailId.message)}</p>}

//           <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="mobileNumber"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               pattern: {
//                 value: /^[0-9]{10}$/,
//                 message: t("INVALID_MOBILE_FORMAT"),
//               },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <MobileNumber value={value} onChange={onChange} onBlur={onBlur} t={t} />
//             )}
//           />
//             {errors.mobileNumber && <p style={errorStyle}>{t(errors.mobileNumber.message)}</p>}

//           <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="fatherName"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: {
//                 value: 100,
//                 message: t("MAX_LENGTH_100"),
//               },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <TextInput value={value} onChange={onChange} onBlur={onBlur} t={t} />
//             )}
//           />
//            {errors.fatherName && <p style={errorStyle}>{t(errors.fatherName.message)}</p>}

//           <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="address"
//              rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: {
//                 value: 100,
//                 message: t("MAX_LENGTH_100"),
//               },
//             }}
//             render={({ value, onChange, onBlur }) => (
//               <TextArea value={value} onChange={onChange} onBlur={onBlur} t={t} />
//             )}
//           />
//           {errors.address && <p style={errorStyle}>{t(errors.address.message)}</p>}
//         </div>

//         <ActionBar>
//           <SubmitBar label="Next" submit="submit" />
//         </ActionBar>
//       </form>

//       {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
//     </React.Fragment>
//   );
// };

// export default PTRCitizenDetails;

// import React, { useEffect, useState } from "react";
// import {
//   TextInput,
//   CardLabel,
//   MobileNumber,
//   TextArea,
//   ActionBar,
//   SubmitBar,
//   Toast,
// } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";

// const PTRCitizenDetails = ({ t, goNext, currentStepData }) => {
//   const {
//     control,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//   } = useForm();

//   const [showToast, setShowToast] = useState(false);

//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const stateId = Digit.ULBService.getStateId();

//   useEffect(() => {
//     const formattedData = currentStepData?.ownerDetails;
//     if (formattedData) {
//       Object.entries(formattedData).forEach(([key, value]) => {
//         setValue(key, value);
//       });
//     }
//   }, [currentStepData, setValue]);

//   const onSubmit = (data) => {
//     goNext(data);
//   };

//   const closeToast = () => setShowToast(false);

//   const errorStyle = {
//     width: "70%",
//     fontSize: "12px",
//     marginTop: "-21px",
//     color: "red",
//   };

//   return (
//     <React.Fragment>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div>
//           {/* First Name */}
//           <CardLabel>{`${t("NDC_FIRST_NAME")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="firstName"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 100, message: t("MAX_LENGTH_100") },
//             }}
//             render={({ field }) => <TextInput {...field} t={t} />}
//           />
//           {errors.firstName && <p style={errorStyle}>{errors.firstName.message}</p>}

//           {/* Last Name */}
//           <CardLabel>{`${t("NDC_LAST_NAME")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="lastName"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 100, message: t("MAX_LENGTH_100") },
//             }}
//             render={({ field }) => <TextInput {...field} t={t} />}
//           />
//           {errors.lastName && <p style={errorStyle}>{errors.lastName.message}</p>}

//           {/* Email */}
//           <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="emailId"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               pattern: {
//                 value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//                 message: t("INVALID_EMAIL_FORMAT"),
//               },
//             }}
//             render={({ field }) => <TextInput {...field} t={t} />}
//           />
//           {errors.emailId && <p style={errorStyle}>{errors.emailId.message}</p>}

//           {/* Mobile Number */}
//           <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="mobileNumber"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               pattern: {
//                 value: /^[0-9]{10}$/,
//                 message: t("INVALID_MOBILE_FORMAT"),
//               },
//             }}
//             render={({ field }) => <MobileNumber {...field} t={t} />}
//           />
//           {errors.mobileNumber && <p style={errorStyle}>{errors.mobileNumber.message}</p>}

//           {/* Father's/Husband's Name */}
//           <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="fatherName"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 100, message: t("MAX_LENGTH_100") },
//             }}
//             render={({ field }) => <TextInput {...field} t={t} />}
//           />
//           {errors.fatherName && <p style={errorStyle}>{errors.fatherName.message}</p>}

//           {/* Address */}
//           <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="address"
//             rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 300, message: t("MAX_LENGTH_300") },
//             }}
//             render={({ field }) => <TextArea {...field} t={t} />}
//           />
//           {errors.address && <p style={errorStyle}>{errors.address.message}</p>}
//         </div>

//         <ActionBar>
//           <SubmitBar label={t("Next")} submit="submit" />
//         </ActionBar>
//       </form>

//       {/* Toast can be used for global errors, if needed */}
//       {showToast && (
//         <Toast isDleteBtn={true} error={true} label={t("REQUIRED_FIELD")} onClose={closeToast} />
//       )}
//     </React.Fragment>
//   );
// };

// export default PTRCitizenDetails;

// import React, { useEffect } from "react";
// import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";

// const PTRCitizenDetails = ({ t, goNext, currentStepData, validateStep }) => {
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const stateId = Digit.ULBService.getStateId();

//   const { control, handleSubmit, setValue, formState: { errors }, trigger } = useForm();

//   const onSubmit = (data) => {
//     console.log("data in first step", data);

//     // Validate the data before proceeding
//     if (validateStep) {
//       const validationErrors = validateStep(data);
//       if (Object.keys(validationErrors).length > 0) {
//         console.log("Validation errors:", validationErrors);
//         return;
//       }
//     }

//     goNext(data);
//   };

//   useEffect(() => {
//     console.log("currentStepData", currentStepData);
//     const formattedData = currentStepData?.ownerDetails;
//     if (formattedData) {
//       console.log("coming here", formattedData);
//       Object.entries(formattedData).forEach(([key, value]) => {
//         setValue(key, value);
//       });
//     }
//   }, [currentStepData, setValue]);

//   // Helper function to get error message
//   const getErrorMessage = (fieldName) => {
//     if (!errors[fieldName]) return null;

//     const error = errors[fieldName];
//     if (error.message) {
//       return t(error.message);
//     }

//     // Fallback error messages
//     const fallbackMessages = {
//       firstName: t("PTR_FIRST_NAME_REQUIRED"),
//       lastName: t("PTR_LAST_NAME_REQUIRED"),
//       emailId: t("PTR_EMAIL_REQUIRED"),
//       mobileNumber: t("PTR_MOBILE_REQUIRED"),
//       fatherOrHusbandName: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
//       address: t("PTR_ADDRESS_REQUIRED"),
//       pincode: t("PTR_PINCODE_REQUIRED")
//     };

//     return fallbackMessages[fieldName] || t("PTR_FIELD_REQUIRED");
//   };

//   return (
//     <React.Fragment>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div>
//           <CardLabel>{`${t("NDC_FIRST_NAME")}`} *</CardLabel>
//           {errors.firstName && <CardLabelError>{getErrorMessage("firstName")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="firstName"
//             rules={{
//               required: t("PTR_FIRST_NAME_REQUIRED"),
//               pattern: {
//                 value: /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;""'']{1,50}$/i,
//                 message: t("PTR_FIRST_NAME_INVALID")
//               }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("firstName");
//                 }}
//                 t={t}
//                 // isMandatory={errors.firstName}
//               />
//             )}
//           />

//           <CardLabel>{`${t("NDC_LAST_NAME")}`} *</CardLabel>
//           {errors.lastName && <CardLabelError>{getErrorMessage("lastName")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="lastName"
//             rules={{
//               // required: t("PTR_LAST_NAME_REQUIRED"),
//               pattern: {
//                 value: /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;""'']{1,50}$/i,
//                 message: t("PTR_LAST_NAME_INVALID")
//               }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("lastName");
//                 }}
//                 t={t}
//                 // isMandatory={errors.lastName}
//               />
//             )}
//           />

//           <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} *</CardLabel>
//           {errors.emailId && <CardLabelError>{getErrorMessage("emailId")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="emailId"
//             rules={{
//               // required: t("PTR_EMAIL_REQUIRED"),
//               pattern: {
//                 value: /^[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
//                 message: t("PTR_EMAIL_INVALID")
//               }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("emailId");
//                 }}
//                 t={t}
//                 // isMandatory={errors.emailId}
//               />
//             )}
//           />

//           <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} *</CardLabel>
//           {errors.mobileNumber && <CardLabelError>{getErrorMessage("mobileNumber")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="mobileNumber"
//             rules={{
//               // required: t("PTR_MOBILE_REQUIRED"),
//               pattern: {
//                 value: /^[6789][0-9]{9}$/i,
//                 message: t("PTR_MOBILE_INVALID")
//               },
//               minLength: {
//                 value: 10,
//                 message: t("PTR_MOBILE_MIN_LENGTH")
//               },
//               maxLength: {
//                 value: 10,
//                 message: t("PTR_MOBILE_MAX_LENGTH")
//               }
//             }}
//             render={(props) => (
//               <MobileNumber
//                 value={props.value}
//                 onChange={props.onChange}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("mobileNumber");
//                 }}
//                 t={t}
//                 // isMandatory={errors.mobileNumber}
//               />
//             )}
//           />

//           <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`} *</CardLabel>
//           {errors.fatherOrHusbandName && <CardLabelError>{getErrorMessage("fatherOrHusbandName")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="fatherOrHusbandName"
//             rules={{
//               // required: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
//               pattern: {
//                 value: /^[^{0-9}^\$\"<>?\\\\~!@#$%^()+={}\[\]*,/_:;""'']{1,50}$/i,
//                 message: t("PTR_FATHER_HUSBAND_NAME_INVALID")
//               }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("fatherOrHusbandName");
//                 }}
//                 t={t}
//                 // isMandatory={errors.fatherOrHusbandName}
//               />
//             )}
//           />

//           <CardLabel>{`${t("PTR_ADDRESS")}`} *</CardLabel>
//           {errors.address && <CardLabelError>{getErrorMessage("address")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="address"
//             rules={{
//               // required: t("PTR_ADDRESS_REQUIRED"),
//               pattern: {
//                 value: /^[^\$\"<>?\\\\~`!@$%^()+={}\[\]*:;""'']{1,500}$/i,
//                 message: t("PTR_ADDRESS_INVALID")
//               },
//               minLength: {
//                 value: 10,
//                 message: t("PTR_ADDRESS_MIN_LENGTH")
//               }
//             }}
//             render={(props) => (
//               <TextArea
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("address");
//                 }}
//                 t={t}
//                 // isMandatory={errors.address}
//               />
//             )}
//           />

//           <CardLabel>{`${t("PTR_PINCODE")}`} *</CardLabel>
//           {errors.pincode && <CardLabelError>{getErrorMessage("pincode")}</CardLabelError>}
//           <Controller
//             control={control}
//             name="pincode"
//             rules={{
//               // required: t("PTR_PINCODE_REQUIRED"),
//               pattern: {
//                 value: /^[1-9][0-9]{5}$/i,
//                 message: t("PTR_PINCODE_INVALID")
//               },
//               minLength: {
//                 value: 6,
//                 message: t("PTR_PINCODE_MIN_LENGTH")
//               },
//               maxLength: {
//                 value: 6,
//                 message: t("PTR_PINCODE_MAX_LENGTH")
//               }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                   trigger("pincode");
//                 }}
//                 t={t}
//                 // isMandatory={errors.pincode}
//                 maxLength={6}
//               />
//             )}
//           />
//         </div>

//         <ActionBar>
//           <SubmitBar label={t("Next")} submit="submit" />
//         </ActionBar>
//       </form>
//     </React.Fragment>
//   );
// };

// export default PTRCitizenDetails;

import React, { useEffect } from "react";
import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const PTRCitizenDetails = ({ t, goNext, currentStepData, validateStep }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  console.log("Digit", Digit);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  const onSubmit = (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) {
        console.log("Validation errors:", validationErrors);
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

  console.log("currentStepDataxxx", currentStepData);

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

    const errorStyle = { color: "#d4351c", fontSize: "12px", marginTop: "-16px", marginBottom: "10px" };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          {/* First Name */}
          <CardLabel>{`${t("NDC_FIRST_NAME")}`} *</CardLabel>
          {/* {errors.firstName && <CardLabelError>{getErrorMessage("firstName")}</CardLabelError>} */}
          <Controller
            control={control}
            name="firstName"
            rules={{
              required: t("PTR_FIRST_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
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
           {errors.firstName && <p style={errorStyle}>{t(errors.firstName.message) || getErrorMessage("firstName")}</p>}

          {/* Last Name */}
          <CardLabel>{`${t("NDC_LAST_NAME")}`} *</CardLabel>
          {/* {errors.lastName && <CardLabelError>{getErrorMessage("lastName")}</CardLabelError>} */}
          <Controller
            control={control}
            name="lastName"
            rules={{
              // required: t("PTR_LAST_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
                message: t("PTR_LAST_NAME_INVALID"),
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
           {errors.lastName && <p style={errorStyle}>{getErrorMessage("lastName")}</p>}

          {/* Email */}
          <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`} *</CardLabel>
          {/* {errors.emailId && <CardLabelError>{getErrorMessage("emailId")}</CardLabelError>} */}
          <Controller
            control={control}
            name="emailId"
            rules={{
              // required: t("PTR_EMAIL_REQUIRED"),
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
           {errors.emailId && <p style={errorStyle}>{getErrorMessage("emailId")}</p>}

          {/* Mobile Number */}
          <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} *</CardLabel>
          {/* {errors.mobileNumber && <CardLabelError>{getErrorMessage("mobileNumber")}</CardLabelError>} */}
          <Controller
            control={control}
            name="mobileNumber"
            rules={{
              // required: t("PTR_MOBILE_REQUIRED"),
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
           {errors.mobileNumber && <p style={errorStyle}>{getErrorMessage("mobileNumber")}</p>}

          {/* Father/Husband Name */}
          <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`} *</CardLabel>
          {/* {errors.fatherOrHusbandName && <CardLabelError>{getErrorMessage("fatherOrHusbandName")}</CardLabelError>} */}
          <Controller
            control={control}
            name="fatherOrHusbandName"
            rules={{
              // required: t("PTR_FATHER_HUSBAND_NAME_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
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
           {errors.fatherOrHusbandName && <p style={errorStyle}>{getErrorMessage("fatherOrHusbandName")}</p>}

          {/* Address */}
          <CardLabel>{`${t("PTR_ADDRESS")}`} *</CardLabel>
          {/* {errors.address && <CardLabelError>{getErrorMessage("address")}</CardLabelError>} */}
          <Controller
            control={control}
            name="address"
            rules={{
              // required: t("PTR_ADDRESS_REQUIRED"),
              pattern: {
                value: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
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
           {errors.address && <p style={errorStyle}>{getErrorMessage("address")}</p>}

          {/* Pincode */}
          <CardLabel>{`${t("PTR_PINCODE")}`} *</CardLabel>
          {/* {errors.pincode && <CardLabelError>{getErrorMessage("pincode")}</CardLabelError>} */}
          <Controller
            control={control}
            name="pincode"
            rules={{
              // required: t("PTR_PINCODE_REQUIRED"),
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
           {errors.pincode && <p style={errorStyle}>{getErrorMessage("pincode")}</p>}

        </div>

        <ActionBar>
          <SubmitBar label={t("Next")} submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default PTRCitizenDetails;
