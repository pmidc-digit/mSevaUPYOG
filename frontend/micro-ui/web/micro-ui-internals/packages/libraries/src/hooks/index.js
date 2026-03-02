import { useInitStore } from "./store";
import useWorkflowDetails from "./workflow";
import useSessionStorage from "./useSessionStorage";
import useQueryParams from "./useQueryParams";
import useDocumentSearch from "./useDocumentSearch";
import useClickOutside from "./useClickOutside";
import useAudit from "./core/useAudit";
import {
  useFetchPayment,
  usePaymentUpdate,
  useFetchCitizenBillsForBuissnessService,
  useFetchBillsForBuissnessService,
  useGetPaymentRulesForBusinessServices,
  useDemandSearch,
  useRecieptSearch,
  useRecieptSearchNew,
  usePaymentSearch,
  useBulkPdfDetails,
} from "./payment";
import { useMCollectRecieptSearch } from "./mcollect/mCollect";
import { useChallanGenerationRecieptSearch } from "./challanGeneration/challanGeneration";
import { useRentAndLeaseRecieptSearch, useRentAndLeaseProperties } from "./rentAndLease/rentAndLease";

import { useUserSearch } from "./userSearch";
import { useApplicationsForBusinessServiceSearch } from "./useApplicationForBillSearch";
import useBoundaryLocalities from "./useLocalities";
import useCommonMDMS from "./useMDMS";
import useCustomMDMS from "./useCustomMDMS";
import useCustomAPIHook from "./useCustomAPIHook";
import useInboxGeneral from "./useInboxGeneral/useInboxGeneral";
import useApplicationStatusGeneral from "./useStatusGeneral";
import useModuleTenants from "./useModuleTenants";
import useStore from "./useStore";
import { useTenants } from "./useTenants";
import useInbox from "./useInbox";
import { useEvents, useClearNotifications, useNotificationCount } from "./events";
import useCreateEvent from "./events/useCreateEvent";
import useUpdateEvent from "./events/useUpdateEvent";
import useNewInboxGeneral from "./useInboxGeneral/useNewInbox";
import useDynamicData from "./useDynamicData";

import useComplaintDetails from "./pgr/useComplaintDetails";
import { useComplaintsList, useComplaintsListByMobile } from "./pgr/useComplaintList";
import useComplaintStatus from "./pgr/useComplaintStatus";
import useComplaintTable from "./pgr/useComplaintTable";
import useComplaintTypes from "./pgr/useComplaintTypes";
import useEmployeeFilter from "./pgr/useEmployeeFilter";
import useInboxData from "./pgr/useInboxData";
import useLocalities from "./pgr/useLocalities";
import useServiceDefs from "./pgr/useServiceDefs";
import usePGRTenants from "./pgr/useTenants";
import usePGRMDMS from "./pgr/useMDMS";
import useComplaintSubType from "./pgr/useComplaintSubType";
import useComplaintStatusCount from "./pgr/useComplaintStatusWithCount";
import usePGRInbox from "./pgr/useInbox";

import useSwachComplaintDetails from "./swach/useComplaintDetails";
import { useSwachComplaintsList, useSwachComplaintsListByMobile } from "./swach/useComplaintList";
import useSwachComplaintStatus from "./swach/useComplaintStatus";
import useSwachComplaintTable from "./swach/useComplaintTable";
import useSwachComplaintTypes from "./swach/useComplaintTypes";
import useSwachEmployeeFilter from "./swach/useEmployeeFilter";
import useAttendence from "./swach/useAttendence";
import useSwachInboxData from "./swach/useInboxData";
import useSwachLocalities from "./swach/useLocalities";
import useSWACHInbox from "./swach/useInbox";
import useSwachBharatCategory from "./swach/useSwachBharatCategory";
import useSwachTenants from "./swach/useTenants";
// import usePGRMDMS from "./pgr/useMDMS";
import useSwachComplaintSubType from "./swach/useComplaintSubType";
import useSwachComplaintStatusCount from "./swach/useComplaintStatusWithCount";
import useCount from "./swach/useCount";
import useViewAttendence from "./swach/useViewAttendence";

