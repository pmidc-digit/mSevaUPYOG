import { Card, CardSubHeader, Header, Row, StatusTable, CardSectionHeader,MultiLink } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RALDocuments from "../../components/RALDocument";
import { useParams } from "react-router-dom";
// import { Loader } from "../../components/Loader";
import { Loader } from "../../../../challanGeneration/src/components/Loader";
import ApplicationTimeline from "../../../../templates/ApplicationDetails/components/ApplicationTimeline";
import { getAcknowledgementData } from "../../utils/index";
const RALApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds, tenantId } = useParams();
  const [loader, setLoader] = useState(false);
  const [applicationData, setApplicationData] = useState();
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  console.log("applicationData", applicationData);

  const fetchApplications = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      setApplicationData(responseData?.AllotmentDetails?.[0]);
    } catch (error) {
    } finally {
      setLoader(false);
    }
  };


  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "rl-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  const getAcknowledgement = async () => {
    setLoader(true);
    try {
      const applications = applicationData;
      const tenantInfo = tenants.find((tenant) => tenant.code === tenantId);
      const acknowldgementDataAPI = await getAcknowledgementData({ ...applications }, tenantInfo, t);
      setTimeout(() => {
        Digit.Utils.pdf.generateFormatted(acknowldgementDataAPI);
        setLoader(false);
      }, 0);
    } catch (error) {
      console.error("Error generating acknowledgement:", error);
      setLoader(false);
    }
  };

  const dowloadOptions = [];

  dowloadOptions.push({
    label: t("CHB_DOWNLOAD_ACK_FORM"),
    onClick: () => getAcknowledgement(),
  });

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    setLoader(true);
    try {
      let response = null;
      if (payments?.fileStoreId) {
        response = { filestoreIds: [payments?.fileStoreId] };
      } else {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "rentandlease-receipt");
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response.filestoreIds[0],
      });
      window.open(fileStore[response?.filestoreIds[0]], "_blank");
      setLoader(false);
    } catch (error) {
      console.error(error);
      setLoader(false);
    } 
  }

  if (reciept_data && reciept_data?.Payments.length > 0 && !recieptDataLoading) {
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () => getRecieptSearch({ tenantId: reciept_data?.Payments[0]?.tenantId, payments: reciept_data?.Payments[0] }),
    });
  }
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

  // Assuming applicationData is your API response
  const propertyDetails = applicationData?.additionalDetails ? applicationData.additionalDetails : {};

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginLeft: "14px", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
          {dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
            />
          )}
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("RENT_LEASE_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData?.OwnerInfo?.length > 1;

                return (
                  <React.Fragment key={owner.ownerId || index}>
                    {multipleOwners && (
                      <CardSectionHeader style={{ padding: "5px 24px 0px 24px", fontWeight: "600" }}>
                        {t("RAL_OWNER")} {index + 1}
                      </CardSectionHeader>
                    )}
                    <Row label={t("PT_OWNERSHIP_INFO_NAME")} text={owner?.name || t("CS_NA")} />
                    <Row label={t("CORE_COMMON_PROFILE_EMAIL")} text={owner?.emailId || t("CS_NA")} />
                    <Row label={t("CORE_MOBILE_NUMBER")} text={owner?.mobileNo || t("CS_NA")} />
                    <Row
                      label={t("CORE_COMMON_PINCODE")}
                      text={owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode || t("CS_NA")}
                    />
                  </React.Fragment>
                );
              })
            ) : (
              <Row label={t("OWNER")} text={t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITILE_PROPERTY_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row label={t("APPLICATION_NUMBER")} text={applicationData?.applicationNumber || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_ID")} text={propertyDetails?.propertyId || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={propertyDetails?.propertyName || t("CS_NA")} />
            <Row label={t("RAL_ALLOTMENT_TYPE")} text={propertyDetails?.allotmentType || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={propertyDetails?.propertyType || t("CS_NA")} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={propertyDetails?.address || t("CS_NA")} />
            <Row label={t("RAL_PROPERTY_AMOUNT")} text={propertyDetails?.baseRent || t("CS_NA")} />
            <Row label={t("SECURITY_DEPOSIT")} text={propertyDetails?.securityDeposit || t("CS_NA")} />
            <Row label={t("PENALTY_TYPE")} text={propertyDetails?.feesPeriodCycle?.charAt(0)?.toUpperCase() || t("CS_NA")} />
            <Row label={t("PROPERTY_SIZE")} text={propertyDetails?.propertySizeOrArea || t("CS_NA")} />
            <Row label={t("RENT_LEASE_LOCATION_TYPE")} text={propertyDetails?.locationType || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {applicationData?.Document?.length > 0 ? (
                applicationData.Document.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={applicationData.Document} Code={doc?.documentType} index={index} />
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
