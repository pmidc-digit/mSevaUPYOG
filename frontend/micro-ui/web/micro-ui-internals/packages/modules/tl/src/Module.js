import { Header, CitizenHomeCard, CaseIcon, HomeLink } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import TradeLicense from "../src/pageComponents/TradeLicense";
import TLSelectGeolocation from "../src/pageComponents/TLSelectGeolocation";
import TLSelectAddress from "./pageComponents/TLSelectAddress";
import TLSelectPincode from "./pageComponents/TLSelectPincode";
import Proof from "./pageComponents/Proof";
import SelectOwnerShipDetails from "./pageComponents/SelectOwnerShipDetails";
import SelectOwnerDetails from "./pageComponents/SelectOwnerDetails";
import SelectOwnerAddress from "./pageComponents/SelectOwnerAddress";
import SelectProofIdentity from "./pageComponents/SelectProofIdentity";
import SelectOwnershipProof from "./pageComponents/SelectOwnershipProof";
import SelectTradeName from "./pageComponents/SelectTradeName";
import SelectStructureType from "./pageComponents/SelectStructureType";
import SelectStreet from "./pageComponents/SelectStreet";
import SelectVehicleType from "./pageComponents/SelectVehicleType";
import SelectBuildingType from "./pageComponents/SelectBuildingType";
import SelectCommencementDate from "./pageComponents/SelectCommencementDate";
import SelectTradeUnits from "./pageComponents/SelectTradeUnits";
import SelectAccessories from "./pageComponents/SelectAccessories";
import SelectAccessoriesDetails from "./pageComponents/SelectAccessoriesDetails";
import TLCheckPage from "./pages/citizen/Create/CheckPage";
import TLDocument from "./pageComponents/TLDocumets";
import TLAcknowledgement from "./pages/citizen/Create/TLAcknowledgement";
import MyApplications from "./pages/citizen/Applications/Application";
import TradeLicenseList from "./pages/citizen/Renewal/TradeLicenseList";
import TLWFApplicationTimeline from "./pageComponents/TLWFApplicationTimeline";
import SelectOtherTradeDetails from "./pageComponents/SelectOtherTradeDetails";
import TLSelectStreet from "./pageComponents/TLSelectStreet";
import TLSelectLandmark from "./pageComponents/TLSelectLandMark";
import TLSelectOwnerAddress from "./pageComponents/TLSelectOwnerAddress";
import PropertySearchSummary from "./pageComponents/PropertySearchSummary";
import NewApplicationModal from "./pageComponents/NewApplicationModal";

import TLOwnerDetailsEmployee from "./pageComponents/TLOwnerDetailsEmployee";
import TLTradeDetailsEmployee from "./pageComponents/TLTradeDetailsEmployee";
import TLTradeUnitsEmployee from "./pageComponents/TLTradeUnitsEmployee";
import TLAccessoriesEmployee from "./pageComponents/TLAccessoriesEmployee";
import TLDocumentsEmployee from "./pageComponents/TLDocumentsEmployee";
import TLCard from "./components/TLCard";
import TLInfoLabel from "./pageComponents/TLInfoLabel";
import SearchApplication from "./components/SearchApplication";
import SearchLicense from "./components/SearchLicense";
import TL_INBOX_FILTER from "./components/inbox/InboxFilter";
import NewApplication from "./pages/employee/NewApplication";
import ReNewApplication from "./pages/employee/ReNewApplication";
import Search from "./pages/employee/Search";
import Response from "./pages/Response";

import TLApplicationDetails from "./pages/citizen/Applications/ApplicationDetails";
import CreateTradeLicence from "./pages/citizen/Create";
import EditTrade from "./pages/citizen/EditTrade";
import { TLList } from "./pages/citizen/Renewal";
import RenewTrade from "./pages/citizen/Renewal/renewTrade";
import SearchTradeComponent from "./pages/citizen/SearchTrade";
import SelectTradeUnitsInitial from "./pageComponents/SelectTradeUnitsInitial";
import TLTradeUnitsEmployeeInitial from "./pageComponents/TLTradeUnitsEmployeeInitial";
import CommonRedirect from "./pageComponents/CommonRedirect";
import CitizenApp from "./pages/citizen";
import EmployeeApp from "./pages/employee";
import getRootReducer from "./redux/reducer";
import TLTradeVlidityEmployee from "./pageComponents/TLTradeValidityEmployee";
import NewTLStepForm from "./pages/employee/NewApplication/NewApplicationStepForm/NewTLStepForm";
import TLNewFormStepOne from "./pages/employee/NewApplication/NewApplicationStepForm/TLNewFormStepOne";
import TLNewFormStepTwo from "./pages/employee/NewApplication/NewApplicationStepForm/TLNewFormStepTwo";
import TLNewFormStepThree from "./pages/employee/NewApplication/NewApplicationStepForm/TLNewFormStepThree";
import TLNewSummaryStepFour from "./pages/employee/NewApplication/NewApplicationStepForm/TLNewSummaryStepFour";
import TLSummaryPage from "./pageComponents/TLSummaryPage";
import RenewTLStepForm from "./pages/employee/ReNewApplication/ReNewApplicationStepForm/RenewTLStepForm";
import RenewTLFormStepOne from "./pages/employee/ReNewApplication/ReNewApplicationStepForm/RenewTLFormStepOne";
import RenewTLFormStepTwo from "./pages/employee/ReNewApplication/ReNewApplicationStepForm/RenewTLFormStepTwo";
import RenewTLFormStepThree from "./pages/employee/ReNewApplication/ReNewApplicationStepForm/RenewTLFormStepThree";
import RenewTLSummaryStepFour from "./pages/employee/ReNewApplication/ReNewApplicationStepForm/RenewTLSummaryStepFour";
//For Citizen:
import TLCreateTradeLicenceStepForm from "./pages/citizen/Create/NewApplicationStepForm/NewTLStepForm";
import TLNewFormStepOneCitizen from "./pages/citizen/Create/NewApplicationStepForm/TLNewFormStepOne";
import TLNewFormStepTwoCitizen from "./pages/citizen/Create/NewApplicationStepForm/TLNewFormStepTwo";
import TLNewFormStepThreeCitizen from "./pages/citizen/Create/NewApplicationStepForm/TLNewFormStepThree";
import TLNewSummaryStepFourCitizen from "./pages/citizen/Create/NewApplicationStepForm/TLNewSummaryStepFour";
import { RenewTLStepForm as RenewTLStepFormCitizen } from "./pages/citizen/Renewal/ReNewApplicationStepForm/RenewTLStepForm";
import { RenewTLFormStepOne as RenewTLFormStepOneCitizen } from "./pages/citizen/Renewal/ReNewApplicationStepForm/RenewTLFormStepOne";
import { RenewTLFormStepTwo as RenewTLFormStepTwoCitizen } from "./pages/citizen/Renewal/ReNewApplicationStepForm/RenewTLFormStepTwo";
import { RenewTLFormStepThree as RenewTLFormStepThreeCitizen } from "./pages/citizen/Renewal/ReNewApplicationStepForm/RenewTLFormStepThree";
import { RenewTLSummaryStepFour as RenewTLSummaryStepFourCitizen } from "./pages/citizen/Renewal/ReNewApplicationStepForm/RenewTLSummaryStepFour";
import TLResponseCitizen from "./components/TLResponseCitizen";
//

