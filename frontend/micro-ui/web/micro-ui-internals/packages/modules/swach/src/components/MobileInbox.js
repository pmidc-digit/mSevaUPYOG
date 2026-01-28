import React, {useEffect, useMemo, useState} from "react";
import { useTranslation } from "react-i18next";
import { Loader, Card } from "@mseva/digit-ui-react-components";
import { ComplaintCard } from "./inbox/ComplaintCard";
import ComplaintsLink from "./inbox/ComplaintLinks";
import { LOCALE } from "../constants/Localization";
import PropTypes from "prop-types";
import Filter from "./inbox/Filter";

const GetSlaCell = (value) => {
  // return value < 0 ? (
  //   <span className="sla-cell-error" style={{ color: "#a82227" }}>
  //     {value || ""}
  //   </span>
  // ) : (
  //   <span className="sla-cell-success">{value}</span>
  // );
  if (value < 0) {
    return (
      <span className="sla-cell-error p-0 swach-red-color" >
        {Math.abs(value)} hours overdue
      </span>
    );
  } else {
    return (
      <span className="sla-cell-success p-0">
        {value} hour left
      </span>
    );
  }
};

const GetDateSlaCell = (value) => {
  return value < 0 ? <span className="sla-cell-error">{value || ""}</span> : <span className="sla-cell-success">{value || ""}</span>;
};

let pgrQuery = {};
let wfQuery = {};

const MobileInbox = ({ data, onFilterChange, onSearch, isLoading, searchParams, localities }) => {
  const { t } = useTranslation();
  // let { uuid } = Digit.UserService.getUser().info;
  // const [swachfilters, setSwachFilters] = useState(
  //     searchParams?.filters?.swachfilters || {
  //       serviceCode: [],
  //       locality: [],
  //       applicationStatus: [],
  //       tenants: null,
  //     }
  //   );
  // const [wfFilters, setWfFilters] = useState(
  //     searchParams?.filters?.wfFilters || {
  //       assignee: [{ code: uuid }],
  //     }
  //   );

  // useEffect(() => {
  //   handleFilterSubmit();
  // },[swachfilters, wfFilters])

  // const handleFilterSubmit = () => {
  //     onFilterChange({ pgrQuery: pgrQuery, wfQuery: wfQuery, wfFilters, swachfilters });
  // };
  // const localizedData = data?.map(({ locality, tenantId, serviceRequestId, complaintSubType, sla, status, taskOwner }) => ({
  //   [t("CS_COMMON_COMPLAINT_NO")]: serviceRequestId,
  //   [t("CS_ADDCOMPLAINT_COMPLAINT_SUB_TYPE")]: t(`SWACHBHARATCATEGORY.${complaintSubType.toUpperCase()}`),
  //   [t("WF_INBOX_HEADER_LOCALITY")]: t(Digit.Utils.locale.getLocalityCode(locality, tenantId)),
  //   [t("CS_COMPLAINT_DETAILS_CURRENT_STATUS")]: t(`CS_COMMON_${status}`),
  //   [t("WF_INBOX_HEADER_CURRENT_OWNER")]: taskOwner,
  //   [t("WF_INBOX_HEADER_SLA_DAYS_REMAINING")]: GetSlaCell(sla),
  //   // status,
  // }));

  const localizedData = useMemo(() => {
    return data?.map(({ locality, tenantId, serviceRequestId, complaintSubType, sla, status, taskOwner, taskEmployee, createdDate }) => ({
      [t("CS_COMMON_COMPLAINT_NO")]: serviceRequestId,
      [t("CS_ADDCOMPLAINT_COMPLAINT_SUB_TYPE")]: t(`SWACHBHARATCATEGORY.${complaintSubType.toUpperCase()}`),
      [t("WF_INBOX_HEADER_LOCALITY")]: t(Digit.Utils.locale.getLocalityCode(locality, tenantId)),
      [t("CS_COMPLAINT_DETAILS_CURRENT_STATUS")]: t(`CS_COMMON_${status}`),
      [t("WF_INBOX_HEADER_CURRENT_OWNER")]: taskOwner,
      [t("WF_INBOX_HEADER_CURRENT_EMPLOYEE")]: taskEmployee,
      [t("WF_INBOX_HEADER_SLA_DAYS_REMAINING")]: GetSlaCell(sla),
      [t("WF_INBOX_HEADER_CREATED_DATE")]: GetDateSlaCell(createdDate),
      // status,
    }));
  }, [data, t]);

  const tenantIdsList = useMemo(() => {
    return data?.map((obj) => obj.tenantId);
  })

  let result;
  if (isLoading) {
    result = <Loader />;
  } 
  // else if (data && data?.length === 0) {
  //     result = (
  //       <Card style={{ marginTop: 20 }}>
  //         {t(LOCALE.NO_COMPLAINTS_EMPLOYEE)
  //           .split("\\n")
  //           .map((text, index) => (
  //             <p key={index} style={{ textAlign: "center" }}>
  //               {text}
  //             </p>
  //           ))}
  //       </Card>
  //     );
  //   }
     else {
    result = (
      <ComplaintCard
        data={localizedData}
        onFilterChange={onFilterChange}
        serviceRequestIdKey={t("CS_COMMON_COMPLAINT_NO")}
        onSearch={onSearch}
        searchParams={searchParams}
        localities={localities}
        tenantIdsList = {tenantIdsList}
      />
    );
  }

  return (
    <div className="p-0">
      <div className="inbox-container">
      {/* <Filter complaints={data} onFilterChange={onFilterChange} type="desktop" searchParams={searchParams} /> */}
        <div className="filters-container">
          <ComplaintsLink isMobile={true} />
          {result}
        </div>
      </div>
    </div>
  );
};
MobileInbox.propTypes = {
  data: PropTypes.any,
  onFilterChange: PropTypes.func,
  onSearch: PropTypes.func,
  isLoading: PropTypes.bool,
  searchParams: PropTypes.any,
};

MobileInbox.defaultProps = {
  onFilterChange: () => {},
  searchParams: {},
};

export default MobileInbox;
