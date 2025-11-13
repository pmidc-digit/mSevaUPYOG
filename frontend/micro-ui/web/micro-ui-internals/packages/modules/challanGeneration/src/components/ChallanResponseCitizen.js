import { Banner, Card, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Loader } from "./Loader";

const ChallanResponseCitizen = (props) => {
  const { state } = props.location;
  const { t } = useTranslation();
  const history = useHistory();
  const nocData = state?.data?.Noc?.[0];
  const isCitizen = window.location.href.includes("citizen");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();

  const pathname = history?.location?.pathname || "";
  const ndcCode = pathname.split("/").pop(); // ✅ Extracts the last segment

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.ChallanGenerationService.search({ tenantId, filters });
      console.log("search ", responseData);
      setChallanData(responseData?.challans?.[0]);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
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

  const payLater = async () => {
    setLoader(true);
    console.log("pay later", getChallanData);

    const payload = {
      Challan: {
        ...getChallanData,
        workflow: {
          action: "PAY_LATER",
        },
      },
    };

    try {
      const response = await Digit.ChallanGenerationService.update(payload);
      setLoader(false);
      history.push(`/digit-ui/employee/challangeneration/inbox`);
    } catch (error) {
      setLoader(false);
    }
  };

  const handlePayment = () => {
    history.push(`/digit-ui/employee/payment/collect/Challan_Generation/${ndcCode}/${tenantId}?tenantId=${tenantId}`);
  };

  return (
    <div>
      <Card>
        <Banner
          message={t("CHALLAN_APPLICATION_CREATED")}
          applicationNumber={ndcCode}
          info={nocData?.applicationStatus == "REJECTED" ? "" : t(`CHALLAN_NUMBER`)}
          successful={nocData?.applicationStatus == "REJECTED" ? false : true}
          style={{ padding: "10px" }}
          headerStyles={{ fontSize: "32px", wordBreak: "break-word" }}
        />
        <ActionBar style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: " 20px" }}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onSubmit={onSubmit} />
          <SubmitBar label={t("CHALLAN_PAY_LATER")} onSubmit={payLater} />
          <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={handlePayment} />
        </ActionBar>
      </Card>
      {loader && <Loader page={true} />}
    </div>
  );
};
export default ChallanResponseCitizen;
