import { Card, Header, KeyNote, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MyApplications = ({ view }) => {
  const { t } = useTranslation();
  const userInfo = Digit.UserService.getUser()?.info || {};
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const itemsPerPage = 5;

  const { isLoading, data } = Digit.Hooks.ndc.useSearchApplication({ mobileNumber: userInfo.mobileNumber }, tenantId);

  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return <Loader />;
  }

  const applicationsList = data?.data || [];
  const totalPages = Math.ceil(applicationsList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = applicationsList.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <React.Fragment>
      <Header>{t("TL_MY_APPLICATIONS_HEADER")}</Header>

      {currentApplications.map((application, index) => {
        const filteredApplication = Object.fromEntries(Object.entries(application).filter(([key]) => key !== "Applications"));

        return (
          <div key={`card-${index}`}>
            <Card>
              {Object.keys(filteredApplication)
                .filter((key) => filteredApplication[key] !== null)
                .map((item) => (
                  <KeyNote keyValue={t(item)} note={t(filteredApplication[item])} />
                ))}

              {application?.Applications?.applicationStatus !== "PENDINGPAYMENT" && (
                <Link to={`/digit-ui/citizen/ndc/search/application-overview/${application?.Applications?.applicationNo}`}>
                  <SubmitBar label={t("CS_VIEW_DETAILS")} />
                </Link>
              )}

              {application?.Applications?.applicationStatus === "PENDINGPAYMENT" && (
                <Link to={`/digit-ui/citizen/payment/collect/NDC/${application?.Applications?.applicationNo}/${tenantId}?tenantId=${tenantId}`}>
                  <div style={{ marginTop: "10px" }}>
                    <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} />
                  </div>
                </Link>
              )}
            </Card>
          </div>
        );
      })}

      {!applicationsList.length && <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("PTR_NO_APPLICATION_FOUND_MSG")}</p>}

      {/* Pagination Controls */}
      {applicationsList.length > itemsPerPage && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            style={{ cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            &#8592; Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            style={{ cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            Next &#8594;
          </button>
        </div>
      )}

      <p style={{ marginLeft: "16px", marginTop: "16px" }}>
        {t("PTR_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
        <span className="link" style={{ display: "block" }}>
          <Link to="/digit-ui/citizen/ndc/new-application">{t("NDC_COMMON_CLICK_HERE_TO_REGISTER_NEW_APPLICATION")}</Link>
        </span>
      </p>
    </React.Fragment>
  );
};

export default MyApplications;
