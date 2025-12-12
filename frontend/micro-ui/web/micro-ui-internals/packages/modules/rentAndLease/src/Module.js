import { CitizenHomeCard, Loader, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import InboxFilter from "./components/inbox/NewInboxFilter";
import RentAndLeaseCard from "./components/RentAndLeaseCard";
import EmployeeChallan from "./EmployeeChallan";
import AddressDetails from "./pageComponents/AddressDetails";
import ConsumerDetails from "./pageComponents/ConsumerDetails";
import ServiceDetails from "./pageComponents/ServiceDetails";
import CitizenApp from "./pages/citizen";
import MyChallanResultsComponent from "./pages/citizen/MyProperties";
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
import getRootReducer from "./redux/reducer";
import NewRentAndLeaseStepperForm from "./pageComponents/NewRentAndLeaseStepper/NewRentAndLeaseStepperForm";
import NewRentAndLeaseStepFormOne from "./pageComponents/NewRentAndLeaseStepper/NewRentAndLeaseStepFormOne";
import NewRentAndLeaseStepFormTwo from "./pageComponents/NewRentAndLeaseStepper/NewRentAndLeaseStepFormTwo";
import NewRentAndLeaseStepFormThree from "./pageComponents/NewRentAndLeaseStepper/NewRentAndLeaseStepFormThree";
import NewRentAndLeaseStepFormFour from "./pageComponents/NewRentAndLeaseStepper/NewRentAndLeaseStepFormFour";
import RentAndLeaseCitizenDetails from "./pageComponents/RentAndLeaseCitizenDetails";
import RentAndLeasePropertyDetails from "./pageComponents/RentAndLeasePropertyDetails";
import RentAndLeaseSelectProofIdentity from "./pageComponents/RentAndLeaseSelectProofIdentity";
import RentAndLeaseSummary from "./pageComponents/RentAndLeaseSummary";
import RentAndLeaseDocument from "./pageComponents/RentAndLeaseDocument";
import CustomDatePicker from "./pageComponents/CustomDatePicker";
import RALApplicationDetails from "./pages/citizen/RALApplicationDetails";
import RALResponse from "./pageComponents/Reponse";
import MyProperties from "./pages/citizen/MyProperties/myProperties";
import RALEmptyResultInbox from "./components/RALEmptyResultInbox";

export const RentAndLeaseReducers = getRootReducer;

export const RentAndLeaseModule = ({ stateCode, userType, tenants }) => {
  const moduleCode = "UC";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });
  Digit.SessionStorage.set("ChallanGeneration_TENANTS", tenants);
  const { path, url } = useRouteMatch();

  // Register components
  useEffect(() => {
    initRentAndLeaseComponents();
  }, []);

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

  if (isLoading) {
    return <Loader />;
  }

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

export const RentAndLeaseLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("RENT_LEASE_CREATE", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/search`,
      i18nKey: t("UC_SEARCH_AND_PAY"),
    },
    {
      link: `${matchPath}/my-properties`,
      i18nKey: t("UC_MY_PROPERTIES"),
    },
    {
      link: `${matchPath}/new-application`,
      i18nKey: t("RENT_LEASE_CREATE_APPLICATION"),
    },
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_MCOLLECT")} links={links} Icon={() => <PTIcon className="fill-path-primary-main" />} />;
};

const componentsToRegister = {
  RALApplicationDetails,
  ConsumerDetails,
  ServiceDetails,
  AddressDetails,
  RentAndLeaseCard,
  RentAndLeaseModule,
  RentAndLeaseLinks,
  MCollectEmployeeChallan: EmployeeChallan,
  MCollectAcknowledgement: MCollectAcknowledgement,
  MCollectEditChallan: EditChallan,
  MCollectNewChallan: NewChallan,
  MCollectSearchChallanComponent: SearchChallanComponent,
  MCollectSearchResultsComponent: SearchResultsComponent,
  MCollectMyChallanResultsComponent: MyChallanResultsComponent,
  MyProperties,
  SearchReceipt,
  SearchChallan,
  SearchBill,
  GroupBill,
  MCOLLECT_INBOX_FILTER: (props) => <InboxFilter {...props} />,
  // New stepper form components
  NewRentAndLeaseStepperForm,
  NewRentAndLeaseStepFormOne,
  NewRentAndLeaseStepFormTwo,
  NewRentAndLeaseStepFormThree,
  NewRentAndLeaseStepFormFour,
  RentAndLeaseCitizenDetails,
  RentAndLeasePropertyDetails,
  RentAndLeaseSelectProofIdentity,
  RentAndLeaseSummary,
  RentAndLeaseDocument,
  RALResponse,
  CustomDatePicker,
  RALEmptyResultInbox,
};

export const initRentAndLeaseComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
