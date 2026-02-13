import { Banner, Card, CardText, ActionBar, SubmitBar, Loader } from "@mseva/digit-ui-react-components";
import React, {useEffect , useState} from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { getBusinessServices, stringReplaceAll } from "../../../utils";

const SelfCertificationResponse = (props) => {
//   const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
//   const bpaData = state?.data?.BPA?.[0];
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [bpaData , setBpaData] = useState({})
  const location = useLocation();
  const { workflowAction } = location.state || {};
  console.log("workflowAction",workflowAction);


  const pathname = history?.location?.pathname || "";
  const selfCertificationCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const onSubmit = () => {
    history.push(`/digit-ui/citizen`);
    window.location.reload();
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [])

  useEffect(async () => {
        if(selfCertificationCode){
          try{
            setIsLoading(true)
            const response = await Digit.OBPSService.BPASearch(tenantId, {applicationNo: selfCertificationCode})
            if(response?.ResponseInfo?.status === "successful"){
            //   dispatch(UPDATE_OBPS_FORM("createdResponse", response?.BPA?.[0]));
              setBpaData(response?.BPA?.[0])
              setIsLoading(false)
            }else{
              setError(t("Some_Unknown_Error"))
              setShowToast(true);
              setIsLoading(false)
            }
          }catch(e){
            setError(t(e.message))
            setShowToast(true);
            setIsLoading(false)
          }
        }
    }, [selfCertificationCode])

    const closeToast = () => {
        setShowToast(false);
        setError("");
    };

//   const onGoToNDC = () => {
//     history.push(`/digit-ui/citizen/ndc-home`);
//   };

  const handlePayment = () => {
    window.location.assign(
      `${window.location.origin}/digit-ui/citizen/payment/collect/${`${getBusinessServices(bpaData?.businessService, bpaData?.applicationStatus, bpaData?.additionalDetails?.applicationType)}/${bpaData?.applicationNo}/${bpaData?.tenantId}?tenantId=${bpaData?.tenantId}`}`,
    )
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing
  if(isLoading) return (<Loader />)
  if(showToast) return (<Toast isDleteBtn={true} error={true} label={error} onClose={closeToast} />);

  console.log("GetInThisPage", bpaData)

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          message={bpaData?.status == "REJECTED" ? t("BPA_Application_Rejected") : bpaData?.status == "INITIATED" ? t("Application_Saved_As_Draft_Successfully") :t(`WF_BPA_LOW_${workflowAction||""}_BY_ARCHITECT_DONE`)}
          applicationNumber={selfCertificationCode}
          info={bpaData?.status == "REJECTED" ? "" : t(`BPA_APPROVAL_NUMBER`)}
          successful={bpaData?.status == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {/* {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null} */}
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          {/* <SubmitBar label={t("WF_BPA_PAY")} style={{ marginRight: "10px" }} /> */}
          {/* <SubmitBar label={t("CORE_COMMON_GO_TO_NDC")} onSubmit={onGoToNDC} /> */}
          {((bpaData?.status === "PENDING_APPL_FEE") || (bpaData?.status === "PENDING_SANC_FEE_PAYMENT")) &&<SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />}
        </ActionBar>
      </Card>
    </div>
  );
};
export default SelfCertificationResponse;
