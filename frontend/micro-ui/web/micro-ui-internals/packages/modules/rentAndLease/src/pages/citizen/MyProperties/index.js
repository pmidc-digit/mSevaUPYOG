import React, { useState, useEffect } from "react";
import { Header, ResponseComposer, Card, KeyNote, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import PropTypes from "prop-types";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showToast, setShowToast] = useState(null);

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

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  const handleMakePayment = (id) => {
    history.push(`/digit-ui/citizen/payment/my-bills/rl-services/${id}/${tenantId}?tenantId=${tenantId}`);
    // history.push(`/digit-ui/citizen/payment/collect/rl-services/${id}/${tenantId}?tenantId=${tenantId}`);
  };

  // handleRenewal for later use case(don't remove it)
  // const handleRenewal = async (data) => {
  //   setLoader(true);
  //   const oldStart = new Date(data?.startDate);
  //   const oldEnd = new Date(data?.endDate);
  //   const duration = oldEnd - oldStart;

  //   const newStart = new Date(oldEnd);
  //   const newEnd = new Date(newStart.getTime() + duration);

  //   const sanitizedOwners = data?.OwnerInfo?.map(({ ownerId, ...rest }) => rest);

  //   const payload = {
  //     AllotmentDetails: {
  //       tenantId: data?.tenantId,
  //       propertyId: data?.propertyId,
  //       previousApplicationNumber: data?.applicationNumber,
  //       OwnerInfo: sanitizedOwners,
  //       tradeLicenseNumber: data?.tradeLicenseNumber,
  //       additionalDetails: data?.additionalDetails,
  //       startDate: newStart.getTime(),
  //       endDate: newEnd.getTime(),
  //       workflow: {
  //         action: "INITIATE",
  //       },
  //       Document: null,
  //     },
  //   };

  //   try {
  //     const response = await Digit.RentAndLeaseService.create(payload);
  //     await updateApplication(response?.AllotmentDetails, data);
  //   } catch (error) {
  //     setLoader(false);
  //     setShowToast({ key: true, label: "Error creating renewal application" });
  //   }
  // };

  // const updateApplication = async (response, originalData) => {
  //   const sanitizedDocuments = originalData?.Document?.map(({ docId, id, ...rest }) => rest);

  //   const payload = {
  //     AllotmentDetails: {
  //       ...response,
  //       Document: sanitizedDocuments,
  //       workflow: {
  //         action: "APPLY",
  //       },
  //     },
  //   };
  //   try {
  //     await Digit.RentAndLeaseService.update(payload);
  //     setShowToast({ key: false, label: "Renewal application submitted successfully" });
  //     setPropertiesData([]);
  //     setFilters((prev) => ({ ...prev, offset: 0 }));
  //     fetchProperties();
  //   } catch (error) {
  //     setShowToast({ key: true, label: "Error updating renewal application" });
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  const submitAction = async (action, property) => {
    const updatedApplicant = {
      ...property,
      workflow: {
        action: action,
        assignes: [],
        comments: "",
        documents: null,
      },
    };

    const finalPayload = {
      AllotmentDetails: [updatedApplicant],
    };
    try {
      setLoader(true);
      const response = await Digit.RentAndLeaseService.update(finalPayload);
      if (response?.ResponseInfo?.status == "successful") {
        setShowToast({ key: false, label: "Successfully updated the status" });
        setPropertiesData([]);
        setFilters((prev) => ({ ...prev, offset: 0 }));
        fetchProperties();
      }
    } catch (err) {
      setShowToast({ key: true, label: "Something went wrong" });
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="ral-my-properties-container">
      <div>
        {header && (
          <Header className="ral-my-properties-header">
            {t(header)} ({totalCount})
          </Header>
        )}

        {getPropertiesData?.map((property, index) => {
          return (
            <Card key={index}>
              {property?.registrationNumber && <KeyNote keyValue={t("RAL_REGISTRATION_NUMBER")} note={property?.registrationNumber || t("CS_NA")} />}
              <KeyNote keyValue={t("RAL_APPLICATION_NUMBER")} note={property?.applicationNumber || t("CS_NA")} />
              <KeyNote
                keyValue={t("RAL_ALLOTMENT_TYPE")}
                note={
                  (Array.isArray(property?.additionalDetails) ? property?.additionalDetails[0] : property?.additionalDetails)?.allotmentType ||
                  t("CS_NA")
                }
              />
              <KeyNote keyValue={t("STATUS")} note={t(property?.expireFlag ? "Renewed" : property.status)} />
              {/* <KeyNote
                keyValue={t("UC_OWNER_NAME_LABEL")}
                note={
                  property?.OwnerInfo && property?.OwnerInfo.length > 0 ? property?.OwnerInfo.map((o) => o.name || t("CS_NA")).join(", ") : t("CS_NA")
                }
              /> */}
              <KeyNote
                keyValue={t("RENT_LEASE_PROPERTY_NAME")}
                note={
                  (Array.isArray(property?.additionalDetails) ? property?.additionalDetails[0] : property?.additionalDetails)?.propertyName ||
                  t("CS_NA")
                }
              />

              <div className="ral-my-properties-actions">
                {
                  <Link to={`/digit-ui/citizen/rentandlease/property/${property?.applicationNumber}/${property?.tenantId}`}>
                    <SubmitBar label={t("CS_VIEW_DETAILS")} />
                  </Link>
                }
                {(property?.status == "PENDINGPAYMENT" ||
                  property?.status == "PENDING_FOR_PAYMENT" ||
                  ((property?.status == "PENDING_FOT_SETLEMENT" || property?.status == "FORWARD_FOT_SETLEMENT") &&
                    property?.amountToBeDeducted > 0 &&
                    property?.amountToBeRefund == 0)) && (
                  <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} onSubmit={() => handleMakePayment(property?.applicationNumber)} />
                )}
                {property?.status == "APPROVED" && !property?.expireFlag && (
                  <SubmitBar label={t("REQUEST_FOR_DISCONNECTION")} onSubmit={() => submitAction("REQUEST_FOR_DISCONNECTION", property)} />
                )}
                {/* {property?.status == "APPROVED" && Date.now() >= property?.endDate - 15 * 24 * 60 * 60 * 1000 && (
                  <SubmitBar label={t("RENEWAL")} onSubmit={() => handleRenewal(property)} />
                )} */}
              </div>
            </Card>
          );
        })}

        {getPropertiesData?.length === 0 && !loader && <p className="ral-my-properties-no-result">{t("RAL_NO_APPLICATION_FOUND_MSG")}</p>}

        {(getPropertiesData?.length < totalCount || hasMore) && (
          <div className="ral-my-properties-load-more">
            <span className="link ral-my-properties-load-more-link" onClick={handleLoadMore}>
              {t("CHB_LOAD_MORE_MSG")}
            </span>
          </div>
        )}
      </div>
      {loader && <Loader page={true} />}
      {showToast && <Toast error={showToast.key} label={t(showToast.label)} isDleteBtn={true} onClose={() => setShowToast(null)} />}
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
