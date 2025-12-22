import React, { useState, useEffect } from "react";
import { Header } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import ChbApplication from "./chb-application";
import { Loader } from "../../../components/Loader";

export const CHBMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("CITIZEN.CITY");
  const [filters, setFilters] = useState(null);

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

  // Use the search hook with dynamic filters
  const { isLoading, data, refetch } = Digit.Hooks.chb.useChbSearch({ filters });

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      // offset: prev.offset + 5, // 🔹 Add 5 more each click
      limit: Number(prev.limit) + 5, // Load next 5 items only
    }));
  };

  useEffect(() => {
    refetch();
  }, []);

  const filteredApplications = data?.hallsBookingApplication || [];

  return (
    <React.Fragment>
      <Header>{`${t("CHB_MY_APPLICATION_HEADER")} (${filteredApplications.length})`}</Header>
      <div>
        {filteredApplications?.length > 0 &&
          filteredApplications?.map((application, index) => (
            <div key={index}>
              <ChbApplication refetch={refetch} application={application} tenantId={tenantId} buttonLabel={t("CHB_SUMMARY")} />
            </div>
          ))}
        {filteredApplications?.length === 0 && !isLoading && (
          <p style={{ marginLeft: "16px", marginTop: "16px" }}>{t("CHB_NO_APPLICATION_FOUND_MSG")}</p>
        )}

        {filteredApplications?.length !== 0 && data?.count > t1 && (
          <div style={{ marginLeft: "16px", marginTop: "16px" }}>
            <span className="link" style={{ cursor: "pointer", color: "#007bff" }} onClick={handleLoadMore}>
              {t("CHB_LOAD_MORE_MSG")}
            </span>
          </div>
        )}
        {isLoading && <Loader page={true} />}
      </div>
    </React.Fragment>
  );
};
