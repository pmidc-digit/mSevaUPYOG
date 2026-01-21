import { Header, CitizenHomeCard, PTIcon } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
// import Area from "./pageComponents/Area";
// import Electricity from "./pageComponents/Electricity";
// import Remarks from "./pageComponents/Remarks";
// import VasikaDetails from "./pageComponents/VasikaDetails";
// import AllotmentDetails from "./pageComponents/AllotmentDetails";
// import BusinessName from "./pageComponents/BusinessName";
// import ExistingPropertyId from "./pageComponents/ExistingPropertyId";
// import YearOfCreation from "./pageComponents/YearOfCreation";
// import SurveyId from "./pageComponents/SurveyId";

// import UID from "./pageComponents/UID";
// import PTLandArea from "./pageComponents/PTLandArea";
// import GroundFloorDetails from "./pageComponents/GroundFloorDetails";
// import IsAnyPartOfThisFloorUnOccupied from "./pageComponents/IsAnyPartOfThisFloorUnOccupied";
// import IsResidential from "./pageComponents/IsResidential";
// import IsThisFloorSelfOccupied from "./pageComponents/IsThisFloorSelfOccupied";
// import Proof from "./pageComponents/Proof";
// import PropertyBasementDetails from "./pageComponents/PropertyBasementDetails";
// import PropertyFloorDetails from "./pageComponents/PropertyFloorDetails";
// import PropertyTax from "./pageComponents/PropertyTax";
// import PropertyType from "./pageComponents/PropertyType";
// import PropertyUsageType from "./pageComponents/PropertyUsageType";
// import ProvideSubUsageType from "./pageComponents/ProvideSubUsageType";
// import ProvideSubUsageTypeOfRentedArea from "./pageComponents/ProvideSubUsageTypeOfRentedArea";
// import PTWFApplicationTimeline from "./pageComponents/PTWFApplicationTimeline";
// import PTSelectAddress from "./pageComponents/PTSelectAddress";
// import PTSelectGeolocation from "./pageComponents/PTSelectGeolocation";
// import PTSelectStreet from "./pageComponents/PTSelectStreet";
// import PTSelectPincode from "./pageComponents/PTSelectPincode";
// import RentalDetails from "./pageComponents/RentalDetails";
// import SelectInistitutionOwnerDetails from "./pageComponents/SelectInistitutionOwnerDetails";
// import SelectOwnerAddress from "./pageComponents/SelectOwnerAddress";
// import SelectOwnerDetails from "./pageComponents/SelectOwnerDetails";
// import SelectOwnerShipDetails from "./pageComponents/SelectOwnerShipDetails";
// import SelectProofIdentity from "./pageComponents/SelectProofIdentity";
// import SelectSpecialOwnerCategoryType from "./pageComponents/SelectSpecialOwnerCategoryType";
// import SelectSpecialProofIdentity from "./pageComponents/SelectSpecialProofIdentity";
// import Units from "./pageComponents/Units";
// import SelectAltContactNumber from "./pageComponents/SelectAltContactNumber";
// import SelectDocuments from "./pageComponents/SelectDocuments";
// import UnOccupiedArea from "./pageComponents/UnOccupiedArea";
// import PTEmployeeOwnershipDetails from "./pageComponents/OwnerDetailsEmployee";
import CitizenApp from "./pages/citizen";
// import SearchPropertyCitizen from "./pages/citizen/SearchProperty/searchProperty";
// import SearchResultCitizen from "./pages/citizen/SearchResults";
// import PTCheckPage from "./pages/citizen/Create/CheckPage";
// import PTAcknowledgement from "./pages/citizen/Create/PTAcknowledgement";
// import PropertySearchForm from "./components/search/PropertySearchForm";
// import PropertySearchResults from "./components/search/PropertySearchResults";
// import { PTMyPayments } from "./pages/citizen/MyPayments";
// import SelectPTUnits from "./pageComponents/SelectPTUnits";
// import CreateProperty from "./pages/citizen/Create";
// import { PTMyApplications } from "./pages/citizen/PTMyApplications";
// import { MyProperties } from "./pages/citizen/MyProperties";
// import PTApplicationDetails from "./pages/citizen/PTApplicationDetails";
// import SearchPropertyComponent from "./pages/citizen/SearchProperty";
// import SearchResultsComponent from "./pages/citizen/SearchResults";
// import EditProperty from "./pages/citizen/EditProperty";
// import MutateProperty from "./pages/citizen/Mutate";
// import SearchPTIDProp from "./components/search/SearchDefaulter";
// import PropertyInformation from "./pages/citizen/MyProperties/propertyInformation";
// import PTWFCaption from "./pageComponents/PTWFCaption";
// import PTWFReason from "./pageComponents/PTWFReason";
// import ProvideFloorNo from "./pageComponents/ProvideFloorNo";
// import PropertyOwnerHistory from "./pages/citizen/MyProperties/propertyOwnerHistory";
// import TransferDetails from "./pages/citizen/MyProperties/propertyOwnerHistory";
// import TransfererDetails from "./pageComponents/Mutate/TransfererDetails";
// import OwnerMutate from "./pageComponents/Mutate/Owner";
// import PTComments from "./pageComponents/Mutate/Comments";
// import IsMutationPending from "./pageComponents/Mutate/IsMutationPending";
// import UnderStateAquire from "./pageComponents/Mutate/underStateAquire";
// import PropertyMarketValue from "./pageComponents/Mutate/PropertyMarketValue";
// import PTReasonForTransfer from "./pageComponents/Mutate/ReasonForTransfer";
// import PTRegistrationDocument from "./pageComponents/Mutate/RegistrationDocument";
// import TransferProof from "./pageComponents/Mutate/transferReasonDocument";
// import UpdateNumber from "./pages/citizen/MyProperties/updateNumber";
// import EmployeeUpdateOwnerNumber from "./pages/employee/updateNumber";
// import PropertyStructureDetails from "./pageComponents/PropertyStructureDetails";
// import PropertyDetailsCitizen from "./pages/citizen/MyProperties/PropertyDetails";
// import { PropertyApplicationDetails } from "./pages/citizen/MyProperties/PropertyApplicationDetails";
// import PTResponseCitizen from "./pages/citizen/PTResponseCitizen";
// import PTResponseEmployee from "./pages/employee/PTResponseEmployee";

