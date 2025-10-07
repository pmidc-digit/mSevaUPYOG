import React, { Fragment, useState, useEffect } from "react";
import { Header, Loader, Card } from "@mseva/digit-ui-react-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdsApplication from "./ads-application";

// Simplified ADSMyApplications: NO search fields, behaves like PTR module and lists all user bookings.
export const ADSMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = "pb.testing";
  const user = Digit.UserService.getUser().info;

  const [filters, setFilters] = useState(null);

  // pagination param from URL (keeps your existing behavior)
  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  // Make initial filters user-scoped (like PTR) and ensure both branches include mobileNumber
  let initialFilters = !isNaN(parseInt(filter))
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId }
    : { limit: "4", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId };

  useEffect(() => {
    setFilters(initialFilters);
  }, [filter]);

  // Use the search hook with stable filters (no UI for searching)
  const { isLoading, data } = Digit.Hooks.ads.useADSSearch({ filters });

  if (isLoading) return <Loader />;

  const applications = data?.bookingApplication || [];

  return (
    <>
      <Header>{`${t("ADS_MY_BOOKINGS_HEADER")} ${applications ? `(${applications.length})` : ""}`}</Header>

      <div>
        {applications?.length > 0 &&
          applications.map((application, index) => (
            <div key={index}>
              <AdsApplication application={application} tenantId={tenantId} buttonLabel={t("ADS_SUMMARY")} />
            </div>
          ))}

        {!applications?.length > 0 && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("ADS_NO_APPLICATION_FOUND_MSG")}</p>}

        {applications?.length !== 0 && data?.count > t1 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">
                <Link to={`/digit-ui/citizen/ads/myBookings/${t1}`}>{t("ADS_LOAD_MORE_MSG")}</Link>
              </span>
            </p>
          </div>
        )}
      </div>

      <div style={{ marginLeft: "16px", marginTop: "16px" }}>
        <Link to="/digit-ui/citizen/ads/bookad/searchads">
          <button style={{ borderRadius: "30px", padding: "8px 16px" }}>{t("ADS_NEW_BOOKING") + " +"}</button>
        </Link>
      </div>
    </>
  );
};

export default ADSMyApplications;
