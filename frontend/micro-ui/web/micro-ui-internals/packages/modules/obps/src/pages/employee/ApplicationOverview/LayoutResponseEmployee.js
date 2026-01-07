

import React, { useState } from "react"
import { Banner, Card, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components"
import { useTranslation } from "react-i18next"
import { useHistory, useLocation } from "react-router-dom"
import { getLayoutAcknowledgementData } from "../../../utils/getLayoutAcknowledgementData"
// import { getLayoutAcknowledgementData } from "./get-layoutacknowledgement-data"


const LayoutResponseEmployee = (props) => {
  const location = useLocation()
  const { pathname, state } = location
  const { t } = useTranslation()
  const history = useHistory()
  const [pdfError, setPdfError] = useState(null)

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
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("Go To Inbox")} onSubmit={onGoToLayout} />
        </ActionBar>
      </Card>
    </div>
  )
}

export default LayoutResponseEmployee
