import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { FormComposer } from "@mseva/digit-ui-react-components";
import NDCSummary from "../../../pageComponents/NDCSummary";
import { resetNDCForm } from "../../../redux/actions/NDCFormActions";

const NDCNewFormSummaryStepThreeCitizen = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const user = Digit.UserService.getUser();

  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // Function to handle the "Next" button click

  const goNext = async (action) => {
    const actionStatus = action?.action;
    try {
      const res = await onSubmit(formData, actionStatus); // wait for the API response
      // Check if the API call was successful
      if (res?.isSuccess) {
        history.push("/digit-ui/citizen/ndc/response/" + res?.response?.Applications?.[0]?.applicationNo);
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  function mapToNDCPayload(inputData, actionStatus) {
    const owners = (inputData?.apiData?.Applications?.[0]?.owners || []).map((item) => {
      const obj = JSON.parse(JSON.stringify(item));
      delete obj.status;
      return obj;
    });

    const baseApplication = formData?.responseData?.[0] || formData?.apiData?.Applications?.[0] || {};

    const existingDocuments = baseApplication?.Documents || [];
    const uploadedDocuments = inputData?.DocummentDetails?.documents?.documents || [];

    const docs =
      existingDocuments.length > 0
        ? uploadedDocuments.map((doc) => {
            const nextDocumentAttachment = doc?.documentAttachment;
            const matchingExistingDocument = existingDocuments.find((existingDoc) => existingDoc?.documentType === doc?.documentType);

            if (matchingExistingDocument) {
              return {
                ...matchingExistingDocument,
                documentAttachment: nextDocumentAttachment,
              };
            }

            return {
              uuid: doc?.uuid,
              documentType: doc?.documentType,
              documentAttachment: nextDocumentAttachment,
            };
          })
        : uploadedDocuments;

    // Clone and modify workflow action
    const updatedApplication = {
      ...baseApplication,
      workflow: {
        ...baseApplication?.workflow,
        action: actionStatus,
      },
      owners: owners,
      NdcDetails: baseApplication?.NdcDetails,
      Documents: docs,
    };

    // Final payload matches update API structure
    const payload = {
      Applications: [updatedApplication],
    };

    return payload;
  }

  const onSubmit = async (data, actionStatus) => {
    const finalPayload = mapToNDCPayload(data, actionStatus);
    // return;
    const response = await Digit.NDCService.NDCUpdate({ tenantId, details: finalPayload });
    dispatch(resetNDCForm());
    if (response?.ResponseInfo?.status === "successful") {
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  // Function to handle the "Back" button click
  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  return (
    <React.Fragment>
      <NDCSummary formData={formData} goNext={goNext} onGoBack={onGoBack} />
    </React.Fragment>
  );
};

export { NDCNewFormSummaryStepThreeCitizen };
