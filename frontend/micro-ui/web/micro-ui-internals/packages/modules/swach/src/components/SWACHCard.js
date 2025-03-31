import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmployeeModuleCard } from "@mseva/digit-ui-react-components";


const SWACHCard = () => {
  const { t } = useTranslation();

  const allLinks = [
    { text: t("ES_SWACH_INBOX"), link: "/digit-ui/employee/swach/inbox" },
    { text: t("ES_SWACH_NEW_COMPLAINT"), link: "/digit-ui/employee/swach/complaint/create" , accessTo: ["CSR"] 
      // have to change in roleactions
     },
  ];

  if (!Digit.Utils.pgrAccess()) { // swach is using same user base as pgr
    return null;
  }

  const Icon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" fill="white"></path>
  </svg>

  let propsForCSR =[
    {
      label: t("ES_SWACH_NEW_COMPLAINT"),
      link: `/digit-ui/employee/swach/complaint/create`,
       role: "CSR" 
      // have to change in roleactions
      //   role: "PGR-ADMIN"
    }
  ]
  
  console.log("PGR role access",propsForCSR.filter(link => link.role && Digit.Utils.didEmployeeHasRole(link.role) ))
  propsForCSR = propsForCSR.filter(link => link.role && Digit.Utils.didEmployeeHasRole(link.role) );

  const propsForModuleCard = {
    Icon: <Icon />,
    moduleName: t("ES_SWACH_HEADER_COMPLAINT"),
    kpis: [
        {
            label: t("TOTAL_SWACH"),
            link: `/digit-ui/employee/swach/inbox`
        },
        {
            label: t("TOTAL_NEARING_SLA"),
            link: `/digit-ui/employee/swach/inbox`
        }
    ],
    links: [
    {
        label: t("ES_SWACH_INBOX"),
        link: `/digit-ui/employee/swach/inbox`
    },
    ...propsForCSR
    ]
}

  return <EmployeeModuleCard {...propsForModuleCard} />
};
export default SWACHCard;
