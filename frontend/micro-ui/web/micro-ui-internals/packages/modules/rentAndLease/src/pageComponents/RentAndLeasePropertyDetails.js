// import React, { useEffect, useState, useMemo } from "react";
// import {
//   TextInput,
//   CardLabel,
//   Dropdown,
//   ActionBar,
//   SubmitBar,
//   CardLabelError,
//   LabelFieldPair,
//   CardSectionHeader,
//   Card,
// } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";
// import { Loader } from "../components/Loader";

// const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
//   const stateId = Digit.ULBService.getStateId();
//   let user = Digit.UserService.getUser();
//   const dispatch = useDispatch();
//   const [loader, setLoader] = useState(false);
//   const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);

//   const tenantId = window.location.href.includes("citizen")
//     ? window.localStorage.getItem("CITIZEN.CITY")
//     : window.localStorage.getItem("Employee.tenant-id");

//   // Static options for dropdowns
//   const propertyTypeOptions = [
//     { name: "On Rent", code: "ON_RENT", i18nKey: "ON_RENT" },
//     { name: "On Lease", code: "ON_LEASE", i18nKey: "ON_LEASE" },
//   ];

//   const propertySpecificOptions = [
//     { name: "Commercial", code: "COMMERCIAL", i18nKey: "COMMERCIAL" },
//     { name: "Residential", code: "RESIDENTIAL", i18nKey: "RESIDENTIAL" },
//     { name: "Industrial", code: "INDUSTRIAL", i18nKey: "INDUSTRIAL" },
//     { name: "Mixed Use", code: "MIXED_USE", i18nKey: "MIXED_USE" },
//   ];

//   const locationTypeOptions = [
//     { name: "Prime", code: "PRIME", i18nKey: "PRIME" },
//     { name: "Non-Prime", code: "NON_PRIME", i18nKey: "NON_PRIME" },
//   ];

//   // Mock property data - In real implementation, this would come from an API
//   const mockProperties = [
//     {
//       id: 1,
//       title: "Commercial Space - Prime Location",
//       propertyType: "ON_RENT",
//       propertySpecific: "COMMERCIAL",
//       locationType: "PRIME",
//       area: "1200 sq ft",
//       address: "123 Main Street, City Center",
//       rent: "₹50,000/month",
//     },
//     {
//       id: 2,
//       title: "Residential Apartment - Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "RESIDENTIAL",
//       locationType: "PRIME",
//       area: "1500 sq ft",
//       address: "456 Park Avenue, Downtown",
//       rent: "₹35,000/month",
//     },
//     {
//       id: 3,
//       title: "Commercial Shop - Non-Prime",
//       propertyType: "ON_RENT",
//       propertySpecific: "COMMERCIAL",
//       locationType: "NON_PRIME",
//       area: "800 sq ft",
//       address: "789 Suburban Road, Outskirts",
//       rent: "₹25,000/month",
//     },
//     {
//       id: 4,
//       title: "Industrial Warehouse - Non-Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "INDUSTRIAL",
//       locationType: "NON_PRIME",
//       area: "5000 sq ft",
//       address: "321 Industrial Area, Zone B",
//       rent: "₹1,00,000/month",
//     },
//     {
//       id: 5,
//       title: "Residential House - Prime",
//       propertyType: "ON_RENT",
//       propertySpecific: "RESIDENTIAL",
//       locationType: "PRIME",
//       area: "2000 sq ft",
//       address: "555 Elite Avenue, Premium Area",
//       rent: "₹60,000/month",
//     },
//     {
//       id: 6,
//       title: "Mixed Use Property - Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "MIXED_USE",
//       locationType: "PRIME",
//       area: "3000 sq ft",
//       address: "999 Business Hub, Central",
//       rent: "₹80,000/month",
//     },
//   ];

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//     trigger,
//   } = useForm({
//     defaultValues: {
//       propertyType: "",
//       propertySpecific: "",
//       locationType: "",
//       selectedProperty: null,
//       startDate: "",
//       endDate: "",
//     },
//   });

//   const selectedPropertyType = watch("propertyType");
//   const selectedPropertySpecific = watch("propertySpecific");
//   const selectedLocationType = watch("locationType");
//   const selectedProperty = watch("selectedProperty");

//   // Filter properties based on selections
//   const filteredProperties = useMemo(() => {
//     if (!selectedPropertyType || !selectedPropertySpecific || !selectedLocationType) {
//       return [];
//     }

//     return mockProperties.filter((property) => {
//       return (
//         property.propertyType === selectedPropertyType?.code &&
//         property.propertySpecific === selectedPropertySpecific?.code &&
//         property.locationType === selectedLocationType?.code
//       );
//     });
//   }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType]);

//   // Reset selected property when filters change
//   useEffect(() => {
//     if (selectedPropertyType || selectedPropertySpecific || selectedLocationType) {
//       setValue("selectedProperty", null);
//     }
//   }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType, setValue]);

//   const propertyNameOptions = mockProperties.map((p) => ({
//     name: p.title,
//     code: p.id, // use id as code
//     i18nKey: p.title, // or just p.title if no translation
//   }));

//   const onSubmit = async (data) => {
//     if (validateStep) {
//       const validationErrors = validateStep(data);
//       if (Object.keys(validationErrors).length > 0) return;
//     }

//     if (!data.selectedProperty) {
//       trigger("selectedProperty");
//       return;
//     }

//     // Store property details in Redux and move to next step
//     const propertyDetails = {
//        propertyName: data.propertyName,
//       propertyId: data.propertyId,
//       propertyType: data.propertyType,
//       propertySpecific: data.propertySpecific,
//       locationType: data.locationType,
//       selectedProperty: data.selectedProperty,
//       startDate: data.startDate,
//       endDate: data.endDate,
//     };

//     dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));

//     if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
//       goNext(propertyDetails);
//       return;
//     }

//     // For new applications, just proceed to next step
//     setLoader(false);
//     dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));
//     goNext(propertyDetails);
//   };

