import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
//
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { updateNDCForm } from "../../../redux/actions/NDCFormActions";

const NewNDCStepFormTwo = ({ config, onGoNext, onBackClick, t }) => {
  const currentStepData = useSelector((state) =>
    state.ndc.NDCForm.formData && state.ndc.NDCForm.formData[config.key] ? state.ndc.NDCForm.formData[config.key] : {}
  );
  const dispatch = useDispatch();
  const stateId = Digit.ULBService.getStateId();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId, "NDC", ["Documents"]);
  const checkFormData = useSelector((state) => state.ndc.NDCForm.formData || {});
  const id = window.location.pathname.split("/").pop();
  const user = Digit.UserService.getUser();

  const { isLoading: propertyLoading, data: applicationDetails, refetch } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

  useEffect(() => {
    if (applicationDetails?.Applications.length) {
      dispatch(updateNDCForm("responseData", applicationDetails?.Applications));
    }
  }, [applicationDetails]);

  function goNext(finaldata) {
    console.log(`Data in step ${config.currStepNumber} is: \n`, finaldata);
    const missingFields = validation(finaldata);
    if (missingFields.length > 0) {
      setError(`${t("NDC_MESSAGE_" + missingFields[0].replace(".", "_").toUpperCase())}`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }

    const isRealId = id && id.startsWith("NDC-");

    if (isRealId) {
      // onGoNext();
      updateApplication(finaldata);
      console.log("here bab");
    }
    // onGoNext();
    //}
  }

  const updateApplication = async (data) => {
    const applicant = Digit.UserService.getUser()?.info || {};
    const auditDetails = data?.cpt?.details?.auditDetails;
    const applicantId = applicant?.uuid;

    console.log("final data===?????", data);
    console.log("checkFormData???====", checkFormData);

    // Build owners array
    const owners = [
      {
        // name: `${data?.PropertyDetails?.firstName} ${data?.PropertyDetails?.lastName}`.trim(),
        name: user?.info?.name,
        mobileNumber: user?.info?.mobileNumber,
        gender: checkFormData?.NDCDetails?.PropertyDetails?.gender,
        emailId: user?.info?.emailId,
        type: user?.info?.type,
      },
    ];

    // Pick the source of truth for the application
    const baseApplication = checkFormData?.responseData?.[0] || {};

    // Clone and modify workflow action
    const updatedApplication = {
      ...baseApplication,
      workflow: {
        ...baseApplication?.workflow,
        // action: actionStatus,
      },
      owners: owners,
      NdcDetails: baseApplication?.NdcDetails,
      Documents: [], // We'll populate below
    };

    (data?.documents?.documents || [])?.forEach((doc) => {
      updatedApplication.Documents?.push({
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.fileStoreId,
      });
    });

    // Final payload matches update API structure
    const payload = {
      Applications: [updatedApplication],
    };

    console.log("payload", payload);

    // return;

    const response = await Digit.NDCService.NDCUpdate({ tenantId, details: payload });

    if (response?.ResponseInfo?.status === "successful") {
      dispatch(updateNDCForm("apiData", response));
      onGoNext();
      return { isSuccess: true, response };
    } else {
      return { isSuccess: false, response };
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  function validation(documents) {
    if (!isLoading) {
      const ndcDocumentsType = data?.NDC?.Documents || [];
      const documentsData = documents?.documents?.documents || [];

      // Step 1: Extract required document codes from ndcDocumentsType
      const requiredDocs = ndcDocumentsType.filter((doc) => doc.required).map((doc) => doc.code);

      // Step 2: Extract uploaded documentTypes
      const uploadedDocs = documentsData.map((doc) => doc.documentType);

      console.log("DocumentsObject", requiredDocs);

      // Step 3: Identify missing required document codes
      const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc));

      return missingDocs;
    }
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    // console.log("onFormValueChange data in document detilas in step 4  ", data,"\n Bool: ",!_.isEqual(data, currentStepData));
    if (!_.isEqual(data, currentStepData)) {
      dispatch(updateNDCForm(config.key, data));
    }
  };

  // console.log("currentStepData in  Administrative details: ", currentStepData);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={currentStepData}
        //heading={t("")}
        config={config.currStepConfig}
        onSubmit={goNext}
        onFormValueChange={onFormValueChange}
        //isDisabled={!canSubmit}
        label={t(`${config.texts.submitBarLabel}`)}
        currentStep={config.currStepNumber}
        onBackClick={onGoBack}
      />
      {showToast && <Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />}
    </React.Fragment>
  );
};

export { NewNDCStepFormTwo };
