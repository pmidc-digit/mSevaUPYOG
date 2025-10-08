import { Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PetApplication = ({ application, tenantId, buttonLabel }) => {
  console.log("buttonLabel", buttonLabel);
  const { t } = useTranslation();
  return (
    <Card>
      <KeyNote keyValue={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} note={application?.applicationNumber} />
      <KeyNote keyValue={t("REPORT_FSM_RESULT_APPLICANTNAME")} note={application?.owner?.name} />
      <KeyNote keyValue={t("PTR_APPLICATION_CATEGORY")} note={t("PTR_APPLICATION")} />
      <KeyNote keyValue={t("PTR_SEARCH_PET_TYPE")} note={application?.petDetails?.petType} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`PTR_COMMON_${application?.status}`)} />
      {application?.status == "Pending" ? (
        <Link to={`/digit-ui/citizen/payment/collect/PTR/${application?.applicationNumber}/${application?.tenantId}`}>
          <SubmitBar label={"Pending For Payment"} />
        </Link>
      ) : (
        <Link to={`/digit-ui/citizen/ptr/petservice/application/${application?.applicationNumber}/${application?.tenantId}`}>
          <SubmitBar label={buttonLabel} />
        </Link>
      )}
    </Card>
  );
};

export default PetApplication;