import useTenantsFSM from "./fsm/useTenants";
import useDesludging from "./fsm/useDesludging";
import useApplicationStatus from "./fsm/useApplicationStatus";
import useMDMS from "./fsm/useMDMS";
import useSearch from "./fsm/useSearch";
import useSearchAll from "./fsm/useSearchAll";
import useVehicleSearch from "./fsm/useVehicleSearch";
import useVehicleUpdate from "./fsm/useVehicleUpdate";
import useVehicleTripCreate from "./fsm/useVehicleTripCreate";
import useFSMInbox from "./fsm/useInbox";
import useApplicationUpdate from "./fsm/useApplicationUpdate";
import useWorkflowData from "./fsm/useWorkflowData";
import useRouteSubscription from "./fsm/useRouteSubscription";
import useDsoSearch from "./fsm/useDsoSearch";
import usePropertySearch from "./pt/usePropertySearch";
import usePropertySearchNew from "./pt/usePropertySearchNew";
import usePropertySearchWithDue from "./pt/usePropertySearchWithDue";
import usePropertyPayment from "./pt/usePropertyPayment";
import useApplicationDetail from "./fsm/useApplicationDetail";
import useApplicationActions from "./fsm/useApplicationActions";
import useApplicationAudit from "./fsm/useApplicationAudit";
import useSearchForAuditData from "./fsm/useSearchForAudit";
import useVehiclesSearch from "./fsm/useVehiclesSearch";
import useConfig from "./fsm/useConfig";
import useVendorDetail from "./fsm/useVendorDetail";
import useSlum from "./fsm/useSlum";
import usePaymentHistory from "./fsm/usePaymentHistory";
import useVendorCreate from "./fsm/useVendorCreate";
import useVendorUpdate from "./fsm/useVendorUpdate";
import useVehicleDetails from "./fsm/useVehicleDetails";
import useVehicleCreate from "./fsm/useVehicleCreate";
import useUpdateVehicle from "./fsm/useUpdateVehicle";
import useDriverSearch from "./fsm/useDriverSearch";
import useDriverCreate from "./fsm/useDriverCreate";
import useDriverUpdate from "./fsm/useDriverUpdate";
import useDriverDetails from "./fsm/useDriverDetails";
import useVendorSearch from "./fsm/useVendorSearch";
import useAdvanceBalanceCalulation from "./fsm/useAdvanceBalanceCalculation";

import useEmployeeSearch from "./useEmployeeSearch";

import usePropertyMDMS from "./pt/usePropertyMDMS";
import usePropertyAPI from "./pt/usePropertyAPI";
import usePropertyCreateNUpdateAPI from "./pt/usePropertyCreateNUpdateAPI";
import usePropertyDocumentSearch from "./pt/usePropertyDocumentSearch";
import useTenantsPT from "./pt/useTenants";
import usePtApplicationDetail from "./pt/useApplicationDetail";
import usePtApplicationActions from "./pt/useApplicationActions";
import usePtMDMS from "./pt/useMDMS";
import usePropertyAssessment from "./pt/usePropertyAssessment";
import UseAssessmentCreateUlb from "./pt/UseAssessmentCreateUlb";
import usePtCalculationEstimate from "./pt/usePtCalculationEstimate";
import useGenderMDMS from "./pt/useGenderMDMS";
import usePTGenderMDMS from "./pt/usePTGenderMDMS";
import useMyPropertyPayments from "./pt/useMyPropertyPayments";
import useGenericViewProperty from "./pt/useGenericViewProperty";
import useRatingAndFeedbackMDMS from "./pt/useRatingAndFeedbackMDMS";
import useServiceSearchCF from "./pt/useServiceSearchCF";

import useDssMdms from "./dss/useMDMS";
import useDashboardConfig from "./dss/useDashboardConfig";
import useDSSDashboard from "./dss/useDSSDashboard";
import useGetChart from "./dss/useGetChart";

import useMCollectMDMS from "./mcollect/useMCollectMDMS";
import useMCollectSearch from "./mcollect/useMCollectSearch";
import useMcollectSearchBill from "./mcollect/useMcollectSearchBill";
import usemcollectTenants from "./mcollect/useTenants";
import useMCollectCount from "./mcollect/useMCollectCount";
import useMCollectCategory from "./mcollect/useMcollectCategory";
import useMCollectCategoryTypes from "./mcollect/useMcollectCategoryTypes";
import useMCollectTaxHeads from "./mcollect/useMcollectTaxHeads";
import useMcollectFormConfig from "./mcollect/useMcollectFormConfig";

import useChallanGenerationMDMS from "./challanGeneration/useChallanGenerationMDMS";
import useChallanGenerationSearch from "./challanGeneration/useChallanGenerationSearch";
import useChallanGenerationSearchBill from "./challanGeneration/useChallanGenerationSearchBill";
import useChallanGenerationTenants from "./challanGeneration/useTenants";
import useChallanGenerationCount from "./challanGeneration/useChallanGenerationCount";
import useChallanGenerationCategory from "./challanGeneration/useChallanGenerationCategory";
import useChallanGenerationCategoryTypes from "./challanGeneration/useChallanGenerationCategoryTypes";
import useChallanGenerationTaxHeads from "./challanGeneration/useChallanGenerationTaxHeads";
import useChallanGenerationFormConfig from "./challanGeneration/useChallanGenerationFormConfig";
import useChallanInbox from "./challanGeneration/useInbox";

import useRentAndLeaseMDMS from "./rentAndLease/useRentAndLeaseMDMS";
import useRALPropertyMDMS from "./rentAndLease/useRentAndLeasePropertyMDMS";
import useRALDocumentsMDMS from "./rentAndLease/useRentAndLeaseDocumetsMDMS";
import useRentAndLeaseSearch from "./rentAndLease/useRentAndLeaseSearch";
import useRentAndLeaseSearchBill from "./rentAndLease/useRentAndLeaseSearchBill";
import useRentAndLeaseTenants from "./rentAndLease/useTenants";
import useRentAndLeaseCount from "./rentAndLease/useRentAndLeaseCount";
import useRentAndLeaseCategory from "./rentAndLease/useRentAndLeaseCategory";
import useRentAndLeaseCategoryTypes from "./rentAndLease/useRentAndLeaseCategoryTypes";
import useRentAndLeaseTaxHeads from "./rentAndLease/useRentAndLeaseTaxHeads";
import useRentAndLeaseFormConfig from "./rentAndLease/useRentAndLeaseFormConfig";