//   useEffect(() => {
//     if (apiDataCheck?.[0]?.propertyDetails) {
//       const propertyDetails = apiDataCheck[0]?.propertyDetails;
//       if (propertyDetails.propertyName) setValue("startDate", propertyDetails.propertyName);
//       if (propertyDetails.propertyId) setValue("endDate", propertyDetails.propertyId);
//       if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
//       if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
//       if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
//       if (propertyDetails.selectedProperty) {
//         setValue("selectedProperty", propertyDetails.selectedProperty, {
//           shouldValidate: true, // 👈 force RHF to re‑run validation
//           shouldDirty: false,
//         });
//       }
//       if (propertyDetails.startDate) setValue("startDate", propertyDetails.startDate);
//       if (propertyDetails.endDate) setValue("endDate", propertyDetails.endDate);
//     }
//   }, [apiDataCheck, setValue]);

//   useEffect(() => {
//     if (currentStepData?.propertyDetails) {
//       const propertyDetails = currentStepData?.propertyDetails;
//       if (propertyDetails.propertyName) setValue("startDate", propertyDetails.propertyName);
//       if (propertyDetails.propertyId) setValue("endDate", propertyDetails.propertyId);
//       if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
//       if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
//       if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
//       if (propertyDetails.selectedProperty) {
//         setValue("selectedProperty", propertyDetails.selectedProperty, {
//           shouldValidate: true, // 👈 force RHF to re‑run validation
//           shouldDirty: false,
//         });
//       }
//       if (propertyDetails.startDate) setValue("startDate", propertyDetails.startDate);
//       if (propertyDetails.endDate) setValue("endDate", propertyDetails.endDate);
//     }
//   }, [currentStepData, setValue]);

//   console.log("errors", errors);

//   const getErrorMessage = (fieldName) => {
//     if (!errors[fieldName]) return null;
//     return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
//   };

//   const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px", color: "red" };
//   const mandatoryStyle = { color: "red" };
//   const propertyCardStyle = {
//     border: "1px solid #e0e0e0",
//     borderRadius: "8px",
//     padding: "16px",
//     marginBottom: "12px",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     backgroundColor: "#ffffff",
//   };

//   const selectedCardStyle = {
//     ...propertyCardStyle,
//     border: "2px solid #2947a3",
//     backgroundColor: "#f0f4ff",
//   };

//   const handlePropertySelect = (property) => {
//     setValue("selectedProperty", property);
//     trigger("selectedProperty");
//   };

//   const todayISO = new Date().toISOString().split("T")[0];
//   console.log("currentStepData", currentStepData);

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <CardSectionHeader className="card-section-header">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSectionHeader>

//       {/* Property Name Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_NAME") || "Property Name"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyName"
//           rules={{ required: t("RENT_LEASE_PROPERTY_NAME_REQUIRED") || "Property Name is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyNameOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyName && <CardLabelError style={errorStyle}>{getErrorMessage("propertyName")}</CardLabelError>}

//       {/* Property ID Search */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_ID") || "Property ID"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyId"
//           rules={{ required: t("RENT_LEASE_PROPERTY_ID_REQUIRED") || "Property ID is required" }}
//           render={({ value, onChange, onBlur }) => (
//             <TextInput
//               type="text"
//               value={value || ""}
//               onChange={(e) => onChange(e.target.value)}
//               onBlur={onBlur}
//               t={t}
//               style={{ width: "100%", maxWidth: "330px" }}
//             />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyId && <CardLabelError style={errorStyle}>{getErrorMessage("propertyId")}</CardLabelError>}

//       {/* Property Type Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_TYPE") || "Property Type"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyType"
//           rules={{ required: t("RENT_LEASE_PROPERTY_TYPE_REQUIRED") || "Property Type is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyTypeOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyType && <CardLabelError style={errorStyle}>{getErrorMessage("propertyType")}</CardLabelError>}

//       {/* Property Specific Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_SPECIFIC") || "Property Specific"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertySpecific"
//           rules={{ required: t("RENT_LEASE_PROPERTY_SPECIFIC_REQUIRED") || "Property Specific is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertySpecificOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertySpecific && <CardLabelError style={errorStyle}>{getErrorMessage("propertySpecific")}</CardLabelError>}

//       {/* Location Type Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_LOCATION_TYPE") || "Location Type"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="locationType"
//           rules={{ required: t("RENT_LEASE_LOCATION_TYPE_REQUIRED") || "Location Type is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={locationTypeOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.locationType && <CardLabelError style={errorStyle}>{getErrorMessage("locationType")}</CardLabelError>}

//       {/* Property Cards Display */}
//       {selectedPropertyType && selectedPropertySpecific && selectedLocationType && (
//         <div style={{ marginTop: "24px", marginBottom: "24px" }}>
//           <CardLabel className="card-label-smaller" style={{ marginBottom: "12px" }}>
//             {t("RENT_LEASE_SELECT_PROPERTY") || "Select a Property"} <span style={mandatoryStyle}>*</span>
//           </CardLabel>
//           {filteredProperties?.length > 0 || currentStepData?.propertyDetails?.selectedProperty ? (
//             <div>
//               {filteredProperties.map((property) => {
//                 const isSelected = selectedProperty?.id === property.id || currentStepData?.propertyDetails?.selectedProperty;
//                 return (
//                   <Card key={property.id} style={isSelected ? selectedCardStyle : propertyCardStyle} onClick={() => handlePropertySelect(property)}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                       <div style={{ flex: 1 }}>
//                         <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1C1D1F" }}>{property.title}</h3>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Area:</strong> {property.area}
//                         </p>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Address:</strong> {property.address}
//                         </p>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Rent:</strong> {property.rent}
//                         </p>
//                       </div>
//                       {isSelected && <div style={{ color: "#2947a3", fontSize: "20px", marginLeft: "12px" }}>✓</div>}
//                     </div>
//                   </Card>
//                 );
//               })}
//             </div>
//           ) : (
//             <Card style={{ padding: "20px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
//               <p style={{ margin: 0, color: "#666" }}>{t("RENT_LEASE_NO_PROPERTIES_FOUND") || "No properties found matching your criteria."}</p>
//             </Card>
//           )}
//         </div>
//       )}

//       {/* Hidden field for selected property validation */}
//       <Controller
//         control={control}
//         name="selectedProperty"
//         rules={{ required: t("RENT_LEASE_PROPERTY_SELECTION_REQUIRED") || "Please select a property" }}
//         render={() => null}
//       />
//       {errors.selectedProperty && <CardLabelError style={errorStyle}>{getErrorMessage("selectedProperty")}</CardLabelError>}

