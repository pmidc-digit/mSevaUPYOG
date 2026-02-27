import { Banner, Card, Loader, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { stringReplaceAll } from "../../utils";

const NOCEsignResponse = () => {
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showToast, setShowToast] = useState(null);

  const parts = pathname.split("/").filter(Boolean);
  const applicationNo = parts[parts.length - 2];
  const fileStoreId = parts[parts.length - 1];

  const { isLoading, data} = Digit.Hooks.noc.useNOCSearchApplication(
    { applicationNo },
    tenantId
  );
  const mutation = Digit.Hooks.noc.useNocCreateAPI(tenantId, false);

  useEffect(() => {
    if (!isLoading && data?.resData?.Noc?.[0] && fileStoreId) {
      const application = data.resData.Noc[0];

      const updatedApplication = {
        ...application,
        workflow: { action: "ESIGN" },
        nocDetails: {
          ...application?.nocDetails,
          additionalDetails: {
            ...application?.nocDetails?.additionalDetails,
            sanctionLetterFilestoreId: fileStoreId,
          },
        },
      };

      // 🔹 Show "in progress" toast
      setShowToast({ key: "true", warning: true, message: "KINDLY_WAIT_ESIGN_IN_PROGRESS" });

      setLoading(true);

      mutation.mutateAsync({ Noc: updatedApplication })
        .then(() => {
         
          setLoading(false);

          // 🔹 Show success toast
          setShowToast({ key: "true", success: true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          setTimeout(() => setShowToast(null), 3000);

          // countdown + redirect
          const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);

          const timeout = setTimeout(() => {
            history.push(`/digit-ui/employee/noc/inbox/application-overview/${applicationNo}`);
          }, 10000);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        })
        .catch(() => {
          setLoading(false);

          // 🔹 Show failure toast
          setShowToast({ key: "true", warning: true, message: "Failed to update esign in sanction letter" });
          setTimeout(() => setShowToast(null), 3000);

          // redirect after showing toast
          const timeout = setTimeout(() => {
            history.push(`/digit-ui/employee/noc/inbox/application-overview/${applicationNo}`);
          }, 10000);

          return () => clearTimeout(timeout);
        });
    }
  }, [isLoading, data, applicationNo]);

  if (loading || isLoading) {
    return <Loader />;
  }

  const closeToast = () => setShowToast(null);

  return (
    <div>
      <Card>
        <Banner
          message={t("NOC_APPLICATION_ESIGN_SUCCESS_HEADER")}
          info={t(`${stringReplaceAll(data?.resData?.Noc?.[0]?.nocType, ".", "_")}_APPLICATION_NUMBER`)}
          // successful={!!fileStoreId}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <p>{applicationNo}</p>
          {loading ? (
            <p>{t("E-Sign in Progress. Kindly Wait...")}</p>
          ) : (
            fileStoreId && (
              <p>
                {t("You will be redirected in")} {countdown} {t("seconds")}...
              </p>
            )
          )}
        </div>
      </Card>

      {showToast && (
        <Toast success={showToast?.success} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </div>
  );
};

export default NOCEsignResponse;
