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
  const [documentsData, setDocumentsData] = useState([]);
  const [getPropertyFiltered, setPropertyFiltered] = useState([]);
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

  // const incrementPeriodMonthsValues = [
  //   { name: 1, code: "1" },
  //   { name: 2, code: "2" },
  //   { name: 3, code: "3" },
  //   { name: 4, code: "4" },
  //   { name: 5, code: "5" },
  //   { name: 6, code: "6" },
  //   { name: 7, code: "7" },
  //   { name: 8, code: "8" },
  //   { name: 9, code: "9" },
  //   { name: 10, code: "10" },
  //   { name: 11, code: "11" },
  //   { name: 12, code: "12" },
  // ];

  const incrementPeriodMonthsValues = Array.from({ length: 60 }, (_, index) => ({
    name: index + 1,
    code: String(index + 1),
  }));

  const propertySpecificOptions = [
    { name: t("COMMERCIAL"), code: "Commercial", i18nKey: "Commercial" },
    { name: t("RESIDENTIAL"), code: "Residential", i18nKey: "Residential" },
  ];

  // 🔹 Location Type options
  const locationTypeOptions = [
    { name: t("PRIME"), code: "Prime", i18nKey: "Prime" },
    { name: t("NON_PRIME"), code: "Non-Prime", i18nKey: "Non-Prime" },
  ];

  const arrearReasonOptions = [
    { name: t("PREVIOUS DUES"), code: "PREVIOUS DUES" },
    { name: t("UNDER DISPUTE"), code: "UNDER DISPUTE" },
    { name: t("COURT CASE"), code: "COURT CASE" },
  ];

  const filters = {
    tenantId,
    searchType: "1",
  };

  const { data, isLoading, isError } = Digit.Hooks.rentandlease.useRentAndLeaseProperties(filters);

  const { data: rentANDLeaseArea = [], isLoading: RLAreaLoading } = Digit.Hooks.useCustomMDMS(tenantId, "rentAndLease", [{ name: "Area" }]);
  const { data: rentANDLeaseProperty = [], isLoading: RLPropertyLoading } = Digit.Hooks.useCustomMDMS(tenantId, "rentAndLease", [
    { name: "RLProperty" },
  ]);

  const { data: dueDateRL = [], isLoading: DueDateLoading } = Digit.Hooks.useCustomMDMS(tenantId, "rl-services-masters", [{ name: "DueDate" }]);

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
      // propertyId: "",
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

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  const docUploadData = {
    Challan: {
      Documents: [
        {
          code: "arrearDoc",
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
      // if (selectedPropertyType && selectedPropertySpecific && selectedLocationType) {
      //   properties = properties.filter(
      //     (p) =>
      //       p.allotmentType === selectedPropertyType?.code &&
      //       p.propertyType === selectedPropertySpecific?.code &&
      //       p.locationType === selectedLocationType?.code
      //   );
      // }

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

    console.log("property", property);

    const findPropertySpecific = propertySpecificOptions?.find((item) => item?.code == property?.propertyType);
    const findlocationTypeOptions = locationTypeOptions?.find((item) => item?.code == property?.locationType);

    setValue("propertySpecific", findPropertySpecific);
    setValue("locationType", findlocationTypeOptions);

    // List only the fields you want to prefill
    const fieldsToPrefill = [
      // "propertyId",
      "propertyName",
      "baseRent",
      // "securityDeposit",
      "refundApplicableOnDiscontinuation",
      "penaltyType",
      // "latePayment",
      // "cowCessApplicable",
      // "taxApplicable"
    ];
    setValue("securityDeposit", "0");

    setValue("selectedProperty", property);
    fieldsToPrefill?.forEach((field) => {
      let value = property?.[field];

      if (field === "securityDeposit" && typeof value === "number") {
        value = value.toString();
      }

      setValue(field, value || null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    });
  };

  const onSubmit = async (data) => {
    const applicationType = data?.applicationType?.code;

    if (applicationType === "Legacy") {
      data["arrearDoc"] = documentsData?.[0]?.filestoreId;
    } else {
      delete data["arrearDoc"];
    }

    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    triggerLoader(true);
    // Build one consistent object
    const propertyDetails = Object.keys(data).reduce((acc, key) => {
      acc[key] = data?.[key] || null; // ✅ optional chaining + null fallback
      return acc;
    }, {});

    propertyDetails["propertyId"] = propertyDetails?.selectedProperty?.propertyId;

    // Dispatch to Redux under one key
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));
    triggerLoader(false);
    goNext(propertyDetails);
  };

  useEffect(() => {
    if (currentStepData?.propertyDetails) {
      setValue("securityDeposit", currentStepData?.propertyDetails?.securityDeposit);
      const propertyDetails = currentStepData.propertyDetails;

      Object.keys(propertyDetails)?.forEach((key) => {
        if (key === "securityDeposit" || key === "duration") return; // Skip this field
        setValue(key, propertyDetails[key], { shouldValidate: true });
      });

      // Restore documentsData for persistence
      if (propertyDetails.arrearDoc) {
        setDocumentsData([
          {
            documentType: "arrearDoc",
            filestoreId: propertyDetails.arrearDoc,
            documentUid: propertyDetails.arrearDoc,
          },
        ]);
      }
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
    setDocumentsData(data);
  };

  const filterProperties = (checkProperty) => {
    const checkAllotment = watch("propertyType");
    const filteredData = rentANDLeaseProperty?.rentAndLease?.RLProperty?.filter((item) => item.areaCode == checkProperty?.code);
    const filterSet = filteredData?.filter((item) => item?.allotmentType == checkAllotment?.code);
    setPropertyFiltered(filterSet);
  };

  const handleBillingPeriod = (val) => {
    const dueDateRLData = dueDateRL?.["rl-services-masters"]?.DueDate;

    const filteredRLData = dueDateRLData?.find((item) => item?.billingCycle == val?.feesPeriodCycle);

    const dueDay = Number(filteredRLData?.dueDay);

    const today = new Date();
    const currentDate = today.getDate();

    let billingDate;

    if (dueDay >= currentDate) {
      // Last day of previous month
      billingDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      // Last day of current month
      billingDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    const formattedDate = `${billingDate.getFullYear()}-${String(billingDate.getMonth() + 1).padStart(2, "0")}-${String(
      billingDate.getDate()
    ).padStart(2, "0")}`;

    setValue("lastBillingPeriod", formattedDate);
  };
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
      {/* Allotment Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("Allotment Type")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertyType"
          rules={{ required: t("Allotment Type is required") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyTypeOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertyType && <CardLabelError className="ral-error-label">{getErrorMessage("propertyType")}</CardLabelError>}
      {/* Building/Plot/Shop Area */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("Building/Plot/Shop Locality")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="area"
          rules={{ required: t("Building/Plot/Shop Locality is required") }}
          render={(props) => (
            <Dropdown
              className="form-field"
              // select={props.onChange}
              select={(selected) => {
                // ✅ set propertyName field
                props.onChange(selected);
                filterProperties(selected);
              }}
              selected={props.value}
              option={rentANDLeaseArea?.rentAndLease?.Area}
              defaultValues
              optionKey="name"
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors.area && <CardLabelError className="ral-error-label">{getErrorMessage("area")}</CardLabelError>}
      {/* Building/Plot/Shop Name Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("Building/Plot/Shop Name")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertyName"
          rules={{ required: t("Building/Plot/Shop Name is required") }}
          render={({ value, onChange }) => (
            <Dropdown
              className="form-field"
              select={(selected) => {
                // ✅ set propertyName field
                onChange(selected.propertyName);
                // ✅ also set propertyId field
                handleBillingPeriod(selected);
                handlePropertySelect(selected); // ✅ prefill all other fields
              }}
              selected={filteredProperties.find((p) => p.propertyName === value)}
              option={getPropertyFiltered}
              optionKey="propertyName"
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors.propertyName && <CardLabelError className="ral-error-label">{getErrorMessage("propertyName")}</CardLabelError>}
      {/* Building/Plot/Shop Specific Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("Building/Plot/Shop Specific")} <span className="mandatory-asterisk">*</span>
        </CardLabel>
        <Controller
          control={control}
          name="propertySpecific"
          rules={{ required: t("Building/Plot/Shop Specific is required") }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertySpecificOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertySpecific && <CardLabelError className="ral-error-label">{getErrorMessage("propertySpecific")}</CardLabelError>}
      {/* Location Type Dropdown */}
      {/* <LabelFieldPair>
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
      {errors.locationType && <CardLabelError className="ral-error-label">{getErrorMessage("locationType")}</CardLabelError>} */}
      {/* Property ID */}
      {/* <LabelFieldPair>
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
      {errors.propertyId && <CardLabelError className="ral-error-label">{getErrorMessage("propertyId")}</CardLabelError>} */}
      {/* Hidden field for selected property */}
      <Controller control={control} name="selectedProperty" render={() => null} />
      {/* Start Date */}
      {/* {watch("applicationType")?.code != "Legacy" && ( */}
      <div
        style={{
          display: watch("applicationType")?.code === "Legacy" ? "none" : "block",
        }}
      >
        <LabelFieldPair>
          <CardLabel>
            {t("RAL_START_DATE")} <span className="mandatory-asterisk">*</span>
          </CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="startDate"
              rules={{
                required: watch("applicationType")?.code !== "Legacy" ? t("PTR_FIELD_REQUIRED") : false,
                validate: (value) => {
                  // Skip validation for Legacy
                  if (watch("applicationType")?.code === "Legacy") {
                    return true;
                  }

                  if (!value) return t("PTR_FIELD_REQUIRED");

                  const chosen = new Date(value);
                  const today = new Date(todayISO);

                  if (chosen > today) {
                    return t("RAL_START_DATE_CANNOT_BE_FUTURE");
                  }
                  // if (!value) return t("PTR_FIELD_REQUIRED");
                  // const chosen = new Date(value);
                  // const today = new Date(todayISO);
                  // if (chosen > today) return t("RAL_START_DATE_CANNOT_BE_FUTURE");
                  return true;
                },
              }}
              render={({ value, onChange }) => (
                <TextInput
                  type="date"
                  max={todayISO}
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
      </div>
      {/* )} */}
      {/* Duration (optional, auto-filled) */}
      {/* {watch("applicationType")?.code != "Legacy" && ( */}
      <div
        style={{
          display: watch("applicationType")?.code === "Legacy" ? "none" : "block",
        }}
      >
        <LabelFieldPair>
          <CardLabel>{t("DURATION")}</CardLabel>
          <div className="form-field">
            <Controller control={control} name="duration" render={({ value }) => <TextInput type="text" value={value || ""} disabled={true} />} />
          </div>
        </LabelFieldPair>
      </div>
      {/* )} */}
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
      {/* {watch("applicationType")?.code != "Legacy" && ( */}
      <div
        style={{
          display: watch("applicationType")?.code === "Legacy" ? "none" : "block",
        }}
      >
        <LabelFieldPair>
          <CardLabel>
            {t("RAL_SECURITY_AMOUNT")} <span className="mandatory-asterisk">*</span>
          </CardLabel>
          <div className="form-field">
            <Controller
              control={control}
              name="securityDeposit"
              rules={{
                required: watch("applicationType")?.code !== "Legacy" ? t("PTR_FIELD_REQUIRED") : false,
                // required: t("PTR_FIELD_REQUIRED")
              }}
              render={({ value, onChange }) => (
                <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} disable={true} />
              )}
            />
          </div>
        </LabelFieldPair>
        {errors.securityDeposit && <CardLabelError className="ral-error-label">{getErrorMessage("securityDeposit")}</CardLabelError>}
      </div>
      {/* )} */}
      {watch("applicationType")?.code == "Legacy" && (
        <React.Fragment>
          <LabelFieldPair>
            <CardLabel>
              {t("Arrears")} <span className="mandatory-asterisk">*</span>
            </CardLabel>

            <div className="form-field">
              <div style={{ fontSize: "13px", color: "green", paddingBottom: "10px" }}>
                Please add Arrears including penalty until last billing period.
              </div>
              <Controller
                control={control}
                name="arrear"
                rules={{ required: t("RENT_LEASE_ARREAR_REQUIRED") }}
                render={({ value, onChange, onBlur }) => (
                  <input
                    className="employee-card-input undefined focus-visible undefined"
                    type="number"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    onBlur={(e) => {
                      onBlur(e);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {errors.arrear && <CardLabelError className="ral-error-label">{getErrorMessage("arrear")}</CardLabelError>}

          {/* Last Billing Month */}
          <LabelFieldPair>
            <CardLabel>
              {t("Last Billing Month")} {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="lastBillingPeriod"
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
                  return <TextInput type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={true} />;
                }}
              />
            </div>
          </LabelFieldPair>
          {errors.lastBillingPeriod && <CardLabelError className="ral-error-label">{getErrorMessage("lastBillingPeriod")}</CardLabelError>}

          {/* last Rent Revised Date */}
          <LabelFieldPair>
            <CardLabel>
              {t("Last Rent Revised Date")}
              {/* {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>} */}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="lastRentRevisedDate"
                // rules={{
                //   validate: (value) => {
                //     const arrear = watch("arrear");
                //     if (arrear > 0 && !value) {
                //       return t("RENT_LEASE_RAL_END_DATE_REQUIRED");
                //     }
                //     return true;
                //   },
                // }}
                render={({ value, onChange }) => {
                  return (
                    <TextInput
                      type="date"
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value)}
                      // disabled={true}
                    />
                  );
                }}
              />
            </div>
          </LabelFieldPair>
          {errors.lastRentRevisedDate && <CardLabelError className="ral-error-label">{getErrorMessage("lastRentRevisedDate")}</CardLabelError>}

          {/* Increment Period Months */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {t("Increment Period Months")}
              {/* {watch("arrear") > 0 && <span className="mandatory-asterisk">*</span>} */}
            </CardLabel>
            <Controller
              control={control}
              name="incrementPeriodMonths"
              // rules={{
              //   validate: (value) => {
              //     const arrear = watch("arrear");
              //     if (arrear > 0 && !value) {
              //       return t("RENT_LEASE_REASON_REQUIRED");
              //     }
              //     return true;
              //   },
              // }}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  select={props.onChange}
                  selected={props.value}
                  option={incrementPeriodMonthsValues}
                  defaultValues
                  optionKey="name"
                  t={t}
                />
              )}
            />
          </LabelFieldPair>
          {errors.incrementPeriodMonths && <CardLabelError className="ral-error-label">{getErrorMessage("incrementPeriodMonths")}</CardLabelError>}

          {/* increment Percentage */}
          <LabelFieldPair>
            <CardLabel>
              {t("Increment Percentage")}
              {/* <span className="mandatory-asterisk">*</span> */}
            </CardLabel>

            <div className="form-field">
              <Controller
                control={control}
                name="incrementPercentage"
                // rules={{ required: t("RENT_LEASE_ARREAR_REQUIRED") }}
                render={({ value, onChange, onBlur }) => (
                  <input
                    className="employee-card-input undefined focus-visible undefined"
                    type="number"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    onBlur={(e) => {
                      onBlur(e);
                    }}
                  />
                )}
              />
            </div>
          </LabelFieldPair>
          {errors.incrementPercentage && <CardLabelError className="ral-error-label">{getErrorMessage("incrementPercentage")}</CardLabelError>}

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
                  option={arrearReasonOptions}
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
              formData={{ documents: { documents: documentsData } }}
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