import EmployeeApp from "./pages/employee";
import PTCard from "./components/PTCard";
import InboxFilter from "./components/inbox/NewInboxFilter";
import EmptyResultInbox from "./components/empty-result";
import { TableConfig } from "./config/inbox-table-config";
// import NewApplication from "./pages/employee/NewApplication";
// import ApplicationDetails from "./pages/employee/ApplicationDetails";
// import PropertyDetails from "./pages/employee/PropertyDetails";
// import AssessmentDetails from "./pages/employee/AssessmentDetails";
// import EditApplication from "./pages/employee/EditApplication";
// import Response from "./pages/Response";
// import TransferOwnership from "./pages/employee/PropertyMutation";
// import DocsRequired from "./pages/employee/PropertyMutation/docsRequired";
// import SelectOtp from "../../core/src/pages/citizen/Login/SelectOtp";
// import CitizenFeedback from "@mseva/digit-ui-module-core/src/components/CitizenFeedback";
// import AcknowledgementCF from "@mseva/digit-ui-module-core/src/components/AcknowledgementCF";
//import PTCitizenFeedbackPopUp from "./pageComponents/PTCitizenFeedbackPopUp";

// import PTSelectLandmark from "./pageComponents/PTSelectLandmark";
// import NewPropertyStepForm from "../src/pages/employee/NewApplication/NewApplicationStepForm/NewPropertyStepForm";
// import PTNewFormStepOne from "../src/pages/employee/NewApplication/NewApplicationStepForm/PTNewFormStepOne";
// import PTNewFormStepTwo from "../src/pages/employee/NewApplication/NewApplicationStepForm/PTNewFormStepTwo";
// import PTNewFormStepThree from "../src/pages/employee/NewApplication/NewApplicationStepForm/PTNewFormStepThree";
// import PTNewFormStepFour from "../src/pages/employee/NewApplication/NewApplicationStepForm/PTNewFormStepFour";
// import PTNewFormSummaryStepFive from "../src/pages/employee/NewApplication/NewApplicationStepForm/PTNewFormSummaryStepFive";
// import EditPropertyStepForm from "../src/pages/employee/EditApplication/EditPropertyStepForm";
// import PTEditFormStepOne from "../src/pages/employee/EditApplication/PTEditFormStepOne";
// import PTEditFormStepTwo from "../src/pages/employee/EditApplication/PTEditFormStepTwo";
// import PTEditFormStepThree from "../src/pages/employee/EditApplication/PTEditFormStepThree";
// import PTEditFormStepFour from "../src/pages/employee/EditApplication/PTEditFormStepFour";
// import PTEditFormSummaryStepFive from "../src/pages/employee/EditApplication/PTEditFormSummaryStepFive";
// import PTOwnerTransfershipStepOne from "../src/pages/employee/PropertyMutation/OwnerTransfership/PTOwnerTransfershipStepOne";
// import OwnerTransfershipStepForm from "../src/pages/employee/PropertyMutation/OwnerTransfership/OwnerTransfershipStepForm";
// import PTOwnerTransfershipStepTwo from "../src/pages/employee/PropertyMutation/OwnerTransfership/PTOwnerTransfershipStepTwo";
// import PTOwnerTransfershipSummaryStepThree from "../src/pages/employee/PropertyMutation/OwnerTransfership/PTOwnerTransfershipSummaryStepThree";
// import PropertyCheckboxQuestions from "./pageComponents/PropertyCheckboxQuestions";
// import { AssessmentDetails as AssessmentDetailsCitizen } from "./pages/citizen/MyProperties/AssessmentDetails";

