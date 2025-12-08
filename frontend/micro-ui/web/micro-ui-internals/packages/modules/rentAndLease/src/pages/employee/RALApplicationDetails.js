import { Card, CardSubHeader, Header, Row, StatusTable, CardSectionHeader } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RALDocuments from "../../components/RALDocument";
import { useParams } from "react-router-dom";
import { Loader } from "../../components/Loader";
import ApplicationTimeline from "../../../../templates/ApplicationDetails/components/ApplicationTimeline";

const RALApplicationDetails = () => {

  console.log('first11')
  const { t } = useTranslation();
  const { acknowledgementIds, tenantId } = useParams();
  const [loader, setLoader] = useState(false);
  const [applicationData, setApplicationData] = useState();
  console.log("applicationData", applicationData);

  const fetchApplications = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      console.log("search ", responseData);
      setApplicationData(responseData?.AllotmentDetails?.[0]);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (acknowledgementIds) {
      const filters = { applicationNumbers: acknowledgementIds };
      fetchApplications(filters);
    }
  }, []);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: acknowledgementIds,
    moduleCode: "RENT_N_LEASE_NEW",
    role: "EMPLOYEE",
  });

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("RENT_LEASE_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData.OwnerInfo.length > 1;
                const ownerLabelPrefix = multipleOwners ? `${t("OWNER")} ${index + 1}` : t("OWNER");

                return (
                  <React.Fragment key={owner.ownerId || index}>
                    <Row label={`${ownerLabelPrefix} ${t("ADS_APPLICANT_NAME")}`} text={owner?.name || t("CS_NA")} />
                    <Row label={`${ownerLabelPrefix} ${t("CORE_COMMON_PROFILE_EMAIL")}`} text={owner?.emailId || t("CS_NA")} />
                    <Row label={`${ownerLabelPrefix} ${t("CORE_MOBILE_NUMBER")}`} text={owner?.mobileNo || t("CS_NA")} />
                    <Row label={`${ownerLabelPrefix} ${t("CORE_COMMON_PINCODE")}`} text={owner?.pincode || t("CS_NA")} />
                  </React.Fragment>
                );
              })
            ) : (
              <Row label={t("OWNER")} text={t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("RENT_LEASE_PROPERTY_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={applicationData?.propertyName || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={applicationData?.propertyType || t("CS_NA")} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={applicationData?.address || t("CS_NA")} />
            <Row label={t("BASE_RENT")} text={applicationData?.baseRent || t("CS_NA")} />
            <Row label={t("SECURITY_DEPOSIT")} text={applicationData?.securityDeposit || t("CS_NA")} />
            <Row label={t("PROPERTY_SIZE")} text={applicationData?.propertySizeOrArea || t("CS_NA")} />
            <Row label={t("LOCATION_TYPE")} text={applicationData?.locationType || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {applicationData?.documents?.length > 0 ? (
                applicationData.documents.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={applicationData.documents} Code={doc?.documentType} index={index} />
                    <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
                  </div>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>

        <ApplicationTimeline workflowDetails={workflowDetails} t={t} />
      </div>
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
