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
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: isHovered ? "0 12px 40px rgba(0, 0, 0, 0.15)" : "0 4px 20px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
          background: "white",
          position: "relative",
          border: isHovered ? "2px solid rgba(79, 101, 216, 0.3)" : "2px solid transparent",
        }}
      >
        {/* Icon Container with Gradient Background */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "120px",
            padding: "24px",
            background: updatedModuleData[0]?.bgColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated Background Circle */}
          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              top: "-50px",
              right: "-50px",
              transition: "transform 0.5s ease",
              transform: isHovered ? "scale(1.5)" : "scale(1)",
            }}
          />

          {/* Icon with Scale Animation */}
          <div
            style={{
              transform: isHovered ? "scale(1.15) rotate(5deg)" : "scale(1) rotate(0deg)",
              transition: "transform 0.3s ease",
              zIndex: 1,
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))",
            }}
          >
            {iconSelector(moduleData.code)}
          </div>
        </div>

        {/* Module Name Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 32px",
            background: "white",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1a202c",
                margin: 0,
                lineHeight: "1.3",
                transition: "color 0.3s ease",
              }}
            >
              {updatedModuleData[0]?.moduleName}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#718096",
                margin: "6px 0 0 0",
                fontWeight: "400",
              }}
            >
              Quick access to module
            </p>
          </div>

          {/* Arrow Icon with Animation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: isHovered ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f7fafc",
              transition: "all 0.3s ease",
              transform: isHovered ? "translateX(4px)" : "translateX(0)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
                transition: "transform 0.3s ease",
                transform: isHovered ? "translateX(2px)" : "translateX(0)",
              }}
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke={isHovered ? "white" : "#4a5568"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              animation: "shine 0.6s ease",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    </Link>
  ) : null
}

export default EmployeeQuickServicesCard;
