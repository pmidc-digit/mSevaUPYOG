import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { stringReplaceAll } from "../../utils";

const Response = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/employee`);
  };

  const onGoToNDC = () => {
    history.push(`/digit-ui/employee/ndc/inbox`);
  };

  const handlePayment = () => {
    history.push(`/digit-ui/employee/payment/collect/NDC/${ndcCode}/${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_APPROVAL_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_NDC")} onSubmit={onGoToNDC} />
          <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default Response;
