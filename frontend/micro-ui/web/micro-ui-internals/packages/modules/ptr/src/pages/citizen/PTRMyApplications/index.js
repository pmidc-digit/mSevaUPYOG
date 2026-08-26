import { Header, Loader } from "@mseva/digit-ui-react-components";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PetApplication from "./pet-application";

export const PTRMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().info;

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let filter1 = !isNaN(parseInt(filter)) ?
  { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId } :
  { limit: "20", sortOrder: "ASC", sortBy: "createdTime", offset: "0", mobileNumber: user?.mobileNumber, tenantId };

  const { isLoading, isError, error, data } = Digit.Hooks.ptr.usePTRSearch({ tenantId, filters: filter1 }, {});

  const { PetRegistrationApplications: applicationsList } = data || {};
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);

  const itemsPerPage = 5;

  // Calculate slice indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applicationsList?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const totalPages = Math.ceil((applicationsList?.length || 0) / itemsPerPage);

  let combinedApplicationNumber = applicationsList?.length > 0 ? applicationsList?.map((ob) => ob?.applicationNumber) : [];
  let serviceSearchArgs = {
    tenantId: tenantId,
    referenceIds: combinedApplicationNumber
  };

  // const { isLoading: serviceloading, data: servicedata } = Digit.Hooks.useFeedBackSearch(
  //   { filters: { serviceSearchArgs } },
  //   { filters: { serviceSearchArgs }, enabled: combinedApplicationNumber?.length > 0 ? true : false, cacheTime: 0 }
  // );

  // console.log("servicedata", servicedata);

  function getLabelValue(curservice) {
    // let foundValue = servicedata?.Service?.find((ob) => ob?.referenceId?.includes(curservice?.applicationNumber));

    // if (foundValue) return t("CS_CF_VIEW");
    // else
    return t("CS_VIEW_DETAILS");
  }

  if (isLoading) {
    return <Loader />;
  }
  return (
    <section className="citizen-my-applications citizen-my-applications--ptr">
      <Header>{`${t("CS_TITLE_MY_APPLICATIONS")} ${applicationsList ? `(${applicationsList.length})` : ""}`}</Header>
        <p className="ptr-style-b0288cd4be">
        {t("PTR_TEXT_NOT_ABLE_TO_FIND_THE_APPLICATION")}{" "}
        <span className="link ptr-style-2a1b75c911">
          <Link to="/digit-ui/citizen/ptr/petservice/new-application/info">{t("PTR_COMMON_CLICK_HERE_TO_REGISTER_NEW_PET")}</Link>
        </span>
      </p>
      <div>
        {loadingPage ?
        <Loader /> :

        applicationsList?.length > 0 &&
        currentItems.map((application, index) =>
        <div key={index}>
              <PetApplication application={application} tenantId={user?.tenantId} buttonLabel={getLabelValue(application)} />
            </div>
        )
        }
        {!applicationsList?.length > 0 && <p className="ptr-style-b0288cd4be">{t("PTR_NO_APPLICATION_FOUND_MSG")}</p>}


      </div>
      {/* Pagination controls */}
      {applicationsList?.length > itemsPerPage &&
      <div className="ptr-pagination-controls">
          <button
          className={`ptr-pagination-button${currentPage === 1 ? " ptr-pagination-button--disabled" : ""}`}
          disabled={currentPage === 1}
          onClick={() => {
            setLoadingPage(true);
            setTimeout(() => {
              setCurrentPage((prev) => prev - 1);
              setLoadingPage(false);
            }, 500);
          }}>

            &#8592;
          </button>

          <span className="ptr-pagination-info">
            {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, applicationsList.length)} of ${applicationsList.length}`}
          </span>

          <button
          className={`ptr-pagination-button${currentPage === totalPages ? " ptr-pagination-button--disabled" : ""}`}
          disabled={currentPage === totalPages}
          onClick={() => {
            setLoadingPage(true);
            setTimeout(() => {
              setCurrentPage((prev) => prev + 1);
              setLoadingPage(false);
            }, 500);
          }}>

            &#8594;
          </button>
        </div>
      }


    </section>);

};
