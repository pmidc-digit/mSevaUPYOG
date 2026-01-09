import React, { useEffect, useState } from "react";
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
import { Loader } from "../components/Loader";

const PTRCitizenPet = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
  const stateId = Digit.ULBService.getStateId();
  let user = Digit.UserService.getUser();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");

  const apiDataCheck = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData?.responseData);

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { data: mdmsPetData, isLoading } = Digit.Hooks.ptr.usePTRPetMDMS(tenantId);

  const petTypeObj = mdmsPetData?.petTypes?.find((pt) => pt.name === apiDataCheck?.[0]?.petDetails?.petType) || null;

  const breedTypeObj = mdmsPetData?.breedTypes?.find((bt) => bt.name === apiDataCheck?.[0]?.petDetails?.breedType) || null;

  const genderTypeObj = mdmsPetData?.genderTypes?.find((gt) => gt.name === apiDataCheck?.[0]?.petDetails?.petGender) || null;

  const pathParts = window.location.pathname.split("/");
  const id = pathParts[pathParts.length - 1];
  const checkNumber = pathParts[pathParts.length - 2];
  const checkForRenew = id == "renew-application";

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
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
      goNext(data);
      return;
    }
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
      previousApplicationNumber: checkNumber ? checkNumber : null,
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
      setLoader(true);
      try {
        const response = await Digit.PTRService.update({ PetRegistrationApplications: [updateFormData] }, tenantId);
        setLoader(false);
        if (response?.ResponseInfo?.status === "successful") {
          dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", response.PetRegistrationApplications[0]));
          goNext(data);
        }
      } catch (error) {
        setLoader(false);
        console.log("error", error);
      }
    } else {
      // No existing application -> create (unchanged)

      try {
        const response = await Digit.PTRService.create({ petRegistrationApplications: [formData] }, formData.tenantId);
        setLoader(false);
        if (response?.ResponseInfo?.status === "successful") {
          dispatch(UPDATE_PTRNewApplication_FORM("CreatedResponse", response.PetRegistrationApplications[0]));
          goNext(data);
        }
      } catch (error) {
        setLoader(false);
        console.log("error", error);
      }
    }
  };

  useEffect(() => {
    if (apiDataCheck?.[0]?.petDetails) {
      console.log("apiDataCheck?.[0]?.petDetails", apiDataCheck?.[0]);
      const createdTime = apiDataCheck?.[0]?.auditDetails?.createdTime;

      // Convert to Date object
      const createdDate = new Date(Number(createdTime));
      const currentDate = new Date();

      // Calculate months passed since createdTime
      const monthsDiff = (currentDate.getFullYear() - createdDate.getFullYear()) * 12 + (currentDate.getMonth() - createdDate.getMonth());

      Object.entries(apiDataCheck[0].petDetails).forEach(([key, value]) => {
        if (key === "lastVaccineDate") {
          const epoch = value !== null && value !== undefined && value !== "" ? (!Number.isNaN(Number(value)) ? Number(value) : value) : value;

          const v = convertEpochToDateInput(epoch);
          setValue(key, v);
        } else if (key === "petType") {
          setValue(key, petTypeObj);
        } else if (key === "breedType") {
          setValue(key, breedTypeObj);
        } else if (key === "petGender") {
          setValue(key, genderTypeObj);
        } else if (key === "petAge") {
          // 🧠 Handle pet age increment logic
          if (value) {
            const [yearsStr, monthsStr] = value.toString().split(".");
            let years = parseInt(yearsStr, 10);
            let months = parseInt(monthsStr || 0, 10);

            // Add the months passed since creation
            months += monthsDiff;

            // Convert months overflow to years
            if (months >= 12) {
              years += Math.floor(months / 12);
              months = months % 12;
            }

            const updatedAge = `${years}.${months}`;
            setValue(key, updatedAge);
          } else {
            setValue(key, value);
          }
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

  // const selectedVaccineDate = watch("lastVaccineDate");
  // useEffect(() => {
  //   // re-trigger petAge validation whenever vaccine date changes
  //   // console.log("watch lastVaccineDate ->", selectedVaccineDate, "type:", typeof selectedVaccineDate, "asJSON:", JSON.stringify(selectedVaccineDate));

  //   if (selectedVaccineDate) {
  //     trigger("petAge");
  //   }
  // }, [selectedVaccineDate, trigger]);

  const onlyAlphabets = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*\s*$/; // Allows any number of letters and spaces
  const onlyNumbers = /^[0-9]+$/; // Allows any number of digits
  const alphaNum = /^[A-Za-z0-9]+$/; // Allows any number of letters and digits
  const decimalNumber = /^\d+(\.\d{1,2})?$/;

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };

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
  // const AGE_REGEX = /^(?:(?:[1-9]|1[0-4])(?:\.(?:[1-9]|1[01]))?|40|0?\.(?:[1-9]|1[01]))$/;
  const AGE_REGEX = /^(?:(?:[1-9]|[1-3][0-9])(?:\.(?:[1-9]|1[01]))?|40(?:\.0?)?|0?\.(?:[1-9]|1[01]))$/;

  // Watch for petAge change
  const petAgeVal = watch("petAge");

  useEffect(() => {
    if (!petAgeVal) return;

    const today = new Date();

    // Parse pet age: e.g., "1.2" → 1 year, 2 months
    const normalized = petAgeVal.startsWith(".") ? `0${petAgeVal}` : petAgeVal;
    const [yStr, mStr] = normalized.split(".");
    const years = parseInt(yStr || "0", 10);
    const months = parseInt(mStr || "0", 10);

    // Compute minimum allowed date
    const min = new Date(today);
    min.setFullYear(today.getFullYear() - years);
    min.setMonth(today.getMonth() - months);

    const formatDate = (date) => date.toISOString().split("T")[0];

    setMinDate(formatDate(min));
    setMaxDate(formatDate(today));
  }, [petAgeVal]);

  return (
    <form className="card" onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("PTR_PET_DETAILS")}</CardSectionHeader>

      {/* PET NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_NAME")} *</CardLabel>
        <div className="form-field">
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
              <TextInput
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => trigger("petName")}
                t={t}
                disabled={checkForRenew}
              />
            )}
          />
          {errors.petName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("petName")}</p>}
        </div>
      </LabelFieldPair>

      {/* PET TYPE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_SEARCH_PET_TYPE")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="petType"
            rules={{ required: t("PTR_PET_TYPE_REQUIRED") }}
            render={(props) => (
              <Dropdown
                select={props.onChange}
                selected={props.value}
                option={mdmsPetData?.petTypes}
                optionKey="name"
                disable={checkForRenew}
              />
            )}
          />
          {errors.petType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("petType")}</p>}
        </div>
      </LabelFieldPair>

      {/* BREED TYPE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_SEARCH_BREED_TYPE")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="breedType"
            rules={{ required: t("PTR_BREED_TYPE_REQUIRED") }}
            render={(props) => {
              const filteredBreeds = selectedPetType ? mdmsPetData?.breedTypes?.filter((b) => b.petType == selectedPetType.code) : [];
              return (
                <Dropdown
                  select={props.onChange}
                  selected={props.value}
                  option={filteredBreeds}
                  optionKey="name"
                  disable={checkForRenew}
                />
              );
            }}
          />
          {errors.breedType && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("breedType")}</p>}
        </div>
      </LabelFieldPair>

      {/* PET GENDER */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_GENDER")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="petGender"
            rules={{ required: t("PTR_PET_GENDER_REQUIRED") }}
            render={(props) => (
              <Dropdown
                select={props.onChange}
                selected={props.value}
                option={mdmsPetData?.genderTypes}
                optionKey="name"
                disable={checkForRenew}
              />
            )}
          />
          {errors.petGender && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("petGender")}</p>}
        </div>
      </LabelFieldPair>

      {/* COLOR */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{`${t("PTR_COLOR")}`} *</CardLabel>
        <div className="form-field">
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
              <TextInput
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={(e) => props.onBlur(e)}
                t={t}
                disabled={checkForRenew}
              />
            )}
          />
          {errors.petColor && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("petColor")}</p>}
        </div>
      </LabelFieldPair>

      {/* PET AGE */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_PET_AGE")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="petAge"
            rules={{
              required: t("PTR_PET_AGE_REQUIRED"),
              pattern: { value: AGE_REGEX, message: t("PTR_PET_AGE_INVALID") },
              // validate: (val) => {
              //   if (!val) return t("PTR_PET_AGE_REQUIRED");
              //   const normalized = val.startsWith(".") ? `0${val}` : val;
              //   if (!AGE_REGEX.test(normalized)) return t("PTR_PET_AGE_INVALID_FORMAT");

              //   const { years, months } = parsePetAge(normalized);

              //   // months must be 0..11, but regex already guarantees months ∈ {1..11} when present
              //   if (months < 0 || months > 11) return t("PTR_PET_AGE_INVALID_MONTHS");

              //   // forbid total > 15 years (so 15.x is invalid)
              //   if (years > 40 || (years === 40 && months > 0)) return t("PTR_PET_AGE_MAX");

              //   // you had a vaccine check earlier — example below:
              //   // const vaccDate = watch("lastVaccineDate"); // make sure you included `watch` from useForm
              //   // if (vaccDate) {
              //   //   // compute integer years since vaccine (or whichever rule you want)
              //   //   const yearsSinceVaccine = yearsSince(vaccDate); // your existing helper
              //   //   // decide your rule: at least `yearsSinceVaccine`
              //   //   // Here we convert custom age to floor(totalYears) for comparison (same rule you had before)
              //   //   const roundedAge = years > 0 && years < 1 ? 1 : Math.floor(years + months / 12);
              //   //   if (roundedAge < yearsSinceVaccine) return t("PTR_PET_AGE_LESS_THAN_VACC");
              //   // }

              //   return true;
              // },
              validate: (val) => {
                if (!val) return t("PTR_PET_AGE_REQUIRED");
                const normalized = val.startsWith(".") ? `0${val}` : val;
                if (!AGE_REGEX.test(normalized)) return t("PTR_PET_AGE_INVALID_FORMAT");

                const { years, months } = parsePetAge(normalized);

                if (months < 0 || months > 11) return t("PTR_PET_AGE_INVALID_MONTHS");

                // ⛔️ Age cannot exceed 40 years
                if (years > 40 || (years === 40 && months > 0)) return t("PTR_PET_AGE_MAX");

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
                disabled={checkForRenew}
              />
            )}
          />
          {errors.petAge && (
            <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("petAge")}</p>
          )}

          <span style={{ fontSize: "12px", color: "#666" }}>{"Example: 0.5 (5 months), 1.2 (1 year 2 months)"}</span>

          {/* Example helper text */}
        </div>
      </LabelFieldPair>

      {/* VACCINATED DATE */}
      <LabelFieldPair style={{ marginTop: "20px" }}>
        <CardLabel className="card-label-smaller">{t("PTR_VACCINATED_DATE")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="lastVaccineDate"
            rules={{
              required: t("PTR_VACCINATION_DATE_REQUIRED"),
            }}
            render={(props) => (
              <CustomDatePicker
                value={props.value}
                // min={minVaccineDateStr}
                // max={todayStr}
                min={minDate}
                max={maxDate}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => {
                  trigger("lastVaccineDate");
                  // trigger("petAge");
                }}
                t={t}
              />
            )}
          />
          {errors.lastVaccineDate && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("lastVaccineDate")}</p>}
        </div>
      </LabelFieldPair>

      {/* VACCINATION NUMBER */}
      <LabelFieldPair style={{ marginTop: "15px" }}>
        <CardLabel className="card-label-smaller">{t("PTR_VACCINATION_NUMBER")} *</CardLabel>
        <div className="form-field">
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
          {errors.vaccinationNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("vaccinationNumber")}</p>}
        </div>
      </LabelFieldPair>

      {/* DOCTOR NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_DOCTOR_NAME")} *</CardLabel>
        <div className="form-field">
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
          {errors.doctorName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("doctorName")}</p>}
        </div>
      </LabelFieldPair>

      {/* CLINIC NAME */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("PTR_CLINIC_NAME")} *</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="clinicName"
            rules={{ required: t("PTR_CLINIC_NAME_REQUIRED"), pattern: { value: /^[a-zA-Z0-9\s&-]+$/, message: t("PTR_CLINIC_NAME_INVALID") } }}
            render={(props) => (
              <TextInput value={props.value} onChange={(e) => props.onChange(e.target.value)} onBlur={() => trigger("clinicName")} t={t} />
            )}
          />
          {errors.clinicName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{getErrorMessage("clinicName")}</p>}
        </div>
      </LabelFieldPair>

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
  );
};

export default PTRCitizenPet;
