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
import { Controller, useForm } from "react-hook-form";
import {
  useDispatch,
  //  useSelector
} from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";

const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, config }) => {
  const dispatch = useDispatch();
  // const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { data: mdmsPropertyData } = Digit.Hooks.rentandlease.useRALPropertyMDMS(tenantId);
  console.log("mdmsPropertyData", mdmsPropertyData);
  const { triggerLoader } = config?.currStepConfig[0];

  // 🔹 Dropdown options
  const propertyTypeOptions = [
    { name: t("ON_RENT"), code: "ON_RENT", i18nKey: "ON_RENT" },
    { name: t("ON_LEASE"), code: "ON_LEASE", i18nKey: "ON_LEASE" },
  ];

  const propertySpecificOptions = [
    { name: t("COMMERCIAL"), code: "COMMERCIAL", i18nKey: "COMMERCIAL" },
    { name: t("RESIDENTIAL"), code: "RESIDENTIAL", i18nKey: "RESIDENTIAL" },
    { name: t("INDUSTRIAL"), code: "INDUSTRIAL", i18nKey: "INDUSTRIAL" },
    { name: t("MIXED_USE"), code: "MIXED_USE", i18nKey: "MIXED_USE" },
  ];

  // 🔹 Location Type options
  const locationTypeOptions = [
    { code: "PRIME", name: t("PRIME"), i18nKey: "PRIME" },
    { code: "NON_PRIME", name: t("NON_PRIME"), i18nKey: "NON_PRIME" },
  ];

  // const notificationPrefOptions = [
  //   { code: "SMS", name: t("SMS"), i18nKey: "SMS" },
  //   { code: "EMAIL", name: t("EMAIL"), i18nKey: "EMAIL" },
  //   { code: "PUSH", name: t("PUSH"), i18nKey: "PUSH" },
  // ];

  // const penaltyTypeOptions = [
  //   { code: "DAILY", name: t("DAILY"), i18nKey: "DAILY" },
  //   { code: "MONTHLY", name: t("MONTHLY"), i18nKey: "MONTHLY" },
  //   { code: "ONETIME", name: t("ONETIME"), i18nKey: "ONETIME" },
  // ];
  const incrementCycleOptions = [
    { code: "YEARLY", name: t("YEARLY"), i18nKey: "YEARLY" },
    { code: "HALF_YEARLY", name: t("HALF_YEARLY"), i18nKey: "HALF_YEARLY" },
  ];

  // 🔹 Mock property data
  const mockProperties = [
    {
      propertyType: "ON_RENT",
      propertyId: "RL001",
      propertyName: "Commercial Space - Prime Location",
      usageCategory: "rent",
      propertySizeOrArea: "1200",
      address: "123 Main Street, City Center",
      geoLocation: { latitude: "28.6139", longitude: "77.2090" },
      propertySpecific: "COMMERCIAL",
      locationType: "PRIME",
      propertyImage: "https://c8.alamy.com/comp/KFF7X8/kpmg-logo-KFF7X8.jpg",
      baseRent: "50000",
      securityDeposit: "10000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: true,
      penaltyType: "DAILY",
      latePayment: "2%",
    },
    {
      propertyType: "ON_LEASE",
      propertyId: "RL002",
      propertyName: "Residential Apartment - Prime",
      usageCategory: "rent",
      propertySizeOrArea: "1500",
      address: "456 Park Avenue, Downtown",
      geoLocation: { latitude: "28.7041", longitude: "77.1025" },
      propertySpecific: "RESIDENTIAL",
      locationType: "PRIME",
      propertyImage: "https://via.placeholder.com/150",
      baseRent: "35000",
      securityDeposit: "8000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: false,
      penaltyType: "MONTHLY",
      latePayment: "5%",
    },
    {
      propertyType: "ON_RENT",
      propertyId: "RL003",
      propertyName: "Commercial Shop - Non-Prime",
      usageCategory: "rent",
      propertySizeOrArea: "800",
      address: "789 Suburban Road, Outskirts",
      geoLocation: { latitude: "27.1767", longitude: "78.0081" },
      propertySpecific: "COMMERCIAL",
      locationType: "NON_PRIME",
      propertyImage: "https://via.placeholder.com/150",
      baseRent: "25000",
      securityDeposit: "5000",
      tax_applicable: false,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "1%",
    },
    {
      propertyType: "ON_LEASE",
      propertyId: "RL004",
      propertyName: "Industrial Warehouse - Non-Prime",
      usageCategory: "rent",
      propertySizeOrArea: "5000",
      address: "321 Industrial Area, Zone B",
      geoLocation: { latitude: "19.0760", longitude: "72.8777" },
      propertySpecific: "INDUSTRIAL",
      locationType: "NON_PRIME",
      propertyImage: "https://via.placeholder.com/150",
      baseRent: "100000",
      securityDeposit: "20000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: false,
      penaltyType: "MONTHLY",
      latePayment: "10%",
    },
    {
      propertyType: "ON_RENT",
      propertyId: "RL005",
      propertyName: "Residential House - Prime",
      usageCategory: "rent",
      propertySizeOrArea: "2000",
      address: "555 Elite Avenue, Premium Area",
      geoLocation: { latitude: "12.9716", longitude: "77.5946" },
      propertySpecific: "RESIDENTIAL",
      locationType: "PRIME",
      propertyImage: "https://via.placeholder.com/150",
      baseRent: "60000",
      securityDeposit: "15000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "3%",
    },
    {
      propertyType: "ON_LEASE",
      propertyId: "RL006",
      propertyName: "Mixed Use Property - Prime",
      usageCategory: "rent",
      propertySizeOrArea: "3000",
      address: "999 Business Hub, Central",
      geoLocation: { latitude: "22.5726", longitude: "88.3639" },
      propertySpecific: "MIXED_USE",
      locationType: "PRIME",
      propertyImage: "https://via.placeholder.com/150",
      baseRent: "80000",
      securityDeposit: "25000",
      tax_applicable: false,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "4%",
    },
  ];

  const [filteredProperties, setFilteredProperties] = useState(mockProperties);

  // 🔹 Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      propertyId: "",
      propertyName: "",
      propertyType: "",
      propertySpecific: "",
      locationType: "",
      usageCategory: "",
      propertySizeOrArea: "",
      baseRent: "",
      securityDeposit: "",
      refund_applicable_on_discontinuation: null,
      penaltyType: "",
      latePayment: "",
      startDate: "",
      endDate: "",
      incrementApplicable: "",
      incrementPercentage: "",
      incrementCycle: "",
      gstApplicable: false,
      cowCessApplicable: false,
      termsAndConditions: "",
      amountToBeRefunded: "",
      selectedProperty: null,
      // address: "",
      // geoLocation: null,
      // propertyImage: "",
      // tax_applicable: null,
    },
  });

  const selectedPropertyType = watch("propertyType");
  const selectedPropertySpecific = watch("propertySpecific");
  const selectedLocationType = watch("locationType");

  // 🔹 Reset selected property when filters change
  useEffect(() => {
    if (selectedPropertyType || selectedPropertySpecific || selectedLocationType) {
      setValue("selectedProperty", null);
    }
  }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType, setValue]);

  useEffect(() => {
    if (selectedPropertyType && selectedPropertySpecific && selectedLocationType) {
      const filtered = mockProperties.filter(
        (p) =>
          p.propertyType === selectedPropertyType?.code &&
          p.propertySpecific === selectedPropertySpecific?.code &&
          p.locationType === selectedLocationType?.code
      );
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(filteredProperties);
    }
  }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType]);

  const todayISO = new Date().toISOString().split("T")[0];

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const handlePropertySelect = (property) => {
    setValue("selectedProperty", property);

    // ✅ Prefill only dependent fields
    setValue("propertyId", property?.propertyId ?? null);
    setValue("propertyName", property?.propertyName ?? null);
    setValue("baseRent", property?.baseRent ?? null);
    setValue("securityDeposit", property?.securityDeposit ?? null);
    setValue("penaltyType", property?.penaltyType ?? null);
    setValue("latePayment", property?.latePayment ?? null);
    setValue("refund_applicable_on_discontinuation", property?.refund_applicable_on_discontinuation ?? null);

    // keep dropdowns as they are (propertyType, propertySpecific, locationType)
    trigger("selectedProperty");
  };

  const onSubmit = async (data) => {
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

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px", color: "red" };
  const mandatoryStyle = { color: "red" };
  const checkStyles = { marginBottom: "15px" };
  const radioStyles = { width: "18px", height: "18px", cursor: "pointer" };
  const wrapper = { display: "flex", alignItems: "center", gap: "10px", margin: "10px 0px 20px 0px" };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSectionHeader>

      {/* Property Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_TYPE")} <span style={mandatoryStyle}>*</span>
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
      {errors.propertyType && <CardLabelError style={errorStyle}>{getErrorMessage("propertyType")}</CardLabelError>}

      {/* Property Specific Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_SPECIFIC")} <span style={mandatoryStyle}>*</span>
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
      {errors.propertySpecific && <CardLabelError style={errorStyle}>{getErrorMessage("propertySpecific")}</CardLabelError>}

      {/* Location Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_LOCATION_TYPE")} <span style={mandatoryStyle}>*</span>
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
      {errors.locationType && <CardLabelError style={errorStyle}>{getErrorMessage("locationType")}</CardLabelError>}

      {/* Property Name Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_NAME")} <span style={mandatoryStyle}>*</span>
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
      {errors.propertyName && <CardLabelError style={errorStyle}>{getErrorMessage("propertyName")}</CardLabelError>}

      {/* Property ID */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("RENT_LEASE_PROPERTY_ID")} <span style={mandatoryStyle}>*</span>
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
      {errors.propertyId && <CardLabelError style={errorStyle}>{getErrorMessage("propertyId")}</CardLabelError>}

      {/* Hidden field for selected property */}
      <Controller control={control} name="selectedProperty" rules={{ required: t("RENT_LEASE_PROPERTY_SELECTION_REQUIRED") }} render={() => null} />
      {errors.selectedProperty && <CardLabelError style={errorStyle}>{getErrorMessage("selectedProperty")}</CardLabelError>}

      {/* Start Date */}
      <LabelFieldPair>
        <CardLabel>
          {t("RAL_START_DATE")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="startDate"
            rules={{
              required: t("PTR_FIELD_REQUIRED"),
              validate: (value) => {
                if (!value) return t("PTR_FIELD_REQUIRED");
                const today = new Date(todayISO);
                const chosen = new Date(value);
                if (chosen < today) return t("PTR_START_DATE_NOT_IN_PAST");
                return true;
              },
            }}
            render={({ value, onChange }) => (
              <TextInput
                type="date"
                min={todayISO}
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
      {errors.startDate && <CardLabelError style={errorStyle}>{getErrorMessage("startDate")}</CardLabelError>}

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
      {errors.endDate && <CardLabelError style={errorStyle}>{getErrorMessage("endDate")}</CardLabelError>}

      {/* Rent Amount */}
      <LabelFieldPair>
        <CardLabel>
          {t("RENT_AMOUNT")} <span style={mandatoryStyle}>*</span>
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

      {/* Penalty Type */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">
          {t("PENALTY_TYPE")} <span style={mandatoryStyle}>*</span>
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
      {errors.propertyId && <CardLabelError style={errorStyle}>{getErrorMessage("penaltyType")}</CardLabelError>}

      {/* Security Amount */}
      <LabelFieldPair>
        <CardLabel>
          {t("SECURITY_AMOUNT")} <span style={mandatoryStyle}>*</span>
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

      {/* Late Payment % */}
      <LabelFieldPair>
        <CardLabel>
          {t("LATE_PAYMENT_PERCENT")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="latePayment"
            render={({ value, onChange }) => <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} disable={true} />}
          />
        </div>
      </LabelFieldPair>

      {/* Terms & Conditions */}
      <LabelFieldPair>
        <CardLabel>
          {t("TERMS_AND_CONDITIONS")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="termsAndConditions"
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => <TextArea value={value || ""} onChange={onChange} />}
          />
        </div>
      </LabelFieldPair>
      {errors.termsAndConditions && <CardLabelError style={errorStyle}>{getErrorMessage("termsAndConditions")}</CardLabelError>}

      {/* Refund Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("REFUND_APPLICABLE")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            name="refund_applicable_on_discontinuation"
            render={({ value, onChange }) => (
              <div style={wrapper}>
                <input type="radio" checked={value === true} onChange={() => onChange(true)} style={radioStyles} disabled /> {t("YES")}
                <input type="radio" checked={value === false} onChange={() => onChange(false)} style={radioStyles} disabled /> {t("NO")}
              </div>
            )}
          />
        </div>
      </LabelFieldPair>

      {/* Amount to be Refunded */}
      <LabelFieldPair>
        <CardLabel>
          {t("AMOUNT_TO_BE_REFUNDED")}
          {/* <span style={mandatoryStyle}>*</span> */}
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="amountToBeRefunded"
            // rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => <TextInput type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
          />
        </div>
      </LabelFieldPair>

      {/* GST Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("GST_APPLICABLE")}
          {/* <span style={mandatoryStyle}>*</span> */}
        </CardLabel>
        <div className="form-field" style={{ checkStyles }}>
          <Controller
            control={control}
            name="gstApplicable"
            render={({ value, onChange }) => (
              <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={radioStyles} />
            )}
          />
        </div>
      </LabelFieldPair>

      {/* Cow Cess Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("COW_CESS_APPLICABLE")}
          {/* <span style={mandatoryStyle}>*</span> */}
        </CardLabel>
        <div className="form-field" style={{ checkStyles }}>
          <Controller
            control={control}
            name="cowCessApplicable"
            render={({ value, onChange }) => (
              <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={radioStyles} />
            )}
          />
        </div>
      </LabelFieldPair>

      {/* Increment Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("INCREMENT_APPLICABLE")}
          {/* <span style={mandatoryStyle}>*</span> */}
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="incrementApplicable"
            // rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => (
              <div style={wrapper}>
                <input type="radio" checked={value === true} onChange={() => onChange(true)} style={radioStyles} /> {t("YES")}
                <input type="radio" checked={value === false} onChange={() => onChange(false)} style={radioStyles} /> {t("NO")}
              </div>
            )}
          />
        </div>
      </LabelFieldPair>

      {/* Increment Percentage */}
      <LabelFieldPair>
        <CardLabel>{t("INCREMENT_PERCENTAGE")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="incrementPercentage"
            rules={{
              validate: (val) => {
                if (watch("incrementApplicable") === "YES" && !val) return t("PTR_FIELD_REQUIRED");
                return true;
              },
            }}
            render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
          />
        </div>
      </LabelFieldPair>

      {/* Increment Cycle */}
      <LabelFieldPair>
        <CardLabel>{t("INCREMENT_CYCLE")}</CardLabel>
        <Controller
          control={control}
          name="incrementCycle"
          render={({ value, onChange }) => (
            <Dropdown className="form-field" option={incrementCycleOptions} optionKey="name" selected={value} select={onChange} t={t} />
          )}
        />
      </LabelFieldPair>

      {/* Notification Preferences */}
      {/* <LabelFieldPair>
        <CardLabel>{t("NOTIFICATION_PREFERENCES")} <span style={mandatoryStyle}>*</span></CardLabel>
        <Controller
          control={control}
          name="notificationPrefs"
          rules={{ required: t("PTR_FIELD_REQUIRED") }}
          render={({ value, onChange }) => (
            <Dropdown
              className="form-field"
              option={notificationPrefOptions}
              optionKey="name"
              selected={value}
              select={onChange}
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      {errors.notificationPrefs && <CardLabelError style={errorStyle}>{getErrorMessage("notificationPrefs")}</CardLabelError>} */}

      {/* Penalty Type */}
      {/* <LabelFieldPair>
        <CardLabel>
          {t("PENALTY_TYPE")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <Controller
          control={control}
          name="penaltyType"
          rules={{ required: t("PTR_FIELD_REQUIRED") }}
          render={({ value, onChange }) => (
            <Dropdown className="form-field" option={penaltyTypeOptions} optionKey="name" selected={value} select={onChange} t={t} disable={true}/>
          )}
        />
      </LabelFieldPair>
      {errors.penaltyType && <CardLabelError style={errorStyle}>{getErrorMessage("penaltyType")}</CardLabelError>} */}

      {/* Action Bar */}
      <ActionBar>
        <SubmitBar
          label={t("Back")}
          style={{ border: "1px solid", background: "transparent", color: "#2947a3", marginRight: "8px" }}
          onSubmit={onGoBack}
        />
        <SubmitBar label={t("Next")} submit="submit" />
      </ActionBar>
    </form>
  );
};

export default RentAndLeasePropertyDetails;
