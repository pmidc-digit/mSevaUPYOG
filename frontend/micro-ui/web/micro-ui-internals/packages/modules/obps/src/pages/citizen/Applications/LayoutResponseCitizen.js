
import React, { useState } from "react"
import { Banner, Card, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"
import { useHistory, useLocation } from "react-router-dom"
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData"


const LayoutResponseCitizen = (props) => {
  const location = useLocation()
  const { pathname, state } = location
  const { t } = useTranslation()
  const history = useHistory()
  const [pdfError, setPdfError] = useState(null)

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
    history.push(`/digit-ui/citizen/obps/my-applications`)
  }
  const onGoToNewLayoutApplication = () => {
    history.push(`/digit-ui/citizen/obps/layout/apply`)
  }

  const handleDownloadPdf = async () => {
    const Property = layoutData;
    //console.log("tenants in NOC", tenants);
    const tenantInfo = tenants.find((tenant) => tenant.code === Property.tenantId);
    const acknowledgementData = await getLayoutAcknowledgementData(Property, tenantInfo, t);
    //console.log("acknowledgementData in citizen NOC", acknowledgementData);
    // Digit.Utils.pdf.generate(acknowledgementData);
    Digit.Utils.pdf.generateBPAREG(acknowledgementData);
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
        {layoutData?.applicationStatus !== "REJECTED" ? (
          <div>
            <SubmitBar style={{ overflow: "hidden" }} label={t("COMMON_DOWNLOAD")} onSubmit={handleDownloadPdf} />
            {pdfError && <div style={{ color: "red", padding: "10px", marginTop: "10px" }}>{pdfError}</div>}
          </div>
        ) : null}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("My Application")} onSubmit={onGoToLayout} />
          <SubmitBar label={t(" New Application")} onSubmit={onGoToNewLayoutApplication} />
        </ActionBar>
      </Card>
    </div>
  )
}

export default LayoutResponseCitizen
