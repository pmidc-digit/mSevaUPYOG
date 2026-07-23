import { Banner, Card, CardText, ActionBar, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { stringReplaceAll } from "../../utils";
import  getNOCSanctionLetter  from "../../utils/getNOCSanctionLetter";

const NOCResponseCitizen = (props) => {
  const location = useLocation();
  const { pathname, state } = location;
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
      history.push(`/digit-ui/citizen/firenoc/search/application-overview/${nocCode}`);
    }, 1000); // delay navigation by 1 second
  };


  const onGoToNOC = () => {
    history.push(`/digit-ui/citizen/firenoc-home`);
  };

  const handlePayment = () => {
    if(tenantId === "pb.jalandhar" || tenantId === "pb.testing" || tenantId === "pb.itjalandhar"){
        alert(t("PAYMENT_DISABLED"))
      return
    }
    else{
      history.push(`/digit-ui/citizen/payment/collect/FIRENOC/${nocCode}?tenantId=${tenantId}`);
    }
  };

  const getFirenocNocApplication = async () => {
    try {
      setLoading(true);
      const nocSanctionData = await getNOCSanctionLetter({application:nocData, t:t});
      let filestoreID = null;
        try {
          const response = await Digit.PaymentService.generatePdf(
            tenantId,
            { Payments: [{ Noc: nocSanctionData.Noc , tenantId }] },
            "firenoc-application"
          );
          filestoreID = response?.filestoreIds[0];
        } finally {
          setLoading(false);
        }

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: filestoreID,
      });
      window.open(fileStore[filestoreID], "_blank")
    } finally {
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
          {!loading && (
            <SubmitBar label={t("Download Application")} onSubmit={() => getFirenocNocApplication()} />
          )}
          <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default NOCResponseCitizen;
