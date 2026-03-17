import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { stringReplaceAll } from "../../utils";

const NDCResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
  };

  const onGoToNDC = () => {
    history.push(`/digit-ui/citizen/ndc-home`);
  };

  const handlePayment = () => {
    history.push(`/digit-ui/citizen/payment/collect/NDC/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          message={"NDC Application Submitted Successfully"}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`NDC_APPROVAL_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {/* {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null} */}
        <ActionBar className="ndc-action-bar" >
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_NDC")} onSubmit={onGoToNDC} />
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default NDCResponseCitizen;