import useTenantsTL from "./tl/useTenants";
import useTradeLicenseMDMS from "./tl/useTradeLicenseMDMS";
import useTLDocumentSearch from "./tl/useTLDocumentSearch";
import useTradeLicenseAPI from "./tl/useTradeLicenseAPI";
import useTradeLicenseSearch from "./tl/useTradeLicenseSearch";
import { useTLSearchApplication, useTLApplicationDetails } from "./tl/useTLsearchApplication";
import { useNDCSearchApplication, useNDCSearchApplicationEmployee } from "./ndc/useNDCSearchApplication";
import useTLPaymentHistory from "./tl/userPaymentHistory";
import useTLApplicationDetail from "./tl/useApplicationDetail";
import useTLApplicationActions from "./tl/useApplicationActions";
import useTLFetchBill from "./tl/useFetchBill";
import useNDCDocumentSearch from "./ndc/useNDCDocumentSearch";

import useTLGenderMDMS from "./tl/useTLGenderMDMS";
import useTLInbox from "./tl/useInbox";
import useTradeLicenseBillingslab from "./tl/useTradeLicenseBillingslab";
import useTLMDMS from "./tl/useMDMS";
import useTLSearch from "./tl/useSearch";
import useTLWorkflowData from "./tl/useTLWorkflowData";
import useESign from "./tl/useESign";

import useHRMSSearch from "./hrms/useHRMSsearch";
import useHrmsMDMS from "./hrms/useHRMSMDMS";
import useHRMSCreate from "./hrms/useHRMScreate";
import useHRMSUpdate from "./hrms/useHRMSUpdate";
import useHRMSCount from "./hrms/useHRMSCount";
import useHRMSGenderMDMS from "./hrms/useHRMSGender";
import useOBPSRoles from "./hrms/useOBPSRoles";
import useEmployeeList from "./hrms/useEmployeeList";
import useZones from "./hrms/useZones";

import useReceiptsSearch from "./receipts/useReceiptsSearch";
import useReceiptsMDMS from "./receipts/useReceiptsMDMS";
import useReceiptsUpdate from "./receipts/useReceiptsUpdate";

import SearchMdmsTypes from "./obps/SearchMdmsTypes";
import useOBPSMDMS from "./obps/useMDMS";
import useOBPSSearch from "./obps/useOBPSSearch";
import useScrutinyDetails from "./obps/useScrutinyDetails";
import useQualificationTypes from "./obps/useQualificationTypes";
import useTenantsOBPS from "./obps/useTenants";
import useNocDetails from "./obps/useNocDetails";
import useNocCreateAPI from "./noc/useNocCreateAPI";
import useNOCApplicationActions from "./noc/useNOCApplicationActions";
import useOBPSDocumentSearch from "./obps/useOBPSDocumentSearch";
import useObpsAPI from "./obps/useObpsAPI";
import useBPADetails from "./obps/useBPADetails";
import useBPASearch from "./obps/useBPASearch";
import { useBPAREGgetbill } from "./obps/useBPAREGgetbill";
import useStakeholderAPI from "./obps/useStakeholderAPI";
import useOCEdcrSearch from "./obps/useOCEdcrSearch";
import useLicenseDetails from "./obps/useLicenseDetails";
import useBPAREGApplicationActions from "./obps/useBPAREGApplicationActions";
import useBPADetailsPage from "./obps/useBPADetailsPage";
import useBPAInbox from "./obps/useBPAInbox";
import useEDCRInbox from "./obps/useEDCRInbox";
import useBPAApplicationActions from "./obps/useApplicationActions";
import useArchitectInbox from "./obps/useArchitectInbox";
import useBPAREGSearch from "./obps/useBPAREGSearch";
import useEmpBPAREGSearch from "./obps/useEmpBPAREGSearch";
import useServiceTypeFromApplicationType from "./obps/useServiceTypeFromApplicationType";
import useBusinessServiceBasedOnServiceType from "./obps/useBusinessServiceBasedOnServiceType";
import useBusinessServiceData from "./obps/useBusinessServiceData";
import useBPATaxDocuments from "./obps/useBPATaxDocuments";
import { useBPACalculation } from "./obps/useBPACalculation";

import useEventInbox from "./events/useEventInbox";
import useEventDetails from "./events/useEventDetails";
import { useEngagementMDMS } from "./engagement/useMdms";
import useDocSearch from "./engagement/useSearch";
import useDocCreate from "./engagement/useCreate";
import useDocUpdate from "./engagement/useUpdate";
import useDocDelete from "./engagement/useDelete";

import useSurveyCreate from "./surveys/useCreate";
import useSurveyDelete from "./surveys/useDelete";
import useSurveyUpdate from "./surveys/useUpdate";
import useSurveySearch from "./surveys/useSearch";
import useSurveyShowResults from "./surveys/useShowResults";
import useSurveySubmitResponse from "./surveys/useSubmitResponse";
import useSurveyInbox from "./surveys/useSurveyInbox";
import useSurveyCategoryInbox from "./surveys/useSurveyCategoryInbox";
import useSurveyQuestionInbox from "./surveys/useSurveyQuestionInbox";

