import { Banner, Card, CardText, ActionBar, SubmitBar , Loader } from "@mseva/digit-ui-react-components";
import React ,{useState} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { stringReplaceAll} from "../../utils";
import { getNOCAcknowledgementData } from "../../utils/getNOCAcknowledgementData";

const NOCResponseCitizen = (props) => {
  const location=useLocation();
  const {pathname, state } = location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.FireNOCs?.[0];
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [loading, setLoading] = useState(false);
  

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  // const pathname = history?.location?.pathname || "";
  const nocCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
  };
  const onViewApplication = () => {
    setLoading(true); // show loading first
    setTimeout(() => {
      history.push(`/digit-ui/citizen/noc/search/application-overview/${nocCode}`);
    }, 1000); // delay navigation by 1 second
  };


  const onGoToNOC = () => {
    history.push(`/digit-ui/citizen/firenoc-home`);
  };

  const handlePayment = () => {
    history.push(`/digit-ui/citizen/payment/collect/obpas_noc/${nocCode}/${tenantId}?tenantId=${tenantId}`);
  };


  const handleDownloadPdf = async (isView = false) => {
    try{
      setLoading(true);
    const Property = nocData;
    if (!Property) {
      setLoading(false);
      return;
    }
    const tenantInfo = tenants?.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getNOCAcknowledgementData(Property, tenantInfo, null, null, t, isView);
    Digit.Utils.pdf.generateFormattedNOC(acknowledgementData);
    }catch(error){
      console.error("PDF generation error:", error);
    }finally{
      setLoading(false);
    }
  };

   if (loading) {
      return <Loader />;
    }
  


  return (
    <div>
      <Card>
        <Banner
          // message={t(`${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          message={t("NOC_APPLICATION_SUCCESS_HEADER")}
          // message={t(`NOC_APPLICATION_${nocData?.workflow?.action}_SUCCESS_HEADER`)}
          applicationNumber={nocCode}
          info={nocData?.fireNOCDetails?.status == "REJECTED" ? "" : t(`${stringReplaceAll(nocData?.fireNOCDetails?.fireNOCType, ".", "_")}_APPLICATION_NUMBER`)}
          successful={nocData?.fireNOCDetails?.status == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {/* {nocData?.applicationStatus !== "REJECTED" ? (
          <div>
          {/* <CardText>
            {t(`${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText> */}
        {/* <SubmitBar style={{ overflow: "hidden" }} label={t("COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
          </div>
        ) : null} */}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CORE_COMMON_GO_TO_FIRENOC")} onSubmit={onGoToNOC} />
          {nocData?.fireNOCDetails?.status === "INITIATED" ? (
            <SubmitBar label={t("View Application")} onSubmit={() => handleDownloadPdf(true)} />
          ) : (
            <SubmitBar label={t("Download Application")} onSubmit={() => handleDownloadPdf(false)} />
          )}
          {/* <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} /> */}
        </ActionBar>
      </Card>
    </div>
  );
};
export default NOCResponseCitizen;
