import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ActionBar, Toast, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import { useHistory } from "react-router-dom";
import NOCSummary from "../NOCSummary";

const EmployeeNOCStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const [showToast, setShowToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = useSelector((state) => state?.noc?.NOCNewApplicationFormReducer?.formData || {});

  const history = useHistory();

  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const buildUpdatePayload = (formData) => {
    const fireNOCData = formData?.apiData?.FireNOCs?.[0];
    const site = formData?.siteDetails || {};
    const docsFromRedux = formData?.uploadedDocuments?.documents || [];

    const convertedDocs = docsFromRedux.map((doc) => ({
      tenantId,
      documentType: doc.documentType,
      fileStoreId: doc.filestoreId || doc.fileStoreId,
      ...(doc.dropdown ? { dropdown: doc.dropdown } : {}),
    }));

    const updatedFireNOC = {
      ...fireNOCData,
      fireNOCDetails: {
        ...fireNOCData?.fireNOCDetails,
        action: "APPLY",
        propertyDetails: {
          ...fireNOCData?.fireNOCDetails?.propertyDetails,
          address: {
            ...fireNOCData?.fireNOCDetails?.propertyDetails?.address,
            doorNo: site.doorHouseNo || "",
            street: site.streetName || "",
            landmark: site.landmarkName || "",
            pincode: site.pincode || "",
          },
          propertyId: site.propertyId || fireNOCData?.fireNOCDetails?.propertyDetails?.propertyId || "",
        },
        applicantDetails: {
          ...fireNOCData?.fireNOCDetails?.applicantDetails,
          additionalDetail: {
            ...fireNOCData?.fireNOCDetails?.applicantDetails?.additionalDetail,
            ownerAuditionalDetail: {
              ...fireNOCData?.fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail,
              documents: convertedDocs,
            },
          },
        },
      },
    };

    return { FireNOCs: [updatedFireNOC] };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildUpdatePayload(currentStepData);
      const response = await Digit.FIRENOCService.update({ tenantId, details: payload });

      if (response?.FireNOCs?.length > 0) {
        const applicationNo = response.FireNOCs[0]?.fireNOCDetails?.applicationNumber;
        history.replace({
          pathname: `/digit-ui/employee/firenoc/response/${applicationNo}`,
          state: { data: response },
        });
      } else {
        setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
      }
    } catch (error) {
      const errMsg = error?.Errors?.[0]?.message || error?.message || "COMMON_SOME_ERROR_OCCURRED_LABEL";
      setShowToast({ key: "true", error: true, message: errMsg });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  function onGoBack() {
    onBackClick(config.key);
  }

  const closeToast = () => setShowToast(null);

  return (
    <React.Fragment>
      {isSubmitting && <Loader />}
      <NOCSummary currentStepData={currentStepData} t={t} />
      <ActionBar>
        <SubmitBar className="submit-bar-back" label={t("Back")} onSubmit={onGoBack} />
        <SubmitBar label={t("Submit")} onSubmit={handleSubmit} disabled={isSubmitting} />
      </ActionBar>
      {showToast && (
        <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />
      )}
    </React.Fragment>
  );
};

export default EmployeeNOCStepFormFour;