export const TLReducers = getRootReducer;

export const TLModule = ({ stateCode, userType, tenants }) => {
  const { path, url } = useRouteMatch();

  const moduleCode = "TL";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  //addComponentsToRegistry();
  Digit.SessionStorage.set("TL_TENANTS", tenants);

  if (userType === "employee") {
    return <EmployeeApp path={path} url={url} userType={userType} />;
  } else return <CitizenApp />;
};

export const TLLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("PT_CREATE_TRADE", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/tradelicence/new-application`,
      i18nKey: t("TL_CREATE_TRADE"),
    },
    {
      link: `${matchPath}/tradelicence/renewal-list`,
      i18nKey: t("TL_RENEWAL_HEADER"),
    },
    {
      link: `${matchPath}/tradelicence/my-application`,
      i18nKey: t("TL_MY_APPLICATIONS_HEADER"),
    },
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_TRADE_LICENSE")} links={links} Icon={() => <CaseIcon className="fill-path-primary-main" />} />;
};

const componentsToRegister = {
  TLModule,
  TLLinks,
  TLCard,
  TradeLicense,
  SelectTradeName,
  SelectStructureType,
  SelectVehicleType,
  SelectBuildingType,
  SelectCommencementDate,
  SelectTradeUnits,
  SelectAccessories,
  SelectAccessoriesDetails,
  TLSelectGeolocation,
  TLSelectAddress,
  TLSelectPincode,
  TLProof: Proof,
  SelectOwnerShipDetails,
  SelectOwnerDetails,
  SelectOwnerAddress,
  SelectProofIdentity,
  SelectOwnershipProof,
  TLSelectStreet,
  TLSelectLandmark,
  TLSelectOwnerAddress,
  TLCheckPage,
  TLDocument,
  TLAcknowledgement,
  TradeLicenseList,
  MyApplications,
  TLOwnerDetailsEmployee,
  TLTradeDetailsEmployee,
  TLTradeUnitsEmployee,
  TLAccessoriesEmployee,
  TLDocumentsEmployee,
  SearchApplication,
  SearchLicense,
  TL_INBOX_FILTER,
  TLInfoLabel,
  TLWFApplicationTimeline,
  TLApplicationDetails,
  TLCreateTradeLicence: CreateTradeLicence,
  TLEditTrade: EditTrade,
  TLList,
  TLRenewTrade: RenewTrade,
  TLSearchTradeComponent: SearchTradeComponent,
  TLNewApplication: NewApplication,
  TLReNewApplication: ReNewApplication,
  TLSearch: Search,
  TLResponse: Response,
  SelectOtherTradeDetails,
  SelectTradeUnitsInitial,
  TLTradeUnitsEmployeeInitial,
  CommonRedirect,
  TLTradeVlidityEmployee,
  NewTLStepForm,
  TLNewFormStepOne,
  TLNewFormStepTwo,
  TLNewFormStepThree,
  TLNewSummaryStepFour,
  TLSummaryPage,
  RenewTLStepForm,
  RenewTLFormStepOne,
  RenewTLFormStepTwo,
  RenewTLFormStepThree,
  RenewTLSummaryStepFour,
  //For citizen:
  TLCreateTradeLicenceStepForm,
  TLNewFormStepOneCitizen,
  TLNewFormStepTwoCitizen,
  TLNewFormStepThreeCitizen,
  TLNewSummaryStepFourCitizen,
  TLPropertySearchSummary: PropertySearchSummary,
  TLNewApplicationModal: NewApplicationModal,
  TLResponseCitizen,
  RenewTLStepFormCitizen,
  RenewTLFormStepOneCitizen,
  RenewTLFormStepTwoCitizen,
  RenewTLFormStepThreeCitizen,
  RenewTLSummaryStepFourCitizen,
};

export const initTLComponents = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};
