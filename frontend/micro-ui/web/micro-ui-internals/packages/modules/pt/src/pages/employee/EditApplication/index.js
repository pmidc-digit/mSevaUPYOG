import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import EditForm from "./EditForm";
import EditPropertyStepForm from "../EditApplication/EditPropertyStepForm";

const EditApplication = () => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();

  let { id: applicationNumber } = useParams();

  const { isLoading, data: applicationDetails } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, applicationNumber);
console.log("applicationDetails-------------", applicationDetails);
  // return applicationDetails && !isLoading ? <EditForm applicationData={applicationDetails?.applicationData} tenantId={tenantId} /> : null;
  return applicationDetails && !isLoading ? <EditPropertyStepForm applicationData={applicationDetails?.applicationData} tenantId={tenantId} /> : null;
};
export default EditApplication;
