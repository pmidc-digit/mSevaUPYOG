import React, { useEffect } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_PTRNewApplication_FORM } from "../redux/action/PTRNewApplicationActions";
import { convertEpochToDateInput } from "../utils/index";
import CustomDatePicker from "./CustomDatePicker";

const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
  console.log("currentStepData here:>> ", currentStepData);
  const stateId = Digit.ULBService.getStateId();
  let user = Digit.UserService.getUser();
  const dispatch = useDispatch();
  const apiDataCheck = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData?.responseData);

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { data: mdmsPetData, isLoading } = Digit.Hooks.ptr.usePTRPetMDMS(tenantId);

  const petTypeObj = mdmsPetData?.petTypes?.find((pt) => pt.name === apiDataCheck?.[0]?.petDetails?.petType) || null;

  const breedTypeObj = mdmsPetData?.breedTypes?.find((bt) => bt.name === apiDataCheck?.[0]?.petDetails?.breedType) || null;

  const genderTypeObj = mdmsPetData?.genderTypes?.find((gt) => gt.name === apiDataCheck?.[0]?.petDetails?.petGender) || null;

  console.log("petTypeObj :>> ", petTypeObj);
  console.log("breedTypeObj :>> ", breedTypeObj);

  console.log("genderTypeObj :>> ", genderTypeObj);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // yyyy-mm-dd for max
  const minVaccineDate = new Date();
  minVaccineDate.setFullYear(minVaccineDate.getFullYear() - 20);
  const minVaccineDateStr = minVaccineDate.toISOString().split("T")[0];
  function yearsSince(dateStr) {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    const monthDiff = now.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) years--;
    return years >= 0 ? years : 0;
  }

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({ defaultValues: { petAge: "", lastVaccineDate: "" } });

  const selectedPetType = watch("petType");

  function toEpochMilliseconds(dateStr) {
    return new Date(dateStr).getTime();
  }

  const onSubmit = async (data) => {
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    const checkForRenew = id == "renew-application";
    if (validateStep) {
      const validationErrors = validateStep(data);
      console.log("validationErrors", validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
      console.log("Skipping API call — already created");
      goNext(data);
      return;
    }

    console.log("data", data);

    const { address, name, pincode, ...filteredOwnerDetails } = currentStepData.ownerDetails;
    const formData = {
      tenantId,
      owner: {
        ...filteredOwnerDetails,
        name: name,
        // userName: `${firstName} ${lastName}`,
        userName: filteredOwnerDetails?.mobileNumber,
        tenantId,
        type: "CITIZEN",
      },
      petDetails: {
        petName: data.petName,
        petType: data.petType?.name,
        breedType: data.breedType?.code,
        petGender: data.petGender?.name,
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
      applicationType: checkForRenew ? "RENEWAPPLICATION" : "NEWAPPLICATION",
      ownerName: name, //change to ownerName
      fatherName: filteredOwnerDetails?.fatherOrHusbandName,
      mobileNumber: filteredOwnerDetails?.mobileNumber,
      workflow: {
        action: "INITIATE",
        comments: "",
        status: "INITIATED",
      },
    };

    const pick = (newV, oldV) => (newV !== undefined && newV !== null && newV !== "" ? newV : oldV);
    const existing = apiDataCheck?.[0] || currentStepData?.responseData?.[0] || {};

    if (existing?.applicationNumber && !checkForRenew) {
      const existingDocuments =
        existing?.documents && Array.isArray(existing.documents) && existing.documents.length
          ? existing.documents
          : currentStepData?.documents?.documents?.documents || currentStepData?.documents || [];

      const updateFormData = {
        ...existing, // preserve id, applicationNumber, auditDetails, etc.

        owner: {
          ...existing.owner,
          ...filteredOwnerDetails,
          name: `${pick(filteredOwnerDetails.firstName, (existing.owner?.name || "").split(" ")[0] || "")} ${pick(
            filteredOwnerDetails.lastName,
            (existing.owner?.name || "").split(" ")[1] || ""
          )}`.trim(),
          userName: pick(filteredOwnerDetails.mobileNumber, existing.owner?.userName),
        },

        address: {
          ...existing.address,
          pincode: pick(pincode, existing.address?.pincode),
          addressId: pick(currentStepData.ownerDetails.address, existing.address?.addressId),
          tenantId,
        },

        petDetails: {
          ...existing.petDetails,
          petName: pick(data.petName, existing.petDetails?.petName),
          // prefer .name (UI) -> fallback to .code, then existing
          petType: pick(data.petType?.name ?? data.petType?.code, existing.petDetails?.petType),
          breedType: pick(data.breedType?.name ?? data.breedType?.code, existing.petDetails?.breedType),
          petGender: pick(data.petGender?.name ?? data.petGender?.code, existing.petDetails?.petGender),
          petColor: pick(data.petColor, existing.petDetails?.petColor),
          lastVaccineDate: pick(toEpochMilliseconds(data.lastVaccineDate), existing.petDetails?.lastVaccineDate),
          petAge: pick(data.petAge, existing.petDetails?.petAge),
          vaccinationNumber: pick(data.vaccinationNumber, existing.petDetails?.vaccinationNumber),
          doctorName: pick(data.doctorName, existing.petDetails?.doctorName),
          clinicName: pick(data.clinicName, existing.petDetails?.clinicName),
        },

        // preserve documents unless other steps changed them
        documents: existingDocuments,
        // keep workflow unchanged here
        workflow: {
          ...existing.workflow,
          action: "SAVEASDRAFT",
          status: "SAVEASDRAFT",
          comments: "SAVEASDRAFT",
        },

        ownerName:
          `${pick(filteredOwnerDetails.firstName, existing.ownerName || "")} ${pick(filteredOwnerDetails.lastName, "")}`.trim() || existing.ownerName,
        mobileNumber: pick(filteredOwnerDetails.mobileNumber, existing.mobileNumber),
      };

      const response = await Digit.PTRService.update({ PetRegistrationApplications: [updateFormData] }, tenantId);
      if (response?.ResponseInfo?.status === "successful") {
        dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", response.PetRegistrationApplications[0]));
        goNext(data);
      }
    } else {
      // No existing application -> create (unchanged)
      const response = await Digit.PTRService.create({ petRegistrationApplications: [formData] }, formData.tenantId);
      if (response?.ResponseInfo?.status === "successful") {
        dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", response.PetRegistrationApplications[0]));
        goNext(data);
      }
    }
  };
  useEffect(() => {
    if (apiDataCheck?.[0]?.petDetails) {
      Object.entries(apiDataCheck[0].petDetails).forEach(([key, value]) => {
        if (key === "lastVaccineDate") {
          const epoch = value !== null && value !== undefined && value !== "" ? (!Number.isNaN(Number(value)) ? Number(value) : value) : value;

          const v = convertEpochToDateInput(epoch);
          console.log("setting lastVaccineDate from apiCheckData ->", value, "coerced ->", epoch, "converted ->", v);
          setValue(key, v);
        } else if (key === "petType") {
          setValue(key, petTypeObj);
        } else if (key === "breedType") {
          setValue(key, breedTypeObj);
        } else if (key === "petGender") {
          setValue(key, genderTypeObj);
        } else {
          setValue(key, value);
        }
      });
    }
  }, [isLoading, mdmsPetData, apiDataCheck, setValue]);
  useEffect(() => {
    if (currentStepData?.petDetails) {
      Object.entries(currentStepData.petDetails).forEach(([key, value]) => {
        if (key === "lastVaccineDate") {
          setValue(key, convertEpochToDateInput(value));
        } else {
          setValue(key, value);
        }
      });
    }
  }, [currentStepData, setValue]);

  const selectedVaccineDate = watch("lastVaccineDate");
  useEffect(() => {
    // re-trigger petAge validation whenever vaccine date changes
    console.log("watch lastVaccineDate ->", selectedVaccineDate, "type:", typeof selectedVaccineDate, "asJSON:", JSON.stringify(selectedVaccineDate));

    if (selectedVaccineDate) {
      trigger("petAge");
    }
  }, [selectedVaccineDate, trigger]);

  const onlyAlphabets = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/; // Allows any number of letters and spaces
  const onlyNumbers = /^[0-9]+$/; // Allows any number of digits
  const alphaNum = /^[A-Za-z0-9]+$/; // Allows any number of letters and digits
  const decimalNumber = /^\d+(\.\d{1,2})?$/;
  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  // helper: parse the custom age string into { years, months, totalYears }
  const parsePetAge = (raw) => {
    if (!raw) return null;
    const v = raw.startsWith(".") ? `0${raw}` : raw; // ".11" -> "0.11"
    const [yStr, mStr] = v.split(".");
    const years = parseInt(yStr || "0", 10);
    const months = mStr ? parseInt(mStr, 10) : 0;
    return { years, months, totalYears: years + months / 12 };
  };

  // regex:
  // - integers 1..14 optionally with .1-.11
  // - OR 15 (no decimal)
  // - OR 0.x or .x with x in 1..11
  const AGE_REGEX = /^(?:(?:[1-9]|1[0-4])(?:\.(?:[1-9]|1[01]))?|15|0?\.(?:[1-9]|1[01]))$/;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("PTR_PET_DETAILS")}</CardSectionHeader>

      {/* PET NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_NAME")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="petName"
            rules={{
              required: t("PTR_PET_NAME_REQUIRED"),
              pattern: { value: alphaNum, message: t("PTR_PET_NAME_INVALID") },
              maxLength: { value: 100, message: "Maximum 100 characters" },
              minLength: { value: 2, message: "Minimum 2 characters" },
            }}
            render={(props) => (
              <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("petName")} t={t} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.petName && <CardLabelError style={errorStyle}>{getErrorMessage("petName")}</CardLabelError>}

      {/* PET TYPE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_SEARCH_PET_TYPE")} *</CardLabel>

        <Controller
          control={control}
          name="petType"
          rules={{ required: t("PTR_PET_TYPE_REQUIRED") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={mdmsPetData?.petTypes} optionKey="name" />
          )}
        />
      </LabelFieldPair>
      {errors.petType && <CardLabelError style={errorStyle}>{getErrorMessage("petType")}</CardLabelError>}

      {/* BREED TYPE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_SEARCH_BREED_TYPE")} *</CardLabel>

        <Controller
          control={control}
          name="breedType"
          rules={{ required: t("PTR_BREED_TYPE_REQUIRED") }}
          render={(props) => {
            const filteredBreeds = selectedPetType ? mdmsPetData?.breedTypes?.filter((b) => b.petType == selectedPetType.code) : [];
            return <Dropdown className="form-field" select={props.onChange} selected={props.value} option={filteredBreeds} optionKey="name" />;
          }}
        />
      </LabelFieldPair>
      {errors.breedType && <CardLabelError style={errorStyle}>{getErrorMessage("breedType")}</CardLabelError>}

      {/* PET GENDER */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_GENDER")} *</CardLabel>

        <Controller
          control={control}
          name="petGender"
          rules={{ required: t("PTR_PET_GENDER_REQUIRED") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={mdmsPetData?.genderTypes} optionKey="name" />
          )}
        />
      </LabelFieldPair>
      {errors.petGender && <CardLabelError style={errorStyle}>{getErrorMessage("petGender")}</CardLabelError>}

      {/* COLOR */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("PTR_COLOR")}`} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="petColor"
            rules={{
              required: t("PTR_PET_COLOR_REQUIRED"),
              pattern: { value: /^[A-Za-z\s]+$/, message: t("PTR_PET_COLOR_INVALID") },
              maxLength: { value: 50, message: "Maximum 50 characters" },
              minLength: { value: 2, message: "Minimum 2 characters" },
            }}
            render={(props) => (
              <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={(e) => props.onBlur(e)} t={t} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.petColor && <CardLabelError style={errorStyle}>{getErrorMessage("petColor")}</CardLabelError>}

      {/* VACCINATED DATE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_VACCINATED_DATE")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="lastVaccineDate"
            rules={{ required: t("PTR_VACCINATION_DATE_REQUIRED") }}
            render={(props) => (
              <CustomDatePicker
                value={props.value}
                min={minVaccineDateStr}
                max={todayStr}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => {
                  trigger("lastVaccineDate");
                  trigger("petAge");
                }}
                t={t}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.lastVaccineDate && <CardLabelError style={errorStyle}>{getErrorMessage("lastVaccineDate")}</CardLabelError>}

      {/* PET AGE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_AGE")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="petAge"
            rules={{
              required: t("PTR_PET_AGE_REQUIRED"),
              pattern: { value: AGE_REGEX, message: t("PTR_PET_AGE_INVALID") },
              // validate: (val) => {
              //   const age = Number(val);
              //   if (isNaN(age)) return t("PTR_PET_AGE_INVALID");
              //   // allow any positive decimal (e.g. 0.1). change 0.01 to 0.1 if you want a floor of 0.1
              //   if (age <= 0) return "Pet age must be greater than 0";
              //   if (age > 23) return "Pet age cannot be greater than 23";
              //   const vaccDate = watch("lastVaccineDate");
              //   if (!vaccDate) return true;
              //   const yearsFromVacc = yearsSince(vaccDate); // integer years
              //   // Round pet age to nearest whole number for vaccine-date comparison (per tester request)
              //   let roundedAge;

              //   if (age > 0 && age < 1) {
              //     roundedAge = 1; // special case for anything between 0 and 1
              //   } else {
              //     roundedAge = Math.floor(age); // always round down for 1 and above
              //   }

              //   return roundedAge >= yearsFromVacc || `Pet age must be at least ${yearsFromVacc} year(s)`;
              // },
              validate: (val) => {
                if (!val) return t("PTR_PET_AGE_REQUIRED");
                const normalized = val.startsWith(".") ? `0${val}` : val;
                if (!AGE_REGEX.test(normalized)) return t("PTR_PET_AGE_INVALID_FORMAT");

                const { years, months } = parsePetAge(normalized);

                // months must be 0..11, but regex already guarantees months ∈ {1..11} when present
                if (months < 0 || months > 11) return t("PTR_PET_AGE_INVALID_MONTHS");

                // forbid total > 15 years (so 15.x is invalid)
                if (years > 15 || (years === 15 && months > 0)) return t("PTR_PET_AGE_MAX");

                // you had a vaccine check earlier — example below:
                const vaccDate = watch("lastVaccineDate"); // make sure you included `watch` from useForm
                if (vaccDate) {
                  // compute integer years since vaccine (or whichever rule you want)
                  const yearsSinceVaccine = yearsSince(vaccDate); // your existing helper
                  // decide your rule: at least `yearsSinceVaccine`
                  // Here we convert custom age to floor(totalYears) for comparison (same rule you had before)
                  const roundedAge = years > 0 && years < 1 ? 1 : Math.floor(years + months / 12);
                  if (roundedAge < yearsSinceVaccine) return t("PTR_PET_AGE_LESS_THAN_VACC");
                }

                return true;
              },
            }}
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  // allow digits and one decimal point; strip other chars
                  let v = e.target.value.replace(/[^0-9.]/g, "");
                  // remove any additional dots (keep only the first)
                  v = v.replace(/(\..*)\./g, "$1");
                  props.onChange(v);
                }}
                maxlength={5} // allow for values like "23.99"
                t={t}
              />
            )}
          />
          {errors.petAge && (
            <CardLabelError style={{ width: "70%", fontSize: "12px", marginTop: "-18px" }}>{getErrorMessage("petAge")}</CardLabelError>
          )}

          <span style={{ fontSize: "12px", color: "#666" }}>{"Example: 0.5 (5 months), 1.2 (1 year 2 months)"}</span>

          {/* Example helper text */}
        </div>
      </LabelFieldPair>

      {/* VACCINATION NUMBER */}
      <LabelFieldPair style={{ marginTop: "15px" }}>
        <CardLabel className="card-label-smaller">{t("PTR_VACCINATION_NUMBER")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="vaccinationNumber"
            rules={{
              required: t("PTR_VACCINATION_NUMBER_REQUIRED"),
              pattern: { value: alphaNum, message: t("PTR_VACCINATION_NUMBER_INVALID") },
              maxLength: { value: 50, message: "Maximum 50 numbers" },
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
        </div>
      </LabelFieldPair>
      {errors.vaccinationNumber && <CardLabelError style={errorStyle}>{getErrorMessage("vaccinationNumber")}</CardLabelError>}

      {/* DOCTOR NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_DOCTOR_NAME")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="doctorName"
            rules={{
              required: t("PTR_DOCTOR_NAME_REQUIRED"),
              pattern: { value: onlyAlphabets, message: t("PTR_DOCTOR_NAME_INVALID") },
              maxLength: { value: 100, message: "Maximum 100 characters" },
              minLength: { value: 2, message: "Minimum 2 characters" },
            }}
            render={(props) => (
              <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("doctorName")} t={t} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.doctorName && <CardLabelError style={errorStyle}>{getErrorMessage("doctorName")}</CardLabelError>}

      {/* CLINIC NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_CLINIC_NAME")} *</CardLabel>
        <div className="field">
          <Controller
            control={control}
            name="clinicName"
            rules={{ required: t("PTR_CLINIC_NAME_REQUIRED"), pattern: { value: /^[a-zA-Z0-9\s&-]+$/, message: t("PTR_CLINIC_NAME_INVALID") } }}
            render={(props) => (
              <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("clinicName")} t={t} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.clinicName && <CardLabelError style={errorStyle}>{getErrorMessage("clinicName")}</CardLabelError>}

      <ActionBar>
        <SubmitBar
          label="Back"
          style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "5px" }}
          onSubmit={onGoBack}
        />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default PTRCitizenPet;
