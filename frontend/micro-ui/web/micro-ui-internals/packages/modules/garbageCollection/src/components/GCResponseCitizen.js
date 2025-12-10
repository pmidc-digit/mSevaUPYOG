import { Banner, Card, CardText, ActionBar, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { ChallanData,getAcknowledgementData } from "../utils";
import { Loader } from "./Loader";

const GCResponseCitizen = (props) => {
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

  // const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  // const pathname = window?.location?.pathname || "";
  // const afterApplication = pathname?.split("/response/")[1];
  // const parts = afterApplication?.split("/");

  // const applicationNumber = parts.slice(0, 4).join("/");

  const pathname = history?.location?.pathname || "";
  const applicationNumber = pathname?.split("/").pop(); // ✅ Extracts the last segment

  let challanEmpData = ChallanData(tenantId, applicationNumber);

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      console.log("search ", responseData);
      setChallanData(responseData?.GarbageConnection?.[0]);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };
  const getAcknowledgement = async () => {
      const applications = getChallanData;
      console.log('applications for garbage', applications)
      const tenantInfo = tenants.find((tenant) => tenant.code === applications.tenantId);
      const acknowldgementDataAPI = await getAcknowledgementData({ ...applications }, tenantInfo, t);
      Digit.Utils.pdf.generate(acknowldgementDataAPI);
  };
  

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (applicationNumber) {
      const filters = {};
      filters.challanNo = applicationNumber;
      fetchChallans(filters);
    }
  }, []);

  const onSubmit = () => {
    if (isCitizen) history.push(`/digit-ui/citizen`);
    else history.push(`/digit-ui/employee`);
  };

  

  const handlePayment = () => {
    // return;
    history.push(`/digit-ui/employee/payment/collect/Challan_Generation/${applicationNumber}/${tenantId}?tenantId=${tenantId}`);
    // pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
  };

  //  /digit-ui/employee/payment/collect/TL/PB-TL-2025-07-07-227598/pb.testing

  return (
    <div>
      <Card>
        <Banner
          // message={t(`NDC_${stringReplaceAll(nocData?.nocType, ".", "_")}_${stringReplaceAll(nocData?.applicationStatus, ".", "_")}_HEADER`)}
          // message={"Community Hall Booking Application Submitted Successfully"}
          message={t("GC_APPLICATION_CREATED")}
          applicationNumber={applicationNumber}
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
        <div className="primary-label-btn d-grid" onClick={getAcknowledgement}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
          {t("CHB_DOWNLOAD_ACK_FORM")}
        </div>
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
      {showToast && <Toast error={error} label={getLable} isDleteBtn={true} onClose={closeToast} />}
    </div>
  );
};
export default GCResponseCitizen;
