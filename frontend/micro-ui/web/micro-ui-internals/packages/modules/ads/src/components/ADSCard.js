import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CHBIcon } from "../components/CHBIcon";
import { EmployeeModuleCard } from "@mseva/digit-ui-react-components";

// Component to render the ADS module card with relevant links and access control for employee side

const ADSCard = () => {
  const { t } = useTranslation();
 const { data, isLoading, isFetching, isSuccess } = Digit.Hooks.useNewInboxGeneral({
     tenantId: Digit.ULBService.getCurrentTenantId(),
     ModuleCode: "ADS",
     filters: { limit: 10, offset: 0, services: ["ads"] }, //edited this
 
     config: {
       select: (data) => {
         return {tSotalCount:data?.totalCount,nearingSlaCount:data?.nearingSlaCount} || "-";
       },
       enabled: Digit.Utils.ptAccess(),
     },
   });
 
   useEffect(() => {
     if (!isFetching && isSuccess) setTotal(data);
   }, [isFetching]);
  const [total, setTotal] = useState("-");

  if (!Digit.Utils.adsAccess()) {
    return null;
  }
  const links = [
    {
      label: t("ADS_BOOK"),
      link: `/digit-ui/employee/ads/bookad/searchads`,
    },
    //in progress for search application page on employee side
    {
      label: t("ADS_SEARCH_BOOKINGS"),
      link: `/digit-ui/employee/ads/my-applications`,
    },
  ];
  const ADS_CEMP = Digit.UserService.hasAccess(["ADS_CEMP"]) || false;
  const propsForModuleCard = {
    Icon: <CHBIcon />,
    moduleName: t("ADS_ADVERTISEMENT_MODULE"),

    links: links.filter((link) => !link?.role || ADS_CEMP),
  };

  return <EmployeeModuleCard {...propsForModuleCard} />;
};

export default ADSCard;
