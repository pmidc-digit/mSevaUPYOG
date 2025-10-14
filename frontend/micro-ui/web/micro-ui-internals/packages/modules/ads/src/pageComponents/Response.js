import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
// import { stringReplaceAll } from "../utils";

const ADSResponseCitizen = (props) => {
  const isCitizen = window.location.href.includes("citizen");

  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const applicationData = state?.applicationData;

  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");

  const pathname = history?.location?.pathname || "";
  const ptrCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(isCitizen ? `/digit-ui/citizen` : `/digit-ui/employee`);
  };

  const onGoToNDC = () => {
    history.push(isCitizen ? `/digit-ui/citizen/ads-home` : `/digit-ui/employee/ads/inbox`);
  };


  // `/digit-ui/citizen/payment/collect/adv-services/${ptrCode}/${tenantId}?tenantId=${tenantId}`
  // history.push(`/digit-ui/citizen/payment/my-bills/adv-services/${application?.bookingNo}`)
  const handlePayment = () => {
    history.push(
      isCitizen
        ? `/digit-ui/citizen/payment/my-bills/adv-services/${applicationData?.bookingNo}`
        : `/digit-ui/employee/payment/collect/adv-services/${ptrCode}/${tenantId}?tenantId=${tenantId}`
    );
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          // message={t(
          //   `ADS_${stringReplaceAll(applicationData?.cartDetails?.[0]?.addType, ".", "_")}_${stringReplaceAll(
          //     applicationData?.bookingStatus,
          //     ".",
          //     "_"
          //   )}_HEADER`
          // )}
          message={t(`ADS_BOOKED_HEADER`)}
          applicationNumber={ptrCode}
          info={applicationData?.bookingStatus == "REJECTED" ? "" : t(`ADS_APPROVAL_NUMBER`)}
          successful={applicationData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {applicationData?.bookingStatus !== "REJECTED" ? (
          <CardText>
            {/* {t(
              `ADS_${stringReplaceAll(applicationData?.cartDetails?.[0]?.addType, ".", "_")}_${stringReplaceAll(
                applicationData?.bookingStatus,
                ".",
                "_"
              )}_SUB_HEADER`
            )} */}

            {t(`ADS_BOOKED_SUB_HEADER`)}
          </CardText>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_ADS")} onSubmit={onGoToNDC} />
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};

export default ADSResponseCitizen;