//       {/* Start Date */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RAL_START_DATE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="startDate"
//           rules={{
//             required: t("PTR_FIELD_REQUIRED"),
//             validate: (value) => {
//               if (!value) return t("PTR_FIELD_REQUIRED");
//               const today = new Date(todayISO);
//               const chosen = new Date(value);
//               if (chosen < today) {
//                 return t("RAL_START_DATE_NOT_IN_PAST");
//               }
//               return true;
//             },
//           }}
//           render={({ value, onChange, onBlur }) => (
//             <div className="form-field">
//               <TextInput
//                 type="date"
//                 min={todayISO}
//                 value={value || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 onBlur={(e) => {
//                   onBlur(e);
//                   trigger("startDate");
//                 }}
//                 t={t}
//               />
//             </div>
//           )}
//         />
//       </LabelFieldPair>
//       {errors?.startDate && <CardLabelError style={errorStyle}>{errors?.startDate?.message}</CardLabelError>}

//       {/* End Date */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RAL_END_DATE")}
//           <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="endDate"
//           rules={{
//             validate: (value) => {
//               if (!value) return true; // optional
//               const start = watch("startDate");
//               if (!start) return t("PTR_START_DATE_REQUIRED");
//               if (new Date(value) <= new Date(start)) {
//                 return t("PTR_END_DATE_AFTER_START");
//               }
//               return true;
//             },
//           }}
//           render={({ value, onChange, onBlur }) => (
//             <div className="form-field">
//               <TextInput
//                 type="date"
//                 min={watch("startDate") || todayISO}
//                 value={value || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 onBlur={(e) => {
//                   onBlur(e);
//                   trigger("endDate");
//                 }}
//               />
//             </div>
//           )}
//         />
//       </LabelFieldPair>
//       {errors?.endDate && <CardLabelError style={errorStyle}>{errors?.endDate?.message}</CardLabelError>}
//       <ActionBar>
//         <SubmitBar label={t("Next") || "Next"} submit="submit" />
//       </ActionBar>
//       {loader && <Loader page={true} />}
//     </form>
//   );
// };

// export default RentAndLeasePropertyDetails;

// import React, { useEffect, useState, useMemo } from "react";
// import {
//   TextInput,
//   CardLabel,
//   Dropdown,
//   ActionBar,
//   SubmitBar,
//   CardLabelError,
//   LabelFieldPair,
//   CardSectionHeader,
//   Card,
//   TextArea,
// } from "@mseva/digit-ui-react-components";
// import { Controller, useForm } from "react-hook-form";
// import { useDispatch, useSelector } from "react-redux";
// import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";
// import { Loader } from "../components/Loader";

// const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, isEdit }) => {
//   const stateId = Digit.ULBService.getStateId();
//   let user = Digit.UserService.getUser();
//   const dispatch = useDispatch();
//   const [loader, setLoader] = useState(false);
//   const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);

//   const tenantId = window.location.href.includes("citizen")
//     ? window.localStorage.getItem("CITIZEN.CITY")
//     : window.localStorage.getItem("Employee.tenant-id");

//   // Static options for dropdowns
//   const propertyTypeOptions = [
//     { name: "On Rent", code: "ON_RENT", i18nKey: "ON_RENT" },
//     { name: "On Lease", code: "ON_LEASE", i18nKey: "ON_LEASE" },
//   ];

//   const propertySpecificOptions = [
//     { name: "Commercial", code: "COMMERCIAL", i18nKey: "COMMERCIAL" },
//     { name: "Residential", code: "RESIDENTIAL", i18nKey: "RESIDENTIAL" },
//     { name: "Industrial", code: "INDUSTRIAL", i18nKey: "INDUSTRIAL" },
//     { name: "Mixed Use", code: "MIXED_USE", i18nKey: "MIXED_USE" },
//   ];

//   const locationTypeOptions = [
//     { name: "Prime", code: "PRIME", i18nKey: "PRIME" },
//     { name: "Non-Prime", code: "NON_PRIME", i18nKey: "NON_PRIME" },
//   ];

//   // Mock property data - In real implementation, this would come from an API
//   const mockProperties = [
//     {
//       id: 1,
//       title: "Commercial Space - Prime Location",
//       propertyType: "ON_RENT",
//       propertySpecific: "COMMERCIAL",
//       locationType: "PRIME",
//       area: "1200 sq ft",
//       address: "123 Main Street, City Center",
//       rent: "₹50,000/month",
//     },
//     {
//       id: 2,
//       title: "Residential Apartment - Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "RESIDENTIAL",
//       locationType: "PRIME",
//       area: "1500 sq ft",
//       address: "456 Park Avenue, Downtown",
//       rent: "₹35,000/month",
//     },
//     {
//       id: 3,
//       title: "Commercial Shop - Non-Prime",
//       propertyType: "ON_RENT",
//       propertySpecific: "COMMERCIAL",
//       locationType: "NON_PRIME",
//       area: "800 sq ft",
//       address: "789 Suburban Road, Outskirts",
//       rent: "₹25,000/month",
//     },
//     {
//       id: 4,
//       title: "Industrial Warehouse - Non-Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "INDUSTRIAL",
//       locationType: "NON_PRIME",
//       area: "5000 sq ft",
//       address: "321 Industrial Area, Zone B",
//       rent: "₹1,00,000/month",
//     },
//     {
//       id: 5,
//       title: "Residential House - Prime",
//       propertyType: "ON_RENT",
//       propertySpecific: "RESIDENTIAL",
//       locationType: "PRIME",
//       area: "2000 sq ft",
//       address: "555 Elite Avenue, Premium Area",
//       rent: "₹60,000/month",
//     },
//     {
//       id: 6,
//       title: "Mixed Use Property - Prime",
//       propertyType: "ON_LEASE",
//       propertySpecific: "MIXED_USE",
//       locationType: "PRIME",
//       area: "3000 sq ft",
//       address: "999 Business Hub, Central",
//       rent: "₹80,000/month",
//     },
//   ];

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//     trigger,
//   } = useForm({
//     defaultValues: {
//       propertyType: "",
//       propertySpecific: "",
//       locationType: "",
//       selectedProperty: null,
//       startDate: "",
//       endDate: "",
//     },
//   });

//   const selectedPropertyType = watch("propertyType");
//   const selectedPropertySpecific = watch("propertySpecific");
//   const selectedLocationType = watch("locationType");
//   const selectedProperty = watch("selectedProperty");

