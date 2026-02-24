// RenewSummaryStepFour.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";

const RenewTLSummaryStepFour = ({ config, onGoNext, onBackClick, t }) => {
  const formData = useSelector((state) => state.tl.tlNewApplicationForm.formData);
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Monitor checkbox state and enable/disable button
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.declarationChecked) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Auto-close toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
      const appNumber = formData?.CreatedResponse?.applicationNumber || formData?.EditPayload?.applicationNumber;
      if (appNumber) {
        Digit.TLService.fetch_bill({ tenantId: tenantId, filters: { consumerCode: appNumber, businessService: "TL" } });
      }
  },[])

  const goNext = async () => {
    // Validate checkbox
    if (!window.declarationChecked) {
      setError(t("TL_PLEASE_ACCEPT_DECLARATION"));
      setShowToast(true);
      return;
    }

    const res = await onSubmit(formData?.CreatedResponse);

    if (res) {
      const appNumber = formData?.CreatedResponse?.applicationNumber || formData?.EditPayload?.applicationNumber;
      history.replace(`/digit-ui/employee/tl/application-details/${appNumber}`);
    }
  };

  const onSubmit = async (data) => {
    // ─── EDIT PATH: use the pre-built EditPayload from Step 2 ───
    if (formData?.EditPayload) {
      const editPayload = { ...formData.EditPayload };
      // Overlay documents from Step 3
      if (formData?.Documents?.documents?.documents?.length > 0) {
        editPayload.tradeLicenseDetail.applicationDocuments = formData.Documents.documents.documents;
      }
      editPayload.wfDocuments = formData?.Documents?.documents?.documents || null;

      // Sanitize owner fields — ensure dropdown objects are sent as plain strings/codes
      if (editPayload.tradeLicenseDetail?.owners?.length > 0) {
        editPayload.tradeLicenseDetail.owners = editPayload.tradeLicenseDetail.owners.map((owner) => ({
          ...owner,
          gender: typeof owner.gender === "object" ? (owner.gender?.code || owner.gender?.value || null) : owner.gender,
          relationship: typeof owner.relationship === "object" ? (owner.relationship?.code || owner.relationship?.value || null) : owner.relationship,
          ownerType: typeof owner.ownerType === "object" ? (owner.ownerType?.code || owner.ownerType?.value || null) : owner.ownerType,
        }));
      }

      const response = await Digit.TLService.update({ Licenses: [editPayload] }, tenantId);
      return (response?.ResponseInfo?.status === "successful");
    }

    // ─── NORMAL RENEWAL PATH: APPLY action ───
    let formdata = {...data};
    formdata.tradeLicenseDetail.applicationDocuments = formData?.Documents?.documents?.documents;
    formdata.wfDocuments = formData?.Documents?.documents?.documents;
    formdata.calculation.applicationNumber = formdata.applicationNumber;
    formdata.action = "APPLY";
    formdata.status = "INITIATED";

    const response = await Digit.TLService.update({ Licenses: [formdata] }, tenantId);
    return (response?.ResponseInfo?.status === "successful");
  }

  const onGoBack = () => {
    onBackClick(config.key, formData);
  };

  return (
    <React.Fragment>
    <FormComposer
      defaultValues={formData}
      config={config.currStepConfig}
      onSubmit={goNext}
      label={t(config.texts.submitBarLabel)}
      currentStep={config.currStepNumber}
      onBackClick={onGoBack}
      isDisabled={isButtonDisabled}
    />
    {showToast && (
      <Toast
        error={true}
        label={error}
        isDleteBtn={true}
        onClose={() => {
          setShowToast(false);
          setError("");
        }}
      />
    )}
    </React.Fragment>
  );
};

export default RenewTLSummaryStepFour
