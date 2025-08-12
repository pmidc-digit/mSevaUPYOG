import { Header, CitizenHomeCard, CHBIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import CHBSlotDetails from "./pageComponents/CHBSlotDetails";
import CHBCreate from "./pages/citizen/Create";
import CHBCitizenDetails from "./pageComponents/CHBCitizenDetails";
import CHBBankDetails from "./pageComponents/CHBBankDetails";
import CHBAddressDetails from "./pageComponents/CHBAddressDetails";
import CHBDocumentDetails from "./pageComponents/CHBDocumentDetails";
import CHBSearchHall from "./pageComponents/CHBSearchHall";
import CHBWFApplicationTimeline from "./pageComponents/CHBWFApplicationTimeline";
import CitizenApp from "./pages/citizen";
import CHBCheckPage from "./pages/citizen/Create/CheckPage";
import CHBAcknowledgement from "./pages/citizen/Create/CHBAcknowledgement";
import { CHBMyApplications } from "./pages/citizen/CHBMyApplications";
import CHBApplicationDetails from "./pages/citizen/CHBApplicationDetails";
import CHBWFCaption from "./pageComponents/CHBWFCaption";
import CHBWFReason from "./pageComponents/CHBWFReason";
import EmployeeApp from "./pages/employee";
import CHBCard from "./components/CHBCard";
import InboxFilter from "./components/inbox/NewInboxFilter";
import { TableConfig } from "./config/inbox-table-config";
import ApplicationDetails from "./pages/employee/ApplicationDetails";
import Response from "./pages/Response";
import SelectOtp from "../../core/src/pages/citizen/Login/SelectOtp";
import CitizenFeedback from "@mseva/digit-ui-module-core/src/components/CitizenFeedback";
import AcknowledgementCF from "@mseva/digit-ui-module-core/src/components/AcknowledgementCF";
import CHBRequiredDoc from "./pageComponents/CHBRequiredDoc";
import CHBStepperForm from "./pageComponents/CHBStepper/CHBStepperForm";
import CHBStepFormOne from "./pageComponents/CHBStepper/CHBStepFormOne";
import CHBStepFormTwo from "./pageComponents/CHBStepper/CHBStepFormTwo";
import CHBStepFormThree from "./pageComponents/CHBStepper/CHBStepFormThree";
import CHBStepFormFour from "./pageComponents/CHBStepper/CHBStepFormFour";
import CHBCitizenDetailsNew from "./pageComponents/CHBCitizenDetailsNew";
import CHBCitizenSecond from "./pageComponents/CHBCitizenSecond";
import CHBSelectProofIdentity from "./pageComponents/CHBSelectProofIdentity";
import CHBSummary from "./pageComponents/CHBSummary";
import NewGCStepFormFive from "./pageComponents/CHBStepper/GCStepFormFive";
import getRootReducer from "./redux/reducer";

export const GCReducers = getRootReducer;

const componentsToRegister = {
  CHBCheckPage,
  CHBAcknowledgement,
  CHBWFCaption,
  CHBWFReason,
  ApplicationDetails: ApplicationDetails,
  CHBResponse: Response,
  CHBMyApplications: CHBMyApplications,
  CHBApplicationDetails: CHBApplicationDetails,
  SelectOtp, // To-do: Temp fix, Need to check why not working if selectOtp module is already imported from core module
  AcknowledgementCF,
  CitizenFeedback,
  CHBCreate: CHBCreate,
  CHBCitizenDetails,
  CHBSlotDetails,
  CHBBankDetails,
  CHBAddressDetails,
  CHBDocumentDetails,
  CHBSearchHall,
  CHBWFApplicationTimeline,
  CHBRequiredDoc,
  CHBStepperForm,
  CHBStepFormOne,
  CHBStepFormTwo,
  CHBStepFormThree,
  CHBStepFormFour,
  CHBCitizenDetailsNew,
  CHBCitizenSecond,
  CHBSelectProofIdentity,
  CHBSummary,
  NewGCStepFormFive
};

const addComponentsToRegistry = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};

export const GCModule = ({ stateCode, userType, tenants }) => {
  const { path, url } = useRouteMatch();

  const moduleCode = "GC";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  addComponentsToRegistry();

  Digit.SessionStorage.set("CHB_TENANTS", tenants);

  useEffect(
    () =>
      userType === "employee" &&
      Digit.LocalizationService.getLocale({
        modules: [`rainmaker-${Digit.ULBService.getCurrentTenantId()}`],
        locale: Digit.StoreData.getCurrentLanguage(),
        tenantId: Digit.ULBService.getCurrentTenantId(),
      }),
    []
  );

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

export const GCLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("GC", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}chb/bookHall`,
      i18nKey: t("CHB_SEARCH_HALL_HEADER"),
    },

    {
      link: `${matchPath}/chb/myBookings`,
      i18nKey: t("CHB_MY_APPLICATIONS_HEADER"),
    },
  ];

  return <CitizenHomeCard header={t("COMMUNITY_HALL_BOOKING")} links={links} Icon={() => <CHBIcon className="fill-path-primary-main" />} />;
};

export const GCComponents = {
  CHBCard,
  GCModule,
  GCLinks,
  CHB_INBOX_FILTER: (props) => <InboxFilter {...props} />,
  CHBInboxTableConfig: TableConfig,
};
