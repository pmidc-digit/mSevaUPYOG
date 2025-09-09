import { Banner, Card, CardText, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation} from "react-router-dom";
import { stringReplaceAll } from "../../utils";
import { getNOCAcknowledgementData } from "../../utils/getNOCAcknowledgementData";

const Response = (props) => {
  const location=useLocation();
  const {pathname, state} = location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  //console.log("tenantId here in Response", tenantId);

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const nocCode = pathname.split("/").pop();

  const onSubmit = () => {
    history.push(`/digit-ui/employee`);
  }

  const onGoToNOC = () => {
    history.push(`/digit-ui/employee/noc/inbox`);
  };

   const handlePayment = () => {
    history.push(`/digit-ui/employee/payment/collect/NOC/${nocCode}/${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  const handleDownloadPdf = async () => {
    const Property = nocData;
      //console.log("tenants in NOC", tenants);
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getNOCAcknowledgementData(Property, tenantInfo, t);
    // console.log("acknowledgementData in NOC", acknowledgementData);
    Digit.Utils.pdf.generate(acknowledgementData);
  };

  return (
    <div>
      <Card>
        <Banner
          message={t(`${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          applicationNumber={nocCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`${stringReplaceAll(nocData?.nocType, ".", "_")}_APPLICATION_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{fontSize: "32px", wordBreak: "break-word"}}
        />
        {nocData?.applicationStatus !== "REJECTED" ? 
        (
          <div>
        {/* <CardText>
          {t(`NOC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
        </CardText>  */}
        <SubmitBar style={{ overflow: "hidden" }} label={t("COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
        </div>
        ):null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_NOC")} onSubmit={onGoToNOC} />
          <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default Response;