import useNOCDetails from "./noc/useNOCDetails";
import useNOCInbox from "./noc/useInbox";
import { useNOCSearchApplication, useNOCCitizenSearchApplication, useNOCSearchApplicationByIdOrMobile, useNOCCheckListSearch } from "./noc/useSearchApplications";
import useBuildingCategory from "./noc/useBuildingCategory";
import useBuildingType from "./noc/useBuildingType";
import useRoadType from "./noc/useRoadType";
import useNOCTenants from "./noc/useTenants";
import useNOCDocumentSearch from "./noc/useNOCDocumentsSearch";
import useNocType from "./noc/useNocType";
import useNOCFeeCalculator from "./noc/useNOCFeeCalculator";

import WSSearchMdmsTypes from "./ws/WSSearchMdmsTypes";
import usewsTenants from "./ws/useTenants";
import useWaterSearch from "./ws/useWaterSearch";
import useSewarageSearch from "./ws/useSewarageSearch";
import useMyBillsWaterSearch from "./ws/useMyBillsWaterSearch";
import useMyBillsSewarageSearch from "./ws/useMyBillsSewarageSearch";
import useMyApplicationSearch from "./ws/useMyApplicationSearch";
import useWSDocumentSearch from "./ws/useWSDocumentSearch";
import useWSMDMSWS from "./ws/useWSMDMSWS";
import WSuseSearch from "./ws/useSearch";
import useOldValue from "./ws/useOldValue";
import useSewSearch from "./ws/useSewSearch";
import useSearchWS from "./ws/useSearchWS";
import useBulkSearchWS from "./ws/useBulkSearchWS";
import useMypaymentWS from "./ws/useMypaymentWS";
import useWSDetailsPage from "./ws/useWSDetailsPage";
import useWSApplicationActions from "./ws/useApplicationActions";
import useApplicationActionsBillAmendUpdate from "./ws/useApplicationActionsBillAmendUpdate";
import useWSConsumptionSearch from "./ws/useConsumptionSearch";
import useWSMDMS from "./ws/useWSMDMS";
import useAccessControl from "./useAccessControl";
import useConnectionDetail from "./ws/useConnectionDetail";
import useBillSearch from "./bills/useBillSearch";
import useCancelBill from "./bills/useCancelBill";
import useWaterCreateAPI from "./ws/useWaterCreateAPI";
import useSewerageCreateAPI from "./ws/useSewerageCreateAPI";
import useWSUpdateAPI from "./ws/useWSUpdateAPI";
import useCreateBillAmendment from "./ws/useCreateBillAmendment";
import useWSApplicationDetailsBillAmendment from "./ws/useWSApplicationDetailsBillAmendment";
import useWSInbox from "./ws/useInbox";
import useTenantsBills from "./bills/useTenants";
import useMeterReadingCreateAPI from "./ws/useMeterConnectionCreateAPI";
import useGetMeterStatusList from "./ws/useGetMeterStatusList";
import useGetBillingPeriodValidation from "./ws/useBillingPeriodValidation";
import useReportMeta from "./reports/useReport";
import useWaterPropertySearch from "./ws/useWaterPropertySearch";
import useDisconnectionWorkflow from "./ws/useDisconnectionWorkflow";
import useDisConnectionDetails from "./ws/useDisConnectionDetails";
import useWSModifyDetailsPage from "./ws/useWSModifyDetailsPage";
import useBulkMeterReadingCreateAPI from "./ws/useBulkMeterCreate";

import useGetHowItWorksJSON from "./useHowItWorksJSON";
import useGetFAQsJSON from "./useGetFAQsJSON";
import useGetDSSFAQsJSON from "./useGetDSSFAQsJSON";
import useGetDSSAboutJSON from "./useGetDSSAboutJSON";
import useStaticData from "./useStaticData";
import useBillAmendmentInbox from "./billAmendment/useInbox";
import { usePrivacyContext } from "./usePrivacyContext";
import useToCheckPrivacyEnablement from "./ws/useToCheckPrivacyEnablement";
import useWSConfigMDMS from "./ws/useWSConfigMDMS";
import useFeedBackSearch from "./useFeedBackSearch";

import usePetMDMS from "./ptr/usePetMDMS";
import useDocumentsMDMS from "./ptr/useDocumentsMDMS";

import useBreedTypeMDMS from "./ptr/useBreedTypeMDMS";
import usePTRCreateAPI from "./ptr/usePTRCreateAPI";
import usePTRPetMDMS from "./ptr/usePTRPetMDMS";
import usePTRGenderMDMS from "./ptr/usePTRGenderMDMS";
import usePTRSearch from "./ptr/usePTRSearch";
import usePtrApplicationDetail from "./ptr/usePtrApplicationDetail";
import usePTRApplicationAction from "./ptr/usePTRApplicationAction";
import useServiceSearchPTR from "./ptr/useServiceSearchPTR";
import usePetDocumentSearch from "./ptr/usePetDocumentSearch";
import useMyPetPayments from "./ptr/useMyPetPayments";
import useTenantsPTR from "./ptr/useTenants";
import useSVDoc from "./sv/useSVDoc";
import useSvCreateApi from "./sv/useSvCreateApi";
import useTenantsSV from "./sv/useTenants";
import useSVApplicationDetail from "./sv/useSVApplicationDetail";
import useSvSearchApplication from "./sv/useSvSearchApplication";
import useSVApplicationAction from "./sv/useSVApplicationAction";
import createTokenAPI from "./digiLockerApi/createTokenAPI";

