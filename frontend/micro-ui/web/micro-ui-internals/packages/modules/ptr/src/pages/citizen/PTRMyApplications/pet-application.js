import { Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const PetApplication = ({ application, tenantId, buttonLabel }) => {
  const { t } = useTranslation();

  const { data, isLoading } = Digit.Hooks.useCustomMDMS("pb", "PetService", [{ name: "ApplicationType" }]);

  const checkRenewTime = data?.PetService?.ApplicationType?.filter((item) => item.code == "RENEWAPPLICATION");

  const checkTimeRenew = checkRenewTime?.[0]?.renewalPeriod;

  console.log("checkTimeRenew", checkTimeRenew);

  const parseDate = (rawDate) => {
    if (!rawDate) return null;
    if (!isNaN(rawDate)) {
      const timestamp = Number(rawDate);
      return new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    } else {
      return new Date(rawDate);
    }
  };

  console.log("application", application?.validityDate);

  const validToObj = parseDate(application?.validityDate);
  const currentDateObj = new Date();

  // ✅ Use timestamps for duration calculation
  const duration = validToObj && currentDateObj ? validToObj.getTime() - currentDateObj.getTime() : null;

  const days = duration ? Math.round(duration / (1000 * 60 * 60 * 24)) : null;
  // ✅ Renewal check logic

  console.log("duration", duration);

  const checkDuration = duration !== null && duration <= checkTimeRenew;
  const checkRenewal = application?.status == "APPROVED" || application?.status == "EXPIRED";

  console.log("checkRenewal", checkRenewal);

  console.log("checkDuration", checkDuration);

  return (
    <Card>
      <KeyNote keyValue={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} note={application?.applicationNumber} />
      <KeyNote keyValue={t("REPORT_FSM_RESULT_APPLICANTNAME")} note={application?.owner?.name} />
      <KeyNote keyValue={t("PTR_APPLICATION_CATEGORY")} note={t("PTR_APPLICATION")} />
      <KeyNote keyValue={t("PTR_SEARCH_PET_TYPE")} note={application?.petDetails?.petType} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`PTR_COMMON_${application?.status}`)} />
      <div style={{ display: "flex", gap: "20px" }}>
        {application?.status == "Pending" ? (
          <Link to={`/digit-ui/citizen/payment/collect/PTR/${application?.applicationNumber}/${application?.tenantId}`}>
            <SubmitBar label={"Pending For Payment"} />
          </Link>
        ) : (
          <Link to={`/digit-ui/citizen/ptr/petservice/application/${application?.applicationNumber}/${application?.tenantId}`}>
            <SubmitBar label={buttonLabel} />
          </Link>
        )}

        {checkRenewal && checkDuration && (
          <Link
            to={`/digit-ui/citizen/ptr/petservice/new-application/${application?.applicationNumber}/renew-application`}
            // {`/digit-ui/citizen/ptr/petservice/application/${application?.applicationNumber}/${application?.tenantId}`}
          >
            <SubmitBar label={t("PT_RENEW_HEADER")} />
          </Link>
        )}
      </div>
    </Card>
  );
};

export default PetApplication;
