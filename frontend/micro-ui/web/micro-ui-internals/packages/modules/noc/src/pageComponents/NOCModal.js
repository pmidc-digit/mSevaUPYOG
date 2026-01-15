import { Loader, Modal, FormComposer, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";

import { ModalConfig } from "../config/ModalConfig";

const Heading = (props) => {
  return <h1 className="heading-m">{props.label}</h1>;
};

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

const NOCModal = ({
  t,
  action,
  tenantId,
  state,
  getEmployees,
  id,
  closeModal,
  submitAction,
  actionData,
  applicationDetails,
  applicationData,
  businessService,
  moduleCode,
  workflowDetails,
  showToast,
  setShowToast,
  closeToast,
  errors,
  showErrorToast,
  errorOne,
  closeToastOne,
}) => {
  const [config, setConfig] = useState({});
  const [defaultValues, setDefaultValues] = useState({});
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState({});
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);
 
  const checkRole = action?.state?.actions;

  const allRoles = [...new Set(checkRole?.flatMap((a) => a.roles))];

  const allRolesNew = [...new Set(getEmployees?.flatMap((a) => a.roles))];

  const { data: approverData, isLoading: PTALoading } = Digit.Hooks.useEmployeeSearch(
    tenantId,
    {
       //roles: action?.assigneeRoles?.map?.((e) => ({ code: e })),
      roles: allRolesNew?.map((role) => ({ code: role })),
      isActive: true,
    },
    { enabled: !action?.isTerminateState }
  );

  const { isLoading: financialYearsLoading, data: financialYearsData } = Digit.Hooks.pt.useMDMS(
    tenantId,
    businessService,
    "FINANCIAL_YEARLS",
    {},
    {
      details: {
        tenantId: Digit.ULBService.getStateId(),
        moduleDetails: [{ moduleName: "egf-master", masterDetails: [{ name: "FinancialYear", filter: "[?(@.module == 'TL')]" }] }],
      },
    }
  );

  useEffect(() => {
    if (financialYearsData && financialYearsData["egf-master"]) {
      setFinancialYears(financialYearsData["egf-master"]?.["FinancialYear"]);
    }
  }, [financialYearsData]);

  const { data: EmployeeStatusData } = Digit.Hooks.useCustomMDMS(tenantId, "common-masters", [{ name: "Department" }]);

  useEffect(() => {
    if (approverData && EmployeeStatusData) {
      const departments = EmployeeStatusData["common-masters"].Department;
      setApprovers(
        approverData?.Employees?.map((employee) => {
          const deptCode = employee?.assignments?.[0]?.department;
          const matchedDept = departments?.find((d) => d?.code === deptCode);
          return { uuid: employee?.uuid, name: `${employee?.user?.name} - ${matchedDept?.name}` };
        })
      );
    }
  }, [approverData, EmployeeStatusData]);


  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("NOC", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"));
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"));
          }
        }
      }
    })();
  }, [file]);

  useEffect(()=>{
    if(action?.action === "SENDBACKTOCITIZEN"){
      const uuid= applicationDetails?.Noc?.[0]?.auditDetails?.createdBy || null;
     // console.log("uuid here", uuid);
      setSelectedApprover({uuid});
    }
   
  },[action]);

 // console.log("selectedApprover", selectedApprover);

  function submit(data) {
   // console.log("data here in Modal", data);
    
    const mandatoryActions = [ "APPROVE","VERIFY","REJECT","SENDBACKTOCITIZEN", "SENDBACKTOVERIFIER","FORWARD"];

    let checkCommentsMandatory = mandatoryActions.includes(action?.action);

    if (action?.isTerminateState) {
      checkCommentsMandatory = true;
    }

    const commentsText = data?.comments?.toString().trim();
    const conditionalText = data?.conditionalComments?.trim();
    let finalComments = commentsText;
    if (action?.action === "APPROVE" && conditionalText) {
      finalComments = `${commentsText} , ${conditionalText}`;
    }

    if (action?.action !== "APPROVE" && action?.action !== "REJECT"  && !selectedApprover?.uuid) {
      setTimeout(()=>{
        closeToast();
      },2000);

      setShowToast({ key: "true", error:true, message: t("COMMON_ASSIGNEE_NAME_REQUIRED_LABEL") });
      return;
    }

    if (checkCommentsMandatory && !commentsText) {
      setTimeout(()=>{
        closeToast();
      },2000);

     setShowToast({ key: "true", error:true, message: t("COMMON_COMMENTS_REQUIRED_LABEL") });
     return;
    }



    let workflow = { action: action?.action, comments: data?.comments, businessService, moduleName: moduleCode };
    applicationData = {
      ...applicationData,
      action: action?.action,
      comment: finalComments,
      assignee: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
      // assignee: action?.isTerminateState ? [] : [selectedApprover?.uuid],
      wfDocuments: uploadedFile
        ? [
            {
              documentType: file?.type,
              // documentType: action?.action + "_DOC",
              fileName: file?.name,
              documentUid: uploadedFile,
              filestoreId: uploadedFile,
              documentAttachment: uploadedFile
            },
          ]
        : null,
    };

    submitAction({
      Licenses: [applicationData],
    });
  }

  useEffect(() => {
    if (action) {
      setConfig(
        ModalConfig({
          t,
          action,
          approvers,
          selectedApprover,
          setSelectedApprover,
          selectFile,
          uploadedFile,
          setUploadedFile,
          businessService,
        })
      );
    }
  }, [action, approvers, financialYears, selectedFinancialYear, uploadedFile]);

  return action && config.form ? (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => {}}
      // isDisabled={!action.showFinancialYearsModal ? PTALoading || (!action?.isTerminateState && !selectedApprover?.uuid) : !selectedFinancialYear}
      formId="modal-action"
    >
      {/* {financialYearsLoading ? (
        <Loader />
      ) : ( */}
      <FormComposer
        config={config.form}
        className="BPAemployeeCard bpa-workflow-modal-form"
        noBoxShadow
        inline
        childrenAtTheBottom
        onSubmit={submit}
        defaultValues={defaultValues}
        formId="modal-action"
        // isDisabled={!action.showFinancialYearsModal ? PTALoading || (!action?.isTerminateState && !selectedApprover?.uuid) : !selectedFinancialYear}
      />
      {/* )} */}
      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={showToast?.message} onClose={closeToast} isDleteBtn={true}/>}
      {showErrorToast && <Toast error={true} label={errorOne} isDleteBtn={true} onClose={closeToastOne} />}
    </Modal>
  ) : (
    <Loader />
  );
};

export default NOCModal;