//   // Filter properties based on selections
//   const filteredProperties = useMemo(() => {
//     if (!selectedPropertyType || !selectedPropertySpecific || !selectedLocationType) {
//       return [];
//     }

//     return mockProperties.filter((property) => {
//       return (
//         property.propertyType === selectedPropertyType?.code &&
//         property.propertySpecific === selectedPropertySpecific?.code &&
//         property.locationType === selectedLocationType?.code
//       );
//     });
//   }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType]);

//   // Reset selected property when filters change
//   useEffect(() => {
//     if (selectedPropertyType || selectedPropertySpecific || selectedLocationType) {
//       setValue("selectedProperty", null);
//     }
//   }, [selectedPropertyType, selectedPropertySpecific, selectedLocationType, setValue]);

//   const propertyNameOptions = mockProperties.map((p) => ({
//     name: p.title,
//     code: p.id, // use id as code
//     i18nKey: p.title, // or just p.title if no translation
//   }));

//   const onSubmit = async (data) => {
//     if (validateStep) {
//       const validationErrors = validateStep(data);
//       if (Object.keys(validationErrors).length > 0) return;
//     }

//     if (!data.selectedProperty) {
//       trigger("selectedProperty");
//       return;
//     }

//     const propertyDetailsPayload = {
//       // Reference to MDMS property record
//       mdmsRef: {
//         ulb: selectedProperty?.ulbCode, // ULB code from MDMS
//         propertyId: selectedProperty?.id, // Unique Property ID
//       },

//       // Snapshot of property details (readonly, auto-filled from MDMS)
//       propertySnapshot: {
//         name: selectedProperty?.name,
//         type: selectedProperty?.type, // Residential/Commercial
//         detail: selectedProperty?.detail, // Rent/Lease
//         locationType: selectedProperty?.locationType, // Prime/Non-Prime
//         area: selectedProperty?.area,
//         address: selectedProperty?.address,
//         geo: { lat: selectedProperty?.lat, lon: selectedProperty?.lon },
//         images: selectedProperty?.images || [],
//         status: selectedProperty?.status, // Vacant/Occupied
//       },

//       // Contract terms (entered in portal)
//       contractTerms: {
//         startDate: data.startDate,
//         endDate: data.endDate || null,
//         rentAmount: data.rentAmount,
//         gstApplicable: !!data.gstApplicable, // checkbox → true/false
//         cowCessApplicable: !!data.cowCessApplicable, // checkbox → true/false
//         securityAmount: data.securityAmount,
//         refundApplicable: data.refundApplicable, // radio → "YES" or "NO"
//         amountToBeRefunded: data.amountToBeRefunded,
//         incrementApplicable: data.incrementApplicable, // radio → "YES" or "NO"
//         incrementPercentage: data.incrementPercentage || null,
//         incrementCycle: data.incrementCycle || null,
//         latePaymentPercent: data.latePaymentPercent || null,
//         termsAndConditions: data.termsAndConditions,

//         // Multi-checkbox → transform into array
//         notificationPrefs: Object.keys(data.notificationPrefs || {}).filter((k) => data.notificationPrefs[k]), // ['SMS','EMAIL','PUSH']

//         penaltyType: Object.keys(data.penaltyType || {}).filter((k) => data.penaltyType[k]), // ['DAILY','MONTHLY','ONETIME']

//         witnesses: Array.isArray(data.witnesses) ? data.witnesses : (data.witnesses || "").split(",").map((w) => w.trim()),
//       },
//     };

//     // Dispatch to Redux
//     dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetailsPayload));

//     if (currentStepData?.CreatedResponse?.applicationNumber || currentStepData?.applicationData?.applicationNumber) {
//       goNext(propertyDetailsPayload);
//       return;
//     }

//     // For new applications, just proceed to next step
//     setLoader(false);
//     dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetailsPayload));
//     goNext(propertyDetailsPayload);
//   };

//   useEffect(() => {
//     if (apiDataCheck?.[0]?.propertyDetails) {
//       const propertyDetails = apiDataCheck[0]?.propertyDetails;
//       if (propertyDetails.propertyName) setValue("startDate", propertyDetails.propertyName);
//       if (propertyDetails.propertyId) setValue("endDate", propertyDetails.propertyId);
//       if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
//       if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
//       if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
//       if (propertyDetails.selectedProperty) {
//         setValue("selectedProperty", propertyDetails.selectedProperty, {
//           shouldValidate: true, // 👈 force RHF to re‑run validation
//           shouldDirty: false,
//         });
//       }
//       if (propertyDetails.startDate) setValue("startDate", propertyDetails.startDate);
//       if (propertyDetails.endDate) setValue("endDate", propertyDetails.endDate);
//     }
//   }, [apiDataCheck, setValue]);

//   useEffect(() => {
//     if (currentStepData?.propertyDetails) {
//       const propertyDetails = currentStepData?.propertyDetails;
//       if (propertyDetails.propertyName) setValue("startDate", propertyDetails.propertyName);
//       if (propertyDetails.propertyId) setValue("endDate", propertyDetails.propertyId);
//       if (propertyDetails.propertyType) setValue("propertyType", propertyDetails.propertyType);
//       if (propertyDetails.propertySpecific) setValue("propertySpecific", propertyDetails.propertySpecific);
//       if (propertyDetails.locationType) setValue("locationType", propertyDetails.locationType);
//       if (propertyDetails.selectedProperty) {
//         setValue("selectedProperty", propertyDetails.selectedProperty, {
//           shouldValidate: true, // 👈 force RHF to re‑run validation
//           shouldDirty: false,
//         });
//       }
//       if (propertyDetails.startDate) setValue("startDate", propertyDetails.startDate);
//       if (propertyDetails.endDate) setValue("endDate", propertyDetails.endDate);
//     }
//   }, [currentStepData, setValue]);

//   console.log("errors", errors);

//   const getErrorMessage = (fieldName) => {
//     if (!errors[fieldName]) return null;
//     return errors[fieldName]?.message || t("PTR_FIELD_REQUIRED");
//   };

//   const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px", color: "red" };
//   const mandatoryStyle = { color: "red" };
//   const propertyCardStyle = {
//     border: "1px solid #e0e0e0",
//     borderRadius: "8px",
//     padding: "16px",
//     marginBottom: "12px",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     backgroundColor: "#ffffff",
//   };

