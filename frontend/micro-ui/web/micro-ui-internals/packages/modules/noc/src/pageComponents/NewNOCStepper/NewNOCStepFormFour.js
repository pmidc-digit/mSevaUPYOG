import React ,{useMemo,useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, ActionBar, FormComposer, Toast, SubmitBar, CheckBox,Loader } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM, RESET_NOC_NEW_APPLICATION_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useState, useRef } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import NOCSummary from "../NOCSummary";
import { convertToDDMMYYYY } from "../../utils";

const NewNOCStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");
  const [selectedCheckBox, setSelectedCheckBox] = useState(false);

  const isEdit = window.location.pathname.includes("edit");

  function handleCheckBox(e) {
    setSelectedCheckBox(e.target.checked);
  }

  console.log("selectedCheckBox", selectedCheckBox);

  const currentStepData = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.formData || {};
  });

  const coordinates = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.coordinates || {};
  });

  const ownerIds = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.ownerIds || [];
  });

  const ownerPhotos = useSelector(function (state) {
    return state?.noc?.NOCNewApplicationFormReducer?.ownerPhotos || [];
  });

  //console.log("coordinates in summary page", coordinates);

  const menuRef = useRef();
  let user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  const [displayMenu, setDisplayMenu] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const history = useHistory();

  let tenantId;

  if (window.location.href.includes("citizen")) tenantId = window.localStorage.getItem("CITIZEN.CITY");
  else {
    tenantId = window.localStorage.getItem("Employee.tenant-id");
  }

  const goNext = (action) => {
    console.log("formData in parent SummaryPage", currentStepData);

    onSubmit(currentStepData, action);
  };

  const calculatorPayload = useMemo(
    () => ({
      CalculationCriteria: [
        {
          applicationNumber: currentStepData?.apiData?.Noc?.[0]?.applicationNo,
          tenantId: currentStepData?.apiData?.Noc?.[0]?.tenantId,
          NOC: mapToNOCPayload(currentStepData, { action: "" }).Noc,
        },
      ],
    }),
    [currentStepData]
  );

  const { isLoading: nocCalculatorLoading, data : calculatorData, revalidate } = Digit.Hooks.noc.useNOCFeeCalculator(
    { payload: calculatorPayload },
    { enabled: !!calculatorPayload }
  );

  useEffect(() => {
  revalidate();
}, [currentStepData?.siteDetails, currentStepData?.applicationDetails]);


