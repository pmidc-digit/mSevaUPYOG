import { FormComposer, Loader, Modal } from "@mseva/digit-ui-react-components";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { configEmployeeActiveApplication } from "./Modal/EmployeeActivation";
import { configEmployeeApplication } from "./Modal/EmployeeAppliaction";

const EmployeeAction = ({ t, action, tenantId, closeModal, applicationData }) => {
  const history = useHistory();
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedReason, selectReason] = useState("");
  const { data } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "DeactivationReason");

  // Built from the MDMS response without mutating it, so the i18n key does not leak into the cache
  const Reasons = useMemo(
    () =>
      (data?.["egov-hrms"]?.DeactivationReason || []).map((ele) => ({
        ...ele,
        i18key: "EGOV_HRMS_DEACTIVATIONREASON_" + ele.code,
      })),
    [data]
  );

  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  // Derived on every render so the dropdown and the modal always see the current selection
  const config = useMemo(() => {
    switch (action) {
      case "DEACTIVATE_EMPLOYEE_HEAD":
        return configEmployeeApplication({ t, action, selectFile, uploadedFile, setUploadedFile, selectedReason, Reasons, selectReason });
      case "ACTIVATE_EMPLOYEE_HEAD":
        return configEmployeeActiveApplication({
          t,
          action,
          selectFile,
          uploadedFile,
          setUploadedFile,
          selectedReason,
          Reasons,
          selectReason,
          employees: applicationData?.Employees?.[0] || {},
        });
      default:
        return {};
    }
  }, [action, uploadedFile, Reasons, selectedReason]);

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

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else {
          try {
            setUploadedFile(null);
            const response = await Digit.UploadServices.Filestorage("HRMS", file, Digit.ULBService.getStateId());
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

  function submit(formData) {
    // The effective date shown in the form is the one that gets saved
    const effectiveFrom = formData.effectiveFrom ? new Date(formData.effectiveFrom).getTime() : Date.now();
    const reasonForDeactivation = selectedReason.code;
    // Copy the employee so the react-query cache is not changed by the edits below
    const Employees = [cloneDeep(applicationData.Employees[0])];
    const isActivation = action === "ACTIVATE_EMPLOYEE_HEAD";
    const detailsKey = isActivation ? "reactivationDetails" : "deactivationDetails";
    const referenceType = isActivation ? "ACTIVATION" : "DEACTIVATION";

    if (file) {
      const document = {
        referenceType,
        documentId: uploadedFile,
        documentName: file.name,
      };
      Employees[0].documents = [...(Employees[0].documents || []), document];
    }

    set(Employees[0], `${detailsKey}[0].effectiveFrom`, effectiveFrom);
    set(Employees[0], `${detailsKey}[0].orderNo`, formData?.orderNo);
    set(Employees[0], `${detailsKey}[0].reasonForDeactivation`, reasonForDeactivation);
    set(Employees[0], `${detailsKey}[0].remarks`, formData?.remarks);
    Employees[0].isActive = isActivation;

    history.replace("/digit-ui/employee/hrms/response", {
      Employees,
      key: "UPDATE",
      action: isActivation ? "ACTIVATION" : "DEACTIVATION",
    });
  }

  return action && config?.form ? (
    <div className="hrms-modalbutton-disable">
      <Modal
        headerBarMain={<Heading label={t(config?.label?.heading)} />}
        headerBarEnd={<CloseBtn onClick={closeModal} />}
        actionCancelOnSubmit={closeModal}
        actionSaveLabel={t(config?.label?.submit)}
        actionSaveOnSubmit={() => {}}
        formId="modal-action"
        isDisabled={!selectedReason}
      >
        <FormComposer config={config?.form} noBoxShadow inline disabled={true} childrenAtTheBottom onSubmit={submit} formId="modal-action" />
      </Modal>
    </div>
  ) : (
    <Loader />
  );
};
export default EmployeeAction;
