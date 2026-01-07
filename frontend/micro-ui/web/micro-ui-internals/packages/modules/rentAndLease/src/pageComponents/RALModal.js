import React, { useEffect, useState } from "react";
import { FormComposer, Modal, Toast } from "@mseva/digit-ui-react-components";
import { Loader } from "../components/Loader";
import { ModalConfig } from "../config/ModalConfig";

const Heading = (props) => {
  return <h1 className={`heading-m ${props.className}`}>{props.label}</h1>;
};

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className={`icon-bg-secondary ${props.className}`} onClick={props.onClick}>
      <Close />
    </div>
  );
};

const RALModal = ({
  t,
  action,
  tenantId,
  closeModal,
  submitAction,
  applicationData,
  businessService,
  moduleCode,
  showToast,
  closeToast,
  setShowToast,
  getEmployees,
  handleRenewal,
}) => {
  const [config, setConfig] = useState({});
  const [defaultValues, setDefaultValues] = useState({});
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState({});
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);

  const allRolesNew = [...new Set(getEmployees?.flatMap((a) => a.roles))];

  const { data: approverData, isLoading: PTALoading } = Digit.Hooks.useEmployeeSearch(
    tenantId,
    {
      roles:
        action?.assigneeRoles?.length > 0 ? action?.assigneeRoles?.map((role) => ({ code: role })) : allRolesNew?.map((role) => ({ code: role })),
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
      if (file) {
        if (file.size >= 5242880) {
          setShowToast({ key: true, label: t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED") });
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("PT", file, Digit.ULBService.getStateId());
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId);
            } else {
              setShowToast({ key: true, label: t("CS_FILE_UPLOAD_ERROR") });
            }
          } catch (err) {
            setShowToast({ key: true, label: t("CS_FILE_UPLOAD_ERROR") });
          }
        }
      }
    })();
  }, [file]);

  function submit(data) {
    if (action?.action === "RENEWAL" || action?.action === "RAL_RENEWAL") {
      if (!data?.tradeLicenseNumber) {
        setShowToast({ key: true, label: t("Trade License Number is required") });
        return;
      }
      handleRenewal({ ...applicationData, ...data });
      closeModal();
      return;
    }

    // let checkCommentsMandatory =
    //   action?.action === "APPROVE" ||
    //   action?.action === "VERIFY" ||
    //   action?.action === "REJECT" ||
    //   action?.action === "SENDBACKTOCITIZEN" ||
    //   action?.action === "FORWARD";
    // action?.action === "PENDING_FOR_DOCUMENT_VERIFY" ||
    //   action?.action === "DISCONNECTION_FIELD_INSPECTION" ||
    //   action?.action === "FORWARD_FOR_FIELDINSPECTION" ||
    //   action?.action === "FORWARD_FOR_APPROVAL" ||
    //   action?.action === "REQUEST_FOR_DISCONNECTION" ||
    //   action?.action === "FORWARD_FOT_SETLEMENT";

    if (action?.isTerminateState) checkCommentsMandatory = true;

    let checkAssigneeMandatory =
      // action?.action === "SENDBACKTOOVERIFIER" ||
      // action?.action === "VERIFY" ||
      // action?.action === "FORWARD" ||
      // action?.action === "FORWARDFORFIELDINSPECTION" ||
      // action?.action === "FORWARDFORAPPROVAL" ||
      action?.action === "PENDING_FOR_FIELDINSPECTION" ||
      action?.action === "FORWARD_FOR_APPROVAL" ||
      action?.action === "PENDING_FOR_DOCUMENT_VERIFY" ||
      action?.action === "REQUEST_FOR_DISCONNECTION" ||
      action?.action === "FORWARD_FOT_SETLEMENT" ||
      action?.action === "DISCONNECTION_FIELD_INSPECTION" ||
      action?.action === "FORWARD_FOR_FIELDINSPECTION" ||
      action?.action === "FORWARD_FOR_DESCONNECTION_FIELD_INSPECTION";

    if (action?.isTerminateState) checkAssigneeMandatory = false;

    if (checkAssigneeMandatory && !selectedApprover?.uuid) {
      setShowToast({ key: true, label: t("Assignee is required") });

      return;
    }

    const commentsText = data?.comments;

    if (!commentsText) {
      setShowToast({ key: true, label: t("Comments are required") });

      return;
    }

    let workflow = { action: action?.action, comments: data?.comments, businessService, moduleName: moduleCode };
    applicationData = {
      ...applicationData,
      ...data,
      action: action?.action,
      comment: data?.comments,
      assignee: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
      // assignee: action?.isTerminateState ? [] : [selectedApprover?.uuid],
      wfDocuments: uploadedFile
        ? [
            {
              documentType: action?.action + " DOC",
              fileName: file?.name,
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
  }, [action, approvers, financialYears, uploadedFile]);

  useEffect(() => {
    if (action?.action === "FORWARD_FOT_SETLEMENT") {
      setDefaultValues({
        amountToBeDeducted: 0,
      });
    }
  }, [action]);

  if (!action || !config.form) return null;
  return (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} className="ral-modal-header" />}
      headerBarEnd={<CloseBtn onClick={closeModal} className="ral-modal-close" />}
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
      {showToast && <Toast error={showToast.key} label={t(showToast.label)} isDleteBtn={true} onClose={closeToast} />}
      {PTALoading && <Loader page={true} />}
    </Modal>
  );
};

export default RALModal;
