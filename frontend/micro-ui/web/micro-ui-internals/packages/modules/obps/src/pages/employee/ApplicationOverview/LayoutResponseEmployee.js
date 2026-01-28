

import React, { useState } from "react"
import { Banner, Card, ActionBar, SubmitBar, Loader } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"
import { useHistory, useLocation } from "react-router-dom"
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData"
import LayoutFeeEstimationDetails from "../../../pageComponents/LayoutFeeEstimationDetails"
// import { getLayoutAcknowledgementData } from "./get-layoutacknowledgement-data"


const LayoutResponseEmployee = (props) => {
  const location = useLocation()
  const { pathname, state } = location
  const { t } = useTranslation()
  const history = useHistory()
  const [pdfError, setPdfError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const layoutData = state?.data?.Layout?.[0]
  console.log("layoutData in response page", layoutData)

  const tenantId = window.localStorage.getItem("Employee.tenant-id")

  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}

  const applicationNo = pathname.split("/").pop()

  const onSubmit = () => {
    history.push(`/digit-ui/employee`)
  }

  const onGoToLayout = () => {
    history.push(`/digit-ui/employee/obps/layout/inbox`)
  }

  const handlePayment = () => {
    const code = layoutData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "LAYOUT.PAY1" : "LAYOUT.PAY2";
    history.push(`/digit-ui/citizen/payment/collect/${code}/${applicationNo}/${tenantId}?tenantId=${tenantId}`);
  };

  const handleDownloadPdf = async () => {
    const Property = layoutData
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId)
    const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, t)
    Digit.Utils.pdf.generateBPAREG(acknowledgementData)
  }

  return (
    <div>
      <Card>
        <Banner
          message={t(`LAYOUT_APPLICATION_FORWARD_SUCCESS_HEADER`)}
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
      </Card>

      {/* FEE DETAILS CARD */}
      {layoutData?.layoutDetails?.additionalDetails?.applicationDetails && (
        <Card style={{ marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>{t("BPA_FEE_DETAILS_LABEL")}</h3>
            <LayoutFeeEstimationDetails
              formData={{
                apiData: { ...state?.data },
                applicationDetails: {
                  ...layoutData?.layoutDetails?.additionalDetails?.applicationDetails,
                },
                siteDetails: {
                  ...layoutData?.layoutDetails?.additionalDetails?.siteDetails,
                },
              }}
              feeType="PAY1"
            />
          </div>
        </Card>
      )}

      <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
        <SubmitBar label={t("Go To Inbox")} onSubmit={onGoToLayout} />
      </ActionBar>
    </div>
  )
}

export default LayoutResponseEmployee
