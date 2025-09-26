import { Loader, Modal, FormComposer } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import { configBPAApproverApplication } from "../config";
import * as predefinedConfig from "../config";

const Heading = (props) => {
  return <h1 style={{marginLeft:"22px"}} className="heading-m BPAheading-m">{props.label}</h1>;
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

const ActionModal = ({ t, action, tenantId, state, id, closeModal, submitAction, actionData, applicationDetails, applicationData, businessService, moduleCode,workflowDetails,blockReason }) => {
  console.log("applicationData",applicationData)
  console.log("workflowDetails",workflowDetails)
  const mutation1 = Digit.Hooks.obps.useObpsAPI(
      applicationData?.landInfo?.address?.city ? applicationData?.landInfo?.address?.city : tenantId,
      false
    );
   const { data: approverData, isLoading: PTALoading } = Digit.Hooks.useEmployeeSearch(
    tenantId,
    {
      roles: workflowDetails?.data?.initialActionState?.nextActions?.filter(ele=>ele?.action==action?.action)?.[0]?.assigneeRoles?.map(role=>({code:role})),
      isActive: true,
    },
    { enabled: !action?.isTerminateState }
  );

  const queryClient = useQueryClient();
  const [config, setConfig] = useState({});
  const [defaultValues, setDefaultValues] = useState({});
  const [approvers, setApprovers] = useState([]);
  const [blockReasonFiltered, setFilteredBlockReason] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState({});
  const [selectedBlockReason, setBlockReason] = useState({});
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);
  const mobileView = Digit.Utils.browser.isMobile() ? true : false;

  useEffect(() => {
    setApprovers(approverData?.Employees?.map((employee) => ({ uuid: employee?.uuid, name: employee?.user?.name })));
  }, [approverData]);

  function selectFile(e) {
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    (async () => {
      setError(null);
      if (file) {
        const allowedFileTypesRegex = /(.*?)(jpg|jpeg|png|image|pdf)$/i
        if (file.size >= 5242880) {
          setError(t("CS_MAXIMUM_UPLOAD_SIZE_EXCEEDED"));
        } else if (file?.type && !allowedFileTypesRegex.test(file?.type)) {
          setError(t(`NOT_SUPPORTED_FILE_TYPE`))
        } else {
          try {
            const response = await Digit.UploadServices.Filestorage("OBPS", file, Digit.ULBService.getStateId() || tenantId?.split(".")[0]);
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

  const getInspectionDocs = (docs) => {
    let refinedDocs = [];
    docs && docs.map((doc,ind) => {
      refinedDocs.push({
        "documentType":(doc.documentType+"_"+doc.documentType.split("_")[1]).replaceAll("_","."),
        "fileStoreId":doc.fileStoreId,
        "fileStore":doc.fileStoreId,
        "fileName":"",
        "dropDownValues": {
          "value": (doc.documentType+"_"+doc.documentType.split("_")[1]).replaceAll("_","."),
      }
      })
    })
    return refinedDocs;
  }

  const getQuestion = (data) => {
    let refinedQues = [];
    var i;
    for(i=0; i<data?.questionLength; i++)
    {
      refinedQues.push({
        "remarks": data[`Remarks_${i}`],
        "question": data?.questionList[i].question,
        "value": data?.[`question_${i}`]?.code,
      })
    }
    return refinedQues;
  }

  const getfeildInspection = (data) => {
    let formdata = [], inspectionOb = [];
    
    if (data?.additionalDetails?.fieldinspection_pending?.length > 0) {
      inspectionOb = data?.additionalDetails?.fieldinspection_pending
    }
    inspectionOb = inspectionOb.filter(obj => {
      // Check if the object has the date field
      if (!obj.date) return false;
  
      // Get today's date
      const today = new Date();
      // Extract date from the object and convert it to a Date object
      const objDate = new Date(obj.date);
      // Compare the object's date with today's date
      return objDate <= today;
  });

  
    if(data.status == "FIELDINSPECTION_INPROGRESS") {
      formdata = JSON.parse(sessionStorage.getItem("INSPECTION_DATA"));
      formdata?.length > 0 && formdata.map((ob,ind) => {
        inspectionOb.push({
          docs: getInspectionDocs(ob.Documents),
          date: ob.InspectionDate,
          questions: getQuestion(ob),
          time: ob?.InspectionTime,
        })
      })
      console.log("FIELDINSPECTION_INPROGRESS",inspectionOb)
      inspectionOb = inspectionOb.filter((ob) => ob.date && ob.time);
      console.log("inspectionObinspectionOb",inspectionOb)
    } else {
      sessionStorage.removeItem("INSPECTION_DATA")
    }
  
    let fieldinspection_pending = [ ...inspectionOb];
    return fieldinspection_pending;
  }

  const getDocuments = (applicationData) => {
    let documentsformdata = JSON.parse(sessionStorage.getItem("BPA_DOCUMENTS"));
    let documentList = [];
    documentsformdata.map(doc => {
      if(doc?.uploadedDocuments?.[0]?.values?.length > 0) documentList = [...documentList, ...doc?.uploadedDocuments?.[0]?.values];
      if(doc?.newUploadedDocs?.length > 0) documentList = [...documentList, ...doc?.newUploadedDocs]
    });
    return documentList;
  }

  const getPendingApprovals = () => {
    const approvals = Digit.SessionStorage.get("OBPS_APPROVAL_CHECKS");
    const newApprovals = Digit.SessionStorage.get("OBPS_NEW_APPROVALS");
    let result = approvals?.reduce((acc, approval) => approval?.checked ? acc.push(approval?.label) && acc : acc, []);
    result = result?.concat(newApprovals !== null?newApprovals.filter(ob => ob.label !== "").map(approval => approval?.label):[]);
    return result;
  }

  async function submit(data) {
    let workflow = { action: action?.action, comments: data?.comments, businessService, moduleName: moduleCode };
    applicationData = {
      ...applicationData,
      documents: applicationData?.documents,
      additionalDetails: {...applicationData?.additionalDetails, fieldinspection_pending:getfeildInspection(applicationData), pendingapproval: getPendingApprovals(),blockingReason:selectedBlockReason?.name  },
       workflow:{
        action: action?.action,
        comment: data?.comments?.length > 0 ? data?.comments : null,
        comments: data?.comments?.length > 0 ? data?.comments : null,
        assignee: (workflowDetails?.data?.processInstances?.[0]?.state?.applicationStatus==="FIELDINSPECTION_INPROGRESS")? [workflowDetails?.data?.processInstances?.[0]?.assigner?.uuid]: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
        assignes:  (workflowDetails?.data?.processInstances?.[0]?.state?.applicationStatus==="FIELDINSPECTION_INPROGRESS")? [workflowDetails?.data?.processInstances?.[0]?.assigner?.uuid]: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
        varificationDocuments: uploadedFile
        ? [
          {
            documentType: action?.action + " DOC",
            fileName: file?.name,
            fileStoreId: uploadedFile,
          },
        ]
        : null,
      },
      action: action?.action,
      riskType: applicationData?.additionalDetails?.riskType,
      comment: data?.comments,
      assignee: (workflowDetails?.data?.processInstances?.[0]?.state?.applicationStatus==="FIELDINSPECTION_INPROGRESS")? [workflowDetails?.data?.processInstances?.[0]?.assigner?.uuid]: !selectedApprover?.uuid ? null : [selectedApprover?.uuid],
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
    if(parseInt(sessionStorage.getItem("lessAdjusment"))>(parseInt(sessionStorage.getItem("development"))+parseInt(sessionStorage.getItem("otherCharges"))+parseInt(applicationData?.additionalDetails?.selfCertificationCharges?.BPA_MALBA_CHARGES)+parseInt(applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LABOUR_CESS)+parseInt(applicationData?.additionalDetails?.selfCertificationCharges?.BPA_WATER_CHARGES)+parseInt(applicationData?.additionalDetails?.selfCertificationCharges?.BPA_GAUSHALA_CHARGES_CESS))){
      closeModal()
      alert(t("Enterd Less Adjustment amount is invalid"));
    }
    else{
    // applicationData.additionalDetails.selfCertificationCharges.BPA_DEVELOPMENT_CHARGES=sessionStorage.getItem("development") || "0";
    // applicationData.additionalDetails.selfCertificationCharges.BPA_OTHER_CHARGES=sessionStorage.getItem("otherCharges")|| "0";
    // applicationData.additionalDetails.selfCertificationCharges.BPA_LESS_ADJUSMENT_PLOT=sessionStorage.getItem("lessAdjusment" )|| "0";
    // applicationData.additionalDetails.otherFeesDiscription=sessionStorage.getItem("otherChargesDisc" || "NA");
    // applicationData.additionalDetails.lessAdjustmentFeeFiles=JSON.parse(sessionStorage.getItem("uploadedFileLess"));

    const nocDetails = applicationDetails?.nocData?.map(noc => {
      const uploadedDocuments = Digit.SessionStorage.get(noc?.nocType) || [];
      return {
        Noc: {
          ...noc,
          documents: [
            ...(noc?.documents?noc?.documents:[]),
            ...(uploadedDocuments?uploadedDocuments:[])
          ]
        }
      }
    })

    let filters = {sourceRefId:nocDetails?.[0]?.Noc?.sourceRefId}
    // const response = await Digit.NOCSearch.all(tenantId, filters)
    const response = {}

    let AirportFlag = true;
    let NocFlag = true;
    response?.Noc?.map((ob) => {
      if (
        (ob?.applicationStatus?.toUpperCase() === "APPROVED" ||
        ob?.applicationStatus?.toUpperCase() === "AUTO_APPROVED" ||
        ob?.applicationStatus?.toUpperCase() === "REJECTED" ||
        ob?.applicationStatus?.toUpperCase() === "AUTO_REJECTED" ||
        ob?.applicationStatus?.toUpperCase() === "VOIDED") && (AirportFlag == true || NocFlag == true)
      ) {
        if(ob?.nocType === "AIRPORT_AUTHORITY")
        AirportFlag = false
        else if(ob?.nocType === "FIRE_NOC")
        NocFlag = false
      }
    }) 

    let nocData = [];
    if (nocDetails) {
      nocDetails.map(noc => {
        if (
            noc?.Noc?.applicationStatus?.toUpperCase() != "APPROVED" &&
            noc?.Noc?.applicationStatus?.toUpperCase() != "AUTO_APPROVED" &&
            noc?.Noc?.applicationStatus?.toUpperCase() != "REJECTED" &&
            noc?.Noc?.applicationStatus?.toUpperCase() != "AUTO_REJECTED" &&
            noc?.Noc?.applicationStatus?.toUpperCase() != "VOIDED" && (noc?.Noc?.nocType === "AIRPORT_AUTHORITY" && AirportFlag) || (noc?.Noc?.nocType === "FIRE_NOC" && NocFlag)
          ) {
            nocData.push(noc);
          }
      })
    }
    if(applicationData.status == "FIELDINSPECTION_INPROGRESS") {
      let formdata = JSON.parse(sessionStorage.getItem("INSPECTION_DATA"));
      formdata?.length > 0 && formdata.map((ob,ind) => {

        ob.InspectionDate && ob.InspectionTime ?  submitAction({
          BPA:applicationData
        }, nocData?.length > 0 ? nocData : false, {isStakeholder: false, bpa: true}) : closeModalNew()
        console.log(" ob.InspectionDate && ob.InspectionTime", ob.InspectionDate , ob.InspectionTime)
    } )
  }
  else 
  {
    submitAction({
      BPA:applicationData
    }, nocData?.length > 0 ? nocData : false, {isStakeholder: false, bpa: true})    
  }
    }    
  }
  const closeModalNew = ()=>{
    closeModal()
    alert(t("Please fill Inspection Date and Time"))
  }

  useEffect(() => {
    setFilteredBlockReason(blockReason?.map((blockReason) => ({ code: blockReason?.code, name: blockReason?.value })));
    if (action) {
      setConfig(
        configBPAApproverApplication({
          t,
          action,
          approvers,
          selectedApprover,
          setSelectedApprover,
          selectedBlockReason,
          setBlockReason,
          selectFile,
          uploadedFile,
          setUploadedFile,
          businessService,
          assigneeLabel: "WF_ASSIGNEE_NAME_LABEL_BPA",
          error,
          blockReasonFiltered
        })
      );
    }
  }, [action, approvers, selectedFinancialYear, uploadedFile, error]);

  return action && config.form ? (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => { }}
      formId="modal-action"
      isOBPSFlow={true}
      popupStyles={mobileView?{width:"720px"}:{}}
      style={!mobileView?{minHeight: "45px", height: "auto", width:"107px",paddingLeft:"0px",paddingRight:"0px"}:{minHeight: "45px", height: "auto",width:"44%"}}
      popupModuleMianStyles={mobileView?{paddingLeft:"5px"}: {}}
    >
      {PTALoading ? (
        <Loader />
      ) : (
        <FormComposer
          config={config.form}
          cardStyle={{marginLeft:"0px",marginRight:"0px", marginTop:"-25px"}}
          className="BPAemployeeCard"
          noBoxShadow
          inline
          childrenAtTheBottom
          onSubmit={submit}
          defaultValues={defaultValues}
          formId="modal-action"
        />
      )}
    </Modal>
  ) : (
    <Loader />
  );
};

export default ActionModal;