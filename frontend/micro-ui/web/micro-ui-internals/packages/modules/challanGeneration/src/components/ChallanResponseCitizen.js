import { Banner, Card, CardText, ActionBar, SubmitBar,Loader } from "@mseva/digit-ui-react-components";
import React ,{useState, Fragment} from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ChallanData } from "../utils";
const ChallanResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const isCitizen = window.location.href.includes("citizen");
    const [chbPermissionLoading, setChbPermissionLoading] = useState(false);
  
  // const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment
  console.log('ndcCode', ndcCode)
  let challanEmpData = ChallanData(tenantId, ndcCode);

  const onSubmit = () => {
    if (isCitizen) history.push(`/digit-ui/citizen`);
    else history.push(`/digit-ui/employee`);
  };

  // const onGoToCHB = () => {
  //   if (isCitizen) history.push(`/digit-ui/citizen/chb-home`);
  //   else history.push(`/digit-ui/employee/challangeneration/inbox`);
  // };

  // const handleMakePayment = async () => {
  //   if (isCitizen) history.push(`/digit-ui/citizen/payment/collect/chb-services/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
  //   else history.push(`/digit-ui/employee/payment/collect/chb-services/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
  // };
const printChallanNotice = async () => {
    if (chbPermissionLoading) return;
    setChbPermissionLoading(true);
    try {
      const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: ndcCode } });
      const challan = {
        ...applicationDetails,
        ...challanEmpData,
      };
      console.log("applicationDetails", applicationDetails);
      let application = challan;
      let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
      if (!fileStoreId) {
        let response = await Digit.PaymentService.generatePdf(
          tenantId,
          { challan: { ...application } },
          "challan-notice"
        );
        fileStoreId = response?.filestoreIds[0];
      }
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
      window.open(fileStore[fileStoreId], "_blank");
    } finally {
      setChbPermissionLoading(false);
    }
  };
  const handlePayment = () => {
    // return;
    history.push(`/digit-ui/employee/payment/collect/Challan_Generation/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          // message={"Community Hall Booking Application Submitted Successfully"}
          message={t("CHALLAN_APPLICATION_CREATED")}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`CHALLAN_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        {/* {nocData?.applicationStatus !== "REJECTED" ? (
          <CardText>
            {t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_SUB_HEADER`)}
          </CardText>
        ) : null} */}
         <div className="primary-label-btn d-grid" onClick={chbPermissionLoading ? undefined : printChallanNotice}>
                          {chbPermissionLoading ? (
                            <Loader />
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
                              </svg>
                              {t("Challan_Notice")}
                            </>
                          )}
                        </div>
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          {/* <SubmitBar label={t("CORE_COMMON_GO_TO_CHB")} onSubmit={onGoToCHB} /> */}
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
    </div>
  );
};
export default ChallanResponseCitizen;
