import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const ADSAcknowledgment = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const applicationData = state?.applicationData;
  const tenantId = window.localStorage.getItem("Citizen.tenant-id");
  
  const pathname = history?.location?.pathname || "";
  const adsCode = pathname.split("/").pop(); // Extracts the last segment (application number)

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
  };

  const onGoToADS = () => {
    history.push(`/digit-ui/citizen/ads-home`);
  };

  const handlePayment = () => {
    // Based on your business service "ADV" and workflow "PENDINGPAYMENT"
    history.push(`/digit-ui/citizen/payment/my-bills/ADV/${adsCode}`);
  };

  return (
    <div>
      <Card>
        <Banner
          message={t(`ADS_${applicationData?.applicationStatus}_HEADER`)}
          applicationNumber={adsCode}
          info={applicationData?.applicationStatus === "REJECTED" ? "" : t(`ADS_BOOKING_NUMBER`)}
          successful={applicationData?.applicationStatus === "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {applicationData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`ADS_${applicationData?.applicationStatus}_SUB_HEADER`)}
          </CardText>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_ADS")} onSubmit={onGoToADS} />
          {applicationData?.applicationStatus === "PENDINGPAYMENT" && (
            <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />
          )}
        </ActionBar>
      </Card>
    </div>
  );
};

export default ADSAcknowledgment;