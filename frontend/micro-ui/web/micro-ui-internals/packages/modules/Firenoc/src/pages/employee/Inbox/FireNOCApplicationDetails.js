import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Header, Loader } from "@mseva/digit-ui-react-components";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";

const FireNOCApplicationDetails = () => {
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const { id: applicationNumber } = useParams();
  const [showToast, setShowToast] = useState(null);

  const { isLoading, data: applicationDetails } = Digit.Hooks.firenoc.useApplicationDetail(t, tenantId, applicationNumber);

  const businessService = applicationDetails?.applicationData?.fireNOCDetails?.additionalDetail?.businessService || "FIRENOC";

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationNumber,
    moduleCode: businessService,
  });

  const closeToast = () => {
    setShowToast(null);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="employee-main-application-details">
      <div className="employee-application-details" style={{ marginBottom: "15px" }}>
        <Header>{t("NOC_APPLICATION_DETAILS")}</Header>
      </div>
      <ApplicationDetailsTemplate
        applicationDetails={applicationDetails}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={applicationDetails?.applicationData}
        workflowDetails={workflowDetails}
        businessService={businessService}
        moduleCode="NOC"
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={"WF_FIRENOC_"}
        showTimeLine={true}
      />
    </div>
  );
};

export default FireNOCApplicationDetails;