// ads
import useADSSlotSearch from "./ads/useADSSlotSearch";
import useADSSearch from "./ads/useADSSearch";
import useADSApplicationDetail from "./ads/useADSApplicationDetail";
import useADSCreateAPI from "./ads/useADSCreateAPI";
import useTenantsADS from "./ads/useTenants";
import useADSDocumentsMDMS from "./ads/useADSDocumentsMDMS";
import useADSDocumentSearch from "./ads/useADSDocumentSearch";
import useADSDemandEstimation from "./ads/useADSDemandEstimation";
import useADSAdTypeMDMS from "./ads/useADSAdTypeMDMS";
import useADSTaxAmountMDMS from "./ads/useADSTaxAmountMDMS";
import useADSLocationMDMS from "./ads/useADSLocationMDMS";
import useADSFaceAreaMDMS from "./ads/useADSFaceAreaMDMS";
import useADSCalculationTypeMDMS from "./ads/useADSCalculationTypeMDMS";
import useADSAdvServicesMDMS from "./ads/useADSAdvServicesMDMS";
import { useADSSearchApplication, useADSSearchApplicationEmployee } from "./ads/useADSSearchApplication";
import useADSScheduleTypeMDMS from "./ads/useADSScheduleTypeMDMS";
import useADSAllMDMS from "./ads/useADSAllMDMS";

// ndc
import useNDCInbox from "./ndc/useInbox";
import useCHBInbox from "./chb/useInbox";
import useSpecialCategory from "./chb/useSpecialCategory";
import useResidentType from "./chb/useResidentType";
import usePurpose from "./chb/usePurpose";
import useChbCreateAPI from "./chb/useChbCreateAPI";
import useChbDocumentsMDMS from "./chb/useChbDocumentsMDMS";
import useChbDocumentSearch from "./chb/useChbDocumentSearch";
import useChbApplicationDetail from "./chb/useChbApplicationDetail";
import useChbSearch from "./chb/useChbSearch";
import useTenantsCHB from "./chb/useTenants";
import useChbApplicationAction from "./chb/useChbApplicationAction";
import useServiceSearchCHB from "./chb/useServiceSearchCHB";
import useChbCommunityHalls from "./chb/useChbCommunityHalls";
import useChbHallCode from "./chb/useChbHallCode";
import useChbSlotSearch from "./chb/useChbSlotSearch";
import useDemandEstimation from "./chb/useDemandEstimation";

// asset hooks here
import useAssetClassification from "./asset/useAssetClassification";
import useAssetType from "./asset/useAssetType";
import useAssetDocumentsMDMS from "./asset/useAssetDocumentsMDMS";
import useAssetSubType from "./asset/useAssetSubType";
import useAssetdetail from "./asset/useAssetdetail";
import useAssetCreateAPI from "./asset/useAssetCreateAPI";
import useAssetApplicationDetail from "./asset/useAssetApplicationDetail";
import useASSETSearch from "./asset/useASSETSearch";
import useTenantsASSET from "./asset/useTenants";
import useASSETApplicationAction from "./asset/useASSETApplicationAction";
import useAssetparentSubType from "./asset/useAssetparentSubType";
import useAssignCreateAPI from "./asset/useAssignCreateAPI";
import useReturnAPI from "./asset/useReturnAPI";
import useEditUpdateAPI from "./asset/useEditUpdateAPI";
import useMaintenanceAPI from "./asset/useMaintenanceAPI";

import useCreate from "./pgrAi/useCreate";
import useSearchPGRAI from "./pgrAi/useSearchPGRAI";
import useFilterEmployee from "./pgrAi/useFilterEmployee";
import useApplicationDetails from "./pgrAi/useApplicationDetails";

import useDistricts from "./obps/useDistricts";
import useULBList from "./obps/useULBList";
import useUlbType from "./obps/useUlbType";
import useEDCRForm from "./obps/useEDCRForm";

//Layout
import useLayoutInbox from "./obps/useLayoutInbox";
import useLayoutFeeCalculator from "./obps/useLayoutFeeCalculator";
import useLayoutBuildingType from "./obps/useLayoutBuildingType";
import useLayoutBuildingCategory from "./obps/useLayoutBuildingCategory";
import useLayoutRoadType from "./obps/useLayoutRoadType";
import useLayoutType from "./obps/useLayoutType";
import { useLayoutSearchApplication, useLayoutCheckListSearch } from "./obps/useSearchApplication";
import { useLayoutCitizenSearchApplication, useLayoutSearchApplicationByIdOrMobile } from "./obps/useLayoutCitizenSearchApplication";
import useLayoutDocumentSearch from "./obps/useLayoutDocumentSearch";
// GC
import useGCInbox from "./gc/useInbox";

