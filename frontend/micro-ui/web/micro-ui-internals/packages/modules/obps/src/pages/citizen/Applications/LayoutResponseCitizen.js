
import React, { useState } from "react"
import { Banner, Card, ActionBar, SubmitBar,Loader } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"
import { useHistory, useLocation } from "react-router-dom"
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData"


const LayoutResponseCitizen = (props) => {
  const location = useLocation()
  const { pathname, state } = location
  const { t } = useTranslation()
  const history = useHistory()
  const [pdfError, setPdfError] = useState(null)
  const [downloading, setDownloading] = useState(false);
  

  const layoutData = state?.data?.Layout?.[0]
  console.log("layoutData in response page", layoutData)

  const tenantId = window.localStorage.getItem("CITIZEN.CITY")

  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}

  const applicationNo = pathname.split("/").pop()

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`)
  }

  const onGoToLayout = () => {
    history.push(`/digit-ui/citizen/obps/layout/my-applications`)
  }
  const onGoToNewLayoutApplication = () => {
    history.push(`/digit-ui/citizen/obps/layout/apply`)
  }
  const onGoToSearchApplication = () => {
    history.push(`/digit-ui/citizen/obps/layout/search-application`)
  }

  const handlePayment = () => {
    const code = layoutData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "LAYOUT.PAY1" : "LAYOUT.PAY2";
    history.push(`/digit-ui/citizen/payment/collect/${code}/${applicationNo}/${tenantId}?tenantId=${tenantId}`);
  };

  const handleDownloadPdf = async () => {
    try{
      setDownloading(true);
      const Property = layoutData;
    //console.log("tenants in NOC", tenants);
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const ulbType = tenantInfo?.city?.ulbType;
    const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo,ulbType, t);
    //console.log("acknowledgementData in citizen NOC", acknowledgementData);
    // Digit.Utils.pdf.generate(acknowledgementData);
    Digit.Utils.pdf.generateFormatted(acknowledgementData);
    } catch(err){
      console.log('err', err)
    }finally{
      setDownloading(false);
    }
    
  };

  return (
    <div>
      <Card>
        <Banner
          message={t(`LAYOUT_APPLICATION_${layoutData?.workflow?.action}_SUCCESS_HEADER`)}
          applicationNumber={applicationNo}
          info={layoutData?.applicationStatus === "REJECTED" ? "" : t("LAYOUT_APPLICATION_NUMBER")}
          successful={layoutData?.applicationStatus === "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {downloading && <Loader />}
        {layoutData?.applicationStatus !== "REJECTED" ? (
          <div style={{display:"flex", justifyContent:"space-evenly"}}>
            <SubmitBar style={{ overflow: "hidden" }} label={t("COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
            {(layoutData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" || layoutData?.applicationStatus === "PENDINGSANCTIONPAYMENT") && <SubmitBar label={t("COMMON_MAKE_PAYMENT")} onSubmit={handlePayment} />}
            {pdfError && <div style={{ color: "red", padding: "10px", marginTop: "10px" }}>{pdfError}</div>}
          </div>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("My Application")} onSubmit={onGoToLayout} />
          <SubmitBar label={t(" New Application")} onSubmit={onGoToNewLayoutApplication} />
          <SubmitBar label={t(" Search Application")} onSubmit={onGoToSearchApplication} />
        </ActionBar>
      </Card>
    </div>
  )
}

export default LayoutResponseCitizen
