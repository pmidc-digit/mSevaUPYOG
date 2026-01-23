import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, ActionBar, FormComposer, Toast, SubmitBar, CheckBox } from "@mseva/digit-ui-react-components";
import { UPDATE_OBPS_FORM, RESET_OBPS_FORM } from "../../../redux/actions/OBPSActions";
import { useState, useRef } from "react";
import _ from "lodash";
import { useHistory, useLocation } from "react-router-dom";
import { convertToDDMMYYYY } from "../../../utils";

const CLUStepFormFour = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(null);
  const [error, setError] = useState("");
  const [selectedCheckBox, setSelectedCheckBox] = useState(false);

  const isEdit = window.location.pathname.includes("edit");

  function handleCheckBox(e) {
    setSelectedCheckBox(e.target.checked);
  }

 // console.log("selectedCheckBox", selectedCheckBox);

  const currentStepData = useSelector(function (state) {
    return state?.obps?.OBPSFormReducer?.formData || {};
  });

  const coordinates = useSelector(function (state) {
    return state?.obps?.OBPSFormReducer?.coordinates || {};
  });

  const ownerIds = useSelector(function (state) {
        return state.obps.OBPSFormReducer.ownerIds;
  });
    
  const ownerPhotos = useSelector(function (state) {
        return state.obps.OBPSFormReducer.ownerPhotos;
  });



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

  const goNext = async (action) => {
    console.log("formData in parent SummaryPage", currentStepData);

    onSubmit(currentStepData, action);
  };

  const onSubmit = async (data, selectedAction) => {
    console.log("formData inside onSubmit", data);

    if (window.location.pathname.includes("edit") && selectedAction.action === "EDIT") {
      setShowToast({ key: "true", warning: true, message: "COMMON_SAVE_OR_RESUBMIT_LABEL" });
      setTimeout(()=>{
        setShowToast(null);
      },3000);
      return;
    }

    try {
      const finalPayload = mapToCLUPayload(data, selectedAction);
      console.log("finalPayload here==>", finalPayload);

      const response = await Digit.OBPSService.CLUUpdate({ tenantId, details: finalPayload });

      if (response?.ResponseInfo?.status === "successful") {
        console.log("success: Update API ");
        // dispatch(RESET_NOC_NEW_APPLICATION_FORM());

        if (window.location.href.includes("citizen")) {
          if (selectedAction.action == "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/citizen/obps/home`);
            }, 3000);
          } else {
            //Else case for "APPLY" or "RESUBMIT" or "DRAFT"
            console.log("We are calling citizen response page");
            history.replace({
              pathname: `/digit-ui/citizen/obps/clu/response/${response?.Clu?.[0]?.applicationNo}`,
              state: { data: response },
            });
          }
        } else {
          //need to check for employee side
          console.log("we are calling employee response page");

          if (selectedAction.action === "CANCEL") {
            setShowToast({ key: "true", success: true, message: "COMMON_APPLICATION_CANCELLED_LABEL" });
            setTimeout(() => {
              history.push(`/digit-ui/employee/obps/inbox`);
            }, 3000);
          } else {
            //Else case for "APPLY" or "RESUBMIT" or "DRAFT"
            history.replace({
              pathname: `/digit-ui/employee/obps/response/${response?.Clu?.[0]?.applicationNo}`,
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
    }finally{
      setTimeout(()=>{setShowToast(null);},3000);
    }
  };

  function mapToCLUPayload(cluFormData, selectedAction) {
    console.log("cluFormData", cluFormData);

    {/**Change of Owner Feature Left and to be discussed*/}

    // const ownerData = (cluFormData?.applicationDetails?.owners ?? [])?.map((item,index)=>{
    //   return {
    //     mobileNumber: item?.mobileNumber || "",
    //     name: item?.ownerOrFirmName || "",
    //     emailId: item?.emailId || "",
    //     userName: item?.mobileNumber || "",
    //     additionalDetails:{
    //      ownerPhoto :{...ownerPhotos?.ownerPhotoList?.[index]},
    //      ownerId: {...ownerIds?.ownerIdList?.[index]}
    //     }
    //   }
    //  });

    const updatedApplication = {
      ...cluFormData?.apiData?.Clu?.[0],
      // owners: ownerData,// NEED TO BE DISCUSSED
      workflow: {
        action: selectedAction?.action || "",
      },
      cluDetails: {
        ...cluFormData?.apiData?.Clu?.[0]?.cluDetails,
        vasikaNumber: cluFormData?.siteDetails?.vasikaNumber || "", 
        vasikaDate: cluFormData?.siteDetails?.vasikaDate ? convertToDDMMYYYY(cluFormData?.siteDetails?.vasikaDate) : "",

        //update data with redux as we can not use old data for update api
        additionalDetails: {
          ...cluFormData?.apiData?.Clu?.[0]?.cluDetails.additionalDetails,
          applicationDetails: {
            ...cluFormData?.applicationDetails,
            // applicantGender: cluFormData?.applicationDetails?.applicantGender?.code || "",
          },
          siteDetails: {
            businessService: cluFormData?.apiData?.Clu?.[0]?.cluDetails.additionalDetails?.siteDetails?.businessService,
            ...cluFormData?.siteDetails,
            // ulbName: cluFormData?.siteDetails?.ulbName?.name || "",
            // roadType: cluFormData?.siteDetails?.roadType?.name || "",
            // buildingStatus: cluFormData?.siteDetails?.buildingStatus?.name || "",
            // isBasementAreaAvailable: cluFormData?.siteDetails?.isBasementAreaAvailable?.code || "",
            // district: cluFormData?.siteDetails?.district?.name || "",
            // zone: cluFormData?.siteDetails?.zone?.name || "",

            // specificationBuildingCategory: cluFormData?.siteDetails?.specificationBuildingCategory?.name || "",
            // specificationNocType: cluFormData?.siteDetails?.specificationNocType?.name || "",
            // specificationRestrictedArea: cluFormData?.siteDetails?.specificationRestrictedArea?.code || "",
            // specificationIsSiteUnderMasterPlan: cluFormData?.siteDetails?.specificationIsSiteUnderMasterPlan?.code || "",
          },
          coordinates: { ...coordinates },
          ownerPhotos: Array.isArray(ownerPhotos?.ownerPhotoList) ? ownerPhotos.ownerPhotoList : [],
          ownerIds: Array.isArray(ownerIds?.ownerIdList) ? ownerIds.ownerIdList: [] 
        },
      },
      documents: [],
    };

    const docsArrayFromRedux = cluFormData?.documents?.documents?.documents || [];

    if(isEdit){
       
    const apiResponseDocuments = currentStepData?.apiData?.Clu?.[0]?.documents || [];

    const apiResponseDocumentType = new Set(apiResponseDocuments?.map((d)=> d.documentType));

    const updatedApiResponseDocuments = apiResponseDocuments?.map((doc)=>{

    const fileStoreId = docsArrayFromRedux?.find((obj)=> obj.documentType === doc.documentType)?.uuid || docsArrayFromRedux?.find((obj)=> obj.documentType === doc.documentType)?.documentAttachment;
      return ({
        ...doc,
        uuid: fileStoreId,
        documentAttachment: fileStoreId
      })
    });

   const newlyAddedDocs = docsArrayFromRedux?.filter((d) => !apiResponseDocumentType.has(d.documentType)) || [];

   const updatedNewlyAddedDocs = newlyAddedDocs?.map((doc)=>{
    return {
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.filestoreId,
    }
   });

   const overallDocs= [...updatedApiResponseDocuments, ...updatedNewlyAddedDocs];
   
   console.log("overallDocs", overallDocs);


    overallDocs.forEach((doc)=>{
      updatedApplication?.documents?.push({
       ...doc
      })
    })

    }else{
      docsArrayFromRedux.forEach((doc) => {
        updatedApplication.documents.push({
        uuid: doc?.documentUid,
        documentType: doc?.documentType,
        documentAttachment: doc?.filestoreId,
      });
     });

    }

    const payload = {
      Clu: { ...updatedApplication },
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
  const applicationNo = currentStepData?.apiData?.Clu?.[0]?.applicationNo || "";
  const businessServiceCode = currentStepData?.apiData?.Clu?.[0]?.cluDetails?.additionalDetails?.siteDetails?.businessService || "";
  //console.log("applicationNo here==>", applicationNo);
  //console.log("businessServiceCode here==>", businessServiceCode);
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: applicationNo,
    moduleCode: businessServiceCode,
  });

 // console.log("workflow Details here==>", workflowDetails);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  //console.log("actions here", actions);

  function onActionSelect(action) {
    goNext(action);
    //console.log("selectedAction here", action);
  }

  const ownersList= currentStepData?.apiData?.Clu?.[0]?.cluDetails?.additionalDetails?.applicationDetails?.owners?.map((item)=> item.ownerOrFirmName);
  console.log("ownersList===>", ownersList);
  const combinedOwnersName = ownersList?.join(", ");
  console.log("combinedOwnersName==>", combinedOwnersName);

  const CLUSummary = Digit?.ComponentRegistryService?.getComponent("CLUSummary");

  return (
    <React.Fragment>
      <CLUSummary onGoBack={onGoBack} goNext={goNext} currentStepData={currentStepData} t={t} />

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
          <SubmitBar className="go-back-footer-button" label="Back" onSubmit={onGoBack} />

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

export default CLUStepFormFour;