//   const selectedCardStyle = {
//     ...propertyCardStyle,
//     border: "2px solid #2947a3",
//     backgroundColor: "#f0f4ff",
//   };

//   const handlePropertySelect = (property) => {
//     setValue("selectedProperty", property);
//     trigger("selectedProperty");
//   };

//   const todayISO = new Date().toISOString().split("T")[0];
//   console.log("currentStepData", currentStepData);

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <CardSectionHeader className="card-section-header">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSectionHeader>

//       {/* Property Name Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_NAME") || "Property Name"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyName"
//           rules={{ required: t("RENT_LEASE_PROPERTY_NAME_REQUIRED") || "Property Name is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyNameOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyName && <CardLabelError style={errorStyle}>{getErrorMessage("propertyName")}</CardLabelError>}

//       {/* Property ID Search */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_ID") || "Property ID"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyId"
//           rules={{ required: t("RENT_LEASE_PROPERTY_ID_REQUIRED") || "Property ID is required" }}
//           render={({ value, onChange, onBlur }) => (
//             <TextInput
//               type="text"
//               value={value || ""}
//               onChange={(e) => onChange(e.target.value)}
//               onBlur={onBlur}
//               t={t}
//               style={{ width: "100%", maxWidth: "330px" }}
//             />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyId && <CardLabelError style={errorStyle}>{getErrorMessage("propertyId")}</CardLabelError>}

//       {/* Property Type Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_TYPE") || "Property Type"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertyType"
//           rules={{ required: t("RENT_LEASE_PROPERTY_TYPE_REQUIRED") || "Property Type is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertyTypeOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertyType && <CardLabelError style={errorStyle}>{getErrorMessage("propertyType")}</CardLabelError>}

//       {/* Property Specific Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_PROPERTY_SPECIFIC") || "Property Specific"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="propertySpecific"
//           rules={{ required: t("RENT_LEASE_PROPERTY_SPECIFIC_REQUIRED") || "Property Specific is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={propertySpecificOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.propertySpecific && <CardLabelError style={errorStyle}>{getErrorMessage("propertySpecific")}</CardLabelError>}

//       {/* Location Type Dropdown */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RENT_LEASE_LOCATION_TYPE") || "Location Type"} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="locationType"
//           rules={{ required: t("RENT_LEASE_LOCATION_TYPE_REQUIRED") || "Location Type is required" }}
//           render={(props) => (
//             <Dropdown className="form-field" select={props.onChange} selected={props.value} option={locationTypeOptions} optionKey="name" t={t} />
//           )}
//         />
//       </LabelFieldPair>
//       {errors.locationType && <CardLabelError style={errorStyle}>{getErrorMessage("locationType")}</CardLabelError>}

//       {/* Property Cards Display */}
//       {selectedPropertyType && selectedPropertySpecific && selectedLocationType && (
//         <div style={{ marginTop: "24px", marginBottom: "24px" }}>
//           <CardLabel className="card-label-smaller" style={{ marginBottom: "12px" }}>
//             {t("RENT_LEASE_SELECT_PROPERTY") || "Select a Property"} <span style={mandatoryStyle}>*</span>
//           </CardLabel>
//           {filteredProperties?.length > 0 || currentStepData?.propertyDetails?.selectedProperty ? (
//             <div>
//               {filteredProperties.map((property) => {
//                 const isSelected = selectedProperty?.id === property.id || currentStepData?.propertyDetails?.selectedProperty;
//                 return (
//                   <Card key={property.id} style={isSelected ? selectedCardStyle : propertyCardStyle} onClick={() => handlePropertySelect(property)}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//                       <div style={{ flex: 1 }}>
//                         <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: "#1C1D1F" }}>{property.title}</h3>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Area:</strong> {property.area}
//                         </p>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Address:</strong> {property.address}
//                         </p>
//                         <p style={{ margin: "4px 0", fontSize: "14px", color: "#666" }}>
//                           <strong>Rent:</strong> {property.rent}
//                         </p>
//                       </div>
//                       {isSelected && <div style={{ color: "#2947a3", fontSize: "20px", marginLeft: "12px" }}>✓</div>}
//                     </div>
//                   </Card>
//                 );
//               })}
//             </div>
//           ) : (
//             <Card style={{ padding: "20px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
//               <p style={{ margin: 0, color: "#666" }}>{t("RENT_LEASE_NO_PROPERTIES_FOUND") || "No properties found matching your criteria."}</p>
//             </Card>
//           )}
//         </div>
//       )}

//       {/* Hidden field for selected property validation */}
//       <Controller
//         control={control}
//         name="selectedProperty"
//         rules={{ required: t("RENT_LEASE_PROPERTY_SELECTION_REQUIRED") || "Please select a property" }}
//         render={() => null}
//       />
//       {errors.selectedProperty && <CardLabelError style={errorStyle}>{getErrorMessage("selectedProperty")}</CardLabelError>}

//       {/* Start Date */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RAL_START_DATE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="startDate"
//           rules={{
//             required: t("PTR_FIELD_REQUIRED"),
//             validate: (value) => {
//               if (!value) return t("PTR_FIELD_REQUIRED");
//               const today = new Date(todayISO);
//               const chosen = new Date(value);
//               if (chosen < today) {
//                 return t("PTR_START_DATE_NOT_IN_PAST");
//               }
//               return true;
//             },
//           }}
//           render={({ value, onChange, onBlur }) => (
//             <div className="form-field">
//               <TextInput
//                 type="date"
//                 min={todayISO}
//                 value={value || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 onBlur={(e) => {
//                   onBlur(e);
//                   trigger("startDate");
//                 }}
//                 t={t}
//               />
//             </div>
//           )}
//         />
//       </LabelFieldPair>
//       {errors?.startDate && <CardLabelError style={errorStyle}>{errors?.startDate?.message}</CardLabelError>}

