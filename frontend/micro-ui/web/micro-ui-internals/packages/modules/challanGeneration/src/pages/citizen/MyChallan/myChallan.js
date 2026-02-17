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
  const [filters, setFilters] = useState(null);
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let initialFilters = !isNaN(parseInt(filter))
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId }
    : { limit: "10", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId };

  useEffect(() => {
    setFilters(initialFilters);
  }, [filter, tenantId]);

  const fetchChallans = async () => {
    console.log("filters", filters);
    setLoader(true);
    try {
      const responseData = await Digit.ChallanGenerationService.search({ tenantId, filters });
      console.log("result", responseData);
      setChallanData(responseData);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    // const filters = {};
    console.log("filters", filters);
    if (filters) fetchChallans();
    // filters.mobileNumber = userInfo?.info?.mobileNumber;
  }, [filters]);

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      // offset: prev.offset + 5, // 🔹 Add 5 more each click
      limit: Number(prev.limit) + 5, // Load next 5 items only
    }));
  };

  const handleMakePayment = (id) => {
    history.push(`/digit-ui/citizen/payment/collect/Challan_Generation/${id}/${tenantId}?tenantId=${tenantId}`);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div>
        {header && (
          <Header style={{ marginLeft: "8px" }}>
            {t(header)} ({getChallanData?.challans?.length})
          </Header>
        )}

        {getChallanData?.challans?.map((bill, index) => {
          const checkAmount = Math.max(bill?.amount?.[0]?.amount || 0, bill?.challanAmount || 0);
          const total = checkAmount ?? 0;
          const waiver = bill?.feeWaiver ?? 0;
          const finalAmount = total - waiver;
          return (
            <Card key={index}>
              <KeyNote keyValue={t("CHALLAN_AMOUNT")} note={finalAmount} />
              <KeyNote keyValue={t("UC_CHALLAN_NO")} note={bill?.challanNo || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(bill.challanStatus)} />
              <KeyNote keyValue={t("UC_OWNER_NAME_LABEL")} note={t(`${bill.citizen?.name || t("CS_NA")}`)} />
              <div className="action-button-myapplication"
                
              >
                {
                  <Link to={`/digit-ui/citizen/challangeneration/application/${bill?.challanNo}/${bill?.tenantId}`}>
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

        {getChallanData?.challans?.length === 0 && !loader && (
          <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("CHB_NO_APPLICATION_FOUND_MSG")}</p>
        )}

        {getChallanData?.challans?.length !== 0 && getChallanData?.totalCount > t1 && (
          <div style={{ marginLeft: "16px", marginTop: "16px" }}>
            <span className="link" style={{ cursor: "pointer", color: "#007bff" }} onClick={handleLoadMore}>
              {t("CHB_LOAD_MORE_MSG")}
            </span>
          </div>
        )}
      </div>
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
