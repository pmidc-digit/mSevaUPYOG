import React, { useState, useEffect, useMemo } from "react";
import { Header, Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "../../../components/Loader";

const MyChallanResult = ({ template, header, actionButtonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState([]);
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

  const handleDiscontinue = async (data) => {
    setLoader(true);
    const payload = {
      GarbageConnection: {
        ...data,
        applicationType: "DISCONNECT_GARBAGE_CONNECTION",
        processInstance: {
          ...data?.processInstance,
          action: "INITIATE",
        },
      },
      disconnectRequest: true,
    };

    try {
      const response = await Digit.GCService.create(payload);
      updateApplication(response?.GarbageConnection[0]);
      // setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  const updateApplication = async (response) => {
    // return;
    // setLoader(true);
    const payload = {
      GarbageConnection: {
        ...response,
        processInstance: {
          ...response?.processInstance,
          action: "SUBMIT_APPLICATION",
        },
      },
    };
    try {
      const response = await Digit.GCService.update(payload);
      await fetchChallans();
      // setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  // ✅ COUNT HOW MANY TIMES EACH connectionNo APPEARS
  const connectionCountMap = useMemo(() => {
    const map = {};
    getChallanData?.forEach((item) => {
      if (item?.connectionNo) {
        map[item.connectionNo] = (map[item.connectionNo] || 0) + 1;
      }
    });
    return map;
  }, [getChallanData]);

  return (
    <div className="gc-style-d265a6b9b9">
      <div>
        {header && (
          <Header className="gc-style-c937f3b834">
            {t(header)} ({getChallanData?.length})
          </Header>
        )}

        {getChallanData?.map((bill, index) => {
          const connectionCount = connectionCountMap[bill?.connectionNo] || 0;
          const showDiscontinueButton = bill.applicationStatus === "CONNECTION_ACTIVATED" && connectionCount === 1; // ✅ ONLY IF UNIQUE
          return (
            <Card key={index}>
              <KeyNote keyValue={t("GC_APPLICATION_NO")} note={bill?.applicationNo || t("CS_NA")} />
              {bill?.connectionNo && <KeyNote keyValue={t("GC_CONNECTION_NO")} note={bill?.connectionNo || t("CS_NA")} />}
              <KeyNote keyValue={t("APPLICATION_STATUS")} note={t(bill.applicationStatus)} />
              <KeyNote keyValue={t("STATUS")} note={t(bill.status)} />
              <KeyNote keyValue={t("GC_CONNECTION_TYPE")} note={t(`${bill.connectionCategory || t("CS_NA")}`)} />
              <div
                className="gc-style-0b9a47eb61"
              >
                {
                  <Link to={`/digit-ui/citizen/garbagecollection/application/${bill?.applicationNo}/${bill?.tenantId}`}>
                    <SubmitBar label={t("CS_VIEW_DETAILS")} />
                  </Link>
                }

                {(bill.applicationStatus == "PENDING_FOR_CITIZEN_ACTION" || bill.applicationStatus == "INITIATED") && (
                  <SubmitBar
                    label={t("WF_GC_EDIT")}
                    onSubmit={() => {
                      history.push(`/digit-ui/citizen/garbagecollection/create-application/${bill?.applicationNo}`);
                      //  handleEdit(bill?.applicationNo)
                    }}
                  />
                )}

                {/* ✅ SHOW ONLY ONCE PER UNIQUE connectionNo */}
                {showDiscontinueButton && (
                  <SubmitBar
                    className="gc-style-ec060bac5e"
                    label={t("GC_DISCONTINUE_SERVICE")}
                    onSubmit={() => handleDiscontinue(bill)}
                    disabled={loader}
                  />
                )}

                {bill.applicationStatus == "PENDING_FOR_PAYMENT" && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(bill?.applicationNo)} />
                )}
              </div>
            </Card>
          );
        })}

        {getChallanData?.length === 0 && !loader && <p className="gc-style-eda36bf913">{t("CHB_NO_APPLICATION_FOUND_MSG")}</p>}

        {getChallanData?.length !== 0 && getCount > t1 && (
          <div className="gc-style-eda36bf913">
            <span className="link gc-style-029f4a9edb"  onClick={handleLoadMore}>
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
