import { Banner, Card, Loader, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory , useParams } from "react-router-dom";
import { encryptId } from "../../utils";

const LayoutEsignResponse = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showToast, setShowToast] = useState(null);

 const { id, file } = useParams();
  const applicationNo = decodeURIComponent(id);
  const fileStoreId = file;

  const { isLoading, data } = Digit.Hooks.obps.useLayoutSearchApplication(
    { applicationNo: applicationNo },
    tenantId
  );
  // type=false → LayoutUpdate mutation
  const mutation = Digit.Hooks.obps.useLayoutCreateAPI(tenantId, false);

  useEffect(() => {
    if (!isLoading && data?.resData?.Layout?.[0] && fileStoreId) {
      const application = data?.resData?.Layout[0];

      const updatedApplication = {
        ...application,
        workflow: { action: "ESIGN" },
        layoutDetails: {
          ...application?.layoutDetails,
          additionalDetails: {
            ...application?.layoutDetails?.additionalDetails,
            LOIFilestoreId: fileStoreId,
          },
        },
      };

      setShowToast({ key: "true", warning: true, message: "KINDLY_WAIT_ESIGN_IN_PROGRESS" });
      setLoading(true);

      mutation.mutateAsync({ Layout: { ...updatedApplication } })
        .then(() => {
          setLoading(false);
          setShowToast({ key: "true", success: true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          setTimeout(() => setShowToast(null), 3000);

          const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);

          const timeout = setTimeout(() => {
            const encryptedID = encryptId(applicationNo);
              history.push(`/digit-ui/employee/obps/layout/inbox/application-overview/${encryptedID}`);
          }, 10000);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        })
        .catch(() => {
          setLoading(false);
          setShowToast({ key: "true", warning: true, message: "Failed to update esign in LOI" });
          setTimeout(() => setShowToast(null), 3000);

          const timeout = setTimeout(() => {
            const encryptedID = encryptId(applicationNo);
            history.push(`/digit-ui/employee/obps/layout/inbox/application-overview/${encryptedID}`);
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
          message={t("ESIGN_LAYOUT_SUCCESSFULLY")}
          applicationNumber={applicationNo}
          info={t("ESIGN_SUCCESS_INFO")}
          successful={true}
        />
        <div className="obps-pages-employee-layout-esign-response--style-1">
          {t("REDIRECTING_IN_SECONDS")} {countdown}
        </div>
      </Card>
      {showToast && (
        <Toast
          error={showToast?.error}
          warning={showToast?.warning}
          label={t(showToast?.message)}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default LayoutEsignResponse;
