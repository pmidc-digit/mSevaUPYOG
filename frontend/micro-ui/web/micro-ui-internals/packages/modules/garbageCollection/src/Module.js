import { CitizenHomeCard, Loader, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import InboxFilter from "./components/inbox/NewInboxFilter";
import ChallanGenerationCard from "./components/ChallanGenerationCard";
import EmployeeChallan from "./EmployeeChallan";
import AddressDetails from "./pageComponents/AddressDetails";
import ConsumerDetails from "./pageComponents/ConsumerDetails";
import ServiceDetails from "./pageComponents/ServiceDetails";
import CitizenApp from "./pages/citizen";
import MyChallanResultsComponent from "./pages/citizen/MyChallan";
import SearchChallanComponent from "./pages/citizen/SearchChallan";
import SearchResultsComponent from "./pages/citizen/SearchResults";
import EmployeeApp from "./pages/employee";
import EditChallan from "./pages/employee/EditChallan";
import MCollectAcknowledgement from "./pages/employee/EmployeeChallanAcknowledgement";
import NewChallan from "./pages/employee/NewChallan";
import SearchReceipt from "./pages/employee/SearchReceipt";
import SearchChallan from "./pages/employee/SearchChallan";
import SearchBill from "./pages/employee/SearchBill";
import GroupBill from "./pages/employee/GroupBills";
import ChallanStepperForm from "./pageComponents/ChallanStepper/ChallanStepperForm";
import ChallanStepFormOne from "./pageComponents/ChallanStepper/ChallanStepFormOne";
import ChallanStepFormTwo from "./pageComponents/ChallanStepper/ChallanStepFormTwo";
import ChallanStepFormThree from "./pageComponents/ChallanStepper/ChallanStepFormThree";
import ChallanStepFormFour from "./pageComponents/ChallanStepper/ChallanStepFormFour";
import OffenderDetails from "./pageComponents/OffenderDetails";
import OffenceDetails from "./pageComponents/OffenceDetails";
import ChallanSummary from "./pageComponents/ChallanSummary";
import ChallanDocuments from "./pageComponents/ChallanDocuments";
import getRootReducer from "../redux/reducer";
import ChallanResponseCitizen from "./components/ChallanResponseCitizen";
import ChallanApplicationDetails from "./pages/citizen/ChallanApplicationDetails";
import TestComp from "./pageComponents/TestComp";

export const GarbageCollectionModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "UC";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  Digit.SessionStorage.set("ChallanGeneration_TENANTS", tenants);
  if (isLoading) {
    return <Loader />;
  }
  const { path, url } = useRouteMatch();
  console.log("Getting Here CG");

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

export const GarbageCollectionLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("PT_CREATE_PROPERTY112", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/My-Challans`,
      i18nKey: t("GC_MY_APPLICATION"),
    },
    {
      link: `${matchPath}/create-application`,
      i18nKey: t("GC_CREATE_APPLICATION"),
    },
  ];

  console.log("matchPath", matchPath);

  return <CitizenHomeCard header={t("ACTION_TEST_MCOLLECT")} links={links} Icon={() => <PTIcon className="fill-path-primary-main" />} />;
};

export const ChallanReducers = getRootReducer;

const componentsToRegister = {
  ConsumerDetails,
  ServiceDetails,
  AddressDetails,
  ChallanGenerationCard,
  GarbageCollectionModule,
  GarbageCollectionLinks,
  MCollectEmployeeChallan: EmployeeChallan,
  MCollectAcknowledgement: MCollectAcknowledgement,
  MCollectEditChallan: EditChallan,
  MCollectNewChallan: NewChallan,
  MCollectSearchChallanComponent: SearchChallanComponent,
  MCollectSearchResultsComponent: SearchResultsComponent,
  MCollectMyChallanResultsComponent: MyChallanResultsComponent,
  SearchReceipt,
  SearchChallan,
  SearchBill,
  GroupBill,
  MCOLLECT_INBOX_FILTER: (props) => <InboxFilter {...props} />,
  ChallanStepperForm,
  ChallanStepFormOne,
  ChallanStepFormTwo,
  ChallanStepFormThree,
  ChallanStepFormFour,
  OffenderDetails,
  OffenceDetails,
  ChallanSummary,
  ChallanDocuments,
  ChallanResponseCitizen,
  ChallanApplicationDetails,
  TestComp,
};

export const initGarbageCollectionComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
