import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EmployeeModuleCard, PTRIcon } from "@mseva/digit-ui-react-components";

const GCCard = () => {
  const { t } = useTranslation();

  const [total, setTotal] = useState("-");
  const { data, isLoading, isFetching, isSuccess } = Digit.Hooks.useNewInboxGeneral({
    tenantId: Digit.ULBService.getCurrentTenantId(),
    ModuleCode: "GC",
    filters: { limit: 10, offset: 0, services: ["GC"] },

    config: {
      select: (data) => {
        return { totalCount: data?.totalCount, nearingSlaCount: data?.nearingSlaCount } || "-";
      },
      enabled: Digit.Utils.ptAccess(),
    },
  });

  useEffect(() => {
    if (!isFetching && isSuccess) setTotal(data);
  }, [isFetching]);

  if (!Digit.Utils.ptAccess()) {
    return null;
  }
  const links = [
    {
      count: isLoading ? "0" : total?.totalCount,
      label: t("Inbox"),
      // link: `/digit-ui/employee/asset/assetservice/inbox`,
      link: `/digit-ui/employee/garbage/inbox`,
    },
    {
      count: isLoading ? "-" : total?.totalCount,
      label: t("ES_COMMON_INBOX"),
      link: `/digit-ui/employee/gc/inbox`,
    },
    // {
    //   label: t("PTR_TITLE_NEW_PET_REGISTRATION"),
    //   link: `/digit-ui/employee/ptr/petservice/new-application`,
    //   role: "PT_CEMP"
    // },
    // {
    //   label: t("ES_COMMON_APPLICATION_SEARCH"),
    //   link: `/digit-ui/employee/ptr/petservice/my-applications`,
    // },
  ];
  const PT_CEMP = Digit.UserService.hasAccess(["GC_CEMP"]) || false;
  const propsForModuleCard = {
    Icon: <PTRIcon />,
    moduleName: t("PTR_TITLE_PET_REGISTRATION"),
    kpis: [
      {
        count: total?.totalCount,
        label: t("ES_TITLE_INBOX"),
        link: `/digit-ui/employee/gc/inbox`,
      },
    ],
    // links:links.filter(link=>!link?.role||PT_CEMP),
    links: links.filter((link) => !link?.role),
  };

  return <EmployeeModuleCard {...propsForModuleCard} />;
};

export default GCCard;
