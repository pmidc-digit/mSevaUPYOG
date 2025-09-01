// import React, { useEffect, useState } from "react";
// import { TextInput, CardLabel, Dropdown, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";

// const Breed_Type = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];

// const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t }) => {
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const stateId = Digit.ULBService.getStateId();

//   const { control, handleSubmit, setValue,errors } = useForm();

//   const onSubmit = (data) => {
//     console.log("data in first step", data);
//     goNext(data);
//   };

//   useEffect(() => {
//     console.log("currentStepData", currentStepData);
//     const formattedData = currentStepData?.petDetails;
//     if (formattedData) {
//       console.log("coming here", formattedData);
//       Object.entries(formattedData).forEach(([key, value]) => {
//         setValue(key, value);
//       });
//     }
//   }, [currentStepData, setValue]);

//    const errorStyle = { color: "red", fontSize: "12px", marginTop: "-16px", marginBottom: "10px" };

//   return (
//     <React.Fragment>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div>
//           <CardLabel>{`${t("PTR_PET_NAME")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="petName"
//               rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 100, message: t("MAX_LENGTH_100") },
//               pattern: {
//                 value: /^[a-zA-Z0-9\s]*$/,
//                 message: t("ALPHANUMERIC_ONLY")
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
//                 }}
//               />
//             )}
//           />

//            {errors.petName && <p style={errorStyle}>{t(errors.petName.message)}</p>}

//           <CardLabel>{`${t("PTR_SEARCH_PET_TYPE")}`}</CardLabel>
//           <Controller
//             control={control}
//             name={"petType"}
//              rules={{ required: t("REQUIRED_FIELD") }}
//             render={(props) => (
//               <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
//             )}
//           />
//   {errors.petType && <p style={errorStyle}>{t(errors.petType.message)}</p>}
//           <CardLabel>{`${t("PTR_SEARCH_BREED_TYPE")}`}</CardLabel>
//           <Controller
//             control={control}
//             name={"breedType"}
//              rules={{ required: t("REQUIRED_FIELD") }}
//             render={(props) => (
//               <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
//             )}
//           />
// {errors.breedType && <p style={errorStyle}>{t(errors.breedType.message)}</p>}
//           <CardLabel>{`${t("PTR_PET_GENDER")}`}</CardLabel>
//           <Controller
//             control={control}
//             name={"petGender"}
//              rules={{ required: t("REQUIRED_FIELD") }}
//             render={(props) => (
//               <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Breed_Type} optionKey="i18nKey" />
//             )}
//           />
//  {errors.petGender && <p style={errorStyle}>{t(errors.petGender.message)}</p>}
//           <CardLabel>{`${t("PTR_COLOR")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="color"
//               rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 50, message: t("MAX_LENGTH_50") }
//             }}
//             render={(props) => (
//               <TextInput
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                 }}
//               />
//             )}
//           />
//            {errors.color && <p style={errorStyle}>{t(errors.color.message)}</p>}

//           <CardLabel>{`${t("PTR_VACCINATED_DATE")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="lastVaccineDate"
//              rules={{ required: t("REQUIRED_FIELD") }}
//             render={(props) => (
//               <TextInput
//                 type="date"
//                 value={props.value}
//                 onChange={(e) => {
//                   props.onChange(e.target.value);
//                 }}
//                 onBlur={(e) => {
//                   props.onBlur(e);
//                 }}
//               />
//             )}
//           />
//            {errors.lastVaccineDate && <p style={errorStyle}>{t(errors.lastVaccineDate.message)}</p>}

//           <CardLabel>{`${t("PTR_VACCINATION_NUMBER")}`}</CardLabel>
//           <Controller
//             control={control}
//             name="vaccinationNumber"
//              rules={{
//               required: t("REQUIRED_FIELD"),
//               maxLength: { value: 50, message: t("MAX_LENGTH_50") },
//               pattern: {
//                 value: /^[0-9]*$/,
//                 message: t("NUMERIC_ONLY")
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
//                 }}
//               />
//             )}
//           />
//            {errors.vaccinationNumber && <p style={errorStyle}>{t(errors.vaccinationNumber.message)}</p>}
//         </div>