// import { NewApplication as NewApplicationCitizen } from "./pages/citizen/Create/NewApplication";
// import CreateEmployeeStepForm from "./pages/citizen/Create/NewApplicationStepForm/NewPropertyStepForm";
// import { PTNewFormStepOne as PTNewFormStepOneCitizen } from "./pages/citizen/Create/NewApplicationStepForm/PTNewFormStepOne";
// import { PTNewFormStepTwo as PTNewFormStepTwoCitizen } from "./pages/citizen/Create/NewApplicationStepForm/PTNewFormStepTwo";
// import { PTNewFormStepThree as PTNewFormStepThreeCitizen } from "./pages/citizen/Create/NewApplicationStepForm/PTNewFormStepThree";
// import { PTNewFormStepFour as PTNewFormStepFourCitizen } from "./pages/citizen/Create/NewApplicationStepForm/PTNewFormStepFour";
// import { PTNewFormSummaryStepFive as PTNewFormSummaryStepFiveCitizen } from "../src/pages/citizen/Create/NewApplicationStepForm/PTNewFormSummaryStepFive";
// import SubmitResponse from "./components/Response/submit";
// import CitizenEditPropertyStepForm from "./pages/citizen/EditProperty/CitizenEditPropertyStepForm";
// import CitizenPTEditFormStepOne from "./pages/citizen/EditProperty/CitizenPTEditFormStepOne";
// import CitizenPTEditFormStepTwo from "./pages/citizen/EditProperty/CitizenPTEditFormStepTwo";
// import CitizenPTEditFormStepThree from "./pages/citizen/EditProperty/CitizenPTEditFormStepThree";
// import CitizenPTEditFormStepFour from "./pages/citizen/EditProperty/CitizenPTEditFormStepFour";
// import CitizenPTEditFormSummaryStepFive from "./pages/citizen/EditProperty/CitizenPTEditFormSummaryStepFive";
// import PTSummaryEdit from "./pageComponents/PTSummaryEdit";
// import PTSummaryEmployee from "./pageComponents/PTSummaryEmployee";
// import { GISComponent } from "./pageComponents/GISComponent";
// import { PTNewFormStepZeroCitizen } from "./pages/citizen/Create/NewApplicationStepForm/PTNewFormStepZeroCitizen";
import { GISIntegration } from "./pages/citizen/GISIntegration";
// import { GISIntegration as GISIntegrationEmployee } from "./pages/employee/GISIntegration";

