import { Banner, Card, ActionBar, SubmitBar, Toast, Loader } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ChallanData, getLocationName } from "../utils";
import getPDFData from "../utils/getTLAcknowledgementData";
// import { Loader } from "./Loader";

const TLResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const isCitizen = window.location.href.includes("citizen");
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();
  const [getLable, setLable] = useState(false);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(null);

  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  let challanEmpData = ChallanData(tenantId, ndcCode);

  const { isLoading, data: application, error: errorApplication } = Digit.Hooks.tl.useTLApplicationDetails({
    tenantId: tenantId,
    applicationNumber: ndcCode,
  });

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.ChallanGenerationService.search({ tenantId, filters });
     
      setChallanData(responseData?.challans?.[0]);
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (ndcCode) {
      const filters = {};
      filters.challanNo = ndcCode;
      fetchChallans(filters);
    }
  }, []);

  const onSubmit = () => {
    if (isCitizen) history.push(`/digit-ui/citizen`);
    else history.push(`/digit-ui/employee`);
  };

  // const printChallanNotice = async () => {
  //   if (chbPermissionLoading) return;
  //   setChbPermissionLoading(true);
  //   try {
  //     const applicationDetails = await Digit.ChallanGenerationService.search({ tenantId, filters: { challanNo: ndcCode } });
  //     const location = await getLocationName(
  //       applicationDetails?.challans?.[0]?.additionalDetail?.latitude,
  //       applicationDetails?.challans?.[0]?.additionalDetail?.longitude
  //     );
  //     const challan = {
  //       ...applicationDetails,
  //       ...challanEmpData,
  //     };
  //     let application = challan;
  //     let fileStoreId = applicationDetails?.Applications?.[0]?.paymentReceiptFilestoreId;
  //     if (!fileStoreId) {
  //       let response = await Digit.PaymentService.generatePdf(tenantId, { challan: { ...application, location } }, "challan-notice");
  //       fileStoreId = response?.filestoreIds[0];
  //     }
  //     const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: fileStoreId });
  //     window.open(fileStore[fileStoreId], "_blank");
  //   } finally {
  //     setChbPermissionLoading(false);
  //   }
  // };

  const { data: storeData } = Digit.Hooks.useStore.getInitData();

  const { tenants } = storeData || {};

  const downloadTLcertificate = async () => {
    const TLcertificatefile = await Digit.PaymentService.generatePdf(tenantId, { Licenses: application }, "tlcertificate");
    const receiptFile = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: TLcertificatefile.filestoreIds[0] });
    window.open(receiptFile[TLcertificatefile.filestoreIds[0]], "_blank");
  };

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === application[0]?.tenantId);
    let res = application[0];
    const data = getPDFData({ ...res }, tenantInfo, t);
    data.then((ress) => Digit.Utils.pdf.generate(ress));
  };

  return (
    <div>
      <Card>
        <Banner
          message={t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_LOGO_HEADER")}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_LOGO_HEADER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        <div className="primary-label-btn d-grid" onClick={chbPermissionLoading ? undefined : handleDownloadPdf}>
          {chbPermissionLoading ? (
            <Loader />
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
              </svg>
              {t("CS_COMMON_DOWNLOAD_APPLICATION")}
            </>
          )}
        </div>
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
        </ActionBar>
      </Card>
      {showToast && <Toast error={error} label={getLable} isDleteBtn={true} onClose={closeToast} />}
    </div>
  );
};
export default TLResponseCitizen;
