import React, { useEffect, useState } from "react";
import { Card, Banner, CardText, SubmitBar } from "@mseva/digit-ui-react-components";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PTResponseEmployee = () => {
  const { t } = useTranslation();
  const { id: applicationNumber } = useParams(); // Same as PropertyApplicationDetails
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [enableDownload, setEnableDownload] = useState(false);

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
        complaintNumber={applicationNumber}
        successful={true}
      />

      <CardText>{t("PT_ACKNOWLEDGEMENT_TRACK_INFO")}</CardText>

      {/* <div>
        <SubmitBar label={t("PT_DOWNLOAD_ACK_FORM")} onSubmit={(e) => handleDownloadPdf(e)} />
      </div> */}

      <Link to="/digit-ui/employee">
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
    </Card>
  );
};

export default PTResponseEmployee;