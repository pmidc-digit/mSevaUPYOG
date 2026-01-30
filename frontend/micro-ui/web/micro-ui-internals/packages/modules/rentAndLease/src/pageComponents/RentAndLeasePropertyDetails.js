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
  TextArea,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import {
  useDispatch,
  //  useSelector
} from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";
import RentANDLeaseDocuments from "../components/RentANDLeaseDocuments";

const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, validateStep, config }) => {
  const dispatch = useDispatch();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const [documentsData, setDocumentsData] = useState({});
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // 🔹 Dropdown options
  const propertyTypeOptions = [
    { name: t("ON_RENT"), code: "rent", i18nKey: "rent" },
    { name: t("ON_LEASE"), code: "lease", i18nKey: "lease" },
    { name: t("ON_DEED"), code: "deed", i18nKey: "deed" },
  ];

  const applicationTypeOptions = [
    { name: t("Legacy"), code: "Legacy" },
    { name: t("New"), code: "new" },
  ];

  const propertySpecificOptions = [
    { name: t("COMMERCIAL"), code: "Commercial", i18nKey: "Commercial" },
    { name: t("RESIDENTIAL"), code: "Residential", i18nKey: "Residential" },
  ];

  // 🔹 Location Type options
  const locationTypeOptions = [
    { name: t("PRIME"), code: "Prime", i18nKey: "Prime" },
    { name: t("NON_PRIME"), code: "Non-Prime", i18nKey: "Non-Prime" },
  ];

  const filters = {
    tenantId,
    searchType: "1",
  };

  const { data, isLoading, isError } = Digit.Hooks.rentandlease.useRentAndLeaseProperties(filters);

  const { triggerLoader, triggerToast } = config?.currStepConfig[0];

  // 🔹 Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      applicationType: { name: t("Legacy"), code: "Legacy" },
      propertyId: "",
      propertyName: "",
      propertyType: "",
      propertySpecific: "",
      locationType: "",
      allotmentType: "",
      propertySizeOrArea: "",
      baseRent: "",
      securityDeposit: "",
      refundApplicableOnDiscontinuation: null,
      penaltyType: "",
      // latePayment: "",
      startDate: "",
      endDate: "",
      incrementApplicable: "",
      incrementPercentage: "",
      incrementCycle: "",
      selectedProperty: null,
      duration: "", // 👈 new field
      // taxApplicable: false,
      // cowCessApplicable: false,
      // termsAndConditions: "",
      // amountToBeRefunded: "",
      // address: "",
      // geoLocation: null,
      // propertyImage: "",
      // tax_applicable: null,
    },
  });

  const docUploadData = {
    Challan: {
      Documents: [
        {
          code: "BPA_FILE_UPLOAD",
          documentType: "ID_PROOF",
          required: watch("arrear") > 0 ? true : false,
          active: true,
          description: "ID proof of offender",
          maxSizeMB: 2,
          hasDropdown: true,
        },
      ],
    },
  };

  const selectedPropertyType = watch("propertyType");
  const selectedPropertySpecific = watch("propertySpecific");
  const selectedLocationType = watch("locationType");

  const [filteredProperties, setFilteredProperties] = useState([]);

  useEffect(() => {
    if (data?.property) {
      // Start with all properties from MDMS
      let properties = data?.property;
      if (selectedPropertyType && selectedPropertySpecific && selectedLocationType) {
        properties = properties.filter(
          (p) =>
            p.allotmentType === selectedPropertyType?.code &&
            p.propertyType === selectedPropertySpecific?.code &&
            p.locationType === selectedLocationType?.code
        );
      }

      setFilteredProperties(properties);
    }
  }, [data, selectedPropertyType, selectedPropertySpecific, selectedLocationType]);

  const todayISO = new Date().toISOString().split("T")[0];
  const minStartDate = new Date();
  minStartDate.setMonth(minStartDate.getMonth() - 11);
  const minStartDateISO = minStartDate.toISOString().split("T")[0];

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const handlePropertySelect = (property) => {
    if (!property) return;

    // List only the fields you want to prefill
    const fieldsToPrefill = [
      "propertyId",
      "propertyName",
      "baseRent",
      "securityDeposit",
      "refundApplicableOnDiscontinuation",
      "penaltyType",
      // "latePayment",
      // "cowCessApplicable",
      // "taxApplicable"
    ];

    setValue("selectedProperty", property);
    fieldsToPrefill?.forEach((field) => {
      setValue(field, property?.[field] ?? null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  };

  const onSubmit = async (data) => {
    console.log("data", data);

    if (!documentsData?.[0]?.filestoreId) {
      alert("Please upload arrear document");
      return;
    }

    data["arrearDoc"] = documentsData?.[0]?.filestoreId;

    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    triggerLoader(true);
    // Build one consistent object
    const propertyDetails = Object.keys(data).reduce((acc, key) => {
      acc[key] = data?.[key] ?? null; // ✅ optional chaining + null fallback
      return acc;
    }, {});

    // Dispatch to Redux under one key
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));
    triggerLoader(false);
    goNext(propertyDetails);
  };

  useEffect(() => {
    if (currentStepData?.propertyDetails) {
      const propertyDetails = currentStepData.propertyDetails;

      Object.keys(propertyDetails)?.forEach((key) => {
        setValue(key, propertyDetails[key], { shouldValidate: true });
      });
    }
  }, [currentStepData, setValue]);

  useEffect(() => {
    const start = watch("startDate");
    const end = watch("endDate");

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      // Calculate total months difference
      let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      months += endDate.getMonth() - startDate.getMonth();

      // Adjust if end day is before start day
      if (endDate.getDate() < startDate.getDate()) {
        months -= 1;
      }

      // Convert to years + months
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      let durationText = "";
      if (years > 0) {
        durationText += `${years} ${years === 1 ? "year" : "years"}`;
      }
      if (remainingMonths > 0) {
        durationText += (durationText ? " " : "") + `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
      }

      // If exactly 0 months (edge case), show "0 months"
      if (!durationText) {
        durationText = "0 months";
      }

      setValue("duration", durationText, { shouldValidate: true });
    } else {
      setValue("duration", "", { shouldValidate: false });
    }
  }, [watch("startDate"), watch("endDate")]);

  useEffect(() => {
    if (triggerLoader) {
      triggerLoader(isLoading);
    }
  }, [isLoading, triggerLoader]);

  useEffect(() => {
    if (isError && triggerToast) {
      triggerToast("ERROR_WHILE_FETCHING_PROPERTIES", true);
    }
  }, [isError, triggerToast]);

  const handleDocumentsSelect = (data) => {
    console.log("data check", data);
    setDocumentsData(data);
  };

  useEffect(() => {
    if (watch("arrear") <= 0) {
      clearErrors(["arrearStartDate", "arrearEndDate", "arrearReason", "remarks"]);
    }
  }, [watch("arrear")]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSectionHeader>

      {/* application Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("PT_COMMON_TABLE_COL_APP_TYPE")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="applicationType"
          rules={{ required: t("RENT_LEASE_APPLICATION_TYPE_REQUIRED") }}
          render={(props) => (
            <Dropdown
              className="form-field"
              select={props.onChange}
              selected={props.value}
              option={applicationTypeOptions}
              defaultValues
              optionKey="name"
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors.applicationType && <CardLabelError className="ral-error-label">{getErrorMessage("applicationType")}</CardLabelError>}

      {/* Property Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_TYPE")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertyType"
          rules={{ required: t("RENT_LEASE_PROPERTY_TYPE_REQUIRED") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyTypeOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertyType && <CardLabelError className="ral-error-label">{getErrorMessage("propertyType")}</CardLabelError>}

      {/* Property Specific Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_SPECIFIC")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertySpecific"
          rules={{ required: t("RENT_LEASE_PROPERTY_SPECIFIC_REQUIRED") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertySpecificOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertySpecific && <CardLabelError className="ral-error-label">{getErrorMessage("propertySpecific")}</CardLabelError>}

      {/* Location Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_LOCATION_TYPE")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="locationType"
          rules={{ required: t("RENT_LEASE_LOCATION_TYPE_REQUIRED") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={locationTypeOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.locationType && <CardLabelError className="ral-error-label">{getErrorMessage("locationType")}</CardLabelError>}

      {/* Property Name Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_NAME")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertyName"
          rules={{ required: t("RENT_LEASE_PROPERTY_NAME_REQUIRED") }}
          render={({ value, onChange }) => (
            <Dropdown
              className="form-field"
              select={(selected) => {
                // ✅ set propertyName field
                onChange(selected.propertyName);
                // ✅ also set propertyId field
                handlePropertySelect(selected); // ✅ prefill all other fields
              }}
              selected={filteredProperties.find((p) => p.propertyName === value)}
              option={filteredProperties}
              optionKey="propertyName"
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors.propertyName && <CardLabelError className="ral-error-label">{getErrorMessage("propertyName")}</CardLabelError>}

      {/* Property ID */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_ID")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="propertyId"
            rules={{ required: t("RENT_LEASE_PROPERTY_ID_REQUIRED") }}
            render={({ value, onChange }) => (
              <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} t={t} disabled={true} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.propertyId && <CardLabelError className="ral-error-label">{getErrorMessage("propertyId")}</CardLabelError>}

      {/* Hidden field for selected property */}
      <Controller control={control} name="selectedProperty" render={() => null} />
      {/* Start Date */}
      <LabelFieldPair>
        <CardLabel>
          {t("RAL_START_DATE")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="startDate"
            rules={{
              required: t("PTR_FIELD_REQUIRED"),
              validate: (value) => {
                if (!value) return t("PTR_FIELD_REQUIRED");
                const minStart = new Date(minStartDateISO);
                const chosen = new Date(value);
                if (chosen < minStart) return t("RAL_START_DATE_TOO_OLD");
                return true;
              },
            }}
            render={({ value, onChange }) => (
              <TextInput
                type="date"
                min={minStartDateISO}
                value={value || ""}
                onChange={(e) => {
                  const newStart = e.target.value;
                  onChange(newStart);

                  // ✅ Prefill End Date = Start Date + 11 months
                  if (newStart) {
                    const startDateObj = new Date(newStart);
                    const prefillEnd = new Date(startDateObj);
                    prefillEnd.setMonth(prefillEnd.getMonth() + 11);

                    // format YYYY-MM-DD
                    const prefillISO = prefillEnd.toISOString().split("T")[0];
                    setValue("endDate", prefillISO, { shouldValidate: true });
                  }
                }}
              />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.startDate && <CardLabelError className="ral-error-label">{getErrorMessage("startDate")}</CardLabelError>}

      {/* End Date */}
      <LabelFieldPair>
        <CardLabel>{t("RAL_END_DATE")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="endDate"
            rules={{
              validate: (value) => {
                if (!value) return true; // optional
                const start = watch("startDate");
                if (!start) return t("PTR_START_DATE_REQUIRED");

                const startDate = new Date(start);
                const endDate = new Date(value);

                if (endDate <= startDate) return t("PTR_END_DATE_AFTER_START");

                // ✅ Must be at least 11 months after Start Date
                const minEnd = new Date(startDate);
                minEnd.setMonth(minEnd.getMonth() + 11);
                if (endDate < minEnd) return t("PTR_MIN_DURATION_11_MONTHS");

                return true;
              },
            }}
            render={({ value, onChange }) => {
              const start = watch("startDate");
              let minEndISO = todayISO;
              if (start) {
                const minEnd = new Date(start);
                minEnd.setMonth(minEnd.getMonth() + 11);
                minEndISO = minEnd.toISOString().split("T")[0];
              }

              return (
                <TextInput
                  type="date"
                  min={minEndISO} // ✅ restrict selectable dates
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                />
              );
            }}
          />
        </div>
      </LabelFieldPair>
      {errors.endDate && <CardLabelError className="ral-error-label">{getErrorMessage("endDate")}</CardLabelError>}

      {/* Duration (optional, auto-filled) */}
      <LabelFieldPair>
        <CardLabel>{t("DURATION")}</CardLabel>
        <div className="form-field">
          <Controller control={control} name="duration" render={({ value }) => <TextInput type="text" value={value || ""} disabled={true} />} />
        </div>
      </LabelFieldPair>

      {/* Rent Amount */}
      <LabelFieldPair>
        <CardLabel>
          {t("RAL_RENT_AMOUNT")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="baseRent"
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} disable={true} />}
          />
        </div>
      </LabelFieldPair>
      {errors.baseRent && <CardLabelError className="ral-error-label">{getErrorMessage("baseRent")}</CardLabelError>}

      {/* Penalty Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("PENALTY_TYPE")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="penaltyType"
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => (
              <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} t={t} disabled={true} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.penaltyType && <CardLabelError>{getErrorMessage("penaltyType")}</CardLabelError>}

      {/* Security Amount */}
      <LabelFieldPair>
        <CardLabel>
          {t("RAL_SECURITY_AMOUNT")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="securityDeposit"
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => (
              <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} disable={true} />
            )}
          />
        </div>
      </LabelFieldPair>
      {errors.securityDeposit && <CardLabelError className="ral-error-label">{getErrorMessage("securityDeposit")}</CardLabelError>}
      {watch("applicationType")?.code == "Legacy" && (
        <React.Fragment>
          {/* Arrears Amount */}
          <LabelFieldPair>
            <CardLabel>
              {t("Arrears")} <span className="mandatory-asterisk">*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="arrear"
                rules={{ required: t("RENT_LEASE_ARREAR_REQUIRED") }}
                render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
              />
            </div>
          </LabelFieldPair>
          {errors.arrear && <CardLabelError className="ral-error-label">{getErrorMessage("arrear")}</CardLabelError>}

          {/* arrear Start Date */}
          <LabelFieldPair>
            <CardLabel>
              {t("RAL_START_DATE")} {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="arrearStartDate"
                rules={{
                  validate: (value) => {
                    const arrear = watch("arrear");
                    if (arrear > 0 && !value) {
                      return t("RENT_LEASE_RAL_START_DATE_REQUIRED");
                    }
                    return true;
                  },
                }}
                render={({ value, onChange }) => (
                  <TextInput
                    type="date"
                    min={minStartDateISO}
                    value={value || ""}
                    onChange={(e) => {
                      onChange(e);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {errors.arrearStartDate && <CardLabelError className="ral-error-label">{getErrorMessage("arrearStartDate")}</CardLabelError>}

          {/*arrear End Date */}
          <LabelFieldPair>
            <CardLabel>
              {t("RAL_END_DATE")} {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="arrearEndDate"
                rules={{
                  validate: (value) => {
                    const arrear = watch("arrear");
                    if (arrear > 0 && !value) {
                      return t("RENT_LEASE_RAL_END_DATE_REQUIRED");
                    }
                    return true;
                  },
                }}
                render={({ value, onChange }) => {
                  return <TextInput type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} />;
                }}
              />
            </div>
          </LabelFieldPair>
          {errors.arrearEndDate && <CardLabelError className="ral-error-label">{getErrorMessage("arrearEndDate")}</CardLabelError>}

          {/* Areas reason */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("Reason")} {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>}
            </CardLabel>
            <Controller
              control={control}
              name="arrearReason"
              rules={{
                validate: (value) => {
                  const arrear = watch("arrear");
                  if (arrear > 0 && !value) {
                    return t("RENT_LEASE_REASON_REQUIRED");
                  }
                  return true;
                },
              }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={applicationTypeOptions}
                  defaultValues
                  optionKey="name"
                  t={t}
                />
              )}
            />
          </LabelFieldPair>
          {errors.arrearReason && <CardLabelError className="ral-error-label">{getErrorMessage("arrearReason")}</CardLabelError>}

          {/* Remarks */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("Remarks")} {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="remarks"
                rules={{
                  validate: (value) => {
                    const arrear = watch("arrear");
                    if (arrear > 0 && !value?.trim()) {
                      return t("RENT_LEASE_REMARKS_REQUIRED");
                    }
                    return true;
                  },
                }}
                render={({ value, onChange }) => <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} t={t} />}
              />
            </div>
          </LabelFieldPair>
          {errors.remarks && <CardLabelError className="ral-error-label">{getErrorMessage("remarks")}</CardLabelError>}

          <div>
            <RentANDLeaseDocuments
              t={t}
              config={{ key: "documents" }}
              onSelect={handleDocumentsSelect}
              userType="CITIZEN"
              formData={{ documents: documentsData }}
              setError={setError}
              error={error}
              clearErrors={() => {}}
              formState={{}}
              data={docUploadData}
              isLoading={isLoading}
            />
          </div>
        </React.Fragment>
      )}

      {/* Action Bar */}
      <ActionBar>
        <SubmitBar label={t("Back")} className="ral-back-btn" onSubmit={onGoBack} />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default RentAndLeasePropertyDetails;
