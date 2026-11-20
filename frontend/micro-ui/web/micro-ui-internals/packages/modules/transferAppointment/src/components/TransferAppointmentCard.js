import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeModuleCard, PersonIcon } from "@mseva/digit-ui-react-components";

/**
 * Transfer & Appointment Employee Dashboard Card
 */
const TransferAppointmentCard = () => {
  const { t } = useTranslation();

  const propsForModuleCard = {
    Icon: <PersonIcon />,
    moduleName: t("MODULE_TRANSFER_APPOINTMENT") || "Transfer & Appointment",
    kpis: [],
    links: [
      {
        label: t("JUR_MANAGEMENT_TITLE") || "Jurisdiction Management",
        link: "/digit-ui/employee/transferAppointment/jurisdiction",
      },
    ],
  };

  return <EmployeeModuleCard {...propsForModuleCard} />;
};

export default TransferAppointmentCard;