// new stepper form
import NewPTStepperForm from "./pageComponents/NewPTStepper/NewPTStepperForm";
import NewPTStepFormOne from "./pageComponents/NewPTStepper/NewPTStepFormOne";
import NewPTStepFormTwo from "./pageComponents/NewPTStepper/NewPTStepFormTwo";
import NewPTStepFormThree from "./pageComponents/NewPTStepper/NewPTStepFormThree";
import NewPTStepFormFour from "./pageComponents/NewPTStepper/NewPTStepFormFour";
import PTSelectProofIdentity from "./components/PTSelectProofIdentity";
import PTSummary from "../src/pageComponents/PTSummary";
import getRootReducer from "./redux/reducer";

export const PTReducers = getRootReducer;

const componentsToRegister = {
  // PTLandArea,
  // PTCheckPage,
  // PTAcknowledgement,
  // PropertyTax,
  // PTSelectPincode,
  // PTSelectAddress,
  // PTSelectStreet,
  // Proof,
  // SelectOwnerShipDetails,
  // SelectOwnerDetails,
  // SelectSpecialOwnerCategoryType,
  // SelectOwnerAddress,
  // SelectInistitutionOwnerDetails,
  // SelectProofIdentity,
  // SelectSpecialProofIdentity,
  // PTSelectGeolocation,
  // PTWFApplicationTimeline,
  // PTWFCaption,
  // PTWFReason,
  // IsThisFloorSelfOccupied,
  // ProvideSubUsageType,
  // RentalDetails,
  // ProvideSubUsageTypeOfRentedArea,
  // IsAnyPartOfThisFloorUnOccupied,
  // UnOccupiedArea,
  // Area,
  // UID,
  // Electricity,
  // Remarks,
  // VasikaDetails,
  // AllotmentDetails,
  // BusinessName,
  // ExistingPropertyId,
  // YearOfCreation,
  // SurveyId,
  // PropertyStructureDetails,
  // IsResidential,
  // PropertyType,
  // PropertyUsageType,
  // GroundFloorDetails,
  // PropertyFloorDetails,
  // PropertyBasementDetails,
  // PropertyInformation,
  // ProvideFloorNo,
  // PropertyOwnerHistory,
  // TransferDetails,
  // Units,
  // SelectAltContactNumber,
  // SelectDocuments,
  // PTEmployeeOwnershipDetails,
  // SearchPropertyCitizen,
  // SearchResultCitizen,
  // TransfererDetails,
  // OwnerMutate,
  // PTComments,
  // IsMutationPending,
  // PropertyMarketValue,
  // PTReasonForTransfer,
  // PTRegistrationDocument,
  // UnderStateAquire,
  // TransferProof,
  // UpdateNumber,
  // EmployeeUpdateOwnerNumber,
  // PropertySearchForm,
  // PropertySearchResults,
  // PTMyPayments,
  // SelectPTUnits,
  // // PTNewApplication: NewApplication,
  // ApplicationDetails: ApplicationDetails,
  // PTPropertyDetails: PropertyDetails,
  // PTAssessmentDetails: AssessmentDetails,
  // PTEditApplication: EditApplication,
  // PTResponse: Response,
  // PTTransferOwnership: TransferOwnership,
  // PTDocsRequired: DocsRequired,
  // PTCreateProperty: CreateProperty,
  // PTMyApplications: PTMyApplications,
  // PTMyProperties: MyProperties,
  // PTApplicationDetails: PTApplicationDetails,
  // PTSearchPropertyComponent: SearchPropertyComponent,
  // PTSearchResultsComponent: SearchResultsComponent,
  // PTEditProperty: EditProperty,
  // PTMutateProperty: MutateProperty,
  //PTCitizenFeedbackPopUp,
  // PTCitizenFeedback,
  // PTAcknowledgementCF,
  // SelectOtp, // To-do: Temp fix, Need to check why not working if selectOtp module is already imported from core module
  // AcknowledgementCF,
  // CitizenFeedback,
  // PTSelectLandmark,
  // SearchPTIDProp,
  // NewPropertyStepForm,
  // PTNewFormStepOne,
  // PTNewFormStepTwo,
  // PTNewFormStepThree,
  // PTNewFormStepFour,
  // PTNewFormSummaryStepFive,
  PTSummary,
  // NewApplicationCitizen,
  // CreateEmployeeStepForm,
  // EditPropertyStepForm,
  // PTEditFormStepOne,
  // PTEditFormStepTwo,
  // PTEditFormStepThree,
  // PTEditFormStepFour,
  // PTEditFormSummaryStepFive,
  // PTOwnerTransfershipStepOne,
  // OwnerTransfershipStepForm,
  // PTOwnerTransfershipStepTwo,
  // PTOwnerTransfershipSummaryStepThree,
  // PropertyCheckboxQuestions,

  // PTNewFormStepOneCitizen,
  // PTNewFormStepTwoCitizen,
  // PTNewFormStepThreeCitizen,
  // PTNewFormStepFourCitizen,
  // PTNewFormSummaryStepFiveCitizen,
  // PropertyDetailsCitizen,
  // PropertyApplicationDetails,
  // AssessmentDetailsCitizen,
  // SubmitResponse,
  // PTResponseCitizen,
  // PTResponseEmployee,
  // CitizenEditPropertyStepForm,
  // CitizenPTEditFormStepOne,
  // CitizenPTEditFormStepTwo,
  // CitizenPTEditFormStepThree,
  // CitizenPTEditFormStepFour,
  // CitizenPTEditFormSummaryStepFive,
  // PTSummaryEdit,
  // PTSummaryEmployee,
  // GISComponent,
  // PTNewFormStepZeroCitizen,
  GISIntegration,
  // GISIntegrationEmployee,

  NewPTStepperForm,
  NewPTStepFormOne,
  NewPTStepFormTwo,
  NewPTStepFormThree,
  NewPTStepFormFour,
  PTSelectProofIdentity,
};

