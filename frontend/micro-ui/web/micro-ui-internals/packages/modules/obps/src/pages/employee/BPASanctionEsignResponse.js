import { Banner, Card, Loader, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, use } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { encryptId, fetchOnlyFileStore, stringReplaceAll } from "../../utils";
import { set } from "lodash";

const BPASanctionEsignResponse = () => {
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
  const { id: applicationNo, file: filestore } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [edcrData, setEDCRData] = useState(null);

  const { mutate: eSignCertificate, isLoading: eSignLoading, error: eSignError } = Digit.Hooks.tl.useESign();


  useEffect(async () => {
      if (applicationNo) {
        try {
          setIsLoading(true)
          const response = await Digit.OBPSService.BPASearch(tenantId, { applicationNo })
          if (response?.ResponseInfo?.status === "successful") {
            // dispatch(UPDATE_OBPS_FORM("createdResponse", response?.BPA?.[0]));
            setData({ ...response })
            if(response?.BPA?.[0]?.edcrNumber){
              const scrutinyDetails = await Digit.OBPSService.scrutinyDetails(tenantId, { edcrNumber: response?.BPA?.[0]?.edcrNumber });
              if(scrutinyDetails?.edcrDetail?.[0]){
                setEDCRData(scrutinyDetails?.edcrDetail?.[0])
                setIsLoading(false)
                return;
              }else{
                setShowToast({
                  warning: true,
                  message: t("Some_Unknown_Error")
                });
                setIsLoading(false)
                return;
              }
            }else{
              setShowToast({
                warning: true,
                message: t("Some_Unknown_Error")
              });
              setIsLoading(false)
              return
            }
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
    if (edcrData?.updatedDxfFile){
      setApiLoading(true);
      printDrawingWithESign()
    }
  }, [isLoading, data, applicationNo, edcrData]);

  const printDrawingWithESign = async () => {
      try {
        // console.log("🎯 Starting certificate eSign process...");
  
        const { id: fileStoreId, fullTenantId: tenant} = fetchOnlyFileStore(edcrData?.updatedDxfFile)
  
        const callbackUrl = isCitizen ? `${window.location.origin}/digit-ui/citizen/obps/bpa/esign/complete/${applicationNo}/${filestore}` : `${window.location.origin}/digit-ui/employee/obps/bpa/esign/complete/${applicationNo}/${filestore}`;
        const authToken = localStorage.getItem('token');

        console.log("📁 FileStore ID:", fileStoreId, tenant, callbackUrl, authToken);
  
        // Trigger eSign
        eSignCertificate(
          { fileStoreId, tenantId: tenant, callbackUrl, authToken },
          {
            onSuccess: () => console.log("✅ eSign initiated successfully"),
            onError: (error) => {
              console.error("❌ eSign failed:", error);
              setShowToast({
                key: "true",
                error: true,
                message: error.message || "Failed to initiate digital signing process, Kindly check if the document is e-signed already",
              });
              setApiLoading(false);
            },
          }
        );
      } catch (error) {
        console.error("❌ Certificate preparation failed:", error);
        setShowToast({
          key: "true",
          error: true,
          message: error.message || "Failed to prepare certificate for eSign, Kindly check if the document is e-signed already",
        });
        setApiLoading(false);
      }
    };

  if (loading || isLoading || apiLoading) {
    return <Loader />;
  }

  const closeToast = () => setShowToast(null);

  return (
    <div>

      {showToast && (
        <Toast success={showToast?.success} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />
      )}
    </div>
  );
};

export default BPASanctionEsignResponse;
