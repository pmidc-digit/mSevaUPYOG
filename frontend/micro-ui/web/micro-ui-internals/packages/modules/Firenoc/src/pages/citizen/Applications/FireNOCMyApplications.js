import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Header, Loader, Card, SubmitBar } from "@mseva/digit-ui-react-components";

const formatDate = (epoch) => {
  if (!epoch) return "-";
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const StatusBadge = ({ status }) => {
  const colorMap = {
    INITIATED: "#f0a500",
    APPLIED: "#1858b8",
    APPROVED: "#00703c",
    REJECTED: "#d4351c",
    CANCELLED: "#888",
  };
  const color = colorMap[status] || "#505A5F";
  return (
    <span
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "2px 10px",
        fontSize: "12px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {status || "-"}
    </span>
  );
};

const FireNOCMyApplications = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const mobileNumber = Digit.UserService.getUser()?.info?.mobileNumber || "";

  const { isLoading, data: applications = [], isError } = Digit.Hooks.firenoc.useFIRENOCMyApplications(mobileNumber);

  if (isLoading) return <Loader />;

  return (
    <div>
      <Header>
        {t("My FireNOC Applications")} ({applications.length})
      </Header>

      {isError && (
        <Card style={{ textAlign: "center", color: "#d4351c" }}>
          {t("COMMON_SOME_ERROR_OCCURRED_LABEL")}
        </Card>
      )}

      {!isError && applications.length === 0 && (
        <Card style={{ textAlign: "center" }}>{t("NO_APPLICATIONS_MSG")}</Card>
      )}

      {applications.map((app, i) => {
        const appNo = app?.fireNOCDetails?.applicationNumber;
        const ownerName = app?.fireNOCDetails?.applicantDetails?.owners?.[0]?.name || "-";
        const status = app?.fireNOCDetails?.status;
        const nocType = app?.fireNOCDetails?.fireNOCType || "-";
        const detailUrl = `/digit-ui/citizen/firenoc/application-overview/${appNo}?tenantId=${app?.tenantId || ""}`;

        return (
          <Card key={i}>
            <div style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "700" }}>
              {t("NOC_APPLICATION_NUMBER")}
            </div>
            <div style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "400" }}>
              {appNo}
            </div>

            <div style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "700" }}>
              {t("NOC_FIRENOC_TYPE")}
            </div>
            <div style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "400" }}>
              {nocType}
            </div>

            <div style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "700" }}>
              {t("NOC_OWNER_NAME")}
            </div>
            <div style={{ marginBottom: "16px", fontSize: "16px", fontWeight: "400" }}>
              {ownerName}
            </div>

            <div style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "700" }}>
              {t("NOC_APPLICATION_STATUS")}
            </div>
            <div style={{ marginBottom: "24px" }}>
              <StatusBadge status={status} />
            </div>

            <SubmitBar
              label={t("TL_VIEW_DETAILS")}
              onSubmit={() => history.push(detailUrl)}
            />
          </Card>
        );
      })}
    </div>
  );
};

export default FireNOCMyApplications;
