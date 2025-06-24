import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
//
import { FormComposer } from "@mseva/digit-ui-react-components";

const NDCNewFormSummaryStepThreeCitizen = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  
  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // console.log("state.pt.PTNewApplicationForm Form data in Summary Step: ", useSelector((state) => state.pt.PTNewApplicationForm.formData));
  // Function to handle the "Next" button click
  const goNext = async (data) => {
    console.log("Full form data submitted: ", formData);
    
    try {const res = await onSubmit(formData); // wait for the API response
    console.log("API response: ", res);

    // Check if the API call was successful
    if (res.isSuccess) {
      console.log("Submission successful, moving to next step.", res.response);
      
      // onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.", res.response);
    }
    }catch(error){
        alert(`Error: ${error.message}`);
        console.error("Submission failed, not moving to next step.", error);
    }
  };

  function mapToNDCPayload(inputData) {
    const applicant = inputData?.NDCDetails?.cpt?.details?.owners?.[0];
    const auditDetails = inputData?.NDCDetails?.cpt?.details?.auditDetails;
    const applicantId = applicant?.uuid;

    const payload = {
          Applicant: {
            uuid: applicantId,
            tenantId: applicant?.tenantId,
            firstname: inputData?.NDCDetails?.PropertyDetails?.firstName,
            lastname: inputData?.NDCDetails?.PropertyDetails?.lastName,
            mobile: inputData?.NDCDetails?.PropertyDetails?.mobileNumber,
            email: inputData?.NDCDetails?.PropertyDetails?.email,
            address: inputData?.NDCDetails?.PropertyDetails?.address,
            applicationStatus: "CREATE",
            createdby: auditDetails?.createdBy,
            lastmodifiedby: auditDetails?.lastModifiedBy,
            createdtime: auditDetails?.createdTime,
            lastmodifiedtime: auditDetails?.lastModifiedTime,
            workflow: {
              action: "INITIATE"
            }
          },
          NdcDetails: [],
          Documents: [] // Add documents mapping if needed
        };

        // Add each water connection to NdcDetails
        (inputData?.NDCDetails?.PropertyDetails?.waterConnection || []).forEach((wc) => {
          payload.NdcDetails.push({
            uuid: wc?.billData?.id,
            applicantId: applicantId,
            businessService: "WS",
            consumerCode: wc?.connectionNo,
            additionalDetails: {
              propertyAddress: inputData?.NDCDetails?.PropertyDetails?.address,
              propertyType: inputData?.NDCDetails?.cpt?.usageCategory,
              // connectionType: wc?.billData,
              // meterNumber: "NOT_AVAILABLE"
            },
            dueAmount: wc?.billData?.totalAmount || null,
            status: wc?.billData?.status
          });
        });

        // Add each sewerage connection to NdcDetails
        (inputData?.NDCDetails?.PropertyDetails?.sewerageConnection || []).forEach((sc) => {
          payload.NdcDetails.push({
            uuid: sc?.billData?.id,
            applicantId: applicantId,
            businessService: "SW",
            consumerCode: sc?.connectionNo,
            additionalDetails: {
              propertyAddress: inputData?.NDCDetails?.PropertyDetails?.address,
              propertyType: inputData?.NDCDetails?.cpt?.usageCategory,
            },
            dueAmount: sc?.billData?.totalAmount || null,
            status: sc?.billData?.status
          });
        });

        (inputData?.DocummentDetails?.documents?.documents || []).forEach((doc) => {
          payload.Documents.push({
            uuid: doc?.documentUid,
            documentType: doc?.documentType,
            documentAttachment: doc?.documentAttachment
          })
        })

        return payload;
    }

  const onSubmit = async (data) => {

    const finalPayload = mapToNDCPayload(data);
    console.log("finalPayload",finalPayload);

    const response = await Digit.NDCService.NDCcreate({tenantId, filters: { skipWorkFlow: true },data: finalPayload });

    if (response?.ResponseInfo?.status === "successful") {
      return  response
    }else{
      console.error(error);
    }

  }

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
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

export {NDCNewFormSummaryStepThreeCitizen};