import React, { Fragment, useState, useEffect } from "react";
import { Header, Loader, Card } from "@mseva/digit-ui-react-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdsApplication from "./ads-application";

// Simplified ADSMyApplications: NO search fields, behaves like PTR module and lists all user bookings.
export const ADSMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = localStorage.getItem("CITIZEN.CITY");
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
    ? { limit: "250", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId, mobileNumber: user?.mobileNumber }
    : { limit: "200", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId, mobileNumber: user?.mobileNumber };

  useEffect(() => {
    setFilters(initialFilters);
  }, [filter]);

  // Use the search hook with stable filters (no UI for searching)
  const { isLoading, data, refetch } = Digit.Hooks.ads.useADSSearch({ filters });
  const applications = data?.bookingApplication || [];

  useEffect(() => {
    refetch();
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);

  const itemsPerPage = 5;

  // Calculate slice indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applications?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const totalPages = Math.ceil((applications?.length || 0) / itemsPerPage);

  if (isLoading) return <Loader />;

  return (
    <>
      <Header>{`${t("ADS_MY_BOOKINGS_HEADER")} ${applications ? `(${applications.length})` : ""}`}</Header>

      <div>
        {currentItems?.length > 0 &&
          currentItems.map((application, index) => (
            <div key={index}>
              <AdsApplication application={application} tenantId={tenantId} buttonLabel={t("ADS_SUMMARY")} refetchBookings={refetch} />
            </div>
          ))}

        {!applications?.length > 0 && <p className="ads-applications-empty">{t("ADS_NO_APPLICATION_FOUND_MSG")}</p>}

        {/* {applications?.length !== 0 && data?.count > t1 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">
                <Link to={`/digit-ui/citizen/ads/myBookings/${t1}`}>{t("ADS_LOAD_MORE_MSG")}</Link>
              </span>
            </p>
          </div>
        )} */}

        {/* Pagination controls */}
        {applications?.length > itemsPerPage && (
          <div className="ads-pagination-controls">
            <button
              className={`ads-pagination-btn ${currentPage === 1 ? "ads-pagination-btn--disabled" : ""}`}
              disabled={currentPage === 1}
              onClick={() => {
                setLoadingPage(true);
                setTimeout(() => {
                  setCurrentPage((prev) => prev - 1);
                  setLoadingPage(false);
                }, 500);
              }}
            >
              &#8592;
            </button>

            <span className="ads-pagination-info">
              {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, applications.length)} of ${applications.length}`}
            </span>

            <button
              className={`ads-pagination-btn ${currentPage === totalPages ? "ads-pagination-btn--disabled" : ""}`}
              disabled={currentPage === totalPages}
              onClick={() => {
                setLoadingPage(true);
                setTimeout(() => {
                  setCurrentPage((prev) => prev + 1);
                  setLoadingPage(false);
                }, 500);
              }}
            >
              &#8594;
            </button>
          </div>
        )}
      </div>

      <div className="ads-new-booking">
        {t("PTR_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
        <Link to="/digit-ui/citizen/ads/bookad/searchads">
          <button className="ads-new-booking-btn">{t("ADS_NEW_BOOKING") + " +"}</button>
        </Link>
      </div>
    </>
  );
};

export default ADSMyApplications;