const addComponentsToRegistry = () => {
  Object.entries(componentsToRegister).forEach(([key, value]) => {
    Digit.ComponentRegistryService.setComponent(key, value);
  });
};

export const PTModule = ({ stateCode, userType, tenants }) => {
  const { path, url } = useRouteMatch();

  const moduleCode = "PT";
  const language = Digit.StoreData.getCurrentLanguage();
  const { isLoading, data: store } = Digit.Services.useStore({ stateCode, moduleCode, language });

  addComponentsToRegistry();

  Digit.SessionStorage.set("PT_TENANTS", tenants);
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

export const PTLinks = ({ matchPath, userType }) => {
  const { t } = useTranslation();
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("PT_CREATE_PROPERTY", {});

  useEffect(() => {
    clearParams();
  }, []);

  const links = [
    {
      link: `${matchPath}/property/citizen-search`,
      i18nKey: t("PT_SEARCH_AND_PAY"),
    },
    {
      link: `/digit-ui/citizen/payment/my-bills/PT`,
      i18nKey: t("CS_TITLE_MY_BILLS"),
    },
    {
      link: `${matchPath}/property/my-payments`,
      i18nKey: t("PT_MY_PAYMENTS_HEADER"),
    },
    {
      link: `${matchPath}/property/new-application`,
      i18nKey: t("PT_CREATE_PROPERTY"),
    },
    {
      link: `${matchPath}/property/my-properties`,
      i18nKey: t("PT_MY_PROPERTIES"),
    },
    {
      link: `${matchPath}/property/my-applications`,
      i18nKey: t("PT_MY_APPLICATION"),
    },
    {
      link: `${matchPath}/property/property-mutation`,
      i18nKey: t("PT_PROPERTY_MUTATION"),
    },
    {
      link: `${matchPath}/howItWorks`,
      i18nKey: t("PT_HOW_IT_WORKS"),
    },
    {
      link: `${matchPath}/faqs`,
      i18nKey: t("PT_FAQ_S"),
    },
  ];

  return <CitizenHomeCard header={t("ACTION_TEST_PROPERTY_TAX")} links={links} Icon={() => <PTIcon className="fill-path-primary-main" />} />;
};

export const PTComponents = {
  PTCard,
  PTModule,
  PTLinks,
  PT_INBOX_FILTER: (props) => <InboxFilter {...props} />,
  PTEmptyResultInbox: EmptyResultInbox,
  PTInboxTableConfig: TableConfig,
};
