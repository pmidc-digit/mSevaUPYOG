import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { stringReplaceAll } from "../utils";

const PTRResponseCitizen = (props) => {
    console.log('props', props)
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.applicationData?.Noc?.[0];
  console.log('state', state)
  console.log('nocData', nocData)
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");

  const pathname = history?.location?.pathname || "";
  const ptrCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
  };

  const onGoToPTR = () => {
    history.push(`/digit-ui/citizen/ptr-home`);
  };


  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing
  

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          message={"Pet Registration application submitted successfully"}
          applicationNumber={ptrCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`PTR_${stringReplaceAll(nocData?.nocType, ".", "_")}_APPROVAL_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
      
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_PTR")} onSubmit={onGoToPTR} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default PTRResponseCitizen;
