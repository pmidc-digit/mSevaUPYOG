import React from "react";
import { useRouteMatch } from "react-router-dom";
import EmployeeApp from "./pages/employee";
import TransferAppointmentCard from "./components/TransferAppointmentCard";
import JurisdictionManagement from "./pages/employee/JurisdictionManagement";
import JurisdictionDetails from "./pages/employee/JurisdictionDetails";
import JurisdictionFilter from "./components/JurisdictionFilter";
import JurisdictionTable from "./components/JurisdictionTable";
import JurisdictionPanel from "./components/JurisdictionPanel";
import RemoveConfirmationModal from "./components/RemoveConfirmationModal";
import JurisdictionHistoryModal from "./components/JurisdictionHistoryModal";

/**
 * Main Transfer & Appointment Module
 */
export const TransferAppointmentModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "TRANSFER_APPOINTMENT";
  const language = Digit.StoreData.getCurrentLanguage();
  const match = useRouteMatch();
  const rawPath = match?.path;
  const path = (Array.isArray(rawPath) ? rawPath[0] : (typeof rawPath === "string" ? rawPath.split(",")[0] : rawPath)) || "/digit-ui/employee/transferAppointment";
  const rawUrl = match?.url;
  const url = (Array.isArray(rawUrl) ? rawUrl[0] : (typeof rawUrl === "string" ? rawUrl.split(",")[0] : rawUrl)) || path;

  // Load module store / localization if available
  Digit.Services.useStore({ stateCode, moduleCode, language });
  Digit.SessionStorage.set("TRANSFER_APPOINTMENT_TENANTS", tenants);

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  }

  return null;
};

export const TransferAppointmentLinks = ({ matchPath, userType }) => {
  return null;
};

const componentsToRegister = {
  TransferAppointmentModule,
  TransferAppointmentCard,
  TransferAppointmentLinks,
  JurisdictionManagement,
  JurisdictionDetails,
  JurisdictionFilter,
  JurisdictionTable,
  JurisdictionPanel,
  RemoveConfirmationModal,
  JurisdictionHistoryModal,
};

export const initTransferAppointmentComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};

export const TransferAppointmentComponents = {
  TransferAppointmentCard,
  TransferAppointmentModule,
  TransferAppointmentLinks,
};

export default TransferAppointmentModule;

