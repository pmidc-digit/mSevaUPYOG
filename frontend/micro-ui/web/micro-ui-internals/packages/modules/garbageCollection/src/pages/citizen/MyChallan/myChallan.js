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
  const [filters, setFilters] = useState(null);
  const [getCount, setCount] = useState();

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
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      setCount(responseData?.TotalCount);
      setChallanData(responseData?.GarbageConnection);
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (filters) fetchChallans();
  }, [filters]);

  const handleMakePayment = (id) => {
    history.push(`/digit-ui/citizen/payment/collect/GC.ONE_TIME_FEE/${id}/${tenantId}?tenantId=${tenantId}`);
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      // offset: prev.offset + 5, // 🔹 Add 5 more each click
      limit: Number(prev.limit) + 5, // Load next 5 items only
    }));
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
              <KeyNote keyValue={t("GC_APPLICATION_NO")} note={bill?.applicationNo || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(bill.applicationStatus)} />
              <KeyNote keyValue={t("GC_CONNECTION_TYPE")} note={t(`${bill.connectionCategory || t("CS_NA")}`)} />
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                {
                  <Link to={`/digit-ui/citizen/garbagecollection/application/${bill?.applicationNo}/${bill?.tenantId}`}>
                    <SubmitBar label={t("CS_VIEW_DETAILS")} />
                  </Link>
                }
                {bill.applicationStatus == "PENDING_FOR_PAYMENT" && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(bill?.applicationNo)} />
                )}
              </div>
            </Card>
          );
        })}

        {getChallanData?.length === 0 && !loader && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("CHB_NO_APPLICATION_FOUND_MSG")}</p>}

        {getChallanData?.length !== 0 && getCount > t1 && (
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
