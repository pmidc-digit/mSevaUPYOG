import { Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PetApplication = ({ application, tenantId, buttonLabel }) => {
  console.log("application 3534543:>> ", application);
  const { t } = useTranslation();
  // http://localhost:3000/digit-ui/citizen/payment/collect/PTR/PB-PTR-2025-08-26-000389/null
  console.log("application?.applicationNumber", application?.applicationNumber);
  console.log("application?.status", application?.status);
  return (
    <Card>
      <KeyNote keyValue={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} note={application?.applicationNumber} />
      <KeyNote keyValue={t("REPORT_FSM_RESULT_APPLICANTNAME")} note={application?.owner?.name} />
      <KeyNote keyValue={t("PTR_APPLICATION_CATEGORY")} note={t("PTR_APPLICATION")} />
      <KeyNote keyValue={t("PTR_SEARCH_PET_TYPE")} note={application?.petDetails?.petType} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`ES_PTR_COMMON_STATUS_${application?.status}`)} />
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
