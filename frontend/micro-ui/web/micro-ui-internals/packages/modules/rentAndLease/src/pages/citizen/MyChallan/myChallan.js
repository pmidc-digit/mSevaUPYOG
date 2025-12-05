import React, { useState, useEffect } from "react";
import { Header, ResponseComposer, Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import Axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../../../components/Loader";

const MyChallanResult = ({ template, header, actionButtonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();


  console.log("copming here",getChallanData);

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.rentAndLease.search({ tenantId, filters });
      console.log("result", responseData);
      setChallanData(responseData?.challans);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    const filters = {};
    filters.mobileNumber = userInfo?.info?.mobileNumber;
    fetchChallans(filters);
  }, []);

  const onSubmit = (data) => {
    history.push(`/digit-ui/citizen/payment/my-bills/${data?.businesService}/${data?.ChannelNo}?workflow=mcollect`);
  };

  const payment = {};

  function getBillingPeriod(fromPeriod, toPeriod) {
    if (fromPeriod && toPeriod) {
      let from =
        new Date(fromPeriod).getDate() +
        " " +
        Digit.Utils.date.monthNames[new Date(fromPeriod).getMonth()] +
        " " +
        new Date(fromPeriod).getFullYear();
      let to =
        new Date(toPeriod).getDate() + " " + Digit.Utils.date.monthNames[new Date(toPeriod).getMonth()] + " " + new Date(toPeriod).getFullYear();
      return from + " - " + to;
    } else return "N/A";
  }

  /* paymentDetails?.data?.Bill?.forEach((element) => {
    if (element?.consumerCode) {
      payment[element?.consumerCode] = {
        total_due: element?.totalAmount,
        bil_due__date: new Date(element?.billDate).toDateString(),
      };
    }
  }); */

  // const searchResults = getChallanData?.map((bill) => {
  //   return {
  //     businesService: bill?.businessService,
  //     total_due: bill?.amount ? bill?.amount : 0,
  //     OwnerName: bill.citizen?.name || t("CS_NA"),
  //     status: bill.applicationStatus,
  //     // BillingPeriod: getBillingPeriod(bill.billDetails[0].fromPeriod, bill.billDetails[0].toPeriod),
  //     //bil_due__date: bill.billDetails[0].expiryDate || 0,
  //     // bil_due__date: `${
  //     //   new Date(bill.billDetails[0].expiryDate).getDate().toString() +
  //     //   "/" +
  //     //   (new Date(bill.billDetails[0].expiryDate).getMonth() + 1).toString() +
  //     //   "/" +
  //     //   new Date(bill.billDetails[0].expiryDate).getFullYear().toString()
  //     // }`,
  //     ChannelNo: bill?.challanNo || t("CS_NA"),
  //     // ServiceCategory: bill.businessService ? bill.businessService.split(".")[bill.businessService.split(".").length - 1] : t("CS_NA"),
  //   };
  // });

  const handleMakePayment = (id) => {
    history.push(`/digit-ui/citizen/payment/collect/Challan_Generation/${id}/${tenantId}?tenantId=${tenantId}`);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div>
        {header && (
          <Header style={{ marginLeft: "8px" }}>
            {t(header)} ({getChallanData?.length})
          </Header>
        )}

        {getChallanData?.map((bill, index) => {
          return (
            <Card key={index}>
              <KeyNote keyValue={t("CHALLAN_AMOUNT")} note={bill?.amount ? bill?.amount?.[0]?.amount : 0} />
              <KeyNote keyValue={t("UC_CHALLAN_NO")} note={bill?.challanNo || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(bill.applicationStatus)} />
              <KeyNote keyValue={t("UC_OWNER_NAME_LABEL")} note={t(`${bill.citizen?.name || t("CS_NA")}`)} />
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                {
                  <Link to={`/digit-ui/citizen/rentandlease/property/${bill?.challanNo}/${bill?.tenantId}`}>
                    <SubmitBar
                      label={t("CS_VIEW_DETAILS")}
                      //  label={CS_VIEW_DETAILS}
                    />
                  </Link>
                }
                {bill.applicationStatus == "ACTIVE" && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(bill?.challanNo)} />
                )}
              </div>
            </Card>
          );
        })}

        {/* <div>
          <ResponseComposer data={searchResults} template={template} actionButtonLabel={actionButtonLabel} onSubmit={onSubmit} />
        </div> */}
      </div>

      {/* <div style={{ marginLeft: "16px", marginTop: "16px", marginBottom: "46px" }}>
        <p>{t("CHALLAN_NOT_ABLE_TO_FIND_BILL_MSG")} </p>
        <p className="link">
          <Link to="/digit-ui/citizen/mcollect/search">{t("UC_CLICK_HERE_TO_SEARCH_LINK")}</Link>
        </p>
      </div> */}
      {loader && <Loader page={true} />}
    </div>
  );
};

MyChallanResult.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string,
};

MyChallanResult.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null,
};

export default MyChallanResult;
