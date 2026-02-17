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
  const { t } = useTranslation()
  const userRoles = Digit.UserService.getUser().info.roles

  const [isHovered, setIsHovered] = useState(false)

  const updatedModuleData = quickServiceModules.modules
    .filter((item) => item.moduleCode === moduleData.code)
    .map((item) => ({
      ...item,
      Access: moduleData.access,
    }))

  const iconSelector = (code) => {
    switch (code) {
      case "PT":
        return <PTIcon />
      case "WS":
        return <WSICon />
      case "FSM":
        return <FSMIcon className="fill-path-primary-main" />
      case "MCollect":
        return <MCollectIcon />
      case "ChallanGeneration":
        return <MCollectIcon />
      case "RentAndLease":
        return <MCollectIcon />
      case "PGR":
        return <PGRIcon />
      case "NDC":
        return <PGRIcon />
      case "TL":
        return <TLIcon />
      case "OBPS":
        return <OBPSIcon />
      case "BPAStakeholder":
        return <OBPSIcon />
      case "Layout":
        return <OBPSIcon />
      case "Bills":
        return <BillsIcon />
      case "PTR":
        return <PTIcon />
      case "Swach":
        return <PGRIcon />
      case "HRMS":
        return <WSICon />
      case "SV":
        return <BillsIcon />
      case "ADS":
        return <BillsIcon />
      case "CHB":
        return <BillsIcon />
      case "ASSET":
        return <BillsIcon />
      case "NOC":
        return <BillsIcon />
      case "GarbageCollection":
        return <BillsIcon />
      case "CLU":
        return <OBPSIcon />
      default:
        return <PTIcon />
    }
  }

  return userRoles.some((item) => item.code === updatedModuleData[0]?.Access) ? (
    <Link
      to={`${updatedModuleData[0]?.routes}`}
      className="employee-quick-service-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`employee-quick-service-card ${isHovered ? 'hovered' : ''}`}
      >
        {/* Icon Container with Gradient Background */}
        <div
          className="card-icon-container"
          style={{
            background: updatedModuleData[0]?.bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          {/* Animated Background Circle */}
          <div className="card-background-circle" />

          {/* Icon with Scale Animation */}
          <div className="card-icon-wrapper">
            {iconSelector(moduleData.code)}
          </div>
        </div>

        {/* Module Name Container */}
        <div className="card-content-container">
          <div className="card-text-content">
            <h3 className="card-module-title">
              {updatedModuleData[0]?.moduleName}
            </h3>
            <p className="card-module-description">
              Quick access to module
            </p>
          </div>

          {/* Arrow Icon with Animation */}
          <div className="card-arrow-container">
            <svg
              width={window.Digit.Utils.browser.isMobile() ? "16" : "20"}
              height={window.Digit.Utils.browser.isMobile() ? "16" : "20"}
              viewBox="0 0 20 20"
              fill="none"
              className="card-arrow-svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                className="card-arrow-path"
              />
            </svg>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        {isHovered && <div className="card-shine-effect" />}
      </div>
    </Link>
  ) : null
}

export default EmployeeQuickServicesCard;
