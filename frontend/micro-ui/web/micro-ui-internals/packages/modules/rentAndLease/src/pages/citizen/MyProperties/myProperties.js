import React, { useState, useEffect } from "react";
import { Header, ResponseComposer, Card, KeyNote, SubmitBar } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import { Loader } from "../../../components/Loader";
import { Loader } from "../../../../../challanGeneration/src/components/Loader";

const MyProperties = ({ template, header, actionButtonLabel }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const userInfo = Digit.UserService.getUser();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const [loader, setLoader] = useState(false);
  const [getPropertiesData, setPropertiesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState({
    limit: 5,
    offset: 0,
    mobileNumber: userInfo?.info?.mobileNumber,
  });

  const fetchProperties = async () => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      if (responseData?.AllotmentDetails) {
        setPropertiesData((prev) => [...prev, ...responseData.AllotmentDetails]);
        setTotalCount(responseData?.totalCount || responseData.AllotmentDetails.length);

        if (!responseData?.totalCount) {
          setHasMore(responseData.AllotmentDetails.length === filters.limit);
        } else {
          setHasMore(false);
        }
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchProperties();
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

  // const handleDisConnection = async (data) => {
  //   setLoader(true);
  //   const payload = {
  //     AllotmentDetails: {
  //       ...data,
  //       applicationType: "DISCONNECT_RENT_AND_LEASE_CONNECTION",
  //       processInstance: {
  //         ...data?.processInstance,
  //         action: "INITIATE",
  //       },
  //     },
  //     disconnectRequest: true,
  //   };

  //   try {
  //     const response = await Digit.RentAndLeaseService.create(payload);
  //     updateApplication(response?.AllotmentDetails[0]);
  //   } catch (error) {
  //     setLoader(false);
  //   }
  // };

  // const updateApplication = async (response) => {
  //   const payload = {
  //     AllotmentDetails: {
  //       ...response,
  //       processInstance: {
  //         ...response?.processInstance,
  //         action: "SUBMIT_APPLICATION",
  //       },
  //     },
  //   };
  //   try {
  //     await Digit.RentAndLeaseService.update(payload);
  //     await fetchProperties();
  //     setLoader(false);
  //   } catch (error) {
  //     setLoader(false);
  //   }
  // };

  return (
    <div style={{ marginTop: "16px" }}>
      <div>
        {header && (
          <Header style={{ marginLeft: "8px" }}>
            {t(header)} ({totalCount})
          </Header>
        )}

        {getPropertiesData?.map((property, index) => {
          return (
            <Card key={index}>
              <KeyNote keyValue={t("RAL_APPLICATION_NUMBER")} note={property?.applicationNumber || t("CS_NA")} />
              <KeyNote keyValue={t("RAL_ALLOTMENT_TYPE")} note={property?.additionalDetails?.allotmentType || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(property.status)} />
              {/* <KeyNote
                keyValue={t("UC_OWNER_NAME_LABEL")}
                note={
                  property?.OwnerInfo && property?.OwnerInfo.length > 0 ? property?.OwnerInfo.map((o) => o.name || t("CS_NA")).join(", ") : t("CS_NA")
                }
              /> */}
              <KeyNote keyValue={t("RENT_LEASE_PROPERTY_NAME")} note={property?.additionalDetails?.propertyName || t("CS_NA")} />

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                {
                  <Link to={`/digit-ui/citizen/rentandlease/property/${property?.applicationNumber}/${property?.tenantId}`}>
                    <SubmitBar label={t("CS_VIEW_DETAILS")} />
                  </Link>
                }
                {(property?.status == "PENDINGPAYMENT" ||
                  property?.status == "PENDING_FOR_PAYMENT" ||
                  property?.status == "PENDING_FOT_SETLEMENT") && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(property?.applicationNumber)} />
                )}
                {/* {property?.status == "APPROVED" && <SubmitBar label={t("RAL_END_TENANCY")} onSubmit={() => handleDisConnection(property)} />} */}
              </div>
            </Card>
          );
        })}

        {getPropertiesData?.length === 0 && !loader && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("RAL_NO_APPLICATION_FOUND_MSG")}</p>}

        {(getPropertiesData?.length < totalCount || hasMore) && (
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
