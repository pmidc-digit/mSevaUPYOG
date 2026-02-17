import { BPAHomeIcon, BPAIcon, CitizenHomeCard, EDCRIcon, Loader, Toast } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { EmployeeModuleCard } from "../../components/EmployeeModuleCard";
import CitizenHomeCardSecond from "@mseva/digit-ui-module-core/src/pages/citizen/CitizenHomeCardSecond";
import { ProfessionalSignUpdate } from "../../pageComponents/ProfessionalSignUpdate";
import { OBPS_BPA_BUSINESS_SERVICES } from "../../../../../constants/constants";
import { LoaderNew } from "../../components/LoaderNew";

const BPACitizenHomeScreen = ({ parentRoute }) => {
  const userInfo = Digit.UserService.getUser();
  const userRoles = userInfo?.info?.roles?.map((roleData) => roleData.code);
  const stateCode = Digit.ULBService.getStateId();
  const [stakeHolderRoles, setStakeholderRoles] = useState(false);
  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(
    stateCode,
    "StakeholderRegistraition",
    "TradeTypetoRoleMapping"
  );
  const [bpaLinks, setBpaLinks] = useState([]);
  const state = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const location = useLocation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("BPA_HOME_CREATE", {});
  const { data: homePageUrlLinks, isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(state, "BPA", ["homePageUrlLinks"]);
  const [showToast, setShowToast] = useState(null);
  const [showModal, setShowModal] = useState(false)
  const [totalCount, setTotalCount] = useState("-");
  const user = Digit.UserService?.getUser()
  const tenantId = localStorage.getItem("CITIZEN.CITY");
  const isUserLoggedIn = user?.access_token
  const isUserRegistered = user?.info?.roles?.some(role => role?.code === "BPA_ARCHITECT" ) || user?.info?.roles?.some(role => (role?.code?.includes("BPA") && role?.tenantId === tenantId));
  const uuid = user?.info?.uuid;
  const stateId = Digit.ULBService.getStateId();
  const { data: userDetails, isLoading: isUserLoading, refetch } = Digit.Hooks.useUserSearch(stateId, { uuid: [uuid] }, {}, { enabled: uuid ? true : false });
  const { data: obpsHomePageUI, isLoading: isOBPSHomePageUILoading } = Digit.Hooks.useCustomMDMS(state, "BPA", [{ name: "OBPSHomePageUI" }]);

  console.log("obpsHomePageUI", obpsHomePageUI, isOBPSHomePageUILoading)
  
  useEffect(() => {
    console.log("userDetails", userDetails, isUserRegistered)
    if(isUserRegistered && !userDetails?.user?.[0]?.signature){
      setShowModal(true);
    }else{
      setShowModal(false);
    }
  } ,[userDetails, isUserRegistered])

  const closeToast = () => {
    window.location.replace("/digit-ui/citizen/all-services");
    setShowToast(null);
  };

  const [searchParams, setSearchParams] = useState({
    applicationStatus: [],
  });
  let isMobile = window.Digit.Utils.browser.isMobile();
  const [pageOffset, setPageOffset] = useState(0);
  const [pageSize, setPageSize] = useState(window.Digit.Utils.browser.isMobile() ? 50 : 10);
  const [sortParams, setSortParams] = useState([{ id: "createdTime", sortOrder: "DESC" }]);
  const paginationParams = isMobile
    ? { limit: 10, offset: 0, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.sortOrder }
    : { limit: pageSize, offset: pageOffset, sortBy: sortParams?.[0]?.id, sortOrder: sortParams?.[0]?.sortOrder };
  const inboxSearchParams = { limit: 10, offset: 0, mobileNumber: userInfo?.info?.mobileNumber };

  const { isLoading: bpaLoading, data: bpaInboxData } = Digit.Hooks.obps.useArchitectInbox({
    tenantId: stateCode,
    moduleName: "bpa-services",
    businessService: OBPS_BPA_BUSINESS_SERVICES,
    filters: {
      searchForm: {
        ...searchParams,
      },
      tableForm: {
        sortBy: sortParams?.[0]?.id,
        limit: pageSize,
        offset: pageOffset,
        sortOrder: sortParams?.[0]?.sortOrder,
      },
      filterForm: {
        moduleName: "bpa-services",
        businessService: [],
        applicationStatus: searchParams?.applicationStatus,
        locality: [],
        assignee: "ASSIGNED_TO_ALL",
      },
    },
    config: {},
    withEDCRData: false,
  });
  const { isLoading: isEDCRInboxLoading, data: { totalCount: edcrCount } = {} } = Digit.Hooks.obps.useEDCRInbox({
    tenantId: stateCode,
    filters: { filterForm: {}, searchForm: {}, tableForm: { limit: 10, offset: 0 } },
  });

  useEffect(()=>{
    if (location.pathname === "/digit-ui/citizen/obps/home"){
      Digit.SessionStorage.del("OBPS.INBOX")
      Digit.SessionStorage.del("STAKEHOLDER.INBOX")
    }
  },[location.pathname])

  useEffect(() => {
    if (!bpaLoading) {
      const totalCountofBoth = bpaInboxData?.totalCount || 0;
      setTotalCount(totalCountofBoth);
    }
  }, [bpaInboxData]);

  useEffect(() => {
    if (!stakeHolderDetailsLoading) {
      let roles = [];
      stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((type) => {
        type?.role?.map((role) => {
          roles.push(role);
        });
      });
      const uniqueRoles = roles?.filter((item, i, ar) => ar.indexOf(item) === i);
      console.log("uniqueRoles",uniqueRoles)
      let isRoute = false;
      uniqueRoles?.map((unRole) => {
        if (userRoles?.includes(unRole) && !isRoute) {
          isRoute = true;
        }
      });
      if (!isUserRegistered) {
        setStakeholderRoles(false);
        setShowToast({ key: "true", message: t("BPA_LOGIN_HOME_VALIDATION_MESSAGE_LABEL") });
      } else {
        setStakeholderRoles(true);
      }
    }
  }, [stakeHolderDetailsLoading]);

  useEffect(() => {
    if (!homePageUrlLinksLoading && homePageUrlLinks?.BPA?.homePageUrlLinks?.length > 0) {
      let uniqueLinks = [];
      homePageUrlLinks?.BPA?.homePageUrlLinks?.map((linkData) => {
        uniqueLinks.push({
          link: `${linkData?.flow?.toLowerCase()}/${linkData?.applicationType?.toLowerCase()}/${linkData?.serviceType?.toLowerCase()}/docs-required`,
          i18nKey: t(`BPA_HOME_${linkData?.applicationType}_${linkData?.serviceType}_LABEL`),
          state: { linkData },
          linkState: true,
        });
      });
      setBpaLinks(uniqueLinks);
    }
  }, [!homePageUrlLinksLoading]);

  useEffect(() => {
    clearParams();
  }, []);

  Digit.SessionStorage.set("EDCR_BACK", "IS_EDCR_BACK");

  if (showToast) return <Toast error={true} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />;

  if (stakeHolderDetailsLoading || !stakeHolderRoles || bpaLoading || isUserLoading) {
    return <Loader />;
  } // || bparegLoading

  const closeModal = () => {
    setShowModal(false);
  }

  // const homeDetails = [
  //   {
  //     Icon: <BPAHomeIcon />,
  //     moduleName: t("ACTION_TEST_BPA_STAKE_HOLDER_HOME"),
  //     name: "employeeCard",
  //     isCitizen: true,
  //     kpis: [
  //       // {
  //       //   count: !(bpaLoading || isEDCRInboxLoading) && totalCount && edcrCount ? totalCount + edcrCount : "-",
  //       //   label: t("BPA_PDF_TOTAL"),
  //       //   link: `/digit-ui/citizen/obps/bpa/inbox`,
  //       // },
  //     ],
  //     links: [
  //       {
  //         count: !bpaLoading ? totalCount : "-",
  //         label: t("ES_COMMON_OBPS_INBOX_LABEL"),
  //         link: `/digit-ui/citizen/obps/bpa/inbox`,
  //       },
  //       {
  //         count: !isEDCRInboxLoading ? edcrCount : "-",
  //         label: t("ES_COMMON_EDCR_INBOX_LABEL"),
  //         link: `/digit-ui/citizen/obps/edcr/inbox`,
  //       },
  //     ],
  //     className: "CitizenHomeCard",
    
  //   },
  //   {
  //     title: t("ACTION_TEST_EDCR_SCRUTINY"),
  //     Icon: <EDCRIcon className="fill-path-primary-main" />,
  //     links: [
  //       {
  //         link: `edcrscrutiny/apply`,
  //         i18nKey: t("BPA_PLAN_SCRUTINY_FOR_NEW_CONSTRUCTION_LABEL"),
  //       },
  //       {
  //         link: `edcrscrutiny/oc-apply`,
  //         i18nKey: t("BPA_OC_PLAN_SCRUTINY_FOR_NEW_CONSTRUCTION_LABEL"),
  //       },
  //     ],
    
  //   },
  //   {
  //     title: t("ACTION_TEST_BPA_STAKE_HOLDER_HOME"),
  //     Icon: <BPAIcon className="fill-path-primary-main" />,
  //     links: bpaLinks,
     
  //   },
  //   {
  //     title: t("ACTION_TEST_LAYOUT_HOME"),
  //     Icon: <EDCRIcon className="fill-path-primary-main" />,
  //     links: [
  //       {
  //         link: `layout/apply`,
  //         i18nKey: t("BPA_LAYOUT_LABEL"),
  //       },
  //        {
  //         link: `layout/my-applications`,
  //         i18nKey: t("BPA_MY_APPLICATIONS_LABEL"),
  //       },
  //               {
  //         link: `layout/search-application`,
  //         i18nKey: t("BPA_SEARCH_APPLICATIONS_LABEL"),
  //       },
  //     ],
     
  //   },
  //   {
  //     title: t("ACTION_TEST_CLU_HOME"),
  //     Icon: <EDCRIcon className="fill-path-primary-main" />,
  //     links: [
  //       {
  //         link: `clu/apply`,
  //         i18nKey: t("BPA_CHANGE_OF_LAND_USE_LABEL"),
  //       },
  //               {
  //         link: `clu/my-applications`,
  //         i18nKey: t("BPA_MY_APPLICATIONS_LABEL"),
  //       },
  //       {
  //         link: `search/clu-application`,
  //         i18nKey: t("BPA_SEARCH_APPLICATIONS_LABEL"),
  //       },
  //     ],
     
  //   },
  //   {
  //     title: t("ACTION_TEST_NOC"),
  //     Icon: <EDCRIcon className="fill-path-primary-main" />,
  //     links: [
  //       {
  //         link: `/digit-ui/citizen/noc/new-application`,
  //         i18nKey: t("NOC_NEW_APPLICATION"),
  //       },
  //               {
  //         link: `/digit-ui/citizen/noc/my-application`,
  //         i18nKey: t("BPA_MY_APPLICATIONS_LABEL"),
  //       },
  //       {
  //         link: `/digit-ui/citizen/noc/search-application`,
  //         i18nKey: t("BPA_SEARCH_APPLICATIONS_LABEL"),
  //       },
  //     ],
     
  //   },
  // ];
  const homeDetails = obpsHomePageUI?.BPA?.OBPSHomePageUI?.length > 0 ? obpsHomePageUI?.BPA?.OBPSHomePageUI?.map((data) => {
    if(data?.title === "ACTION_TEST_BPA_STAKE_HOLDER_HOME"){
      return {
        ...data,
        links: data?.links?.length > 0 ? data?.links : bpaLinks
      }
    }else{
      return data
    }
  }) : []

  if(isOBPSHomePageUILoading){
    return <LoaderNew page={true} />
  }

  const homeScreen = (
    <div className="mainContent">
      {homeDetails.map((data) => {
        return (
          <div>
            {data.name === "employeeCard" ? (
              <EmployeeModuleCard {...data} />
            ) : (
              <CitizenHomeCardSecond header={data.title} links={data.links} Icon={() => data.Icon} />
            )}
              {showModal && <ProfessionalSignUpdate closeModal={closeModal} userDetails={userDetails} refetch={refetch}/>}
          </div>
        );
      })}
    </div>
  );
  sessionStorage.setItem("isPermitApplication", true);
  sessionStorage.setItem("isEDCRDisable", JSON.stringify(false));
  return homeScreen;
};

export default BPACitizenHomeScreen;
