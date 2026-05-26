import { Header, LinkButton, Modal } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import { newConfigMutate } from "../../config/Mutate/config";
import TransfererDetails from "../../pageComponents/Mutate/TransfererDetails";
import { TransferOwnership } from "../../pageComponents/TransferOwnership";
import PropertyOwnerHistory from "../citizen/MyProperties/propertyOwnerHistory";
import MutationApplicationDetails from "./MutationApplicatinDetails";
import getPTAcknowledgementData from "../../getPTAcknowledgementData";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const ApplicationDetails = () => {
  const { t } = useTranslation();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { tenants } = storeData || {};
  const { id: propertyId } = useParams();
  const [showToast, setShowToast] = useState(null);
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [enableAudit, setEnableAudit] = useState(false);
  const [businessService, setBusinessService] = useState("PT.CREATE");
  sessionStorage.setItem("applicationNoinAppDetails", propertyId);
  const [viewTimeline, setViewTimeline] = useState(false);
  const { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, propertyId);

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.pt.useApplicationActions(tenantId);

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.acknowldgementNumber,
    moduleCode: businessService,
    role: "PT_CEMP",
  });

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds: propertyId, audit: true },
    },
    { enabled: enableAudit, select: (data) => data.Properties?.filter((e) => e.status === "ACTIVE") }
  );

  const showTransfererDetails = React.useCallback(() => {
    if (
      auditData &&
      Object.keys(appDetailsToShow).length &&
      applicationDetails?.applicationData?.status !== "ACTIVE" &&
      applicationDetails?.applicationData?.creationReason === "MUTATION" &&
      !appDetailsToShow?.applicationDetails.find((e) => e.title === "PT_MUTATION_TRANSFEROR_DETAILS")
    ) {
      let applicationDetails = appDetailsToShow.applicationDetails?.filter((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER");
      let compConfig = newConfigMutate.reduce((acc, el) => [...acc, ...el.body], []).find((e) => e.component === "TransfererDetails");
      applicationDetails.unshift({
        title: "PT_MUTATION_TRANSFEROR_DETAILS",
        belowComponent: () => <TransfererDetails userType="employee" formData={{ originalData: auditData[0] }} config={compConfig} />,
      });
      setAppDetailsToShow({ ...appDetailsToShow, applicationDetails });
    }
  }, [setAppDetailsToShow, appDetailsToShow, auditData, applicationDetails, auditData, newConfigMutate]);

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (applicationDetails) {
      appDetailsToShow?.applicationData?.owners.sort((item, item2) => {
        return item?.additionalDetails?.ownerSequence - item2?.additionalDetails?.ownerSequence;
      });
      setAppDetailsToShow(_.cloneDeep(applicationDetails));
      if (applicationDetails?.applicationData?.status !== "ACTIVE" && applicationDetails?.applicationData?.creationReason === "MUTATION") {
        setEnableAudit(true);
      }
    }
  }, [applicationDetails]);

  useEffect(() => {
    showTransfererDetails();
    if (appDetailsToShow?.applicationData?.status === "ACTIVE" && PT_CEMP && businessService == "PT.CREATE") {
      setBusinessService("PT.UPDATE");
    }
  }, [auditData, applicationDetails, appDetailsToShow]);

  useEffect(() => {
    if (
      workflowDetails?.data?.applicationBusinessService &&
      !(workflowDetails?.data?.applicationBusinessService === "PT.CREATE" && businessService === "PT.UPDATE")
    ) {
      setBusinessService(workflowDetails?.data?.applicationBusinessService);
    }
  }, [workflowDetails.data]);

  const PT_CEMP = Digit.UserService.hasAccess(["PT_CEMP"]) || false;

  if (appDetailsToShow?.applicationData?.status === "ACTIVE" && PT_CEMP) {
    workflowDetails = {
      ...workflowDetails,
      data: {
        ...workflowDetails?.data,
        actionState: {
          nextActions: [
            {
              action: "VIEW_DETAILS",
              redirectionUrl: {
                pathname: `/digit-ui/employee/pt/property-details/${propertyId}`,
              },
              tenantId: Digit.ULBService.getStateId(),
            },
          ],
        },
      },
    };
  }

  if (
    PT_CEMP &&
    workflowDetails?.data?.actionState?.isStateUpdatable &&
    !workflowDetails?.data?.actionState?.nextActions?.find((e) => e.action === "UPDATE")
  ) {
    if (!workflowDetails?.data?.actionState?.nextActions) workflowDetails.data.actionState.nextActions = [];
    workflowDetails?.data?.actionState?.nextActions.push({
      action: "UPDATE",
      redirectionUrl: {
        pathname: `/digit-ui/employee/pt/modify-application/${propertyId}`,
        state: { workflow: { action: "REOPEN", moduleName: "PT", businessService } },
      },
      tenantId: Digit.ULBService.getStateId(),
    });
  }

  if (!(appDetailsToShow?.applicationDetails?.[0]?.values?.[0].title === "PT_PROPERTY_APPLICATION_NO")) {
    appDetailsToShow?.applicationDetails?.unshift({
      values: [
        { title: "PT_PROPERTY_APPLICATION_NO", value: appDetailsToShow?.applicationData?.acknowldgementNumber },
        { title: "PT_SEARCHPROPERTY_TABEL_PTUID", value: appDetailsToShow?.applicationData?.propertyId },
        { title: "ES_APPLICATION_CHANNEL", value: `ES_APPLICATION_DETAILS_APPLICATION_CHANNEL_${appDetailsToShow?.applicationData?.channel}` },
      ],
    });
  }

  if (
    PT_CEMP &&
    workflowDetails?.data?.applicationBusinessService === "PT.MUTATION" &&
    workflowDetails?.data?.actionState?.nextActions?.find((act) => act.action === "PAY")
  ) {
    workflowDetails.data.actionState.nextActions = workflowDetails?.data?.actionState?.nextActions.map((act) => {
      if (act.action === "PAY") {
        return {
          action: "PAY",
          forcedName: "WF_EMPLOYEE_PT.MUTATION_PAY",
          redirectionUrl: { pathname: `/digit-ui/employee/payment/collect/PT.MUTATION/${appDetailsToShow?.applicationData?.acknowldgementNumber}` },
        };
      }
      return act;
    });
  }

  const wfDocs = workflowDetails.data?.timeline?.reduce((acc, { wfDocuments }) => {
    return wfDocuments ? [...acc, ...wfDocuments] : acc;
  }, []);
  let appdetailsDocuments = appDetailsToShow?.applicationDetails?.find((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER")?.additionalDetails
    ?.documents;

  if (appdetailsDocuments && wfDocs?.length && !appdetailsDocuments?.find((e) => e.title === "PT_WORKFLOW_DOCS")) {
    appDetailsToShow.applicationDetails.find((e) => e.title === "PT_OWNERSHIP_INFO_SUB_HEADER").additionalDetails.documents = [
      ...appdetailsDocuments,
      {
        title: "PT_WORKFLOW_DOCS",
        values: wfDocs?.map?.((e) => ({ ...e, title: e.documentType })),
      },
    ];
  }
  const handleDownloadPdf = async (e) => {
    e?.preventDefault?.();

    try {
      const Property = appDetailsToShow?.applicationData || applicationDetails?.applicationData;
      const tenantInfo = tenants?.find((tenant) => tenant.code === Property?.tenantId);

      if (!Property || !tenantInfo) {
        setShowToast({ key: "error", error: { message: t("ERR_PDF_GEN_FAILED") } });
        setTimeout(closeToast, 5000);
        return;
      }

      const data = await getPTAcknowledgementData({ ...Property }, tenantInfo, t);
      Digit.Utils.pdf.generate(data);
    } catch (error) {
      setShowToast({ key: "error", error: { message: error?.message || t("ERR_PDF_GEN_FAILED") } });
      setTimeout(closeToast, 5000);
    }
  };

  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  if (applicationDetails?.applicationData?.creationReason === "MUTATION") {
    return (
      <MutationApplicationDetails
        propertyId={propertyId}
        acknowledgementIds={appDetailsToShow?.applicationData?.acknowldgementNumber}
        workflowDetails={workflowDetails}
        mutate={mutate}
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
      />
    );
  }
  if (applicationDetails?.applicationDetails[1].title == "PT_ASSESMENT_INFO_SUB_HEADER") {
    if (applicationDetails?.applicationDetails[1].values.length == 4) {
      let obj = {
        title: "PT_ASSESMENT_ELECTRICITY",
        value: applicationDetails?.additionalDetails?.electricity || "NA",
      };
      applicationDetails?.applicationDetails[1].values.push(obj);
    }
    if (applicationDetails?.applicationDetails[1].values.length == 5) {
      let obj = {
        title: "PT_ASSESMENT_ELECTRICITY_UID",
        value: applicationDetails?.additionalDetails?.uid || "NA",
      };
      applicationDetails?.applicationDetails[1].values.push(obj);
    }
  }

  const reversedOwners = Array.isArray(appDetailsToShow?.applicationData?.owners) ? appDetailsToShow?.applicationData?.owners.slice().reverse() : [];
  if (appDetailsToShow?.applicationData) {
    appDetailsToShow?.applicationDetails?.[3]?.additionalDetails?.owners.sort(() => {
      return appDetailsToShow?.applicationDetails?.[3]?.additionalDetails?.owners;
    });
  }

  if (appDetailsToShow?.applicationDetails) {
    appDetailsToShow.applicationDetails = appDetailsToShow.applicationDetails.map((detail) => {
      if (detail.title === "PT_OWNERSHIP_INFO_SUB_HEADER") {
        return {
          ...detail,
          Component: () => (
            <div style={{ display: "inline-flex", gap: "16px", marginLeft: "25px", alignItems: "center" }}>
              <LinkButton label={t("PT_VIEW_HISTORY")} style={{ color: "#A52A2A" }} onClick={() => setShowHistoryModal(true)}></LinkButton>
              <LinkButton label={t("PT_OWNERSHIP_TRANSFER")} style={{ color: "#A52A2A" }} onClick={() => setShowOwnershipModal(true)}></LinkButton>
            </div>
          ),
        };
      }
      return detail;
    });
  }

  return (
    <div>
      <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
        <Header styles={{ marginLeft: "0px", paddingTop: "10px", fontSize: "32px" }}>{t("PT_APPLICATION_TITLE")}</Header>

        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", zIndex: "10", position: "relative" }}>
            <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline}></LinkButton>
            <LinkButton label={t("PT_DOWNLOAD_ACK_FORM")} style={{ color: "#A52A2A" }} onClick={handleDownloadPdf}></LinkButton>
          </div>
        </div>
      </div>
      <ApplicationDetailsTemplate
        applicationDetails={appDetailsToShow}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={appDetailsToShow?.applicationData}
        mutate={mutate}
        auditDataLoading={auditDataLoading}
        id={"timeline"}
        workflowDetails={workflowDetails}
        businessService={businessService}
        moduleCode="PT"
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={"ES_PT_COMMON_STATUS_"}
        forcedActionPrefix={"WF_EMPLOYEE_PT.CREATE"}
        statusAttribute={"state"}
        MenuStyle={{ color: "#FFFFFF", fontSize: "18px" }}
      />
      {showHistoryModal ? (
        <Modal
          headerBarMain={<h1 className="heading-m">{t("PT_OWNER_HISTORY")}</h1>}
          headerBarEnd={<CloseBtn onClick={() => setShowHistoryModal(false)} />}
          hideSubmit={true}
          isDisabled={false}
          popupStyles={{ width: "75%" }}
        >
          <PropertyOwnerHistory propertyId={propertyId} userType={"employee"} />
        </Modal>
      ) : null}
      {showOwnershipModal ? <TransferOwnership /> : null}
    </div>
  );
};

export default React.memo(ApplicationDetails);
