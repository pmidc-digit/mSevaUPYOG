import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const CHBResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const isCitizen = window.location.href.includes("citizen");
  // const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    if (isCitizen) history.push(`/digit-ui/citizen`);
    else history.push(`/digit-ui/employee`);
  };

  const onGoToCHB = () => {
    if (isCitizen) history.push(`/digit-ui/citizen/chb-home`);
    else history.push(`/digit-ui/employee/chb/inbox`);
  };

  const handleMakePayment = async () => {
    if (isCitizen) history.push(`/digit-ui/citizen/payment/collect/chb-services/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
    else history.push(`/digit-ui/employee/payment/collect/chb-services/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
  };

  // const handlePayment = () => {
  //   history.push(`/digit-ui/citizen/payment/collect/NDC/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
  //   // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  // };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          // message={"Community Hall Booking Application Submitted Successfully"}
          message={t("CHB_APPLICATION_CREATED")}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`CHB_APPROVAL_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "clamp(20px, 4vw, 32px)", wordBreak: "break-word" }}

        />
        {/* {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null} */}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_CHB")} onSubmit={onGoToCHB} />
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handleMakePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default CHBResponseCitizen;