//         <ActionBar>
//           <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
//           <SubmitBar label="Next" submit="submit" />
//         </ActionBar>
//       </form>
//     </React.Fragment>
//   );
// };

// export default PTRCitizenPet;

import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, ActionBar, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { UPDATE_PTRNewApplication_FORM } from "../redux/action/PTRNewApplicationActions";
import { convertEpochToDateInput } from "../utils/index";
const Pet_Gender = [{ i18nKey: `PTR_GENDER`, code: `123`, name: `test` }];
const Pet_Type = [{ i18nKey: `PTR_Type`, code: `DOG`, name: `test` }];
const Pet_Breed = [{ i18nKey: `PTR_Breed`, code: `Labrador Retriever`, name: `test` }];

const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t, validateStep }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm();

  const dispatch = useDispatch();
  let user = Digit.UserService.getUser();
  console.log("user", user);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  function toEpochMilliseconds(dateStr) {
    return new Date(dateStr).getTime();
  }

  const onSubmit = async (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      console.log("validationErrors", validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    // ✅ If already created, skip API call
    if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
      console.log("Skipping API call — already created");
      goNext(data);
      return;
    }

    const { address, lastName, firstName, pincode, ...filteredOwnerDetails } = currentStepData.ownerDetails;
    const formData = {
      tenantId,
      applicant: {
        ...filteredOwnerDetails,
        name: `${firstName} ${lastName}`,
        userName: `${firstName} ${lastName}`,
        tenantId,
        type: "CITIZEN",
      },
      petDetails: {
        petName: data.petName,
        petType: data.petType?.code,
        breedType: data.breedType?.code,
        petGender: data.petGender?.code,
        petColor: data.petColor,
        lastVaccineDate: toEpochMilliseconds(data.lastVaccineDate),
        petAge: data.petAge,
        vaccinationNumber: data.vaccinationNumber,
        doctorName: data.doctorName,
        clinicName: data.clinicName,
      },
      address: {
        pincode,
        addressId: currentStepData.ownerDetails.address,
      },
      applicationType: "NEWAPPLICATION",
      applicantName: `${firstName} ${lastName}`,
      mobileNumber: filteredOwnerDetails?.mobileNumber,
      workflow: {
        action: "INITIATE",
        comments: "Initial application submitted",
        status: "INITIATED",
      },
    };

    try {
      const response = await Digit.PTRService.create({ petRegistrationApplications: [formData] }, formData.tenantId);
      if (response?.ResponseInfo?.status === "successful") {
        dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", response.PetRegistrationApplications[0]));
        goNext(data);
      }
    } catch (err) {
      console.error("API call failed:", err);
    }
  };

  // useEffect(() => {
  //   if (currentStepData?.petDetails) {
  //     Object.entries(currentStepData.petDetails).forEach(([key, value]) => {
  //       setValue(key, value);
  //     });
  //   }
  // }, [currentStepData, setValue]);

  useEffect(() => {
    if (currentStepData?.petDetails) {
      Object.entries(currentStepData.petDetails).forEach(([key, value]) => {
        if (key === "lastVaccineDate") {
          setValue(key, convertEpochToDateInput(value)); // ✅ formatted for date input
        } else if (key === "petType") {
          const selectedPetType = petTypeOptions.find((item) => item.code === value);
          setValue(key, selectedPetType || null);
        } else {
          setValue(key, value);
        }
      });
    }
  }, [currentStepData, setValue]);

  console.log("currentStepData66", currentStepData);

  const onlyAlphabets = /^[A-Za-z\s]{3,50}$/;
  const onlyNumbers = /^[0-9]{1,}$/;
  const alphaNum = /^[A-Za-z0-9]{1,20}$/;

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  console.log("errors", errors);
  // let { ownershipCategory: { code: keyToSearchOwnershipSubtype } = {} } = currentStepData;
  // keyToSearchOwnershipSubtype = keyToSearchOwnershipSubtype.split(".")[0];
  // const { data: breedOptions } = Digit.Hooks.ptr.useBreedTypeMDMS(stateId, "common-masters", "TradeOwnershipSubType", {
  //   keyToSearchOwnershipSubtype,
  // });

  const stateId = Digit.ULBService.getStateId();
  console.log("stateId", stateId);
  const { data: breedOptions, isLoading, error } = Digit.Hooks.ptr.useBreedTypeMDMS(tenantId);
  console.log("breedOptions", breedOptions);
  const { data: petTypeOptions } = Digit.Hooks.ptr.usePTRPetMDMS(tenantId);
  console.log("petTypeOptions", petTypeOptions);
  // const { data: petGenderOptions } = Digit.Hooks.ptr.useGenderTypeMDMS(stateId);
  // console.log('petGenderOptions', petGenderOptions)

  const errorStyle = { color: "#d4351c", fontSize: "12px", marginTop: "-16px", marginBottom: "10px" };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* PET NAME */}
      <CardLabel>{t("PTR_PET_NAME")} *</CardLabel>
      {/* {errors.petName && <CardLabelError>{getErrorMessage("petName")}</CardLabelError>} */}
      <Controller
        control={control}
        name="petName"
        rules={{
          // required: t("PTR_PET_NAME_REQUIRED"),
          pattern: {
            value: onlyAlphabets,
            message: t("PTR_PET_NAME_INVALID"),
          },
        }}
        render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("petName")} t={t} />}
      />
      {errors.petName && <p style={errorStyle}>{getErrorMessage("petName")}</p>}
      {/* PET TYPE */}
      <CardLabel>{t("PTR_SEARCH_PET_TYPE")} *</CardLabel>
      {/* {errors.petType && <CardLabelError>{getErrorMessage("petType")}</CardLabelError>} */}
      <Controller
        control={control}
        name="petType"
        // rules={{ required: t("PTR_PET_TYPE_REQUIRED") }}
        render={(props) => (
          <Dropdown className="form-field" select={props.onChange} selected={props.value} option={petTypeOptions} optionKey="i18nKey" />
        )}
      />
      {errors.petType && <p style={errorStyle}>{getErrorMessage("petType")}</p>}

      {/* BREED TYPE */}
      <CardLabel>{t("PTR_SEARCH_BREED_TYPE")} *</CardLabel>
      {/* {errors.breedType && <CardLabelError>{getErrorMessage("breedType")}</CardLabelError>} */}
      <Controller
        control={control}
        name="breedType"
        // rules={{ required: t("PTR_BREED_TYPE_REQUIRED") }}
        render={(props) => (
          <Dropdown className="form-field" select={props.onChange} selected={props.value} option={breedOptions} optionKey="i18nKey" />
        )}
      />
      {errors.breedType && <p style={errorStyle}>{getErrorMessage("breedType")}</p>}

      {/* PET GENDER */}
      <CardLabel>{t("PTR_PET_GENDER")} *</CardLabel>
      {/* {errors.petGender && <CardLabelError>{getErrorMessage("petGender")}</CardLabelError>} */}
      <Controller
        control={control}
        name="petGender"
        // rules={{ required: t("PTR_PET_GENDER_REQUIRED") }}
        render={(props) => <Dropdown className="form-field" select={props.onChange} selected={props.value} option={Pet_Gender} optionKey="i18nKey" />}
      />
      {errors.petGender && <p style={errorStyle}>{getErrorMessage("petGender")}</p>}

      <CardLabel>{`${t("PTR_COLOR")}`}</CardLabel>
      {/* {errors.petColor && <CardLabelError>{getErrorMessage("petColor")}</CardLabelError>} */}
      <Controller
        control={control}
        name="petColor"
        rules={{
          // required: t("PTR_PET_COLOR_REQUIRED"),
          pattern: {
            value: /^[A-Za-z\s]+$/,
            message: t("PTR_PET_COLOR_INVALID"),
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
      {errors.petColor && <p style={errorStyle}>{getErrorMessage("petColor")}</p>}

      {/* {errors.petColor && <CardLabelError>{errors.petColor.message}</CardLabelError>} */}

      {/* VACCINATED DATE */}
      <CardLabel>{t("PTR_VACCINATED_DATE")} *</CardLabel>
      {/* {errors.lastVaccineDate && <CardLabelError>{getErrorMessage("lastVaccineDate")}</CardLabelError>} */}
      <Controller
        control={control}
        name="lastVaccineDate"
        // rules={{ required: t("PTR_VACCINATION_DATE_REQUIRED") }}
        render={(props) => (
          <TextInput
            type="date"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            onBlur={() => trigger("lastVaccineDate")}
            t={t}
          />
        )}
      />
      {errors.lastVaccineDate && <p style={errorStyle}>{getErrorMessage("lastVaccineDate")}</p>}

      {/* PET AGE */}
      <CardLabel>{t("PTR_PET_AGE")} *</CardLabel>
      {/* {errors.petAge && <CardLabelError>{getErrorMessage("petAge")}</CardLabelError>} */}
      <Controller
        control={control}
        name="petAge"
        rules={{
          // required: t("PTR_PET_AGE_REQUIRED"),
          pattern: { value: onlyNumbers, message: t("PTR_PET_AGE_INVALID") },
        }}
        render={(props) => (
          <TextInput
            value={props.value}
            onChange={(e) => props.onChange(e.target.value.replace(/\D/g, ""))}
            maxLength={3}
            onBlur={() => trigger("petAge")}
            t={t}
          />
        )}
      />
      {errors.petAge && <p style={errorStyle}>{getErrorMessage("petAge")}</p>}

      {/* VACCINATION NUMBER */}
      <CardLabel>{t("PTR_VACCINATION_NUMBER")} *</CardLabel>
      {/* {errors.vaccinationNumber && <CardLabelError>{getErrorMessage("vaccinationNumber")}</CardLabelError>} */}
      <Controller
        control={control}
        name="vaccinationNumber"
        rules={{
          // required: t("PTR_VACCINATION_NUMBER_REQUIRED"),
          pattern: { value: alphaNum, message: t("PTR_VACCINATION_NUMBER_INVALID") },
        }}
        render={(props) => (
          <TextInput
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            maxLength={20}
            onBlur={() => trigger("vaccinationNumber")}
            t={t}
          />
        )}
      />
      {errors.vaccinationNumber && <p style={errorStyle}>{getErrorMessage("vaccinationNumber")}</p>}

      {/* DOCTOR NAME */}
      <CardLabel>{t("PTR_DOCTOR_NAME")} *</CardLabel>
      {/* {errors.doctorName && <CardLabelError>{getErrorMessage("doctorName")}</CardLabelError>} */}
      <Controller
        control={control}
        name="doctorName"
        rules={{
          // required: t("PTR_DOCTOR_NAME_REQUIRED"),
          pattern: { value: onlyAlphabets, message: t("PTR_DOCTOR_NAME_INVALID") },
        }}
        render={(props) => (
          <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("doctorName")} t={t} />
        )}
      />
      {errors.doctorName && <p style={errorStyle}>{getErrorMessage("doctorName")}</p>}

      {/* CLINIC NAME */}
      <CardLabel>{t("PTR_CLINIC_NAME")} *</CardLabel>
      {/* {errors.clinicName && <CardLabelError>{getErrorMessage("clinicName")}</CardLabelError>} */}
      <Controller
        control={control}
        name="clinicName"
        rules={{
          // required: t("PTR_CLINIC_NAME_REQUIRED"),
          pattern: { value: onlyAlphabets, message: t("PTR_CLINIC_NAME_INVALID") },
        }}
        render={(props) => (
          <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("clinicName")} t={t} />
        )}
      />
      {errors.clinicName && <p style={errorStyle}>{getErrorMessage("clinicName")}</p>}

      <ActionBar>
        <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default PTRCitizenPet;
