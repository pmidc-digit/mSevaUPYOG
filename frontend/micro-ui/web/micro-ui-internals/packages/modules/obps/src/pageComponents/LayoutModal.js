


import { Modal, FormComposer, Toast } from "@mseva/digit-ui-react-components"
import React,{ useState, useEffect } from "react"
import { LayoutModalConfig } from "../config/LayoutModalConfig"
import { Loader } from "../config/Loader"


const Heading = (props) => {
  return <h1 className="heading-m">{props.label}</h1>
}

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
)

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  )
}

const LayoutModal = ({
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
  setShowToast,
  isSubmitting
}) => {
  const [config, setConfig] = useState({})
  const [defaultValues, setDefaultValues] = useState({})
  const [approvers, setApprovers] = useState([])
  const [selectedApprover, setSelectedApprover] = useState({})
  const [file, setFile] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [error, setError] = useState(null)
  const [financialYears, setFinancialYears] = useState([])
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null)

  //console.log(action, "CHECK11111122222");
  //console.log(getEmployees, "eeee11111122222");

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
  //console.log(approverData, "Ooooooooo");
  

  const { isLoading: financialYearsLoading, data: financialYearsData } = Digit.Hooks.pt.useMDMS(
    tenantId,
    businessService,
    "FINANCIAL_YEARLS",
    {},
    {
      details: {
        tenantId: Digit.ULBService.getStateId(),
        moduleDetails: [
          { moduleName: "egf-master", masterDetails: [{ name: "FinancialYear", filter: "[?(@.module == 'TL')]" }] },
        ],
      },
    },
  )

  useEffect(() => {
    if (financialYearsData && financialYearsData["egf-master"]) {
      setFinancialYears(financialYearsData["egf-master"]?.["FinancialYear"])
    }
  }, [financialYearsData])

  const { data: EmployeeStatusData } = Digit.Hooks.useCustomMDMS(tenantId, "common-masters", [{ name: "Department" }])

  useEffect(() => {
    if (approverData && EmployeeStatusData) {
      const departments = EmployeeStatusData["common-masters"].Department
      setApprovers(
        approverData?.Employees?.map((employee) => {
          const deptCode = employee?.assignments?.[0]?.department
          const matchedDept = departments?.find((d) => d?.code === deptCode)
          return { uuid: employee?.uuid, name: `${employee?.user?.name} - ${matchedDept?.name}` }
        }),
      )
    }
  }, [approverData,EmployeeStatusData])

  function selectFile(e) {
    setFile(e.target.files[0])
  }

  useEffect(() => {
    ;(async () => {
      setError(null)
      if (file) {
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("LAYOUT", file, Digit.ULBService.getStateId())
            if (response?.data?.files?.length > 0) {
              setUploadedFile(response?.data?.files[0]?.fileStoreId)
            } else {
              setError(t("CS_FILE_UPLOAD_ERROR"))
            }
          } catch (err) {
            setError(t("CS_FILE_UPLOAD_ERROR"))
          }
        }
      }
    })()
  }, [file])

  useEffect(() => {
    if (action?.action === "SENDBACKTOPROFESSIONAL") {
      const uuid = applicationDetails?.Layout?.[0]?.auditDetails?.createdBy || null
      setSelectedApprover({ uuid })
    }
  }, [action])

  function submit(data) {
    const mandatoryActions = ["APPROVE", "VERIFY", "REJECT", "SENDBACKTOPROFESSIONAL", "SENDBACKTOVERIFIER", "FORWARD"]

    let checkCommentsMandatory = mandatoryActions.includes(action?.action)

    //console.log(checkCommentsMandatory, "CHECK1111111111");

    if (action?.isTerminateState) {
      checkCommentsMandatory = true
    }

    const commentsText = data?.comments?.toString().trim()

    // if (action?.action !== "APPROVE" && !selectedApprover?.uuid) {
    //   setShowToast({ key: "true", warning: true, message: t("COMMON_ASSIGNEE_NAME_REQUIRED_LABEL") })
    //   return
    // }

    // Do NOT require assignee when SEND BACK TO PROFESSIONAL
if (
  action?.action !== "APPROVE" &&
  action?.action !== "SENDBACKTOPROFESSIONAL"  && action?.action !== "SEND_FOR_INSPECTION_REPORT" &&
  !selectedApprover?.uuid
) {
  setShowToast({ key: "true", warning: true, message: t("COMMON_ASSIGNEE_NAME_REQUIRED_LABEL") })
  return
}


    if (checkCommentsMandatory && !commentsText) {
      setShowToast({ key: "true", warning: true, message: t("COMMON_COMMENTS_REQUIRED_LABEL") })
      return
    }

    const workflow = { action: action?.action, comments: data?.comments, businessService, moduleName: moduleCode }
    applicationData = {
      ...applicationData,
      action: action?.action,
      comment: data?.comments,
      // assignee: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
      assignee:
  action?.action === "SENDBACKTOPROFESSIONAL"
    ? null
    : selectedApprover?.uuid
      ? [selectedApprover?.uuid]
      : null,

      wfDocuments: uploadedFile
        ? [
            {
              documentType: file?.type,
              fileName: file?.name,
              documentUid: uploadedFile,
              filestoreId: uploadedFile,
              documentAttachment: uploadedFile,
            },
          ]
        : null,
    }

    submitAction({
      Licenses: [applicationData],
    })
  }

  useEffect(() => {
    if (action) {
     let formConfig = LayoutModalConfig({
  t,
  action,
  approvers,
  selectedApprover,
  setSelectedApprover,
  selectFile,
  uploadedFile,
  setUploadedFile,
  businessService,
});

// Hide assignee dropdown for SENDBACKTOPROFESSIONAL
if (action?.action === "SENDBACKTOPROFESSIONAL") {
  formConfig.form = formConfig.form.filter((f) => f.name !== "assignee");
}

setConfig(formConfig);

    }
  }, [action, approvers, financialYears, selectedFinancialYear, uploadedFile])

  return action && config.form ? (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => {}}
      formId="modal-action"
    >
      <FormComposer
        config={config.form}
        className="BPAemployeeCard bpa-workflow-modal-form"
        noBoxShadow
        inline
        childrenAtTheBottom
        onSubmit={submit}
        defaultValues={defaultValues}
        formId="modal-action"
      />


      {showToast && <Toast error={showToast?.error} warning={showToast?.warning} label={showToast?.message} onClose={closeToast} isDleteBtn={true}/>}
      {showErrorToast && <Toast error={true} label={errorOne} isDleteBtn={true} onClose={closeToastOne} />}

             
    </Modal>
  ) : (
    <Loader />
  )
}

export default LayoutModal
