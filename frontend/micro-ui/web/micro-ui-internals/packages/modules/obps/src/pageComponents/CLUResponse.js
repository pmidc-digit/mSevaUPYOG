import { Banner, Card, CardText, ActionBar, SubmitBar,Loader } from "@mseva/digit-ui-react-components";
import React, {useState} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { stringReplaceAll} from "../utils";
import { getCLUAcknowledgementData } from "../utils/getCLUAcknowledgementData";


const CLUResponse = (props) => {
  const location=useLocation();
  const {pathname, state } = location;
  const { t } = useTranslation();
  const history = useHistory();
  const [downloading, setDownloading] = useState(false);
  let tenantId;
  const cluData = state?.data?.Clu?.[0];

  if(window.location.pathname.includes("citizen"))tenantId=window.localStorage.getItem("CITIZEN.CITY");
  else{
     tenantId = window.localStorage.getItem("Employee.tenant-id");
  }

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const cluCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  console.log("cluData here", cluData);

  const onSubmit = () => {
    if(window.location.pathname.includes("citizen")){
      history.push(`/digit-ui/citizen`);
    }
    else{
       history.push(`/digit-ui/employee`);
    }
  };

  const onGoToHome = () => {
   if(window.location.pathname.includes("citizen")){
    history.push(`/digit-ui/citizen/obps/home`);
  }
   else{
      history.push(`/digit-ui/employee/obps/clu/inbox`);
   }
  };

  const handlePayment = () => {
    const code = cluData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "CLU.PAY1" : "CLU.PAY2";
    history.push(`/digit-ui/citizen/payment/collect/${code}/${cluCode}/${tenantId}?tenantId=${tenantId}`);
  };


  const handleDownloadPdf = async () => {
    try{
      setDownloading(true);
      const Property = cluData;
    // console.log("tenants in NOC", tenants);
    const site = Property?.cluDetails?.additionalDetails?.siteDetails;
    const ulbType = site?.ulbType;
    const ulbName = site?.ulbName?.city?.name;
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getCLUAcknowledgementData(Property, tenantInfo, ulbType, ulbName, t);
    Digit.Utils.pdf.generateFormatted(acknowledgementData);
 
    } catch(err){
      console.log('err', err)
    } finally{
      setDownloading(false);
    }
  };

  return (
    <div>
      <Card>
        <Banner
          message={t(`BPA_APPLICATION_${cluData?.workflow?.action}_SUCCESS_HEADER`)}
          applicationNumber={cluCode}
          info={cluData?.applicationStatus == "REJECTED" ? "" : t(`${stringReplaceAll(cluData?.cluType, ".", "_")}_APPLICATION_NUMBER_LABEL`)}
          successful={cluData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {downloading && <Loader />}
        {cluData?.applicationStatus !== "REJECTED" ? (
          <div style={{display:"flex", justifyContent:"space-evenly"}}>
          <SubmitBar style={{ overflow: "hidden" }} label={t("COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
          {(cluData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" || cluData?.applicationStatus === "PENDINGSANCTIONPAYMENT") && <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />}
          </div>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_OBPS")} onSubmit={onGoToHome} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default CLUResponse;
