import React from "react";
import { Banner, Card, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

const RALResponse = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.applicationData?.Noc?.[0];
  const isCitizen = window.location.href.includes("citizen");
  const pathname = history?.location?.pathname || "";
  const RALCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(isCitizen ? `/digit-ui/citizen` : `/digit-ui/employee`);
  };

  const onGoToPTR = () => {
    history.push(isCitizen ? `/digit-ui/citizen/rentandlease-home` : `/digit-ui/employee/rentandlease/inbox`);
  };

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          message={t("RAL_SUCCESS_HEADER")}
          applicationNumber={RALCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`RAL_ALLOTMENT_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          className="ral-banner"
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />

        <ActionBar className="ral-action-bar">
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_RAL")} onSubmit={onGoToPTR} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default RALResponse;
