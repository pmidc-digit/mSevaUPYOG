import { Banner, Card, Loader, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, use } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { encryptId, stringReplaceAll } from "../../utils";

const BPAEsignResponse = () => {
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslation();
  const history = useHistory();
  const isCitizen = window.location.href.includes("citizen")
  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");
  const userInfo = Digit.UserService.getUser();
  const userUUID = userInfo?.info?.uuid;

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showToast, setShowToast] = useState(null);
  const { id: applicationNo, file: fileStoreId, drawing } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);


  useEffect(async () => {
      if (applicationNo) {
        try {
          setIsLoading(true)
          const response = await Digit.OBPSService.BPASearch(tenantId, { applicationNo })
          if (response?.ResponseInfo?.status === "successful") {
            // dispatch(UPDATE_OBPS_FORM("createdResponse", response?.BPA?.[0]));
            setData({ ...response })
            setIsLoading(false)
          } else {
            // setError()
            setShowToast({
              warning: true,
              message: t("Some_Unknown_Error")
            });
            setIsLoading(false)
          }
        } catch (e) {
          setShowToast({
              warning: true,
              message: t(e.response?.data?.Errors?.[0]?.message) || t("Some_Unknown_Error")
          });
          setIsLoading(false)
        }
      }
    }, [applicationNo])

  useEffect(async () => {
    if (!isLoading && data?.BPA?.[0] && fileStoreId) {
      const application = data?.BPA?.[0];
      let payload = {
        BPA: {
          ...application,
          additionalDetails: {
            ...application?.additionalDetails,
            sanctionLetterFilestoreId: fileStoreId,
            sanctionLetterDrawing: drawing === "true" ? true : false,
            drawingFilestoreId: fileStoreId || null,
          },
          workflow: { 
            action: "ESIGN",
            assignes: isCitizen ? null : [application?.accountId, ...(application?.landInfo?.owners?.map(owner => owner?.uuid) || [])]
          },
        },
      };

      try{
        setApiLoading(true);
        const result = await Digit.OBPSService.update(payload, tenantId)
        if(result?.ResponseInfo?.status === "successful"){
          setApiLoading(false);
          setLoading(false);

          // 🔹 Show success toast
          setShowToast({ key: "true", success: true, message: "COMMON_SUCCESSFULLY_UPDATED_APPLICATION_STATUS_LABEL" });
          setTimeout(() => setShowToast(null), 3000);

          // countdown + redirect
          const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
          }, 1000);

          const timeout = setTimeout(() => {
            const encryptedID = encryptId(applicationNo);
            history.push(isCitizen? `/digit-ui/citizen/obps/bpa-app/${encryptedID}` : `/digit-ui/employee/obps/inbox/bpa/${encryptedID}`);
          }, 10000);

          return () => {
            clearInterval(interval);
            clearTimeout(timeout);
          };
        }else{
          setShowToast({
              error: true,
              message: t("BPA_CREATE_APPLICATION_FAILED")
          });
          setApiLoading(false);
          setTimeout(() => setShowToast(null), 3000);

          // redirect after showing toast
          const timeout = setTimeout(() => {
            const encryptedID = encryptId(applicationNo);
            history.push(isCitizen? `/digit-ui/citizen/obps/bpa-app/${encryptedID}` : `/digit-ui/employee/obps/inbox/bpa/${encryptedID}`);
          }, 10000);

          return () => clearTimeout(timeout);          
        }
      }catch(e){
        setShowToast({
          error: true,
          message: t(e.response?.data?.Errors?.[0]?.message) || t("BPA_CREATE_APPLICATION_FAILED")
        });
        setApiLoading(false);
        setTimeout(() => setShowToast(null), 3000);

        // redirect after showing toast
        const timeout = setTimeout(() => {
          const encryptedID = encryptId(applicationNo);
          history.push(isCitizen? `/digit-ui/citizen/obps/bpa-app/${encryptedID}` : `/digit-ui/employee/obps/inbox/bpa/${encryptedID}`);
        }, 10000);

        return () => clearTimeout(timeout);    
      }   
    }
  }, [isLoading, data, applicationNo]);

  if (loading || isLoading || apiLoading) {
    return <Loader />;
  }

  const closeToast = () => setShowToast(null);

  return (
    <div>
      <Card>
        <Banner
          message={t("NOC_APPLICATION_ESIGN_SUCCESS_HEADER")}
          info={t(`${stringReplaceAll(data?.BPA?.[0]?.businessService, ".", "_")}_APPLICATION_NUMBER`)}
          successful={!!fileStoreId}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
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
        <Toast success={showToast?.success} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </div>
  );
};

export default BPAEsignResponse;
