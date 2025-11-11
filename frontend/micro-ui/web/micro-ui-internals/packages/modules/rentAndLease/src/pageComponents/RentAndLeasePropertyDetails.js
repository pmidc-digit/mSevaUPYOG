import React, { useEffect, useState, useMemo } from "react";
import {
  TextInput,
  CardLabel,
  Dropdown,
  ActionBar,
  SubmitBar,
  CardLabelError,
  LabelFieldPair,
  CardSectionHeader,
  Card,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";
import { Loader } from "../components/Loader";

const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
  const stateId = Digit.ULBService.getStateId();
  let user = Digit.UserService.getUser();
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  // Static options for dropdowns
  const propertyTypeOptions = [
    { name: "On Rent", code: "ON_RENT", i18nKey: "ON_RENT" },
    { name: "On Lease", code: "ON_LEASE", i18nKey: "ON_LEASE" },
  ];

  const propertySpecificOptions = [
    { name: "Commercial", code: "COMMERCIAL", i18nKey: "COMMERCIAL" },
    { name: "Residential", code: "RESIDENTIAL", i18nKey: "RESIDENTIAL" },
    { name: "Industrial", code: "INDUSTRIAL", i18nKey: "INDUSTRIAL" },
    { name: "Mixed Use", code: "MIXED_USE", i18nKey: "MIXED_USE" },
  ];

  const locationTypeOptions = [
    { name: "Prime", code: "PRIME", i18nKey: "PRIME" },
    { name: "Non-Prime", code: "NON_PRIME", i18nKey: "NON_PRIME" },
  ];

  // Mock property data - In real implementation, this would come from an API
  const mockProperties = [
    {
      id: 1,
      title: "Commercial Space - Prime Location",
      propertyType: "ON_RENT",
      propertySpecific: "COMMERCIAL",
      locationType: "PRIME",
      area: "1200 sq ft",
      address: "123 Main Street, City Center",
      rent: "₹50,000/month",
    },
    {
      id: 2,
      title: "Residential Apartment - Prime",
      propertyType: "ON_LEASE",
      propertySpecific: "RESIDENTIAL",
      locationType: "PRIME",
      area: "1500 sq ft",
      address: "456 Park Avenue, Downtown",
      rent: "₹35,000/month",
    },
    {
      id: 3,
      title: "Commercial Shop - Non-Prime",
      propertyType: "ON_RENT",
      propertySpecific: "COMMERCIAL",
      locationType: "NON_PRIME",
      area: "800 sq ft",
      address: "789 Suburban Road, Outskirts",
      rent: "₹25,000/month",
    },
    {
      id: 4,
      title: "Industrial Warehouse - Non-Prime",
      propertyType: "ON_LEASE",
      propertySpecific: "INDUSTRIAL",
      locationType: "NON_PRIME",
      area: "5000 sq ft",
      address: "321 Industrial Area, Zone B",
      rent: "₹1,00,000/month",
    },
    {
      id: 5,
      title: "Residential House - Prime",
      propertyType: "ON_RENT",
      propertySpecific: "RESIDENTIAL",
      locationType: "PRIME",
      area: "2000 sq ft",
      address: "555 Elite Avenue, Premium Area",
      rent: "₹60,000/month",
    },
    {
      id: 6,
      title: "Mixed Use Property - Prime",
      propertyType: "ON_LEASE",
      propertySpecific: "MIXED_USE",
      locationType: "PRIME",
      area: "3000 sq ft",
      address: "999 Business Hub, Central",
      rent: "₹80,000/month",
    },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      propertyType: "",
      propertySpecific: "",
      locationType: "",
      selectedProperty: null,
      startDate: "",
      endDate: "",
    },
  });

  const selectedPropertyType = watch("propertyType");
  const selectedPropertySpecific = watch("propertySpecific");
  const selectedLocationType = watch("locationType");
  const selectedProperty = watch("selectedProperty");

  // Filter properties based on selections
  const filteredProperties = useMemo(() => {
    if (!selectedPropertyType || !selectedPropertySpecific || !selectedLocationType) {
      return [];
    }

    return mockProperties.filter((property) => {
      return (
        property.propertyType === selectedPropertyType?.code &&
        property.propertySpecific === selectedPropertySpecific?.code &&
        property.locationType === selectedLocationType?.code
      );
    });
  }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType]);

  // Reset selected property when filters change
  useEffect(() => {
    if (selectedPropertyType || selectedPropertySpecific || selectedLocationType) {
      setValue("selectedProperty", null);
    }
  }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType, setValue]);

  const onSubmit = async (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    if (!data.selectedProperty) {
      trigger("selectedProperty");
      return;
    }

    // Store property details in Redux and move to next step
    const propertyDetails = {
      propertyType: data.propertyType,
      propertySpecific: data.propertySpecific,
      locationType: data.locationType,
      selectedProperty: data.selectedProperty,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));

    if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
      goNext(propertyDetails);
      return;
    }

    // For new applications, just proceed to next step
    setLoader(false);
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));
    goNext(propertyDetails);
  };

  useEffect(() => {
    if (apiDataCheck?.[0]?.propertyDetails) {
      const propertyDetails = apiDataCheck[0].propertyDetails;
      if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
      if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
      if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
      if (propertyDetails.selectedProperty) setValue("selectedProperty", propertyDetails.selectedProperty);
    }
  }, [apiDataCheck, setValue]);

  useEffect(() => {
    if (currentStepData?.propertyDetails) {
      const propertyDetails = currentStepData.propertyDetails;
      if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
      if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
      if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
      if (propertyDetails.selectedProperty) setValue("selectedProperty", propertyDetails.selectedProperty);
    }
  }, [currentStepData, setValue]);

  const getErrorMessage = (fieldName) => {
    if (!errors[fieldName]) return null;
    return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
  };

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px" };

  const propertyCardStyle = {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#ffffff",
  };

  const selectedCardStyle = {
    ...propertyCardStyle,
    border: "2px solid #2947a3",
    backgroundColor: "#f0f4ff",
  };

  const handlePropertySelect = (property) => {
    setValue("selectedProperty", property);
    trigger("selectedProperty");
  };

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardSectionHeader className="card-section-header">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSectionHeader>
      {/* Start Date */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RAL_START_DATE")} *</CardLabel>
        <Controller
          control={control}
          name="startDate"
          rules={{
            required: t("PTR_FIELD_REQUIRED"),
            validate: (value) => {
              if (!value) return t("PTR_FIELD_REQUIRED");
              const today = new Date(todayISO);
              const chosen = new Date(value);
              if (chosen < today) {
                return t("PTR_START_DATE_NOT_IN_PAST");
              }
              return true;
            },
          }}
          render={({ value, onChange, onBlur }) => (
            <div className="form-field">
              <TextInput
                type="date"
                min={todayISO}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                onBlur={(e) => {
                  onBlur(e);
                  trigger("startDate");
                }}
                t={t}
              />
            </div>
          )}
        />
      </LabelFieldPair>
      {errors?.startDate && <CardLabelError style={errorStyle}>{errors?.startDate?.message}</CardLabelError>}

      {/* End Date */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RAL_END_DATE")}</CardLabel>
        <Controller
          control={control}
          name="endDate"
          rules={{
            validate: (value) => {
              if (!value) return true; // optional
              const start = watch("startDate");
              if (!start) return t("PTR_START_DATE_REQUIRED");
              if (new Date(value) <= new Date(start)) {
                return t("PTR_END_DATE_AFTER_START");
              }
              return true;
            },
          }}
          render={({ value, onChange, onBlur }) => (
            <div className="form-field">
            <TextInput
              type="date"
              min={watch("startDate") || todayISO}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onBlur={(e) => {
                onBlur(e);
                trigger("endDate");
              }}
            />
            </div>
          )}
        />
      </LabelFieldPair>
      {errors?.endDate && <CardLabelError style={errorStyle}>{errors?.endDate?.message}</CardLabelError>}

      {/* Property Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_PROPERTY_TYPE") || "Property Type"} *</CardLabel>
        <Controller
          control={control}
          name="propertyType"
          rules={{ required: t("RENT_LEASE_PROPERTY_TYPE_REQUIRED") || "Property Type is required" }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyTypeOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertyType && <CardLabelError style={errorStyle}>{getErrorMessage("propertyType")}</CardLabelError>}

      {/* Property Specific Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_PROPERTY_SPECIFIC") || "Property Specific"} *</CardLabel>
        <Controller
          control={control}
          name="propertySpecific"
          rules={{ required: t("RENT_LEASE_PROPERTY_SPECIFIC_REQUIRED") || "Property Specific is required" }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertySpecificOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.propertySpecific && <CardLabelError style={errorStyle}>{getErrorMessage("propertySpecific")}</CardLabelError>}

      {/* Location Type Dropdown */}
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("RENT_LEASE_LOCATION_TYPE") || "Location Type"} *</CardLabel>
        <Controller
          control={control}
          name="locationType"
          rules={{ required: t("RENT_LEASE_LOCATION_TYPE_REQUIRED") || "Location Type is required" }}
          render={(props) => (
            <Dropdown className="form-field" select={props.onChange} selected={props.value} option={locationTypeOptions} optionKey="name" t={t} />
          )}
        />
      </LabelFieldPair>
      {errors.locationType && <CardLabelError style={errorStyle}>{getErrorMessage("locationType")}</CardLabelError>}

      {/* Property Cards Display */}
      {selectedPropertyType && selectedPropertySpecific && selectedLocationType && (
        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
          <CardLabel className="card-label-smaller" style={{ marginBottom: "12px" }}>
            {t("RENT_LEASE_SELECT_PROPERTY") || "Select a Property"} *
          </CardLabel>
          {filteredProperties.length > 0 ? (
            <div>
              {filteredProperties.map((property) => {
                const isSelected = selectedProperty?.id === property.id;
                return (
                  <Card key={property.id} style={isSelected ? selectedCardStyle : propertyCardStyle} onClick={() => handlePropertySelect(property)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1C1D1F" }}>{property.title}</h3>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Area:</strong> {property.area}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Address:</strong> {property.address}
                        </p>
                        <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
                          <strong>Rent:</strong> {property.rent}
                        </p>
                      </div>
                      {isSelected && <div style={{ color: "#2947a3", fontSize: "20px", marginLeft: "12px" }}>✓</div>}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ padding: "20px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
              <p style={{ margin: 0, color: "#666" }}>{t("RENT_LEASE_NO_PROPERTIES_FOUND") || "No properties found matching your criteria."}</p>
            </Card>
          )}
        </div>
      )}

      {/* Hidden field for selected property validation */}
      <Controller
        control={control}
        name="selectedProperty"
        rules={{ required: t("RENT_LEASE_PROPERTY_SELECTION_REQUIRED") || "Please select a property" }}
        render={() => null}
      />
      {errors.selectedProperty && <CardLabelError style={errorStyle}>{getErrorMessage("selectedProperty")}</CardLabelError>}

      <ActionBar>
        <SubmitBar label={t("Next") || "Next"} submit="submit" />
      </ActionBar>
      {loader && <Loader page={true} />}
    </form>
  );
};

export default RentAndLeasePropertyDetails;
