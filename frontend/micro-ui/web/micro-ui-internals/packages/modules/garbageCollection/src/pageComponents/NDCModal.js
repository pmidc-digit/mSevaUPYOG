import { Modal, FormComposer, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { Loader } from "../components/Loader";

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
  closeModal,
  submitAction,
  showToast,
  closeToast,
  errors,
  showErrorToast,
  errorOne,
  closeToastOne,
  getEmployees,
  tenantId,
}) => {
  const [config, setConfig] = useState({});
  const [getAmount, setAmount] = useState();
  const [approvers, setApprovers] = useState([]);

  const allRolesNew = [...new Set(getEmployees?.flatMap((a) => a.roles))];

  console.log("allRolesNew", allRolesNew);

  const { data: approverData, isLoading: PTALoading } = Digit.Hooks.useEmployeeSearch(
    tenantId,
    {
      // roles: action?.assigneeRoles?.map?.((e) => ({ code: e })),
      roles: allRolesNew?.map((role) => ({ code: role })),
      isActive: true,
    },
    { enabled: !action?.isTerminateState }
  );

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

  function submit(data) {
    const payload = { amount: getAmount };
    submitAction(payload);
  }

  useEffect(() => {
    if (action) {
      setConfig(
        ModalConfig({
          t,
          action,
          setAmount,
          approvers,
        })
      );
    }
  }, [action, approvers]);

  if (!action || !config.form) return null;

  return (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => {}}
      formId="modal-action"
    >
      <FormComposer config={config.form} noBoxShadow inline childrenAtTheBottom onSubmit={submit} formId="modal-action" />
      {/* )} */}
      {/* {showToast && <Toast isDleteBtn={true} error={true} label={errors} onClose={closeToast} />} */}
      {showErrorToast && <Toast error={true} label={errorOne} isDleteBtn={true} onClose={closeToastOne} />}
      {PTALoading && <Loader page={true} />}
    </Modal>
  );
};

export default NDCModal;
