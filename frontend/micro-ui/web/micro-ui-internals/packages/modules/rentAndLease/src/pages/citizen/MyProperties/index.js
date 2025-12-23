// import React, { useMemo } from "react";
// import { useTranslation } from "react-i18next";
// import { Route, Switch, useRouteMatch } from "react-router-dom";
// import { config } from "./config";
// import MyPropertiesResultsComponent from "./myProperties";

// const MyChallans = () => {
//   const { t } = useTranslation();
//   const { path } = useRouteMatch();

//   const params = useMemo(() =>
//     config.map(
//       (step) => {
//         const texts = {};
//         for (const key in step.texts) {
//           texts[key] = t(step.texts[key]);
//         }
//         return { ...step, texts };
//       },
//       [config]
//     )
//   );

//   return (
//     <Switch>
//       <Route path={`${path}`} exact>
//         <MyPropertiesResultsComponent
//           template={params[0].labels}
//           header={params[0].texts.header}
//           actionButtonLabel={params[0].texts.actionButtonLabel}
//           t={t}
//         />
//       </Route>
//     </Switch>
//   );
// };

// export default MyChallans;

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
              <KeyNote keyValue={t("RAL_ALLOTMENT_TYPE")} note={property?.additionalDetails?.allotmentType || t("CS_NA")} />
              <KeyNote keyValue={t("STATUS")} note={t(property.status)} />
              {/* <KeyNote
                keyValue={t("UC_OWNER_NAME_LABEL")}
                note={
                  property?.OwnerInfo && property?.OwnerInfo.length > 0 ? property?.OwnerInfo.map((o) => o.name || t("CS_NA")).join(", ") : t("CS_NA")
                }
              /> */}
              <KeyNote keyValue={t("RENT_LEASE_PROPERTY_NAME")} note={property?.additionalDetails?.propertyName || t("CS_NA")} />

              <div className="ral-my-properties-actions">
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
