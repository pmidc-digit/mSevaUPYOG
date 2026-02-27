import { Card, CardSubHeader, Header, Row, StatusTable, CardSectionHeader, MultiLink } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RALDocuments from "../../components/RALDocument";
import { useParams } from "react-router-dom";
// import { Loader } from "../../components/Loader";
import { Loader } from "../../../../challanGeneration/src/components/Loader";
// import ApplicationTimeline from "../../../../templates/ApplicationDetails/components/ApplicationTimeline";
import { getAcknowledgementData } from "../../utils/index";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
const RALApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds, tenantId } = useParams();
  const [loader, setLoader] = useState(false);
  const [applicationData, setApplicationData] = useState();
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

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
        Digit.Utils.pdf.generate(acknowldgementDataAPI);
        setLoader(false);
      }, 0);
    } catch (error) {
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
      
        response = await Digit.PaymentService.generatePdf(
          tenantId,
          { Payments: [
              {
                ...(payments || {}),
                AllotmentDetails: [applicationData],
              },
            ], },
          "rentandlease-receipt"
        );
      
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

  const getDate = (epoch) => {
    return Digit.DateUtils.ConvertEpochToDate(epoch);
  };

  const tValue = (value) => {
    if (value === 0 || value === "0") return "0";
    if (!value) return t("CS_NA");
    if (typeof value === "object" && value !== null) {
      return t(value?.name || value?.code || "CS_NA");
    }
    return t(value);
  };

  const rawAdditionalDetails = applicationData?.additionalDetails || {};
  console.log("rawAdditionalDetails", rawAdditionalDetails);
  const propertyDetails = Array.isArray(rawAdditionalDetails?.propertyDetails)
    ? rawAdditionalDetails?.propertyDetails[0]
    : rawAdditionalDetails?.propertyDetails;

  const arrearDoc = rawAdditionalDetails?.arrearDoc ? [{ documentType: "Arrear Doc", fileStoreId: rawAdditionalDetails.arrearDoc }] : [];
  const allDocuments = [...(applicationData?.Document || []), ...arrearDoc];

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions ral-app-details-header">
          <Header className="ral-header-32">{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
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
          <CardSubHeader className="ral-card-subheader-24">{t("RAL_CITIZEN_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData?.OwnerInfo?.length > 1;

                return (
                  <React.Fragment key={owner.ownerId || index}>
                    {multipleOwners && (
                      <CardSectionHeader className="ral-app-details-owner-header">
                        {t("RAL_APPLICANT")} {index + 1}
                      </CardSectionHeader>
                    )}
                    <Row label={t("PT_OWNERSHIP_INFO_NAME")} text={tValue(owner?.name)} />
                    <Row label={t("CORE_COMMON_PROFILE_EMAIL")} text={tValue(owner?.emailId)} />
                    <Row label={t("CORE_MOBILE_NUMBER")} text={tValue(owner?.mobileNo)} />
                    <Row
                      label={t("PT_COMMON_COL_ADDRESS")}
                      text={tValue(owner?.correspondenceAddress?.addressId || owner?.permanentAddress?.addressId)}
                    />
                    <Row label={t("CORE_COMMON_PINCODE")} text={tValue(owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode)} />
                  </React.Fragment>
                );
              })
            ) : (
              <Row label={t("OWNER")} text={t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader className="ral-card-subheader-24">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row label={t("APPLICATION_NUMBER")} text={tValue(applicationData?.applicationNumber)} />
            <Row label={t("RENT_LEASE_PROPERTY_ID")} text={tValue(propertyDetails?.propertyId)} />
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={tValue(propertyDetails?.propertyName)} />
            <Row label={t("RAL_ALLOTMENT_TYPE")} text={tValue(propertyDetails?.allotmentType)} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={tValue(propertyDetails?.propertyType)} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={tValue(propertyDetails?.address)} />
            <Row label={t("RAL_PROPERTY_AMOUNT")} text={tValue(propertyDetails?.baseRent)} />
            <Row label={t("PENALTY_TYPE")} text={tValue(propertyDetails?.penaltyType)} />
            <Row
              label={t("RAL_FEE_CYCLE")}
              text={
                propertyDetails?.feesPeriodCycle
                  ? tValue(propertyDetails?.feesPeriodCycle?.[0]?.toUpperCase() + propertyDetails?.feesPeriodCycle?.slice(1)?.toLowerCase())
                  : t("CS_NA")
              }
            />
            <Row label={t("PROPERTY_SIZE")} text={tValue(propertyDetails?.propertySizeOrArea)} />
            <Row label={t("RENT_LEASE_LOCATION_TYPE")} text={tValue(propertyDetails?.locationType)} />
            <Row label={t("RAL_START_DATE")} text={tValue(getDate(applicationData?.startDate))} />
            <Row label={t("RAL_END_DATE")} text={tValue(getDate(applicationData?.endDate))} />
            {applicationData?.amountToBeDeducted > 0 && <Row label={t("RAL_PROPERTY_PENALTY")} text={tValue(applicationData?.amountToBeDeducted)} />}
            <Row label={t("SECURITY_DEPOSIT")} text={tValue(propertyDetails?.securityDeposit)} />
            {applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit > 0 && (
              <Row
                label={t("RAL_AMOUNT_TO_TAKE_FROM_CITIZEN")}
                text={tValue(applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit)}
              />
            )}

            {applicationData?.amountToBeRefund > 0 && <Row label={t("RAL_AMOUNT_TO_REFUND")} text={tValue(applicationData?.amountToBeRefund)} />}
            {applicationData?.tradeLicenseNumber && (
              <Row label={t("RENT_LEASE_TRADE_LICENSE_NUMBER")} text={tValue(applicationData?.tradeLicenseNumber)} />
            )}
          </StatusTable>

          {rawAdditionalDetails?.applicationType === "Legacy" && (
            <React.Fragment>
              <CardSubHeader className="ral-card-subheader-24">{t("RAL_ARREAR_DETAILS")}</CardSubHeader>
              <StatusTable>
                <Row label={t("Arrears")} text={tValue(rawAdditionalDetails?.arrear)} />
                <Row
                  label={t("RAL_START_DATE")}
                  text={rawAdditionalDetails?.arrearStartDate ? getDate(rawAdditionalDetails.arrearStartDate) : t("CS_NA")}
                />
                <Row
                  label={t("RAL_END_DATE")}
                  text={rawAdditionalDetails?.arrearEndDate ? getDate(rawAdditionalDetails.arrearEndDate) : t("CS_NA")}
                />
                <Row label={t("Reason")} text={tValue(rawAdditionalDetails?.arrearReason)} />
                <Row label={t("Remarks")} text={tValue(rawAdditionalDetails?.remarks)} />
              </StatusTable>
            </React.Fragment>
          )}

          <CardSubHeader className="ral-card-subheader-24-margin">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card className="ral-app-details-docs-card">
              {allDocuments?.length > 0 ? (
                allDocuments.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={allDocuments} Code={doc?.documentType} index={index} />
                    {t(doc?.documentType)}
                  </div>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>

        {/* <ApplicationTimeline workflowDetails={workflowDetails} t={t} /> */}
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
      </div>
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
