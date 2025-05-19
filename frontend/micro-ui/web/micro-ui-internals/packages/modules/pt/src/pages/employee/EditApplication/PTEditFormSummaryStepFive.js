import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../redux/actions/PTNewApplicationActions";
import { useLocation } from "react-router-dom";
import { useHistory } from "react-router-dom";

const PTEditFormSummaryStepFive = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  const goNext = async (data) => {
    console.log("Full form data submitted: ", formData);
    // onSubmit(formData); // Call the onSubmit function with the form data
    const res = await onSubmit(formData); // wait for the API response
    console.log("API response: ", res);

    // Check if the API call was successful
    if (res) {
      console.log("Submission successful, moving to next step.");
      onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.", res);
    }

    onGoNext();
  };

  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  // Function to handle form value changes
  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data summary in step 5: ", data);
  //   dispatch(UPDATE_PtNewApplication(config.key, data));
  // };

  // const onSubmit = async (data) => {
  //   console.log("FormData received:", data);

  //   // Map the `units` array to include additional details
  //   const updatedUnits = data?.PropertyDetails?.units?.map((unit) => {
  //     const additionalDetails = {
  //       structureType: unit?.constructionDetail?.structureType || null,
  //       ageOfProperty: unit?.constructionDetail?.ageOfProperty || null,
  //     };
  //     return { ...unit, additionalDetails };
  //   });

  //   const owners = Array.isArray(data?.ownerShipDetails?.owners) ? data?.ownerShipDetails?.owners : [];
  //   // Construct the payload
  //   const formData = {
  //     ...data?.originalData,
  //     tenantId: data?.LocationDetails?.address?.city?.code,
  //     address: {
  //       ...data?.originalData?.address,
  //       ...data?.LocationDetails?.address,
  //       city: data?.LocationDetails?.address?.city?.name,
  //       locality: {
  //         code: data?.LocationDetails?.address?.locality?.code,
  //         area: data?.LocationDetails?.address?.locality?.area,
  //       },
  //     },
  //     usageCategory: data?.PropertyDetails?.usageCategoryMajor?.code,
  //     usageCategoryMajor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[0],
  //     usageCategoryMinor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[1] || null,
  //     landArea: Number(data?.PropertyDetails?.landarea || 0),
  //     superBuiltUpArea: Number(data?.PropertyDetails?.landarea || 0),
  //     propertyType: data?.PropertyDetails?.PropertyType?.code,
  //     noOfFloors: Number(data?.PropertyDetails?.noOfFloors || 0),
  //     ownershipCategory: data?.ownerShipDetails?.ownershipCategory?.code,
  //     additionalDetails: {
  //       ...data?.originalData?.additionalDetails,
  //       ageOfProperty: data?.PropertyDetails?.propertyStructureDetails?.ageOfProperty,
  //       structureType: data?.PropertyDetails?.propertyStructureDetails?.structureType,
  //       electricity: data?.LocationDetails?.electricity,
  //       uid: data?.LocationDetails?.uid,
  //       heightAbove36Feet: data?.PropertyDetails?.propertyCheckboxQuestions?.isPropertyHeightMoreThan36Feet,
  //       inflammable: data?.PropertyDetails?.propertyCheckboxQuestions?.hasInflammableMaterial,
  //       vasikaNo: data?.PropertyDetails?.vasikaDetails?.vasikaNo,
  //       vasikaDate: data?.PropertyDetails?.vasikaDetails?.vasikaDate,
  //       allotmentNo: data?.PropertyDetails?.allottmentDetails?.allotmentNo,
  //       allotmentDate: data?.PropertyDetails?.allottmentDetails?.allotmentDate,
  //       businessName: data?.PropertyDetails?.businessName,
  //       yearConstruction: data?.LocationDetails?.yearOfCreation?.code,
  //       remarks: data?.PropertyDetails?.remarks,
  //     },
  //     surveyId: data?.LocationDetails?.surveyId,
  //     existingPropertyId: data?.LocationDetails?.existingPropertyId,
  //     owners: owners?.map((owner, index) => {
  //       const {
  //         name,
  //         mobileNumber,
  //         designation,
  //         altContactNumber,
  //         emailId,
  //         correspondenceAddress,
  //         isCorrespondenceAddress,
  //         ownerType,
  //         fatherOrHusbandName,
  //       } = owner;

  //       let __owner;
  //       if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
  //         __owner = {
  //           name,
  //           mobileNumber,
  //           designation,
  //           altContactNumber,
  //           emailId,
  //           correspondenceAddress,
  //           isCorrespondenceAddress,
  //           ownerType,
  //         };
  //       } else {
  //         __owner = {
  //           name,
  //           mobileNumber,
  //           correspondenceAddress,
  //           permanentAddress: data?.LocationDetails?.address?.locality?.name,
  //           relationship: owner?.relationship?.code,
  //           fatherOrHusbandName,
  //           gender: owner?.gender?.code,
  //           emailId,
  //           additionalDetails: { ownerSequence: index, ownerName: owner?.name },
  //         };
  //       }

  //       if (!__owner?.correspondenceAddress) __owner.correspondenceAddress = "";

  //       const _owner = {
  //         ...__owner,
  //         //ownerType: owner?.ownerType?.code,
  //         ownerType: owner?.ownerType
  //       };
  //       return _owner;
  //     }),
  //     channel: "CFC_COUNTER", // required
  //     creationReason: "UPDATE", // required
  //     source: "MUNICIPAL_RECORDS", // required
  //     units: data?.PropertyDetails?.PropertyType?.code !== "VACANT" ? updatedUnits : [],
  //     // documents: data?.DocummentDetails?.documents?.documents,
  //     documents: data?.DocummentDetails?.documents?.documents,
  //   };
  //   console.log("Documents: ", data.DocummentDetails.documents.documents);

  //   // Add institution details if ownership is not individual
  //   if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
  //     formData.institution = {
  //       name: data?.ownerShipDetails?.owners?.[0]?.institution?.name,
  //       type: data?.ownerShipDetails?.owners?.[0]?.institution?.type?.code,
  //       designation: data?.ownerShipDetails?.owners?.[0]?.designation,
  //       nameOfAuthorizedPerson: data?.ownerShipDetails?.owners?.[0]?.name,
  //       tenantId: data?.LocationDetails?.address?.city?.code,
  //     };
  //   }

  //   // Prepare search data for duplicate property validation
  //   const searchData = {
  //     mobileNumber: formData.owners?.[0]?.mobileNumber,
  //     name: formData.owners?.[0]?.name,
  //     doorNo: formData.address?.doorNo,
  //     locality: formData.address?.locality?.code,
  //     isRequestForDuplicatePropertyValidation: true,
  //   };

  //   console.log("Final Payload:", formData);
  //   console.log("Search Data:", searchData);

  //   // Set the form data and search data
  //   // setFormData(formData);
  //   // setSearchData({ city: formData.tenantId, filters: searchData });
  //   const tenantId = formData.tenantId;
  //   try {
  //     const response = await Digit.PTService.update({ Property: { ...formData } }, tenantId);

  //     if (response?.ResponseInfo?.status === "successful") {
  //       history.replace("/digit-ui/employee/pt/response", {
  //         Property: formData
  //       });
  //     } else {
  //       setShowToast({ error: true, label: response?.Errors?.[0]?.message });
  //     }
  //   } catch (error) {
  //     console.error("Error creating property:", error);
  //     if (error?.response?.data?.Errors) {
  //       const errorMessage = error.response.data.Errors.map(err => err.message).join(", ");
  //       setShowToast({ error: true, label: errorMessage });
  //     } else {
  //       setShowToast({ error: true, label: "An unexpected error occurred. Please try again later." });
  //     }

  //   }

  // };
  // const { state } = useLocation();
  const history = useHistory();
  const onSubmit = (receivedData) => {
    //debugger;
    console.log("dataaaa", receivedData)
    const applicationData = receivedData?.originalData;
    const data = {
      ...receivedData.LocationDetails, ...receivedData.LocationDetails1, ...receivedData.PropertyDetails, ...receivedData.ownerShipDetails, ...receivedData.DocummentDetails
    }

    const formData = {
      ...applicationData,
      address: {
        ...applicationData?.address,
        ...data?.address,
        city: data?.address?.city?.name,
      },
      propertyType: data?.PropertyType?.code,
      //creationReason: applicationData?.workflow?.businessService === "PT.UPDATE" || (applicationData?.documents == null) ? "UPDATE" : applicationData?.creationReason,
      creationReason: "UPDATE",
      usageCategory: data?.usageCategoryMinor?.subuagecode ? data?.usageCategoryMinor?.subuagecode : data?.usageCategoryMajor?.code,
      usageCategoryMajor: data?.usageCategoryMajor?.code.split(".")[0],
      usageCategoryMinor: data?.usageCategoryMajor?.code.split(".")[1] || null,
      noOfFloors: Number(data?.noOfFloors),
      landArea: Number(data?.landarea),
      superBuiltUpArea: Number(data?.landarea),
      additionalDetails: {
        ...data?.additionalDetails, electricity: data?.electricity, uid: data?.uid, ageOfProperty: data?.propertyStructureDetails?.ageOfProperty,
        structureType: data?.propertyStructureDetails?.structureType
      },
      //electricity:data?.electricity,
      source: "MUNICIPAL_RECORDS", // required
      channel: "CFC_COUNTER", // required
      documents: applicationData?.documents ? applicationData?.documents.map((old) => {
        let dt = old.documentType.split(".");
        let newDoc = data?.documents?.documents?.find((e) => e.documentType.includes(dt[0] + "." + dt[1]));
        return { ...old, ...newDoc };
      }) : data?.documents?.documents.length > 0 ? data?.documents?.documents : null,
      units: [
        ...(applicationData?.units?.map((old) => ({ ...old, active: false })) || []),
        ...(data?.units?.map((unit) => {
          return { ...unit, active: true };
        }) || []),
      ],
      // workflow: applicationData?.workflow,
      workflow: {
        action: "OPEN",
        businessService: "PT.CREATE",
        moduleName: "PT"
      },
      applicationStatus: "UPDATE",
    };
    if (applicationData?.workflow?.action === "OPEN") {
      formData.units = formData.units.filter((unit) => unit.active);
    }
    history.push("/digit-ui/employee/pt/response", { Property: formData, key: "UPDATE", action: "SUBMIT" });
  };

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData}
        config={config.currStepConfig}
        onSubmit={goNext}
        // onFormValueChange={onFormValueChange} 
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
    </React.Fragment>
  );
};

export default PTEditFormSummaryStepFive;
