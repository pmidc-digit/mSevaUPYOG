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

const NDCModal = ({
  t,
  action,
  tenantId,
  state,
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
  closeToast,
  errors,
  showErrorToast,
  errorOne,
  closeToastOne,
  getEmployees,
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

  console.log("getEmployees", getEmployees);

  console.log("allRoles", allRoles);

  console.log("allRolesNew", allRolesNew);

  const { data: approverData, isLoading: PTALoading } = Digit.Hooks.useEmployeeSearch(
    tenantId,
    {
      roles: allRolesNew?.map((role) => ({ code: role })),
      // roles: allRolesString,
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
  }, [approverData]);

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
            const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
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

  function submit(data) {
    let workflow = { action: action?.action, comments: data?.comments, businessService, moduleName: moduleCode };
    applicationData = {
      ...applicationData,
      action: action?.action,
      comment: data?.comments,
      assignee: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
      // assignee: action?.isTerminateState ? [] : [selectedApprover?.uuid],
      wfDocuments: uploadedFile
        ? [
            {
              documentType: file?.type,
              documentUid: file?.name,
              fileStoreId: uploadedFile,
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
        noBoxShadow
        inline
        childrenAtTheBottom
        onSubmit={submit}
        defaultValues={defaultValues}
        formId="modal-action"
        // isDisabled={!action.showFinancialYearsModal ? PTALoading || (!action?.isTerminateState && !selectedApprover?.uuid) : !selectedFinancialYear}
      />
      {/* )} */}
      {showToast && <Toast error={showToast.key === "error" ? true : false} label={errors} onClose={closeToast} />}
      {showErrorToast && <Toast error={true} label={errorOne} isDleteBtn={true} onClose={closeToastOne} />}
    </Modal>
  ) : (
    <Loader />
  );
};

export default NDCModal;