//CLU
import useCLUFeeCalculator from "./obps/useCLUFeeCalculator";
import { useCLUSearchApplication, useCLUCitizenSearchApplication, useCLUSearchApplicationByIdOrMobile, useCLUCheckListSearch } from "./obps/useCLUSearchApplication";
import useCLUInbox from "./obps/useCLUInbox";
import useLudhianaPropertSearch from "./pt/useLudhianaPropertSearch";
import useBathindaPropertySearch from "./pt/useBathindaPropertySearch";
import useCLUCreateAPI from "./obps/useCLUCreateAPI";
const pgr = {
  useComplaintDetails,
  useComplaintsList,
  useComplaintsListByMobile,
  useComplaintStatus,
  useComplaintTable,
  useComplaintTypes,
  useEmployeeFilter,
  useInboxData,
  useLocalities,
  useServiceDefs,
  useTenants: usePGRTenants,
  useComplaintSubType,
  usePropertyMDMS,
  useComplaintStatusCount,
  useTradeLicenseBillingslab,
  useMDMS: usePGRMDMS,
  useInbox: usePGRInbox,
};

const swach = {
  useComplaintDetails: useSwachComplaintDetails,
  useComplaintsList: useSwachComplaintsList,
  useComplaintsListByMobile: useSwachComplaintsListByMobile,
  useComplaintStatus: useSwachComplaintStatus,
  useComplaintTable: useSwachComplaintTable,
  useComplaintTypes: useSwachComplaintTypes,
  useEmployeeFilter: useSwachEmployeeFilter,
  useAttendence,
  useInboxData: useSwachInboxData,
  useInbox: useSWACHInbox,
  useLocalities: useSwachLocalities,
  useSwachBharatCategory: useSwachBharatCategory,
  useTenants: useSwachTenants,
  useComplaintSubType: useSwachComplaintSubType,
  usePropertyMDMS,
  useComplaintStatusCount: useSwachComplaintStatusCount,
  useTradeLicenseBillingslab,
  useCount,
  useViewAttendence,
  // useMDMS: usePGRMDMS,
};

const ptr = {
  usePetMDMS,
  usePTRPetMDMS,
  useBreedTypeMDMS,
  useDocumentsMDMS,
  usePTRCreateAPI,
  usePTRApplicationAction,
  usePTRGenderMDMS,
  usePTRSearch,
  usePtrApplicationDetail,
  // useTenantsPTR,
  useServiceSearchPTR,
  usePetDocumentSearch,
  useMyPetPayments,
  useTenants: useTenantsPTR,
};

const fsm = {
  useTenants: useTenantsFSM,
  useDesludging: useDesludging,
  useMDMS: useMDMS,
  useSearch,
  useRouteSubscription,
  useSearchAll,
  useInbox: useFSMInbox,
  useApplicationUpdate,
  useApplicationStatus,
  useWorkflowData,
  useDsoSearch,
  useApplicationDetail,
  useApplicationActions,
  useApplicationAudit,
  useSearchForAuditData,
  useVehicleSearch,
  useVehicleUpdate,
  useVendorDetail,
  useVehiclesSearch,
  useConfig,
  useSlum,
  usePaymentHistory,
  useVendorCreate,
  useVendorUpdate,
  useVehicleDetails,
  useVehicleCreate,
  useVendorCreate,
  useVendorUpdate,
  useVehicleDetails,
  useVehicleCreate,
  useUpdateVehicle,
  useDriverSearch,
  useDriverCreate,
  useDriverUpdate,
  useDriverDetails,
  useVehicleTripCreate,
  useVendorSearch,
  useAdvanceBalanceCalulation,
};

const pt = {
  usePropertySearch,
  usePropertySearchNew,
  usePropertyPayment,
  usePropertyMDMS,
  usePropertySearchWithDue,
  usePropertyAPI,
  usePropertyCreateNUpdateAPI,
  usePropertyDocumentSearch,
  useTenants: useTenantsPT,
  useApplicationDetail: usePtApplicationDetail,
  useApplicationActions: usePtApplicationActions,
  useMDMS: usePtMDMS,
  usePropertyAssessment,
  UseAssessmentCreateUlb,
  usePtCalculationEstimate,
  useGenderMDMS,
  usePTGenderMDMS,
  useMyPropertyPayments,
  useGenericViewProperty,
  useRatingAndFeedbackMDMS,
  useServiceSearchCF,
  useLudhianaPropertSearch,
  useBathindaPropertySearch,
};
const dss = {
  useMDMS: useDssMdms,
  useDashboardConfig,
  useDSSDashboard,
  useGetChart,
};

const mcollect = {
  useCommonMDMS,
  useMCollectMDMS,
  useMCollectSearch,
  useMcollectSearchBill,
  usemcollectTenants,
  useMCollectCount,
  useMCollectCategory,
  useMCollectCategoryTypes,
  useMCollectTaxHeads,
  useMcollectFormConfig,
};