//       {/* End Date */}
//       <LabelFieldPair>
//         <CardLabel className="card-label-smaller">
//           {t("RAL_END_DATE")}
//           <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="endDate"
//           rules={{
//             validate: (value) => {
//               if (!value) return true; // optional
//               const start = watch("startDate");
//               if (!start) return t("PTR_START_DATE_REQUIRED");
//               if (new Date(value) <= new Date(start)) {
//                 return t("PTR_END_DATE_AFTER_START");
//               }
//               return true;
//             },
//           }}
//           render={({ value, onChange, onBlur }) => (
//             <div className="form-field">
//               <TextInput
//                 type="date"
//                 min={watch("startDate") || todayISO}
//                 value={value || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 onBlur={(e) => {
//                   onBlur(e);
//                   trigger("endDate");
//                 }}
//               />
//             </div>
//           )}
//         />
//       </LabelFieldPair>
//       {errors?.endDate && <CardLabelError style={errorStyle}>{errors?.endDate?.message}</CardLabelError>}

//       {/* Rent Amount */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("RENT_AMOUNT")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="rentAmount"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
//         />
//       </LabelFieldPair>
//       {errors.rentAmount && <CardLabelError style={errorStyle}>{getErrorMessage("rentAmount")}</CardLabelError>}

//       {/* GST Applicable */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("GST_APPLICABLE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="gstApplicable"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextInput type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />}
//         />
//       </LabelFieldPair>

//       {/* Cow Cess Applicable */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("COW_CESS_APPLICABLE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="cowCessApplicable"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextInput type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />}
//         />
//       </LabelFieldPair>
//       {errors.cowCessApplicable && <CardLabelError style={errorStyle}>{getErrorMessage("cowCessApplicable")}</CardLabelError>}

//       {/* Security Amount */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("SECURITY_AMOUNT")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="securityAmount"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
//         />
//       </LabelFieldPair>
//       {errors.securityAmount && <CardLabelError style={errorStyle}>{getErrorMessage("securityAmount")}</CardLabelError>}

//       {/* Refund Applicable */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("REFUND_APPLICABLE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <div style={{ display: "flex", gap: "16px" }}>
//           <Controller
//             control={control}
//             name="refundApplicable"
//             rules={{ required: t("PTR_FIELD_REQUIRED") }}
//             render={({ value, onChange }) => (
//               <div>
//                 <TextInput type="radio" name="refundApplicable" checked={value === "YES"} onChange={() => onChange("YES")} /> {t("YES")}
//                 <TextInput type="radio" name="refundApplicable" checked={value === "NO"} onChange={() => onChange("NO")} /> {t("NO")}
//               </div>
//             )}
//           />
//         </div>
//       </LabelFieldPair>

//       {/* Amount to be Refunded */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("AMOUNT_TO_BE_REFUNDED")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           name="amountToBeRefunded"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
//         />
//       </LabelFieldPair>

//       {/* Increment Applicable */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("INCREMENT_APPLICABLE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <div style={{ display: "flex", gap: "16px" }}>
//           <Controller
//             control={control}
//             name="incrementApplicable"
//             rules={{ required: t("PTR_FIELD_REQUIRED") }}
//             render={({ value, onChange }) => (
//               <div>
//                 <TextInput type="radio" name="incrementApplicable" checked={value === "YES"} onChange={() => onChange("YES")} /> {t("YES")}
//                 <TextInput type="radio" name="incrementApplicable" checked={value === "NO"} onChange={() => onChange("NO")} /> {t("NO")}
//               </div>
//             )}
//           />
//         </div>
//       </LabelFieldPair>
//       {errors.incrementApplicable && <CardLabelError style={errorStyle}>{getErrorMessage("incrementApplicable")}</CardLabelError>}

//       {/* Increment Percentage */}
//       <LabelFieldPair>
//         <CardLabel>{t("INCREMENT_PERCENTAGE")}</CardLabel>
//         <Controller
//           control={control}
//           name="incrementPercentage"
//           rules={{
//             validate: (val) => {
//               if (watch("incrementApplicable")?.code === "YES" && !val) {
//                 return t("PTR_FIELD_REQUIRED");
//               }
//               return true;
//             },
//           }}
//           render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
//         />
//       </LabelFieldPair>

//       {/* Increment Cycle */}
//       <LabelFieldPair>
//         <CardLabel>{t("INCREMENT_CYCLE")}</CardLabel>
//         <Controller
//           control={control}
//           name="incrementCycle"
//           render={({ value, onChange }) => (
//             <Dropdown
//             className="form-field"
//               option={[
//                 { code: "YEARLY", name: t("YEARLY") },
//                 { code: "HALF_YEARLY", name: t("HALF_YEARLY") },
//               ]}
//               selected={value}
//               select={onChange}
//             />
//           )}
//         />

//       </LabelFieldPair>

//       {/* Late Payment % */}
//       <LabelFieldPair>
//         <CardLabel>{t("LATE_PAYMENT_PERCENT")}</CardLabel>
//         <Controller
//           control={control}
//           name="latePaymentPercent"
//           render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
//         />
//       </LabelFieldPair>

//       {/* Terms & Conditions */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("TERMS_AND_CONDITIONS")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <Controller
//           control={control}
//           radio
//           name="termsAndConditions"
//           rules={{ required: t("PTR_FIELD_REQUIRED") }}
//           render={({ value, onChange }) => <TextArea value={value || ""} onChange={onChange} />}
//         />
//       </LabelFieldPair>

//       {/* Notification Preferences */}
//       {/* <LabelFieldPair>
//         <CardLabel>
//           {t("NOTIFICATION_PREFERENCES")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <div style={{ display: "flex", gap: "16px" }}>
//           {["SMS", "EMAIL", "PUSH"].map((opt) => (
//             <Controller
//               key={opt}
//               control={control}
//               name={`notificationPrefs.${opt}`}
//               render={({ value, onChange }) => (
//                 <div>
//                   <TextInput type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {opt}
//                 </div>
//               )}
//             />
//           ))}
//         </div>
//       </LabelFieldPair> */}

//       {/* Penalty Type */}
//       <LabelFieldPair>
//         <CardLabel>
//           {t("PENALTY_TYPE")} <span style={mandatoryStyle}>*</span>
//         </CardLabel>
//         <div style={{ display: "flex", gap: "16px" }}>
//           {["DAILY", "MONTHLY", "ONETIME"].map((opt) => (
//             <Controller
//               key={opt}
//               control={control}
//               name={`penaltyType.${opt}`}
//               render={({ value, onChange }) => (
//                 <div>
//                   <TextInput type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {t(opt)}
//                 </div>
//               )}
//             />
//           ))}
//         </div>
//       </LabelFieldPair>
//       {errors.penaltyType && <CardLabelError style={errorStyle}>{getErrorMessage("penaltyType")}</CardLabelError>}

