import React from "react";
import { Loader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import OwnerTransfershipStepForm from "../../employee/PropertyMutation/OwnerTransfership/OwnerTransfershipStepForm";

const CitizenTransferOwnership = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const tenantId = Digit.ULBService.getStateId();
  const { id } = useParams();
  const propertyFromRoute = location?.state?.property;

  const { isLoading: isApplicationLoading, data: applicationDetails } = Digit.Hooks.pt.useApplicationDetail(
    t,
    tenantId,
    id,
    { enabled: !propertyFromRoute && !!id }
  );
  const { isLoading: isPropertyLoading, data: propertyData } = Digit.Hooks.pt.usePropertySearch(
    { tenantId, filters: { propertyIds: id }, auth: true },
    { enabled: !propertyFromRoute && !!id }
  );
  const applicationData = propertyFromRoute || applicationDetails?.applicationData || propertyData?.Properties?.[0];

  if (!propertyFromRoute && (isApplicationLoading || isPropertyLoading)) {
    return <Loader />;
  }

  return applicationData ? (
    <OwnerTransfershipStepForm
      applicationData={applicationData}
      tenantId={tenantId}
      heading="ES_TITLE_MUTATE_PROPERTY"
      responsePath="/digit-ui/citizen/pt/property/transfer-ownership-response"
    />
  ) : null;
};

export default CitizenTransferOwnership;
