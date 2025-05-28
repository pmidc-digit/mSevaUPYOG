import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication, RESET_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormSummaryStepFive = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click
  const goNext = async (data) => {
    console.log("Full form data submitted: ", formData);
    // onSubmit(formData); // Call the onSubmit function with the form data
    try {const res = await onSubmit(formData); // wait for the API response
        console.log("API response: ", res);
    
        // Check if the API call was successful
        if (res.isSuccess) {
          console.log("Submission successful, moving to next step.", res.response);
          const applicationNumber = res?.response?.Properties?.[0]?.acknowldgementNumber;
          dispatch(RESET_PtNewApplication());
          history.replace(`/digit-ui/citizen/pt/property/response/${applicationNumber}`);
          // onGoNext();
        } else {
          console.error("Submission failed, not moving to next step.", res.response);
        }}catch(error){
            alert(`Error: ${error.message}`);
            console.error("Submission failed, not moving to next step.", error);
        }
  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  // Function to handle form value changes
  // const onFormValueChange = (setValue = true, data) => {
  //   console.log("onFormValueChange data summary in step 5: ", data);
  //   dispatch(UPDATE_PtNewApplication(config.key, data));
  // };

  const onSubmit = async (data) => {
  console.log("FormData received:", data);

  const tenantId = data?.LocationDetails?.address?.city?.code;
  const allDocuments = data?.DocummentDetails?.documents?.documents || [];

  let updatedUnits = [];
  const usageCategoryMajorCode = data?.PropertyDetails?.usageCategoryMajor?.code;

  if (usageCategoryMajorCode !== "NONRESIDENTIAL.OTHERS") {
    updatedUnits = data?.PropertyDetails?.units?.map((unit) => {
      let usageCategory;

      if (usageCategoryMajorCode === "RESIDENTIAL") {
        usageCategory = "RESIDENTIAL";
      } else if (usageCategoryMajorCode === "MIXED") {
        usageCategory = unit?.usageCategoryType?.code === "RESIDENTIAL"
          ? "RESIDENTIAL"
          : unit?.subUsageType?.code;
      } else {
        usageCategory = unit?.subUsageType?.code;
      }

      return {
        floorNo: unit?.floorNoCitizen?.code,
        occupancyType: unit?.occupancyType?.code,
        arv: unit?.arv,
        unitType: unit?.subUsageType?.code?.split(".").slice(-1)[0],
        usageCategory,
        tenantId: tenantId,
        constructionDetail: {
          builtUpArea: Number(unit?.builtUpArea),
        },
        additionalDetails: {
          rentedformonths: unit?.RentedMonths?.code ? Number(unit.RentedMonths.code) : null,
          usageForDueMonths: unit?.NonRentedMonthsUsage?.code || null,
        },
      };
    });
  }

  const propertyTypeCode = data?.PropertyDetails?.PropertyType?.code;
  const userEnteredFloors = Number(data?.PropertyDetails?.noOfFloors || 0);

  const unitFloors = data?.PropertyDetails?.units?.map((unit) =>
    Number(unit?.floorNoCitizen?.code)
  ).filter((n) => !isNaN(n));
  const maxUnitFloor = unitFloors?.length ? Math.max(...unitFloors) : 0;

  const noOfFloors =
    propertyTypeCode === "BUILTUP.SHAREDPROPERTY"
      ? 2
      : Math.max(userEnteredFloors, maxUnitFloor);

  const permanentAddress = `${data?.LocationDetails?.address?.doorNo}, ${data?.LocationDetails?.address?.buildingName}, ${data?.LocationDetails?.address?.street}, ${data?.LocationDetails?.address?.locality?.name}, ${data?.LocationDetails?.address?.city?.name}, ${data?.LocationDetails?.address?.pincode}`;

  const owners = Array.isArray(data?.ownerShipDetails?.owners)
    ? data.ownerShipDetails.owners.map((owner, index) => {
        const isIndividual = data?.ownerShipDetails?.ownershipCategory?.code?.includes("INDIVIDUAL");

        const baseOwner = {
          name: owner?.name,
          mobileNumber: owner?.mobileNumber,
          emailId: owner?.emailId,
          correspondenceAddress: "",
          isCorrespondenceAddress: owner?.isCorrespondenceAddress || false,
          ownerType: owner?.ownerType?.code,
        };

        if (isIndividual) {
          baseOwner.permanentAddress = permanentAddress;
          baseOwner.relationship = owner?.relationship?.code;
          baseOwner.fatherOrHusbandName = owner?.fatherOrHusbandName;
          baseOwner.gender = owner?.gender?.code;
          baseOwner.additionalDetails = {
            ownerSequence: index,
            ownerName: owner?.name,
          };
        } else {
          baseOwner.designation = owner?.designation;
          baseOwner.altContactNumber = owner?.altContactNumber;
        }

        baseOwner.documents = [
          allDocuments.find((d) => d.documentType?.includes("IDENTITYPROOF")),
          allDocuments.find((d) => d.documentType?.includes("ADDRESSPROOF")),
        ].filter(Boolean);

        return baseOwner;
      })
    : [];

  const formData = {
    tenantId: tenantId,
    address: {
      ...data?.LocationDetails?.address,
      city: data?.LocationDetails?.address?.city?.name,
      locality: {
        code: data?.LocationDetails?.address?.locality?.code,
        area: data?.LocationDetails?.address?.locality?.area,
      },
    },
    usageCategory: usageCategoryMajorCode,
    usageCategoryMajor: usageCategoryMajorCode?.split(".")[0],
    usageCategoryMinor: usageCategoryMajorCode?.split(".")[1] || null,
    landArea: Number(data?.PropertyDetails?.landarea || 0),
    superBuiltUpArea: Number(data?.PropertyDetails?.landarea || 0),
    propertyType: propertyTypeCode,
    noOfFloors,
    ownershipCategory: data?.ownerShipDetails?.ownershipCategory?.code,
    surveyId: data?.LocationDetails?.surveyId,
    existingPropertyId: data?.LocationDetails?.existingPropertyId,
    owners,
    additionalDetails: {
      businessName: data?.PropertyDetails?.businessName,
      yearConstruction: data?.LocationDetails?.yearOfCreation?.code,
      remarks: data?.PropertyDetails?.remarks,
      vasikaNo: data?.PropertyDetails?.vasikaDetails?.vasikaNo,
      vasikaDate: data?.PropertyDetails?.vasikaDetails?.vasikaDate,
      allotmentNo: data?.PropertyDetails?.allottmentDetails?.allotmentNo,
      allotmentDate: data?.PropertyDetails?.allottmentDetails?.allotmentDate,
      inflammable: data?.PropertyDetails?.propertyCheckboxQuestions?.hasInflammableMaterial,
      heightAbove36Feet: data?.PropertyDetails?.propertyCheckboxQuestions?.isPropertyHeightMoreThan36Feet,
    },
    channel: "CFC_COUNTER", // ✅ required
    creationReason: "CREATE", // ✅ required
    source: "MUNICIPAL_RECORDS", // ✅ required
    applicationStatus: "CREATE", // ✅ required
    units: propertyTypeCode !== "VACANT" ? updatedUnits : [],
    documents: allDocuments,
  };

  if (!data?.ownerShipDetails?.ownershipCategory?.code?.includes("INDIVIDUAL")) {
    formData.institution = {
      name: data?.ownerShipDetails?.owners?.[0]?.institutionName,
      type: data?.ownerShipDetails?.owners?.[0]?.institutionType?.code,
      designation: data?.ownerShipDetails?.owners?.[0]?.designation,
      nameOfAuthorizedPerson: data?.ownerShipDetails?.owners?.[0]?.name,
      tenantId,
    };
  }

  const searchData = {
    mobileNumber: formData.owners?.[0]?.mobileNumber,
    name: formData.owners?.[0]?.name,
    doorNo: formData.address?.doorNo,
    locality: formData.address?.locality?.code,
    isRequestForDuplicatePropertyValidation: true,
  };

  console.log("Final Payload:", formData);
  console.log("Search Data:", searchData);

  const response = await Digit.PTService.create({ Property: formData }, tenantId);
  return {isSuccess: response?.ResponseInfo?.status === "successful", response: response};
};


//   const onSubmit = async (data) => {
//     console.log("FormData received:", data);

//     // Map the `units` array to include additional details
//     const updatedUnits = data?.PropertyDetails?.units?.map((unit) => {
//       const additionalDetails = {
//         structureType: unit?.constructionDetail?.structureType || null,
//         ageOfProperty: unit?.constructionDetail?.ageOfProperty || null,
//       };
//       return { ...unit, additionalDetails };
//     });

//     const owners = Array.isArray(data?.ownerShipDetails?.owners) ? data?.ownerShipDetails?.owners : [];
//     // Construct the payload
//     const formData = {
//       tenantId: data?.LocationDetails?.address?.city?.code,
//       address: {
//         ...data?.LocationDetails?.address,
//         city: data?.LocationDetails?.address?.city?.name,
//         locality: {
//           code: data?.LocationDetails?.address?.locality?.code,
//           area: data?.LocationDetails?.address?.locality?.area,
//         },
//       },
//       usageCategory: data?.PropertyDetails?.usageCategoryMajor?.code,
//       usageCategoryMajor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[0],
//       usageCategoryMinor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[1] || null,
//       landArea: Number(data?.PropertyDetails?.landarea || 0),
//       superBuiltUpArea: Number(data?.PropertyDetails?.landarea || 0),
//       propertyType: data?.PropertyDetails?.PropertyType?.code,
//       noOfFloors: Number(data?.PropertyDetails?.noOfFloors || 0),
//       ownershipCategory: data?.ownerShipDetails?.ownershipCategory?.code,
//       additionalDetails: {
//         ageOfProperty: data?.PropertyDetails?.propertyStructureDetails?.ageOfProperty,
//         structureType: data?.PropertyDetails?.propertyStructureDetails?.structureType,
//         electricity: data?.LocationDetails?.electricity,
//         uid: data?.LocationDetails?.uid,
//         heightAbove36Feet: data?.PropertyDetails?.propertyCheckboxQuestions?.isPropertyHeightMoreThan36Feet,
//         inflammable: data?.PropertyDetails?.propertyCheckboxQuestions?.hasInflammableMaterial,
//         vasikaNo: data?.PropertyDetails?.vasikaDetails?.vasikaNo,
//         vasikaDate: data?.PropertyDetails?.vasikaDetails?.vasikaDate,
//         allotmentNo: data?.PropertyDetails?.allottmentDetails?.allotmentNo,
//         allotmentDate: data?.PropertyDetails?.allottmentDetails?.allotmentDate,
//         businessName: data?.PropertyDetails?.businessName,
//         yearConstruction: data?.LocationDetails?.yearOfCreation?.code,
//         remarks: data?.PropertyDetails?.remarks,
//       },
//       surveyId: data?.LocationDetails?.surveyId,
//       existingPropertyId: data?.LocationDetails?.existingPropertyId,
//       owners: owners?.map((owner, index) => {
//         const {
//           name,
//           mobileNumber,
//           designation,
//           altContactNumber,
//           emailId,
//           correspondenceAddress,
//           isCorrespondenceAddress,
//           ownerType,
//           fatherOrHusbandName,
//         } = owner;

//         let __owner;
//         if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
//           __owner = {
//             name,
//             mobileNumber,
//             designation,
//             altContactNumber,
//             emailId,
//             correspondenceAddress,
//             isCorrespondenceAddress,
//             ownerType,
//           };
//         } else {
//           __owner = {
//             name,
//             mobileNumber,
//             correspondenceAddress,
//             permanentAddress: data?.LocationDetails?.address?.locality?.name,
//             relationship: owner?.relationship?.code,
//             fatherOrHusbandName,
//             gender: owner?.gender?.code,
//             emailId,
//             additionalDetails: { ownerSequence: index, ownerName: owner?.name },
//           };
//         }

//         if (!__owner?.correspondenceAddress) __owner.correspondenceAddress = "";

//         const _owner = {
//           ...__owner,
//           ownerType: owner?.ownerType?.code,
//         };

//         if (_owner.ownerType !== "NONE") {
//           const { documentType, documentUid } = owner?.documents || {};
//           _owner.documents = [
//             { documentUid, documentType: documentType?.code, fileStoreId: documentUid },
//             data?.DocummentDetails?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF")),
//           ];
//         } else {
//           _owner.documents = [data?.DocummentDetails?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF"))];
//         }

//         return _owner;
//       }),
//       channel: "CFC_COUNTER", // required
//       creationReason: "CREATE", // required
//       source: "MUNICIPAL_RECORDS", // required
//       units: data?.PropertyDetails?.PropertyType?.code !== "VACANT" ? updatedUnits : [],
//       // documents: data?.DocummentDetails?.documents?.documents,
//       documents: data?.DocummentDetails?.documents?.documents,
//       applicationStatus: "CREATE",
//     };

//     // Add institution details if ownership is not individual
//     if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
//       formData.institution = {
//         name: data?.ownerShipDetails?.owners?.[0]?.institution?.name,
//         type: data?.ownerShipDetails?.owners?.[0]?.institution?.type?.code,
//         designation: data?.ownerShipDetails?.owners?.[0]?.designation,
//         nameOfAuthorizedPerson: data?.ownerShipDetails?.owners?.[0]?.name,
//         tenantId: data?.LocationDetails?.address?.city?.code,
//       };
//     }

//     // Prepare search data for duplicate property validation
//     const searchData = {
//       mobileNumber: formData.owners?.[0]?.mobileNumber,
//       name: formData.owners?.[0]?.name,
//       doorNo: formData.address?.doorNo,
//       locality: formData.address?.locality?.code,
//       isRequestForDuplicatePropertyValidation: true,
//     };

//     console.log("Final Payload:", formData);
//     console.log("Search Data:", searchData);

//     // Set the form data and search data
//     // setFormData(formData);
//     // setSearchData({ city: formData.tenantId, filters: searchData });
// const tenantId = formData.tenantId;
//     const response = await Digit.PTService.create({ Property: { ...formData } }, tenantId);
//     // if(response?.ResponseInfo?.status === "successful"){
//     //   dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));
//     //   console.log("response in step 2: ", response.Licenses[0]);
//     // }
//     return response?.ResponseInfo?.status === "successful";
//   };
  return (
    <React.Fragment>
      <FormComposer
        defaultValues={formData} // Pass the entire formData as default values
        config={config.currStepConfig} // Configuration for the current step
        onSubmit={goNext} // Handle form submission
        // onFormValueChange={onFormValueChange} // Handle form value changes
        label={t(`${config.texts.submitBarLabel}`)} // Submit button label
        currentStep={config.currStepNumber} // Current step number
        onBackClick={onGoBack} // Handle back button click
      />
    </React.Fragment>
  );
};

export default PTNewFormSummaryStepFive;
