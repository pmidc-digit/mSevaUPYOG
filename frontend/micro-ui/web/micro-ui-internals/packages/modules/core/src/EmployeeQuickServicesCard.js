import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { quickServiceModules } from "../../../constants/quickServiceData";
import { Link } from "react-router-dom";
import {
  BackButton,
  BillsIcon,
  CitizenHomeCard,
  CitizenInfoLabel,
  FSMIcon,
  Loader,
  MCollectIcon,
  OBPSIcon,
  PGRIcon,
  PTIcon,
  TLIcon,
  WSICon,
  PTRIcon,
  PrintBtnCommon,
  Table,
  ArrowRightInbox,
} from "@mseva/digit-ui-react-components";
import { update } from "lodash";
const EmployeeQuickServicesCard = ({ moduleData }) => {
  const { t } = useTranslation();

  console.log("Module Data: ", moduleData);
  //const [moduleData, setModuleData] = useState([])
  const moduleAccessProps = (code) => {
    console.log("Inside moduleAccessProps", Digit.Utils.ptAccess());

    switch (code) {
      case "PT":
        return true;

      case "WS":
        return true;

      case "FSM":
        return true;

      case "MCollect":
        return true;

      case "PGR":
        return true;

      case "TL":
        return true;

      case "OBPS":
        return true;

      case "Bills":
        return true;

      case "PTR":
        return true;

      case "Engagement":
        return true;

      case "Swach":
        return true;

      case "NDC":
        return true;

      case "HRMS":
        return true;

      case "SV":
        return true;

      case "ADS":
        return true;

      case "CHB":
        return true;

      case "ASSET":
        return true;

      default:
        return null;
    }
  };

  const updatedModuleData = quickServiceModules.modules.filter((item) => item.moduleCode === moduleData.code);

  const iconSelector = (code) => {
    switch (code) {
      case "PT":
        return <PTIcon />;
      case "WS":
        return <WSICon />;
      case "FSM":
        return <FSMIcon className="fill-path-primary-main" />;
      case "MCollect":
        return <MCollectIcon />;
      case "PGR":
        return <PGRIcon />;
      case "TL":
        return <TLIcon />;
      case "OBPS":
        return <OBPSIcon />;
      case "Bills":
        return <BillsIcon />;
      case "PTR":
        return <PTIcon />;
      case "Swach":
        return <PGRIcon />;
      case "NDC":
        return <TLIcon />;
      case "HRMS":
        return <WSICon />;
      case "SV":
        return <BillsIcon />;
      case "ADS":
        return <BillsIcon />;
      case "CHB":
        return <BillsIcon />;
      case "ASSET":
        return <BillsIcon />;
      default:
        return <PTIcon />;
    }
  };

  return moduleAccessProps(moduleData.code) ? (
    <div
      className="employee-dashboard-quick-service-card employee-dashboard-quick-service-card-content"
      style={{
        display: "flex",
        padding: "0px",
        borderRadius: "8px",
      }}
    >
      <Link to={`${updatedModuleData[0]?.routes}`}>
        <div
          className="employee-dashboard-quick-service-card-module-icon"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100px",
            paddingTop: "5px",
            borderRadius: "8px 0 0 8px",
            backgroundColor: updatedModuleData[0]?.bgColor,
          }}
        >
          {iconSelector(moduleData.code)}
        </div>
      </Link>
      <Link
        to={`${updatedModuleData[0]?.routes}`}
        style={{
          width: "100%",
        }}
      >
        <div
          className="employee-dashboard-quick-service-card-module-name"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
            padding: "2rem 2rem",
          }}
        >
          {
            // moduleDataForDashboard.moduleName
            updatedModuleData[0]?.moduleCode
          }
        </div>
      </Link>
    </div>
  ) : null;
};

export default EmployeeQuickServicesCard;
