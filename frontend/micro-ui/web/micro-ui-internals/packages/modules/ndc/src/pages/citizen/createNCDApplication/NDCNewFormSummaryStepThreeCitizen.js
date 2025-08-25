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

  const formData = useSelector((state) => state.ndc.NDCForm.formData || {});
  // Function to handle the "Next" button click

  const goNext = async (action) => {
    const actionStatus = action?.action;
    try {
      const res = await onSubmit(formData, actionStatus); // wait for the API response
      // Check if the API call was successful
      if (res?.isSuccess) {
        history.push("/digit-ui/citizen/ndc/response/" + res?.response?.Applications?.[0]?.uuid);
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
      }
    } catch (error) {
      alert(`Error: ${error?.message}`);
    }
  };

  function mapToNDCPayload(inputData, actionStatus) {
    const applicant = Digit.UserService.getUser()?.info || {};

    // const owners = [
    //   {
    //     name: `${formData?.NDCDetails?.PropertyDetails?.firstName} ${formData?.NDCDetails?.PropertyDetails?.lastName}`.trim(),
    //     mobileNumber: formData?.NDCDetails?.PropertyDetails?.mobileNumber,
    //     gender: formData?.NDCDetails?.PropertyDetails?.gender,
    //     emailId: formData?.NDCDetails?.PropertyDetails?.email,
    //     type: "CITIZEN",
    //   },
    // ];

    // Clone and modify workflow action
    const updatedApplication = {
      ...formData?.apiData?.Applications?.[0],
      workflow: {
        ...formData?.apiData?.Applications?.[0]?.workflow,
        action: actionStatus,
      },
      NdcDetails: formData?.apiData?.Applications?.[0]?.NdcDetails,
      Documents: [], // We'll populate below
    };

    (inputData?.DocummentDetails?.documents?.documents || []).forEach((doc) => {
      updatedApplication.Documents.push({
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.fileStoreId,
      });
    });

    // Final payload matches update API structure
    const payload = {
      Applications: [updatedApplication],
    };

    return payload;
  }

  const onSubmit = async (data, actionStatus) => {
    const finalPayload = mapToNDCPayload(data, actionStatus);

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
      <NDCSummary formData={formData} goNext={goNext} />
    </React.Fragment>
  );
};

export { NDCNewFormSummaryStepThreeCitizen };