//       <ActionBar>
//         <SubmitBar label={t("Next") || "Next"} submit="submit" />
//       </ActionBar>
//       {loader && <Loader page={true} />}
//     </form>
//   );
// };

// export default RentAndLeasePropertyDetails;

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
  Card,
  TextArea,
} from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import {
  useDispatch,
  //  useSelector
} from "react-redux";
import { UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM } from "../redux/action/RentAndLeaseNewApplicationActions";

const RentAndLeasePropertyDetails = ({ onGoBack, goNext, currentStepData, t, validateStep, triggerLoader }) => {
  const dispatch = useDispatch();
  // const apiDataCheck = useSelector((state) => state.rentAndLease?.RentAndLeaseNewApplicationFormReducer?.formData?.responseData);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const { data: mdmsPropertyData } = Digit.Hooks.rentandlease.useRALPropertyMDMS(tenantId);
  console.log("mdmsPropertyData", mdmsPropertyData);

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

  const penaltyTypeOptions = [
    { code: "DAILY", name: t("DAILY"), i18nKey: "DAILY" },
    { code: "MONTHLY", name: t("MONTHLY"), i18nKey: "MONTHLY" },
    { code: "ONETIME", name: t("ONETIME"), i18nKey: "ONETIME" },
  ];
  const incrementCycleOptions = [
    { code: "YEARLY", name: t("YEARLY"), i18nKey: "YEARLY" },
    { code: "HALF_YEARLY", name: t("HALF_YEARLY"), i18nKey: "HALF_YEARLY" },
  ];

  // 🔹 Mock property data
  const mockProperties = [
    {
      i18nKey: "Commercial Space - Prime Location",
      code: 1,
      id: 1,
      name: "Commercial Space - Prime Location",
      title: "Commercial Space - Prime Location",
      propertyId: "RL001",
      propertyType: "ON_RENT",
      propertySpecific: "COMMERCIAL",
      usageCategory: "rent",
      locationType: "PRIME",
      area: "1200 sq ft",
      propertySizeOrArea: "1200",
      address: "123 Main Street, City Center",
      geoLocation: { latitude: "28.6139", longitude: "77.2090" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "50,000",
      baseRent: "50000",
      securityDeposit: "10000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: true,
      penaltyType: "DAILY",
      latePayment: "2%",
    },
    {
      i18nKey: "Residential Apartment - Prime",
      code: 2,
      id: 2,
      name: "Residential Apartment - Prime",
      title: "Residential Apartment - Prime",
      propertyId: "RL002",
      propertyType: "ON_LEASE",
      propertySpecific: "RESIDENTIAL",
      usageCategory: "rent",
      locationType: "PRIME",
      area: "1500 sq ft",
      propertySizeOrArea: "1500",
      address: "456 Park Avenue, Downtown",
      geoLocation: { latitude: "28.7041", longitude: "77.1025" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "35,000",
      baseRent: "35000",
      securityDeposit: "8000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: false,
      penaltyType: "MONTHLY",
      latePayment: "5%",
    },
    {
      i18nKey: "Commercial Shop - Non-Prime",
      code: 3,
      id: 3,
      name: "Commercial Shop - Non-Prime",
      title: "Commercial Shop - Non-Prime",
      propertyId: "RL003",
      propertyType: "ON_RENT",
      propertySpecific: "COMMERCIAL",
      usageCategory: "rent",
      locationType: "NON_PRIME",
      area: "800 sq ft",
      propertySizeOrArea: "800",
      address: "789 Suburban Road, Outskirts",
      geoLocation: { latitude: "27.1767", longitude: "78.0081" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "25,000",
      baseRent: "25000",
      securityDeposit: "5000",
      tax_applicable: false,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "1%",
    },
    {
      i18nKey: "Industrial Warehouse - Non-Prime",
      code: 4,
      id: 4,
      name: "Industrial Warehouse - Non-Prime",
      title: "Industrial Warehouse - Non-Prime",
      propertyId: "RL004",
      propertyType: "ON_LEASE",
      propertySpecific: "INDUSTRIAL",
      usageCategory: "rent",
      locationType: "NON_PRIME",
      area: "5000 sq ft",
      propertySizeOrArea: "5000",
      address: "321 Industrial Area, Zone B",
      geoLocation: { latitude: "19.0760", longitude: "72.8777" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "1,00,000",
      baseRent: "100000",
      securityDeposit: "20000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: false,
      penaltyType: "MONTHLY",
      latePayment: "10%",
    },
    {
      i18nKey: "Residential House - Prime",
      code: 5,
      id: 5,
      name: "Residential House - Prime",
      title: "Residential House - Prime",
      propertyId: "RL005",
      propertyType: "ON_RENT",
      propertySpecific: "RESIDENTIAL",
      usageCategory: "rent",
      locationType: "PRIME",
      area: "2000 sq ft",
      propertySizeOrArea: "2000",
      address: "555 Elite Avenue, Premium Area",
      geoLocation: { latitude: "12.9716", longitude: "77.5946" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "60,000",
      baseRent: "60000",
      securityDeposit: "15000",
      tax_applicable: true,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "3%",
    },
    {
      i18nKey: "Mixed Use Property - Prime",
      code: 6,
      id: 6,
      name: "Mixed Use Property - Prime",
      title: "Mixed Use Property - Prime",
      propertyId: "RL006",
      propertyType: "ON_LEASE",
      propertySpecific: "MIXED_USE",
      usageCategory: "rent",
      locationType: "PRIME",
      area: "3000 sq ft",
      propertySizeOrArea: "3000",
      address: "999 Business Hub, Central",
      geoLocation: { latitude: "22.5726", longitude: "88.3639" },
      propertyImage: "https://via.placeholder.com/150",
      rent: "80,000",
      baseRent: "80000",
      securityDeposit: "25000",
      tax_applicable: false,
      refund_applicable_on_discontinuation: true,
      penaltyType: "ONETIME",
      latePayment: "4%",
    },
  ];

  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  console.log("filteredProperties", filteredProperties);

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
      propertyName: "",
      propertyId: "",
      propertyType: "",
      propertySpecific: "",
      locationType: "",
      selectedProperty: null,
      startDate: "",
      endDate: "",
      rentAmount: "",
      gstApplicable: false,
      cowCessApplicable: false,
      securityAmount: "",
      amountToBeRefunded: "",
      refundApplicable: "",
      incrementApplicable: "",
      incrementPercentage: "",
      incrementCycle: "",
      latePaymentPercent: "",
      termsAndConditions: "",
      // notificationPrefs: {},
      penaltyType: "",
    },
  });

  console.log("errors", errors);

  const selectedPropertyType = watch("propertyType");
  const selectedPropertySpecific = watch("propertySpecific");
  const selectedLocationType = watch("locationType");
  const selectedProperty = watch("selectedProperty");

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
      console.log("filtered123", filtered);
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

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-18px", color: "red" };
  const mandatoryStyle = { color: "red" };
  const propertyCardStyle = {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#ffffff",
  };
  const selectedCardStyle = { ...propertyCardStyle, border: "2px solid #2947a3", backgroundColor: "#f0f4ff" };

  const handlePropertySelect = (property) => {
    setValue("selectedProperty", property);
    trigger("selectedProperty");
  };

  const onSubmit = async (data) => {
    if (validateStep) {
      const validationErrors = validateStep(data);
      if (Object.keys(validationErrors).length > 0) return;
    }

    if (!data.selectedProperty) {
      trigger("selectedProperty");
      return;
    }
    triggerLoader(true);
    // Build one consistent object
    const propertyDetails = {
      propertyName: data.propertyName,
      propertyId: data.propertyId,
      propertyType: data.propertyType,
      propertySpecific: data.propertySpecific,
      locationType: data.locationType,
      selectedProperty: data.selectedProperty, // keep full object
      startDate: data.startDate,
      endDate: data.endDate || null,
      rentAmount: data.rentAmount,
      gstApplicable: !!data.gstApplicable,
      cowCessApplicable: !!data.cowCessApplicable,
      securityAmount: data.securityAmount,
      refundApplicable: data.refundApplicable,
      amountToBeRefunded: data.amountToBeRefunded,
      incrementApplicable: data.incrementApplicable,
      incrementPercentage: data.incrementPercentage || null,
      incrementCycle: data.incrementCycle || null,
      latePaymentPercent: data.latePaymentPercent || null,
      termsAndConditions: data.termsAndConditions,
      penaltyType: data.penaltyType || null,
    };
    // Dispatch to Redux under one key
    dispatch(UPDATE_RENTANDLEASE_NEW_APPLICATION_FORM("propertyDetails", propertyDetails));
    triggerLoader(false);
    goNext(propertyDetails);
  };

  useEffect(() => {
    if (currentStepData?.propertyDetails) {
      const propertyDetails = currentStepData.propertyDetails;

      Object.keys(propertyDetails).forEach((key) => {
        setValue(key, propertyDetails[key], { shouldValidate: true });
      });
    }
  }, [currentStepData, setValue]);

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
                console.log("selected", selected);
                // ✅ set propertyName field
                onChange(selected.name);
                // ✅ also set propertyId field
                setValue("propertyId", selected?.id, { shouldValidate: true });
                setValue("rentAmount", selected?.rent, { shouldValidate: true });
                setValue("penaltyType", selected?.penaltyType, { shouldValidate: true });
              }}
              selected={filteredProperties.find((p) => p.name === value)}
              option={filteredProperties}
              optionKey="name"
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

      {/* Property Cards */}
      {selectedPropertyType && selectedPropertySpecific && selectedLocationType && (
        <div style={{ marginTop: "24px", marginBottom: "24px" }}>
          <CardLabel className="card-label-smaller" style={{ marginBottom: "12px" }}>
            {t("RENT_LEASE_SELECT_PROPERTY")} <span style={mandatoryStyle}>*</span>
          </CardLabel>
          {filteredProperties?.length > 0 ? (
            <div>
              {filteredProperties.map((property) => {
                const isSelected = selectedProperty?.id === property.id;
                return (
                  <Card key={property.id} style={isSelected ? selectedCardStyle : propertyCardStyle} onClick={() => handlePropertySelect(property)}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <h3 style={{ margin: "0 0 8px 0" }}>{property.title}</h3>
                        <p>
                          <strong>Area:</strong> {property.area}
                        </p>
                        <p>
                          <strong>Address:</strong> {property.address}
                        </p>
                        <p>
                          <strong>Rent:</strong> {property.rent}
                        </p>
                      </div>
                      {isSelected && <div style={{ color: "#2947a3", fontSize: "20px" }}>✓</div>}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ padding: "20px", textAlign: "center", backgroundColor: "#f9f9f9" }}>
              <p>{t("RENT_LEASE_NO_PROPERTIES_FOUND")}</p>
            </Card>
          )}
        </div>
      )}

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

      {/* Rent Amount */}
      <LabelFieldPair>
        <CardLabel>
          {t("RENT_AMOUNT")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="rentAmount"
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
            name="securityAmount"
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
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
      {/* Refund Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("REFUND_APPLICABLE")} <span style={mandatoryStyle}>*</span>
        </CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            rules={{ required: t("PTR_FIELD_REQUIRED") }}
            name="refundApplicable"
            render={({ value, onChange }) => (
              <div style={wrapper}>
                <input type="radio" checked={value === "YES"} onChange={() => onChange("YES")} style={radioStyles} /> {t("YES")}
                <input type="radio" checked={value === "NO"} onChange={() => onChange("NO")} style={radioStyles} /> {t("NO")}
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
            render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
          />
        </div>
      </LabelFieldPair>

      {/* GST Applicable */}
      <LabelFieldPair>
        <CardLabel>
          {t("GST_APPLICABLE")}
          {/* <span style={mandatoryStyle}>*</span> */}
        </CardLabel>
        <div className="form-field">
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
        <div className="form-field">
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
                <input type="radio" checked={value === "YES"} onChange={() => onChange("YES")} style={radioStyles} /> {t("YES")}
                <input type="radio" checked={value === "NO"} onChange={() => onChange("NO")} style={radioStyles} /> {t("NO")}
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

      {/* Late Payment % */}
      <LabelFieldPair>
        <CardLabel>{t("LATE_PAYMENT_PERCENT")}</CardLabel>
        <div className="form-field">
          <Controller
            control={control}
            name="latePaymentPercent"
            render={({ value, onChange }) => <TextInput type="number" value={value || ""} onChange={(e) => onChange(e.target.value)} />}
          />
        </div>
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
