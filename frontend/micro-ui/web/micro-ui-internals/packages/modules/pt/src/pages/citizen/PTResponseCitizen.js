import React, { useEffect, useState } from "react";
import { Card, Banner, CardText, SubmitBar } from "@mseva/digit-ui-react-components";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PTResponseCitizen = () => {
  const { t } = useTranslation();
  const { id: applicationNumber } = useParams(); // Usually this is the propertyId
  const location = useLocation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [enableDownload, setEnableDownload] = useState(false);

  // Try to get ackNo from route state (passed by NewPTStepFormFive)
  let ackNo = location?.state?.ackNo;
  
  // If not in state, fetch the property details
  const { data: applicationDetails } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, applicationNumber, { enabled: !ackNo });
  
  if (!ackNo && applicationDetails?.applicationData?.acknowldgementNumber) {
    ackNo = applicationDetails?.applicationData?.acknowldgementNumber;
  }

  const handleDownloadPdf = async (e) => {
    e.preventDefault();
    setEnableDownload(true);

    // Placeholder: Integrate your actual PDF download logic here
    // const data = await getPropertyAcknowledgementData({ applicationNumber, tenantId, t });
    // Digit.Utils.pdf.generate(data);
  };

  return (
    <Card>
      <Banner
        message={t("PT_ACKNOWLEDGEMENT_SUCCESS_MESSAGE")}
        applicationNumber={ackNo}
        info={t("PT_PROPERTY_PTUID")}
        applicationNumberOne={`Unique Property ID:  ${applicationNumber}`}
        infoOne={t("PT_APPLICATION_NO")}
        successful={true}
      />

      <CardText>{t("PT_ACKNOWLEDGEMENT_TRACK_INFO")}</CardText>

      {/* <div>
        <SubmitBar label={t("PT_DOWNLOAD_ACK_FORM")} onSubmit={(e) => handleDownloadPdf(e)} />
      </div> */}

      <Link to="/digit-ui/citizen">
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
      <Link to="/digit-ui/citizen/pt-home">
        <SubmitBar label={t("CORE_COMMON_GO_TO_PT_HOME")} />
      </Link>
    </Card>
  );
};

export default PTResponseCitizen;