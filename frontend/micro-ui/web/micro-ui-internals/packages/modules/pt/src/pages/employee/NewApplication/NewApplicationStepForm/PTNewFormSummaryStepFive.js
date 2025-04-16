import React from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer } from "../../../../../../../react-components/src/hoc/FormComposer";
import { UPDATE_PtNewApplication } from "../../../../redux/actions/PTNewApplicationActions";

const PTNewFormSummaryStepFive = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();

  // Retrieve the entire formData object from the Redux store
  const formData = useSelector((state) => state.pt.PTNewApplicationForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click
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

    // Map the `units` array to include additional details
    const updatedUnits = data?.PropertyDetails?.units?.map((unit) => {
      const additionalDetails = {
        structureType: unit?.constructionDetail?.structureType || null,
        ageOfProperty: unit?.constructionDetail?.ageOfProperty || null,
      };
      return { ...unit, additionalDetails };
    });

    const owners = Array.isArray(data?.ownerShipDetails?.owners) ? data?.ownerShipDetails?.owners : [];
    // Construct the payload
    const formData = {
      tenantId: data?.PersonalDetails?.address?.city?.code,
      // tenantId: PersonalDetails.address.city.code
      address: {
        ...data?.PersonalDetails?.address,
        city: data?.PersonalDetails?.address?.city?.name,
        locality: {
          code: data?.PersonalDetails?.address?.locality?.code,
          area: data?.PersonalDetails?.address?.locality?.area,
        },
      },
      usageCategory: data?.PropertyDetails?.usageCategoryMajor?.code,
      usageCategoryMajor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[0],
      usageCategoryMinor: data?.PropertyDetails?.usageCategoryMajor?.code.split(".")[1] || null,
      landArea: Number(data?.PropertyDetails?.landArea || 0),
      superBuiltUpArea: Number(data?.PropertyDetails?.landArea || 0),
      propertyType: data?.PropertyDetails?.PropertyType?.code,
      noOfFloors: Number(data?.PropertyDetails?.noOfFloors || 0),
      ownershipCategory: data?.ownerShipDetails?.ownershipCategory?.code,
      additionalDetails: {
        ageOfProperty: data?.PropertyDetails?.propertyStructureDetails?.ageOfProperty,
        structureType: data?.PropertyDetails?.propertyStructureDetails?.structureType,
        electricity: data?.PersonalDetails?.electricity,
        uid: data?.PersonalDetails?.uid,
      },
      surveyId: data?.PersonalDetails?.surveyId,
      existingPropertyId: data?.PersonalDetails?.existingPropertyId,
      owners: owners?.map((owner, index) => {
        const {
          name,
          mobileNumber,
          designation,
          altContactNumber,
          emailId,
          correspondenceAddress,
          isCorrespondenceAddress,
          ownerType,
          fatherOrHusbandName,
        } = owner;

        let __owner;
        if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
          __owner = {
            name,
            mobileNumber,
            designation,
            altContactNumber,
            emailId,
            correspondenceAddress,
            isCorrespondenceAddress,
            ownerType,
          };
        } else {
          __owner = {
            name,
            mobileNumber,
            correspondenceAddress,
            permanentAddress: data?.PersonalDetails?.address?.locality?.name,
            relationship: owner?.relationship?.code,
            fatherOrHusbandName,
            gender: owner?.gender?.code,
            emailId,
            additionalDetails: { ownerSequence: index, ownerName: owner?.name },
          };
        }

        if (!__owner?.correspondenceAddress) __owner.correspondenceAddress = "";

        const _owner = {
          ...__owner,
          ownerType: owner?.ownerType?.code,
        };

        if (_owner.ownerType !== "NONE") {
          const { documentType, documentUid } = owner?.documents || {};
          _owner.documents = [
            { documentUid, documentType: documentType?.code, fileStoreId: documentUid },
            data?.DocummentDetails?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF")),
          ];
        } else {
          _owner.documents = [data?.DocummentDetails?.documents?.documents?.find((e) => e.documentType?.includes("OWNER.IDENTITYPROOF"))];
        }

        return _owner;
      }),
      additionalDetails: {
        vasikaNo: data?.PropertyDetails?.vasikaDetails?.vasikaNo,
        vasikaDate: data?.PropertyDetails?.vasikaDetails?.vasikaDate,
        allotmentNo: data?.PropertyDetails?.allottmentDetails?.allotmentNo,
        allotmentDate: data?.PropertyDetails?.allottmentDetails?.allotmentDate,
        businessName: data?.PropertyDetails?.businessName,
        yearConstruction: data?.PersonalDetails?.yearOfCreation?.code,
        remarks: data?.PropertyDetails?.remarks,
      },
      channel: "CFC_COUNTER", // required
      creationReason: "CREATE", // required
      source: "MUNICIPAL_RECORDS", // required
      units: data?.PropertyDetails?.PropertyType?.code !== "VACANT" ? updatedUnits : [],
      documents: data?.DocummentDetails?.documents?.documents,
      applicationStatus: "CREATE",
    };

    // Add institution details if ownership is not individual
    if (!data?.ownerShipDetails?.ownershipCategory?.code.includes("INDIVIDUAL")) {
      formData.institution = {
        name: data?.ownerShipDetails?.owners?.[0]?.institution?.name,
        type: data?.ownerShipDetails?.owners?.[0]?.institution?.type?.code,
        designation: data?.ownerShipDetails?.owners?.[0]?.designation,
        nameOfAuthorizedPerson: data?.ownerShipDetails?.owners?.[0]?.name,
        tenantId: data?.PersonalDetails?.address?.city?.code,
      };
    }

    // Prepare search data for duplicate property validation
    const searchData = {
      mobileNumber: formData.owners?.[0]?.mobileNumber,
      name: formData.owners?.[0]?.name,
      doorNo: formData.address?.doorNo,
      locality: formData.address?.locality?.code,
      isRequestForDuplicatePropertyValidation: true,
    };

    console.log("Final Payload:", formData);
    console.log("Search Data:", searchData);

    // Set the form data and search data
    // setFormData(formData);
    // setSearchData({ city: formData.tenantId, filters: searchData });
const tenantId = formData.tenantId;
    const response = await Digit.PTService.create({ Property: { ...formData } }, tenantId);
    // if(response?.ResponseInfo?.status === "successful"){
    //   dispatch(UPDATE_tlNewApplication("CreatedResponse", response.Licenses[0]));
    //   console.log("response in step 2: ", response.Licenses[0]);
    // }
    return response?.ResponseInfo?.status === "successful";
  };
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