console.log('calculatorData', calculatorData)

  const onSubmit = async (data, selectedAction) => {
    console.log("formData inside onSubmit", data);

    if (window.location.pathname.includes("edit") && selectedAction.action === "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_SAVE_OR_RESUBMIT_LABEL" });
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
      return;
    }

    const finalPayload = mapToNOCPayload(data, selectedAction);
    
    const taxHeadEstimates = calculatorData?.Calculation?.[0]?.taxHeadEstimates || [];

    finalPayload.Noc.nocDetails.additionalDetails.calculations = [
      {
        isLatest: true,
        updatedBy: Digit.UserService.getUser()?.info?.name,
        taxHeadEstimates: taxHeadEstimates
      }
    ];
    console.log("finalPayload here==>", finalPayload);

    try {
      const response = await Digit.NOCService.NOCUpdate({ tenantId, details: finalPayload });

      if (response?.ResponseInfo?.status === "successful") {
        console.log("success: Update API ");
        // dispatch(RESET_NOC_NEW_APPLICATION_FORM());

        if (window.location.href.includes("citizen")) {
          if (selectedAction.action == "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/citizen/noc/my-application`);
            }, 3000);
          } else {
            //Else case for "APPLY" or "RESUBMIT" or "DRAFT"
            console.log("We are calling citizen response page");
            history.replace({
              pathname: `/digit-ui/citizen/noc/response/${response?.Noc?.[0]?.applicationNo}`,
              state: { data: response },
            });
          }
        } else {
          console.log("we are calling employee response page");

          if (selectedAction.action === "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/employee/noc/inbox`);
            }, 3000);
          } else {
            //Else case for "APPLY" or "RESUBMIT" or "DRAFT"
            history.replace({
              pathname: `/digit-ui/employee/noc/response/${response?.Noc?.[0]?.applicationNo}`,
              state: { data: response },
            });
          }
        }
      } else {
        console.error("Submission failed, not moving to next step.", res?.response);
        setShowToast({ key: "true", error: true, message: "COMMON_SOMETHING_WENT_WRONG_LABEL" });
      }
    } catch (error) {
      console.log("errors here in goNext - catch block", error);
      setShowToast({ key: "true", error: true, message: "COMMON_SOME_ERROR_OCCURRED_LABEL" });
    } finally {
      setTimeout(() => {
        setShowToast(null);
      }, 3000);
    }
  };

  function mapToNOCPayload(nocFormData, selectedAction) {
    console.log("nocFormData", nocFormData);

    const updatedApplication = {
      ...nocFormData?.apiData?.Noc?.[0],
      vasikaNumber: nocFormData?.siteDetails?.vasikaNumber || "", 
      vasikaDate: nocFormData?.siteDetails?.vasikaDate ? convertToDDMMYYYY(nocFormData?.siteDetails?.vasikaDate) : "",
      workflow: {
        action: selectedAction?.action || "",
        // assignes:selectedAction?.action || "",
        // status:selectedAction?.action || "",
      },
      nocDetails: {
        ...nocFormData?.apiData?.Noc?.[0]?.nocDetails,
                //update data with redux as we can not use old data for update api
        additionalDetails: {
          ...nocFormData?.apiData?.Noc?.[0]?.nocDetails.additionalDetails,
          applicationDetails: {
            ...nocFormData?.applicationDetails,
            //applicantGender: nocFormData?.applicationDetails?.applicantGender?.code || "",
          },
          siteDetails: {
            ...nocFormData?.siteDetails,
            ulbName: nocFormData?.siteDetails?.ulbName?.name || nocFormData?.siteDetails?.ulbName || "",
            roadType: nocFormData?.siteDetails?.roadType?.name || "",
            buildingStatus: nocFormData?.siteDetails?.buildingStatus?.name || "",
            isBasementAreaAvailable: nocFormData?.siteDetails?.isBasementAreaAvailable?.code || "",
            district: nocFormData?.siteDetails?.district || "",
            zone: nocFormData?.siteDetails?.zone?.name || "",
            vasikaDate: nocFormData?.siteDetails?.vasikaDate ? convertToDDMMYYYY(nocFormData?.siteDetails?.vasikaDate) : "",

            specificationBuildingCategory: nocFormData?.siteDetails?.specificationBuildingCategory?.name || "",
            specificationNocType: nocFormData?.siteDetails?.specificationNocType?.name || "",
            specificationRestrictedArea: nocFormData?.siteDetails?.specificationRestrictedArea?.code || "",
            specificationIsSiteUnderMasterPlan: nocFormData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || "",
          },
          coordinates: { ...coordinates },
          ownerPhotos: Array.isArray(ownerPhotos?.ownerPhotoList) ? ownerPhotos.ownerPhotoList : [],
          ownerIds: Array.isArray(ownerIds?.ownerIdList) ? ownerIds.ownerIdList : [],
        },
      },
      documents: [],
    };

    const docsArrayFromRedux = nocFormData?.documents?.documents?.documents || [];

    if (isEdit) {
      const apiResponseDocuments = currentStepData?.apiData?.Noc?.[0]?.documents || [];

      const apiResponseDocumentType = new Set(apiResponseDocuments?.map((d) => d.documentType));

      const updatedApiResponseDocuments = apiResponseDocuments?.map((doc) => {
        const fileStoreId =
          docsArrayFromRedux?.find((obj) => obj.documentType === doc.documentType)?.uuid ||
          docsArrayFromRedux?.find((obj) => obj.documentType === doc.documentType)?.documentAttachment;
        return {
          ...doc,
          uuid: fileStoreId,
          documentAttachment: fileStoreId,
        };
      });

      const newlyAddedDocs = docsArrayFromRedux?.filter((d) => !apiResponseDocumentType.has(d.documentType)) || [];

      const updatedNewlyAddedDocs = newlyAddedDocs?.map((doc) => {
        return {
          uuid: doc?.documentUid,
          documentType: doc?.documentType,
          documentAttachment: doc?.filestoreId,
        };
      });

      const overallDocs = [...updatedApiResponseDocuments, ...updatedNewlyAddedDocs];

      console.log("overallDocs", overallDocs);

      overallDocs.forEach((doc) => {
        updatedApplication?.documents?.push({
          ...doc,
        });
      });
    } else {
      docsArrayFromRedux.forEach((doc) => {
        updatedApplication.documents.push({
          uuid: doc?.documentUid,
          documentType: doc?.documentType,
          documentAttachment: doc?.filestoreId,
        });
      });
    }

    const payload = {
      Noc: { ...updatedApplication },
    };

    return payload;
  }

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const closeToast = () => {
    // setShowToast(false);
    // setError("");
    setShowToast(null);
  };

  console.log("currentStepData in StepFour", currentStepData);
  const applicationNo = currentStepData?.apiData?.Noc?.[0]?.applicationNo || "";
  console.log("applicationNo here==>", applicationNo);
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: "obpas_noc",
  });

  console.log("workflow Details here==>", workflowDetails);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  console.log("actions here", actions);

  function onActionSelect(action) {
    goNext(action);
    //console.log("selectedAction here", action);
  }
  if (nocCalculatorLoading) return <Loader />;

  const ownersList= currentStepData?.apiData?.Noc?.[0]?.nocDetails.additionalDetails?.applicationDetails?.owners?.map((item)=> item.ownerOrFirmName);
  const combinedOwnersName = ownersList?.join(", ");

  return (
    <React.Fragment>
      {nocCalculatorLoading && <Loader />}
      <NOCSummary onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />

      <CheckBox
              label={`I/We hereby solemnly affirm and declare that I am submitting this application on behalf of the applicant (${
                combinedOwnersName
              }). I/We along with the applicant have read the Policy and understand all the terms and conditions of the Policy. We are committed to fulfill/abide by all the terms and conditions of the Policy. The information/documents submitted are true and correct as per record and no part of it is false and nothing has been concealed/misrepresented therein.`}
              onChange={(e) => handleCheckBox(e)}
              value={selectedCheckBox}
              checked={selectedCheckBox}
      />

      {actions && (
        <ActionBar>
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />

          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu localeKeyPrefix={`WF_EMPLOYEE_${"NOC"}`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
          ) : null}
          {selectedCheckBox && <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />}
        </ActionBar>
      )}

      {showToast && (
        <Toast isDleteBtn={true} error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} onClose={closeToast} />
      )}
    </React.Fragment>
  );
};

export default NewNOCStepFormFour;
