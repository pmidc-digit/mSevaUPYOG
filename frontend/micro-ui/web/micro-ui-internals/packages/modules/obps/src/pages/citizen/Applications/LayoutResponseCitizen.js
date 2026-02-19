
import React, { useState, useEffect } from "react"
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
  const [downloading, setDownloading] = useState(false)
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  

  const layoutData = state?.data?.Layout?.[0]
  console.log("layoutData in response page", layoutData)

  let tenantId;
  if(window.location.pathname.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  }

  const { data: storeData } = Digit.Hooks.useStore.getInitData()
  const { tenants } = storeData || {}

  const applicationNo = pathname.split("/").pop()

  // Fetch calculated amount when component mounts
  useEffect(() => {
    const fetchCalculatedAmount = async () => {
      try {
        if (!layoutData) return;
        
        const siteDetails = layoutData?.layoutDetails?.additionalDetails?.siteDetails || {};
        const applicationDetails = layoutData?.layoutDetails?.additionalDetails?.applicationDetails || {};
        
        // Format siteDetails fields for calculator
        const formattedSiteDetails = { ...siteDetails };
        if (siteDetails.zone && typeof siteDetails.zone === 'string') {
          formattedSiteDetails.zone = { code: siteDetails.zone, name: siteDetails.zone };
        }
        if (siteDetails.buildingStatus && typeof siteDetails.buildingStatus === 'string') {
          formattedSiteDetails.buildingStatus = { code: siteDetails.buildingStatus, name: siteDetails.buildingStatus };
        }
        if (siteDetails.buildingCategory && typeof siteDetails.buildingCategory === 'string') {
          formattedSiteDetails.buildingCategory = { code: siteDetails.buildingCategory, name: siteDetails.buildingCategory };
        }
        if (siteDetails.roadType && typeof siteDetails.roadType === 'string') {
          formattedSiteDetails.roadType = { code: siteDetails.roadType, name: siteDetails.roadType };
        }
        if (siteDetails.layoutAreaType && typeof siteDetails.layoutAreaType === 'string') {
          formattedSiteDetails.layoutAreaType = { code: siteDetails.layoutAreaType, name: siteDetails.layoutAreaType };
        }
        
        const payload = {
          CalculationCriteria: [{
            applicationNumber: layoutData?.applicationNo,
            tenantId: layoutData?.tenantId,
            feeType: layoutData?.applicationStatus === "PENDINGAPPLICATIONPAYMENT" ? "PAY1" : "PAY2",
            Layout: {
              ...layoutData,
              layoutDetails: {
                ...layoutData?.layoutDetails,
                additionalDetails: {
                  ...layoutData?.layoutDetails?.additionalDetails,
                  siteDetails: formattedSiteDetails,
                  applicationDetails: applicationDetails,
                }
              }
            }
          }]
        };
        
        const response = await Digit.OBPSService.LayoutCalculator({ details: payload, filters: { getCalculationOnly: "true" } });
        if (response?.Calculation?.[0]?.taxHeadEstimates) {
          const total = response.Calculation[0].taxHeadEstimates.reduce((sum, tax) => sum + (parseFloat(tax.estimateAmount) || 0), 0);
          setCalculatedAmount(total);
        }
      } catch (error) {
        console.error("Error calculating amount:", error);
      }
    };
    
    fetchCalculatedAmount();
  }, [layoutData]);

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
    history.push(
      `/digit-ui/citizen/payment/collect/${code}/${applicationNo}/${tenantId}?tenantId=${tenantId}`,
      { paymentAmount: calculatedAmount, tenantId }
    );
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

