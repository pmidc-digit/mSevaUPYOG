import { CitizenHomeCard, Loader, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import InboxFilter from "./components/inbox/NewInboxFilter";
import RentAndLeaseCard from "./components/RentAndLeaseCard";
import CitizenApp from "./pages/citizen";
import EmployeeApp from "./pages/employee";
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
import MyProperties from "./pages/citizen/MyProperties";
import RALEmptyResultInbox from "./components/RALEmptyResultInbox";
import BillGenie from "./pages/employee/BillGenie";

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

  const stateId = Digit.ULBService.getStateId();

  useEffect(
    () =>
      Digit.LocalizationService.getLocale({
        modules: [`rainmaker-rentAndLease`],
        locale: Digit.StoreData.getCurrentLanguage(),
        tenantId: stateId,
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
  RentAndLeaseCard,
  RentAndLeaseModule,
  RentAndLeaseLinks,
  MyProperties,
  RAL_INBOX_FILTER: (props) => <InboxFilter {...props} />,
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
  RALBillGenie: BillGenie,
};

export const initRentAndLeaseComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