const hrms = {
  useHRMSSearch,
  useHrmsMDMS,
  useHRMSCreate,
  useHRMSUpdate,
  useHRMSCount,
  useHRMSGenderMDMS,
  useOBPSRoles,
  useEmployeeList,
  useZones,
};
const tl = {
  useTenants: useTenantsTL,
  useTradeLicenseMDMS,
  useTLDocumentSearch,
  useTradeLicenseAPI,
  useTLSearchApplication,
  useTLPaymentHistory,
  useTradeLicenseSearch,
  useTLGenderMDMS,
  useTradeLicenseBillingslab,
  useInbox: useTLInbox,
  useMDMS: useTLMDMS,
  useSearch: useTLSearch,
  useApplicationDetail: useTLApplicationDetail,
  useApplicationActions: useTLApplicationActions,
  useFetchBill: useTLFetchBill,
  useTLApplicationDetails,
  useTLWorkflowData,
  useESign,
};

const receipts = {
  useReceiptsMDMS,
  useReceiptsSearch,
  useReceiptsUpdate,
};

const obps = {
  useMDMS: useOBPSMDMS,
  useScrutinyDetails,
  useTenants: useTenantsOBPS,
  useNocDetails: useNocDetails,
  useOBPSDocumentSearch,
  useObpsAPI,
  useBPADetails,
  useBPASearch,
  useBPAREGgetbill,
  useStakeholderAPI,
  useBPAREGSearch,
  useOCEdcrSearch,
  useLicenseDetails,
  useBPAREGApplicationActions,
  useBPADetailsPage,
  useEmpBPAREGSearch,
  useBPAInbox,
  useEDCRInbox,
  useArchitectInbox,
  SearchMdmsTypes,
  useServiceTypeFromApplicationType,
  useApplicationActions: useBPAApplicationActions,
  useOBPSSearch,
  useBusinessServiceBasedOnServiceType,
  useBusinessServiceData,
  useBPATaxDocuments,
  useQualificationTypes,
  useDistricts,
  useULBList,
  useUlbType,
  useEDCRForm,
  useBPACalculation,
  useLayoutInbox,
  useLayoutFeeCalculator,
  useLayoutBuildingType,
  useLayoutBuildingCategory,
  useLayoutRoadType,
  useLayoutType,
  useLayoutSearchApplication,
  useLayoutCheckListSearch,
  useLayoutBuildingType,
  useLayoutBuildingCategory,
  useLayoutRoadType,
  useLayoutCitizenSearchApplication,
  useLayoutDocumentSearch,
  useCLUFeeCalculator,
  useCLUCreateAPI,
  useCLUSearchApplication,
  useCLUCitizenSearchApplication,
  useCLUSearchApplicationByIdOrMobile,
  useCLUCheckListSearch,
  useLayoutSearchApplicationByIdOrMobile,
  useCLUInbox,
  useLayoutBuildingCategory,
};

const events = {
  useInbox: useEventInbox,
  useCreateEvent,
  useEventDetails,
  useUpdateEvent,
};

const engagement = {
  useMDMS: useEngagementMDMS,
  useDocCreate,
  useDocSearch,
  useDocDelete,
  useDocUpdate,
};

const sv = {
  useSVDoc,
  useSvCreateApi,
  useTenants: useTenantsSV,
  useSvSearchApplication,
  useSVApplicationDetail,
  useSVApplicationAction,
  useSvSearchApplication,
};

// for using tenant for city and document and search
const ads = {
  useTenants: useTenantsADS,
  useADSDocumentsMDMS,
  useADSDocumentSearch,
  useADSCreateAPI,
  useADSSlotSearch,
  useADSSearch,
  useADSDemandEstimation,
  useADSApplicationDetail,
  useADSAllMDMS,
  useADSAdvServicesMDMS,
  useADSCalculationTypeMDMS,
  useADSFaceAreaMDMS,
  useADSLocationMDMS,
  useADSTaxAmountMDMS,
  useADSAdTypeMDMS,
  useADSSearchApplication,
  useADSSearchApplicationEmployee,
  useADSScheduleTypeMDMS,
};

const chb = {
  useSpecialCategory,
  useResidentType,
  usePurpose,
  useChbCreateAPI,
  useChbDocumentsMDMS,
  useChbDocumentSearch,
  useChbApplicationDetail,
  useChbSearch,
  useTenants: useTenantsCHB,
  useChbApplicationAction,
  useServiceSearchCHB,
  useChbCommunityHalls,
  useChbHallCode,
  useChbSlotSearch,
  useDemandEstimation,
  useInbox: useCHBInbox,
};

const asset = {
  useAssetClassification,
  useAssetType,
  useAssetDocumentsMDMS,
  useAssetSubType,
  useAssetdetail,
  useAssetCreateAPI,
  useAssetApplicationDetail,
  useASSETApplicationAction,
  useASSETSearch,
  useAssetparentSubType,
  useTenants: useTenantsASSET,
  useAssignCreateAPI,
  useMaintenanceAPI,
  useReturnAPI,
  useEditUpdateAPI,
};

const survey = {
  useCreate: useSurveyCreate,
  useUpdate: useSurveyUpdate,
  useDelete: useSurveyDelete,
  useSearch: useSurveySearch,
  useSubmitResponse: useSurveySubmitResponse,
  useShowResults: useSurveyShowResults,
  useSurveyInbox,
  useSurveyCategoryInbox,
  useSurveyQuestionInbox,
};

