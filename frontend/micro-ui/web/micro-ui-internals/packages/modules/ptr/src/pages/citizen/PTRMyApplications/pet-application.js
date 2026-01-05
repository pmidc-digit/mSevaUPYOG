import { Card, KeyNote, SubmitBar, ActionBar } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";

const PetApplication = ({ application, tenantId, buttonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { data, isLoading } = Digit.Hooks.useCustomMDMS(tenantId, "PetService", [{ name: "ApplicationType" }]);
  const checkRenewTime = data?.PetService?.ApplicationType?.filter((item) => item.code == "RENEWAPPLICATION");
  const checkTimeRenew = checkRenewTime?.[0]?.renewalPeriod * 1000;

  const parseDate = (rawDate) => {
    if (!rawDate) return null;
    if (!isNaN(rawDate)) {
      const timestamp = Number(rawDate);
      return new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    } else {
      return new Date(rawDate);
    }
  };

  const validToObj = application?.validityDate;
  const validToMillis = validToObj ? validToObj * 1000 : null;

  const currentDateObj = Date.now();

  // ✅ Use timestamps for duration calculation
  const duration = validToObj && currentDateObj ? validToMillis - currentDateObj : null;

  // const days = duration ? Math.round(duration / (1000 * 60 * 60 * 24)) : null;
  // ✅ Renewal check logic

  const checkDuration = duration !== null && duration <= checkTimeRenew;
  const checkRenewal = application?.status == "APPROVED" || application?.status == "EXPIRED";

  return (
    <Card>
      {application?.petRegistrationNumber && <KeyNote keyValue={t("PTR_REGISTRATION_NUMBER")} note={application?.petRegistrationNumber} />}
      <KeyNote keyValue={t("PDF_STATIC_LABEL_APPLICATION_NUMBER_LABEL")} note={application?.applicationNumber} />
      <KeyNote keyValue={t("REPORT_FSM_RESULT_APPLICANTNAME")} note={application?.owner?.name} />
      <KeyNote keyValue={t("PTR_APPLICATION_CATEGORY")} note={t("PTR_APPLICATION")} />
      <KeyNote keyValue={t("PTR_SEARCH_PET_TYPE")} note={application?.petDetails?.petType} />
      <KeyNote keyValue={t("PT_COMMON_TABLE_COL_STATUS_LABEL")} note={t(`PTR_COMMON_${application?.status}`)} />
      <div className="action-button-myapplication">
        {application?.status == "Pending" ? (
          <Link to={`/digit-ui/citizen/payment/collect/PTR/${application?.applicationNumber}/${application?.tenantId}`}>
            <SubmitBar label={"Pending For Payment"} />
          </Link>
        ) : (
          <Link to={`/digit-ui/citizen/ptr/petservice/application/${application?.applicationNumber}/${application?.tenantId}`}>
            <SubmitBar label={buttonLabel} />
          </Link>
        )}

        {(application?.status == "CITIZENACTIONREQUIRED" || application?.status == "INITIATED") && (
          <SubmitBar
            label={t("COMMON_EDIT")}
            onSubmit={() => {
              history.push(`/digit-ui/citizen/ptr/petservice/new-application/${application?.applicationNumber}`);
            }}
          />
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
