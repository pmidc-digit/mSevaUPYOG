import { EmployeeModuleCard, PTIcon } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";

const RentAndLeaseCard = () => {
  if (!Digit.Utils.mCollectAccess()) {
    return null;
  }
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { isLoading, isError, error, data, ...rest } = Digit.Hooks.mcollect.useMCollectCount(tenantId);

  const propsForModuleCard = {
    Icon: <PTIcon />,
    moduleName: t("UC_COMMON_HEADER_SEARCH"),
    kpis: [
      {
        count: isLoading ? "-" : data?.ChallanCount?.totalChallan,
        label: t("TOTAL_CHALLANS")
      },
      // {
      //     label: t(""),
      //     link: `/digit-ui/employee/receipts/inbox`
      // }  
    ],
    links: [
      {
        label: t("UC_SEARCH_CHALLAN_LABEL"),
        link: `/digit-ui/employee/mcollect/inbox`
      },
      {
        label: t("UC_GENERATE_NEW_CHALLAN"),
        link: `/digit-ui/employee/rentandlease/new-application`
      },
      {
        label: t("RAL_BILL_GENIE_HEADER"),
        link: `/digit-ui/employee/rentandlease/bill-genie`
      },
    ]
  }
  return <EmployeeModuleCard {...propsForModuleCard} />
};

export default RentAndLeaseCard;

