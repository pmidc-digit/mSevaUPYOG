import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { stringReplaceAll } from "../../utils";

const NOCResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  console.log("state from location", state);
  const nocData = state?.data?.Noc?.[0];
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const pathname = history?.location?.pathname || "";
  const nocCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
  };

  const onGoToNOC = () => {
    history.push(`/digit-ui/citizen/noc-home`);
  };

  const handlePayment = () => {
    history.push(`/digit-ui/citizen/payment/collect/NOC/${nocCode}/${tenantId}`);
  };


  return (
    <div>
      <Card>
        <Banner
          message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          applicationNumber={nocCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`NOC_${stringReplaceAll(nocData?.nocType, ".", "_")}_APPROVAL_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NOC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_NOC")} onSubmit={onGoToNOC} />
          <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default NOCResponseCitizen;