const noc = {
  useNOCDetails,
  useNOCApplicationActions,
  useInbox: useNOCInbox,
  useNOCSearchApplication,
  useNOCCitizenSearchApplication,
  useBuildingCategory,
  useBuildingType,
  useRoadType,
  useTenants: useNOCTenants,
  useNOCDocumentSearch,
  useNocType,
  useNOCFeeCalculator,
  useNOCSearchApplicationByIdOrMobile,
  useNOCCheckListSearch,
  useNocCreateAPI
};

const ndc = {
  useInbox: useNDCInbox,
  useSearchApplication: useNDCSearchApplication,
  useSearchEmployeeApplication: useNDCSearchApplicationEmployee,
  useNDCDocumentSearch,
};

const challangeneration = {
  useChallanGenerationRecieptSearch,
  useChallanGenerationMDMS,
  useChallanGenerationSearch,
  useChallanGenerationSearchBill,
  useChallanGenerationTenants,
  useChallanGenerationCount,
  useChallanGenerationCategory,
  useChallanGenerationCategoryTypes,
  useChallanGenerationTaxHeads,
  useChallanGenerationFormConfig,
  useInbox: useChallanInbox,
};
const rentandlease = {
  useRentAndLeaseRecieptSearch,
  useRentAndLeaseProperties,
  useRentAndLeaseMDMS,
  useRALPropertyMDMS,
  useRALDocumentsMDMS,
  useRentAndLeaseSearch,
  useRentAndLeaseSearchBill,
  useRentAndLeaseTenants,
  useRentAndLeaseCount,
  useRentAndLeaseCategory,
  useRentAndLeaseCategoryTypes,
  useRentAndLeaseTaxHeads,
  useRentAndLeaseFormConfig,
};

const ws = {
  WSSearchMdmsTypes,
  usewsTenants,
  useWaterSearch,
  useSewarageSearch,
  useMyBillsWaterSearch,
  useMyBillsSewarageSearch,
  useMyApplicationSearch,
  useWSDocumentSearch,
  useWSMDMSWS,
  WSuseSearch,
  useSewSearch,
  useSearchWS,
  useBulkSearchWS,
  useWSDetailsPage,
  useWSApplicationActions,
  useApplicationActionsBillAmendUpdate,
  useWSConsumptionSearch,
  useConnectionDetail,
  useMDMS: useWSMDMS,
  useWaterCreateAPI,
  useSewerageCreateAPI,
  useWSUpdateAPI,
  useMypaymentWS,
  useCreateBillAmendment,
  useWSApplicationDetailsBillAmendment,
  useInbox: useWSInbox,
  useOldValue,
  useMeterReadingCreateAPI,
  useGetMeterStatusList,
  useGetBillingPeriodValidation,
  useWaterPropertySearch,
  useDisconnectionWorkflow,
  useDisConnectionDetails,
  useWSModifyDetailsPage,
  useToCheckPrivacyEnablement,
  useBulkMeterReadingCreateAPI,
  useWSConfigMDMS: useWSConfigMDMS,
};

const reports = {
  useReportMeta,
};

const pgrAi = {
  useCreate,
  useSearchPGRAI,
  useFilterEmployee,
  useApplicationDetails,
};

const gc = {
  useInbox: useGCInbox,
};

const Hooks = {
  useSessionStorage,
  useQueryParams,
  useFetchPayment,
  usePaymentUpdate,
  useFetchCitizenBillsForBuissnessService,
  useFetchBillsForBuissnessService,
  useGetPaymentRulesForBusinessServices,
  useWorkflowDetails,
  useInitStore,
  useClickOutside,
  useUserSearch,
  useApplicationsForBusinessServiceSearch,
  useDemandSearch,
  useInboxGeneral,
  useEmployeeSearch,
  useBoundaryLocalities,
  useCommonMDMS,
  useApplicationStatusGeneral,
  useModuleTenants,
  useRecieptSearch,
  useRecieptSearchNew,
  useMCollectRecieptSearch,
  usePaymentSearch,
  useNewInboxGeneral,
  useEvents,
  useClearNotifications,
  useNotificationCount,
  useStore,
  useDocumentSearch,
  useTenants,
  useInbox: useTLInbox,
  useFeedBackSearch,
  useAccessControl,
  useBillSearch,
  useCancelBill,
  useTenantsBills,
  usePrivacyContext,
  pgr,
  swach,
  fsm,
  pt,
  dss,
  mcollect,
  hrms,
  tl,
  ptr,
  receipts,
  obps,
  events,
  engagement,
  survey,
  noc,
  ws,
  gc,
  useCustomMDMS,
  useCustomAPIHook,
  reports,
  useGetHowItWorksJSON,
  useGetFAQsJSON,
  useGetDSSFAQsJSON,
  useGetDSSAboutJSON,
  useStaticData,
  useDynamicData,
  useBulkPdfDetails,
  useBillAmendmentInbox,
  useAudit,
  createTokenAPI,
  sv,
  ads,
  ndc,
  chb,
  asset,
  pgrAi,
  useEDCRForm,
  challangeneration,
  rentandlease,
};

export default Hooks;
