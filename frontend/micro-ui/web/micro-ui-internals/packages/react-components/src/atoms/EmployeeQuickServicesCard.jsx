import React from "react";
import { useTranslation } from "react-i18next";

const EmployeeQuickServicesCard = ({ moduleData }) => {
  const { t } = useTranslation();
  // function getModuleCardData(){
  //   switch(moduleCode){
  //     case "":

  //     case "":
  //     default:
  //       return ";
  //   };
  // }

  // const moduleCardData=getModuleCardData();

  console.log("Module Data: ", moduleData);

  const Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" fill="white"></path>
    </svg>
  );

  const updatedModuleData = {
    ...moduleData,
    moduleDataForDashboard: {
      Icon: <Icon />,
      moduleName: t("ES_PGR_HEADER_COMPLAINT"),
      kpis: [
        {
          label: t("TOTAL_PGR"),
          link: `/digit-ui/employee/pgr/inbox`,
        },
        {
          label: t("TOTAL_NEARING_SLA"),
          link: `/digit-ui/employee/pgr/inbox`,
        },
      ],
      links: [
        {
          label: t("ES_PGR_INBOX"),
          link: `/digit-ui/employee/pgr/inbox`,
        },
        //...propsForCSR,
      ],
    },
  };

  const { moduleDataForDashboard } = updatedModuleData;

  return (
    <div className="employee-dashboard-quick-service-card employee-dashboard-quick-service-card-content">
      <div
        className="employee-dashboard-quick-service-card-module-icon"
      >
        <span className="icon-banner-employee" style={{ borderRadius: "5px", boxShadow: "5px 5px 5px 0px #e3e4e3" }}>
          {moduleDataForDashboard?.Icon}
        </span>
      </div>

      <div className="employee-dashboard-quick-service-card-module-name">{moduleDataForDashboard?.moduleName ?? ""}</div>
    </div>
  );
};

export default EmployeeQuickServicesCard;
