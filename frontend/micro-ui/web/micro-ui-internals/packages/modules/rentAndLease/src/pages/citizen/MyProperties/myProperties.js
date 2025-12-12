import React, { useState, useEffect } from "react";
import { Header, ResponseComposer, Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import Axios from "axios";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../../../components/Loader";

const MyProperties = ({ template, header, actionButtonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    limit: 5,
    offset: 0,
    mobileNumber: userInfo?.info?.mobileNumber,
  });

  const fetchChallans = async () => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      if (responseData?.AllotmentDetails) {
        setChallanData((prev) => [...prev, ...responseData.AllotmentDetails]);
        setTotalCount(responseData?.totalCount || responseData.AllotmentDetails.length);

        if (!responseData?.totalCount) {
          setHasMore(responseData.AllotmentDetails.length === filters.limit);
        } else {
          setHasMore(false);
        }
      }
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [filters.offset]);

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handleMakePayment = (id) => {
    history.push(`/digit-ui/citizen/payment/collect/rl-services/${id}/${tenantId}?tenantId=${tenantId}`);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div>
        {header && (
          <Header style={{ marginLeft: "8px" }}>
            {t(header)} ({totalCount})
          </Header>
        )}

        {getChallanData?.map((bill, index) => {
          return (
            <Card key={index}>
              <KeyNote keyValue={t("RAL_APPLICATION_NUMBER")} note={bill?.applicationNumber || t("CS_NA")} />
              <KeyNote keyValue={t("RAL_ALLOTMENT_TYPE")} note={bill?.additionalDetails?.allotmentType || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(bill.status)} />
              <KeyNote
                keyValue={t("UC_OWNER_NAME_LABEL")}
                note={bill?.OwnerInfo && bill?.OwnerInfo.length > 0 ? bill?.OwnerInfo.map((o) => o.name || t("CS_NA")).join(", ") : t("CS_NA")}
              />

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                {
                  <Link to={`/digit-ui/citizen/rentandlease/property/${bill?.applicationNumber}/${bill?.tenantId}`}>
                    <SubmitBar label={t("CS_VIEW_DETAILS")} />
                  </Link>
                }
                {bill?.status == "PENDINGPAYMENT" && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(bill?.applicationNumber)} />
                )}
              </div>
            </Card>
          );
        })}

        {getChallanData?.length === 0 && !loader && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("RAL_NO_APPLICATION_FOUND_MSG")}</p>}

        {(getChallanData?.length < totalCount || hasMore) && (
          <div style={{ marginLeft: "16px", marginTop: "16px" }}>
            <span className="link" style={{ cursor: "pointer", color: "#007bff", fontWeight: "bold" }} onClick={handleLoadMore}>
              {t("CHB_LOAD_MORE_MSG")}
            </span>
          </div>
        )}
      </div>
      {loader && <Loader page={true} />}
    </div>
  );
};

MyProperties.propTypes = {
  template: PropTypes.any,
  header: PropTypes.string,
  actionButtonLabel: PropTypes.string,
};

MyProperties.defaultProps = {
  template: [],
  header: null,
  actionButtonLabel: null,
};

export default MyProperties;
