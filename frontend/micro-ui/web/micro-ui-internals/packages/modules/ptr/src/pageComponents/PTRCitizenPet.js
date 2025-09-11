import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, ActionBar, SubmitBar, CardLabelError } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { UPDATE_PTRNewApplication_FORM } from "../redux/action/PTRNewApplicationActions";
import { convertEpochToDateInput } from "../utils/index";

const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t, validateStep }) => {
  const stateId = Digit.ULBService.getStateId();
  let user = Digit.UserService.getUser();
  const dispatch = useDispatch();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { data: mdmsPetData } = Digit.Hooks.ptr.usePTRPetMDMS(tenantId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm();

  const selectedPetType = watch("petType");

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

  useEffect(() => {
    if (currentStepData?.petDetails) {
      Object.entries(currentStepData.petDetails).forEach(([key, value]) => {
        if (key === "lastVaccineDate") {
          setValue(key, convertEpochToDateInput(value)); // ✅ formatted for date input
        } else {
          setValue(key, value);
        }
      });
    }
  }, [currentStepData, setValue]);

  const onlyAlphabets = /^[A-Za-z\s]+$/; // Allows any number of letters and spaces
  const onlyNumbers = /^[0-9]+$/; // Allows any number of digits
  const alphaNum = /^[A-Za-z0-9]+$/; // Allows any number of letters and digits

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", fontSize: "12px", marginTop: "-18px" };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* PET NAME */}
      <CardLabel>{t("PTR_PET_NAME")} *</CardLabel>
      <Controller
        control={control}
        name="petName"
        rules={{
          required: t("PTR_PET_NAME_REQUIRED"),
          pattern: {
            value: onlyAlphabets,
            message: t("PTR_PET_NAME_INVALID"),
          },
        }}
        render={(props) => <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("petName")} t={t} />}
      />
      {errors.petName && <CardLabelError style={errorStyle}>{getErrorMessage("petName")}</CardLabelError>}
      {/* PET TYPE */}
      <CardLabel>{t("PTR_SEARCH_PET_TYPE")} *</CardLabel>
      <Controller
        control={control}
        name="petType"
        rules={{ required: t("PTR_PET_TYPE_REQUIRED") }}
        render={(props) => (
          <Dropdown className="form-field" select={props.onChange} selected={props.value} option={mdmsPetData?.petTypes} optionKey="i18nKey" />
        )}
      />
      {errors.petType && <CardLabelError style={errorStyle}>{getErrorMessage("petType")}</CardLabelError>}
      {/* BREED TYPE */}
      <CardLabel>{t("PTR_SEARCH_BREED_TYPE")} *</CardLabel>
      <Controller
        control={control}
        name="breedType"
        rules={{ required: t("PTR_BREED_TYPE_REQUIRED") }}
        render={(props) => {
          const filteredBreeds = selectedPetType ? mdmsPetData?.breedTypes?.filter((breed) => breed.petType == selectedPetType.code) : [];
          return <Dropdown className="form-field" select={props.onChange} selected={props.value} option={filteredBreeds} optionKey="i18nKey" />;
        }}
      />

      {errors.breedType && <CardLabelError style={errorStyle}>{getErrorMessage("breedType")}</CardLabelError>}
      {/* PET GENDER */}
      <CardLabel>{t("PTR_PET_GENDER")} *</CardLabel>
      <Controller
        control={control}
        name="petGender"
        rules={{ required: t("PTR_PET_GENDER_REQUIRED") }}
        render={(props) => (
          <Dropdown className="form-field" select={props.onChange} selected={props.value} option={mdmsPetData?.genderTypes} optionKey="i18nKey" />
        )}
      />
      {errors.petGender && <CardLabelError style={errorStyle}>{getErrorMessage("petGender")}</CardLabelError>}
      <CardLabel>{`${t("PTR_COLOR")}`} *</CardLabel>
      <Controller
        control={control}
        name="petColor"
        rules={{
          required: t("PTR_PET_COLOR_REQUIRED"),
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
      {errors.petColor && <CardLabelError style={errorStyle}>{getErrorMessage("petColor")}</CardLabelError>}
      {/* VACCINATED DATE */}
      <CardLabel>{t("PTR_VACCINATED_DATE")} *</CardLabel>
      <Controller
        control={control}
        name="lastVaccineDate"
        rules={{ required: t("PTR_VACCINATION_DATE_REQUIRED") }}
        render={(props) => (
          <TextInput
            type="date"
            value={props.value}
            max={new Date().toISOString().split("T")[0]} // ✅ disables future dates
            onChange={(e) => props.onChange(e.target.value)}
            onBlur={() => trigger("lastVaccineDate")}
            t={t}
          />
        )}
      />
      {errors.lastVaccineDate && <CardLabelError style={errorStyle}>{getErrorMessage("lastVaccineDate")}</CardLabelError>}
      {/* PET AGE */}
      <CardLabel>{t("PTR_PET_AGE")} *</CardLabel>
      <Controller
        control={control}
        name="petAge"
        rules={{
          required: t("PTR_PET_AGE_REQUIRED"),
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
      {errors.petAge && <CardLabelError style={errorStyle}>{getErrorMessage("petAge")}</CardLabelError>}
      {/* VACCINATION NUMBER */}
      <CardLabel>{t("PTR_VACCINATION_NUMBER")} *</CardLabel>
      <Controller
        control={control}
        name="vaccinationNumber"
        rules={{
          required: t("PTR_VACCINATION_NUMBER_REQUIRED"),
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
      {errors.vaccinationNumber && <CardLabelError style={errorStyle}>{getErrorMessage("vaccinationNumber")}</CardLabelError>}
      {/* DOCTOR NAME */}
      <CardLabel>{t("PTR_DOCTOR_NAME")} *</CardLabel>
      <Controller
        control={control}
        name="doctorName"
        rules={{
          required: t("PTR_DOCTOR_NAME_REQUIRED"),
          pattern: { value: onlyAlphabets, message: t("PTR_DOCTOR_NAME_INVALID") },
        }}
        render={(props) => (
          <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("doctorName")} t={t} />
        )}
      />
      {errors.doctorName && <CardLabelError style={errorStyle}>{getErrorMessage("doctorName")}</CardLabelError>}
      {/* CLINIC NAME */}
      <CardLabel>{t("PTR_CLINIC_NAME")} *</CardLabel>
      <Controller
        control={control}
        name="clinicName"
        rules={{
          required: t("PTR_CLINIC_NAME_REQUIRED"),
          pattern: { value: onlyAlphabets, message: t("PTR_CLINIC_NAME_INVALID") },
        }}
        render={(props) => (
          <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("clinicName")} t={t} />
        )}
      />
      {errors.clinicName && <CardLabelError style={errorStyle}>{getErrorMessage("clinicName")}</CardLabelError>}
      <ActionBar>
        <SubmitBar
          label="Back"
          style={{
            border: "1px solid",
            background: "transparent",
            color: "#2947a3",
            marginRight: "5px",
          }}
          onSubmit={onGoBack}
        />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default PTRCitizenPet;
