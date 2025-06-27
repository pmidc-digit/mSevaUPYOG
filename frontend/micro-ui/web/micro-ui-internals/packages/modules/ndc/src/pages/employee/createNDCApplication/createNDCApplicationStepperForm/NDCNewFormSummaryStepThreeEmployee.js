import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
//
import { FormComposer } from "@mseva/digit-ui-react-components";

const NDCNewFormSummaryStepThreeEmployee = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});  
  const goNext = async (data) => {
    console.log("Full form data submitted: ", formData);
    
    try {const res = await onSubmit(formData); // wait for the API response
    console.log("API response: ", res);

    // Check if the API call was successful
    if (res?.isSuccess) {
      console.log("Submission successful, moving to next step.", res?.response);
      history.push("/digit-ui/employee/ndc/response/"+res?.response?.Applicant?.uuid);
      // onGoNext();
    } else {
      console.error("Submission failed, not moving to next step.", res?.response);
    }
    }catch(error){
        alert(`Error: ${error?.message}`);
        console.error("Submission failed, not moving to next step.", error);
    }
  };

  function mapToNDCPayload(inputData) {
    const applicant = Digit.UserService.getUser()?.info || {};
    const auditDetails = inputData?.NDCDetails?.cpt?.details?.auditDetails;
    const applicantId = applicant?.uuid;

    const payload = {
          Applicant: {
            tenantId: tenantId,
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
              propertyType: inputData?.NDCDetails?.cpt?.details?.usageCategory,
              // connectionType: wc?.billData,
              // meterNumber: "NOT_AVAILABLE"
            },
            dueAmount: wc?.billData?.totalAmount || 0,
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
              propertyType: inputData?.NDCDetails?.cpt?.details?.usageCategory,
            },
            dueAmount: sc?.billData?.totalAmount || 0,
            status: sc?.billData?.status
          });
        });

        if(inputData?.NDCDetails?.PropertyDetails?.propertyBillData?.billData){
          const billData = inputData?.NDCDetails?.PropertyDetails?.propertyBillData?.billData;
          payload.NdcDetails.push({
            uuid: billData?.id,
            applicantId: applicantId,
            businessService: "PT",
            consumerCode: inputData?.NDCDetails?.cpt?.id,
            additionalDetails: {
              propertyAddress: inputData?.NDCDetails?.PropertyDetails?.address,
              propertyType: inputData?.NDCDetails?.cpt?.details?.usageCategory,
            },
            dueAmount: billData?.totalAmount || 0,
            status: billData?.status
          });
        }


        (inputData?.DocummentDetails?.documents?.documents || []).forEach((doc) => {
          payload.Documents.push({
            uuid: doc?.documentUid,
            documentType: doc?.documentType,
            documentAttachment: doc?.fileStoreId
          })
        })

        return payload;
    }

  const onSubmit = async (data) => {

    const finalPayload = mapToNDCPayload(data);
    console.log("finalPayload",finalPayload);

    const response = await Digit.NDCService.NDCcreate({tenantId, filters: { skipWorkFlow: true },details: finalPayload });

    if (response?.ResponseInfo?.status === "successful") {
      return  {isSuccess: true, response}
    }else{
      return {isSuccess: false, response}
      console.error("API Failed");
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

export {NDCNewFormSummaryStepThreeEmployee};