import React, { useState, useEffect } from "react";

import { FilterAction, Card, PopUp, SearchAction } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import Filter from "./Filter";
import SearchComplaint from "./search";
import { LOCALE } from "../../constants/Localization";
import DetailsCard from "./DetailsCard"

export const ComplaintCard = ({ data, onFilterChange, onSearch, serviceRequestIdKey, searchParams, localities, tenantIdsList }) => {
  const { t } = useTranslation();
  const [popup, setPopup] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [filterCount, setFilterCount] = useState(Digit.inboxFilterCount || 1);

  // useEffect(() => {
  //   handlePopupAction("FILTER")
  // },[])

  const handlePopupAction = (type) => {
    if (type === "SEARCH") {
      setSelectedComponent(<SearchComplaint type="mobile" onClose={handlePopupClose} onSearch={onSearch} searchParams={searchParams} />);
    } else if (type === "FILTER") {
      setSelectedComponent(
        <Filter complaints={data} onFilterChange={onFilterChange} onClose={handlePopupClose} type="mobile" searchParams={searchParams} localities={localities}/>
      );
    }
    setPopup(true);
  };

  const handlePopupClose = () => {
    setPopup(false);
    setSelectedComponent(null);
  };

  let result;
  if (data && data?.length === 0) {
    result = (
      <Card className="swach-margin-top-16">
        {t(LOCALE.NO_COMPLAINTS_EMPLOYEE)
          .split("\\n")
          .map((text, index) => (
            <p key={index} className="swach-text-align">
              {text}
            </p>
          ))}
      </Card>
    );
  } else if (data && data?.length > 0) {
    console.log("DataInDetailsCard", data);
    result = <DetailsCard data={data} serviceRequestIdKey={serviceRequestIdKey} linkPrefix={"/digit-ui/employee/swach/complaint/details/"} tenantIdsList={tenantIdsList}/>;
  } else {
    result = (
      <Card className="swach-margin-top-16">
        {t(LOCALE.ERROR_LOADING_RESULTS)
          .split("\\n")
          .map((text, index) => (
            <p key={index} className="swach-text-align">
              {text}
            </p>
          ))}
      </Card>
    );
  }

  return (
    <React.Fragment>
      <div className="searchBox">
        <SearchAction text="SEARCH" handleActionClick={() => handlePopupAction("SEARCH")} />
        <FilterAction filterCount={filterCount} text="FILTER" handleActionClick={() => handlePopupAction("FILTER")} />
        {/* <FilterAction text="SORT" handleActionClick={handlePopupAction} /> */}
      </div>
      {result}
      {popup && (
        <PopUp>
          <div className="popup-module">{selectedComponent}</div>
        </PopUp>
      )}
    </React.Fragment>
  );
};
