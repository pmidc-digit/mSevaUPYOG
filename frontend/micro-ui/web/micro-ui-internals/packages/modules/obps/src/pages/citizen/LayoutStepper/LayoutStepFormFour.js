import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionBar, CheckBox, FormComposer, Menu, SubmitBar, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import LayoutSummary from "../../../pageComponents/LayoutSummary";

const LayoutStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch()
  const [showToast, setShowToast] = useState(null)
  const [error, setError] = useState("")
  const [selectedCheckBox, setSelectedCheckBox] = useState(false)
  const [displayMenu, setDisplayMenu] = useState(false)
  const menuRef = useRef()

  const [isSearching, setIsSearching] = useState(false)
  const [layoutData, setLayoutData] = useState(null)

  let tenantId
  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY")
  else tenantId = window.localStorage.getItem("Employee.tenant-id")

  const currentStepData = useSelector((state) => state.obps.OBPSFormReducer.formData || {})
  const applicationNo = useSelector((state) => state.obps.OBPSFormReducer.formData?.applicationNo)

  const history = useHistory()

  const user = Digit.UserService.getUser()
  const userRoles = user?.info?.roles?.map((e) => e.code)

  const closeMenu = () => {
    setDisplayMenu(false)
  }
  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu)

  function handleCheckBox(e) {
    setSelectedCheckBox(e.target.checked)
  }

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: "Layout_mcUp",
  })

  console.log(" Workflow Details:", workflowDetails)

  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles
    })

  console.log(" Available actions:", actions)

  function onActionSelect(action) {
    goNext(action)
  }

  const goNext = (action) => {
    console.log(" Submitting with action:", action)

    if (window.location.pathname.includes("edit") && action.action === "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_SAVE_OR_RESUBMIT_LABEL" })
      return
    }

    onSubmit(currentStepData, action)
  }

  // const onSubmit = async (data, selectedAction) => {
  //   console.log(" Submitting with data:", data)
  //   console.log(" Selected action:", selectedAction)

  //   if (!layoutData) {
  //     setShowToast({ key: "true", error: true, message: "Application data not loaded. Please wait..." })
  //     return { isSuccess: false, error: "Missing layout data" }
  //   }

  //   const updatedLayout = {
  //     ...layoutData,
  //     workflow: {
  //       action: selectedAction?.action || "FORWARD_L1",
  //     },
  //     layoutDetails: {
  //       ...layoutData.layoutDetails,
  //       additionalDetails: {
  //         ...layoutData.layoutDetails.additionalDetails,
  //         applicationDetails: {
  //           ...data?.applicationDetails,
  //           applicantGender: data?.applicationDetails?.applicantGender?.code || "",
  //         },
  //         siteDetails: {
  //           ...data?.siteDetails,
  //           layoutAreaType: data?.siteDetails?.layoutAreaType?.name || "",
  //           layoutNonSchemeType: data?.siteDetails?.layoutNonSchemeType?.name || "",
  //           ulbName: data?.siteDetails?.ulbName?.name || "",
  //           roadType: data?.siteDetails?.roadType?.name || "",
  //           buildingStatus: data?.siteDetails?.buildingStatus?.name || "",
  //           isBasementAreaAvailable: data?.siteDetails?.isBasementAreaAvailable?.code || "",
  //           schemeType: data?.siteDetails?.schemeType?.name || "",
  //           district: data?.siteDetails?.district?.name || "",
  //           zone: data?.siteDetails?.zone?.name || "",
  //           cluIsApproved: data?.siteDetails?.cluIsApproved?.code || "",
  //         },
  //       },
  //     },
  //     documents: [],
  //   }

  //   const docsArray = data?.documents?.documents?.documents || []
  //   docsArray.forEach((doc) => {
  //     updatedLayout.documents.push({
  //       uuid: doc?.documentUid || doc?.uuid,
  //       documentType: doc?.documentType,
  //       documentAttachment: doc?.filestoreId || doc?.documentAttachment,
  //     })
  //   })

  //   const payload = {
  //     Layout: updatedLayout,
  //   }

  //   console.log(" Final UPDATE payload:", payload)

  //   try {
  //     const response = await Digit.OBPSService.LayoutUpdate(payload, tenantId)

  //     console.log(" UPDATE API Response:", response)

  //     if (response?.ResponseInfo?.status === "successful") {
  //       console.log(" Update successful")

  //       if (window.location.href.includes("citizen")) {
  //         if (selectedAction.action === "CANCEL") {
  //           setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" })
  //           setTimeout(() => {
  //             history.push(`/digit-ui/citizen/obps/layout/my-application`)
  //           }, 3000)
  //         } else {
  //           history.replace({
  //             pathname: `/digit-ui/citizen/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
  //             state: { data: response },
  //           })
  //         }
  //       } else {
  //         if (selectedAction.action === "CANCEL") {
  //           setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" })
  //           setTimeout(() => {
  //             history.push(`/digit-ui/employee/obps/layout/inbox`)
  //           }, 3000)
  //         } else {
  //           history.replace({
  //             pathname: `/digit-ui/employee/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
  //             state: { data: response },
  //           })
  //         }
  //       }
  //     } else {
  //       console.error(" Submission failed")
  //       setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" })
  //     }
  //   } catch (error) {
  //     console.error(" UPDATE API Error:", error)
  //     setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" })
  //   }
  // }


  const onSubmit = async (data, selectedAction) => {
  console.log(" Submitting with data:", data)
  console.log(" Selected action:", selectedAction)

  if (!layoutData) {
    setShowToast({ key: "true", error: true, message: "Application data not loaded. Please wait..." })
    return { isSuccess: false, error: "Missing layout data" }
  }

  // <CHANGE> Preserve full object structure instead of extracting .code or .name
  const updatedLayout = {
    ...layoutData,
    layoutDetails: {
      ...layoutData.layoutDetails,
      additionalDetails: {
        ...layoutData.layoutDetails.additionalDetails,
        // Spread to preserve full objects (applicantGender, etc. remain as complete objects)
        applicationDetails: {
          ...layoutData.layoutDetails.additionalDetails.applicationDetails,
          ...data?.applicationDetails,
        },
        // Spread to preserve full objects (ulbName, roadType, buildingStatus, etc. remain as complete objects)
        siteDetails: {
          ...layoutData.layoutDetails.additionalDetails.siteDetails,
          ...data?.siteDetails,
        },
      },
    },
    workflow: {
      action: selectedAction?.action || "FORWARD_L1",
    },
    documents: [],
  }

  // Handle documents
  const docsArray = data?.documents?.documents?.documents || []
  docsArray.forEach((doc) => {
    updatedLayout.documents.push({
      uuid: doc?.documentUid || doc?.uuid,
      documentType: doc?.documentType,
      documentAttachment: doc?.filestoreId || doc?.documentAttachment,
    })
  })

  const payload = {
    Layout: updatedLayout,
  }

  console.log(" Final UPDATE payload:", payload)

  try {
    const response = await Digit.OBPSService.LayoutUpdate(payload, tenantId)

    console.log(" UPDATE API Response:", response)

    if (response?.ResponseInfo?.status === "successful") {
      console.log(" Update successful")

      if (window.location.href.includes("citizen")) {
        if (selectedAction.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" })
          setTimeout(() => {
            history.push(`/digit-ui/citizen/obps/layout/my-application`)
          }, 3000)
        } else {
          history.replace({
            pathname: `/digit-ui/citizen/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
            state: { data: response },
          })
        }
      } else {
        if (selectedAction.action === "CANCEL") {
          setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" })
          setTimeout(() => {
            history.push(`/digit-ui/employee/obps/layout/inbox`)
          }, 3000)
        } else {
          history.replace({
            pathname: `/digit-ui/employee/obps/layout/response/${response?.Layout?.[0]?.applicationNo}`,
            state: { data: response },
          })
        }
      }
    } else {
      console.error(" Submission failed")
      setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" })
    }
  } catch (error) {
    console.error(" UPDATE API Error:", error)
    setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" })
  }
}

  function onGoBack(data) {
    onBackClick(config.key, data)
  }

  const searchApplication = async () => {
    if (!applicationNo) {
      console.log(" No application number found")
      return
    }

    const searchParams = {
      applicationNo: applicationNo,
    }

    console.log(" Fetching application for update:", applicationNo)

    try {
      setIsSearching(true)
      const response = await Digit.OBPSService.LayoutSearch(tenantId, searchParams)

      console.log(" Fetched Layout data:", response)

      if (response?.Layout?.[0]) {
        setLayoutData(response.Layout[0])
        dispatch(UPDATE_OBPS_FORM("apiData", { Layout: response.Layout }))
        console.log(" Layout data loaded successfully")
      } else {
        throw new Error("Application not found")
      }
    } catch (error) {
      console.error(" Search API Error:", error)
      setShowToast({ key: "true", error: true, message: "Failed to fetch application data" })
    } finally {
      setIsSearching(false)
    }
  }

  React.useEffect(() => {
    if (applicationNo && !layoutData) {
      searchApplication()
    }
  }, [])

  const closeToast = () => {
    setShowToast(null)
  }

  return (
    <React.Fragment>
      {isSearching ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>{t("LOADING_APPLICATION_DETAILS")}</p>
        </div>
      ) : (
        <LayoutSummary currentStepData={currentStepData} t={t} />
      )}

      <CheckBox
        label={`I hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant (${
          currentStepData?.applicationDetails?.applicantOwnerOrFirmName || "NA"
        }). I along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
        onChange={(e) => handleCheckBox(e)}
        value={selectedCheckBox}
        checked={selectedCheckBox}
      />

      {actions && (
        <ActionBar>
          <SubmitBar
            style={{ background: "white", color: "black", border: "1px solid", marginRight: "10px" }}
            label="Back"
            onSubmit={onGoBack}
          />

          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_LAYOUT`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
            />
          ) : null}
          {selectedCheckBox && (
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          )}
        </ActionBar>
      )}

      {showToast && (
        <Toast
          isDleteBtn={true}
          error={showToast?.error}
          warning={showToast?.warning}
          success={showToast?.success}
          label={t(showToast?.message)}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  )
}

export default LayoutStepFormFour