import React, { useEffect, useState, Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import { useHistory } from "react-router-dom";
import { Header, ActionBar, MultiLink, SubmitBar, Menu, Modal, ButtonSelector, Toast, Loader } from "@mseva/digit-ui-react-components";
import * as func from "../../../utils";
import { ifUserRoleExists, downloadPdf, downloadAndOpenPdf } from "../../../utils";
import WSInfoLabel from "../../../pageComponents/WSInfoLabel";
import getConnectionDetailsPDF from "../../../utils/getConnectionDetails";

const GetConnectionDetails = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const history = useHistory();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [showToast, setShowToast] = useState(null);
  let filters = func.getQueryStringParams(location.search);
  const applicationNumber = filters?.applicationNumber;
  const serviceType = filters?.service;
  const due = filters?.due;
  const getTenantId = filters?.tenantId;
  const connectionType = filters?.connectionType;
  const [showOptions, setShowOptions] = useState(false);
  const stateCode = Digit.ULBService.getStateId();
  const actionConfig = ["COLLECT","SINGLE DEMAND","CANCEL DEMAND","MODIFY CONNECTION","DISCONNECTION_BUTTON"];
  const { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.ws.useConnectionDetail(t, tenantId, applicationNumber, serviceType===("WS"||"WATER")?"WATER":serviceType===("SW"||"SEWARAGE")?"SEWARAGE":"", {
    privacy: Digit.Utils.getPrivacyObject(),
    enabled: !!(tenantId && applicationNumber && serviceType)
  });
  const menuRef = useRef();
  const actionMenuRef = useRef();
  sessionStorage.removeItem("IsDetailsExists");
  Digit.SessionStorage.del("PT_CREATE_EMP_WS_NEW_FORM");

  const { isLoading: isLoadingDemand, data: demandData } = Digit.Hooks.useDemandSearch(
    { consumerCode: applicationDetails?.applicationData?.connectionNo, businessService: (serviceType === "WATER" || serviceType ==="WS") ? "WS" : (serviceType === "SEWARAGE" || serviceType ==="SW")? "SW":"", tenantId },
    { enabled: !!(applicationDetails?.applicationData?.applicationNo && applicationDetails?.applicationData?.connectionNo) }
  );
  const [demandDetails,setDemandDetails]=useState([])
  let arr=[]
const dateFormat=(dateString)=>{
// Convert the timestamp to a Date object
const date = new Date(dateString);

// Extract the day, month, and year
const day = String(date.getDate()).padStart(2, '0');
const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
const year = date.getFullYear();

// Format the date as DD/MM/YYYY
const formattedDate = `${day}/${month}/${year}`;
return formattedDate;
}
const[totalDemandTax,setTotalDemandTax]=useState(0)
const [totalBalanceTax,setTotalBalanceTax]=useState(0)
useEffect(() => {
  try {
    if (demandData?.Demands?.length > 0) {
     
     let td=0;
     let tb=0;
      demandData.Demands.map((item)=>{
        if (!item || !item.demandDetails || !Array.isArray(item.demandDetails) || item.demandDetails.length === 0) {
          return; // Skip invalid items
        }
        
        let obj={}
       obj.taxPeriodFrom = item.taxPeriodFrom ? dateFormat(item.taxPeriodFrom) : "N/A"
       obj.taxPeriodTo = item.taxPeriodTo ? dateFormat(item.taxPeriodTo) : "N/A"

     if(item.demandDetails[0].taxHeadMasterCode==="WS_CHARGE"||item.demandDetails[0].taxHeadMasterCode==="SW_CHARGE"||item.demandDetails[0].taxHeadMasterCode==="SW_DISCHARGE_CHARGE"){
    
      obj.demandTax=item.demandDetails[0].taxAmount
      obj.collectionTax=item.demandDetails[0].collectionAmount
      obj.demandPenality=0.0
      obj.demandInterest=0.0
      obj.collectionPenality=0.0
      obj.collectionInterest=0.0
      obj.balanceTax= (item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      obj.balancePenality= 0.0
      obj.balanceInterest=0.0
      obj.advance=0.0
      td+=item.demandDetails[0].taxAmount
      tb+=(item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      arr.push(obj)
     }

     if(item.demandDetails[0].taxHeadMasterCode==="WS_INTEREST"||item.demandDetails[0].taxHeadMasterCode==="SW_INTEREST"||item.demandDetails[0].taxHeadMasterCode==="WS_TIME_INTEREST"||item.demandDetails[0].taxHeadMasterCode==="SW_TIME_INTEREST"){
      obj.demandTax=0.0
      obj.collectionTax=0.0
      obj.demandPenality=0.0
      obj.demandInterest=item.demandDetails[0].taxAmount
      obj.collectionPenality=0.0
      obj.collectionInterest=item.collectionAmount
      obj.balanceTax= (item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      obj.balancePenality= 0.0
      obj.balanceInterest=0.0
      obj.advance=0.0
      tb+=(item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      arr.push(obj)
     }


     if(item.demandDetails[0].taxHeadMasterCode==="WS_PENALITY"||item.demandDetails[0].taxHeadMasterCode==="SW_PENALITY"||item.demandDetails[0].taxHeadMasterCode==="WS_TIME_PENALITY"||item.demandDetails[0].taxHeadMasterCode==="SW_TIME_PENALITY"){
      obj.demandTax=0.0
      obj.collectionTax=0.0
      obj.demandPenality=item.demandDetails[0].taxAmount
      obj.demandInterest=0.0
      obj.collectionPenality=item.collectionAmount
      obj.collectionInterest=0.0
      obj.balanceTax= (item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      obj.balancePenality= 0.0
      obj.balanceInterest=0.0
      obj.advance=0.0
      tb+=(item.demandDetails[0].taxAmount-item.demandDetails[0].collectionAmount)
      arr.push(obj)
     }

     if(item.demandDetails[0].taxHeadMasterCode==="SW_ADVANCE_CARRYFORWARD"||item.demandDetails[0].taxHeadMasterCode==="SW_ADVANCE_CARRYFORWARD"){
      obj.demandTax=0.0
      obj.collectionTax=0.0
      obj.demandPenality=0.0
      obj.demandInterest=0.0
      obj.collectionPenality=0.0
      obj.collectionInterest=0.0
      obj.balanceTax= 0.0
      obj.balancePenality= 0.0
      obj.balanceInterest=0.0
      obj.advance=item.advance
      
      arr.push(obj)
     }
    })
  
    setDemandDetails(arr)
    setTotalBalanceTax(tb)
    setTotalDemandTax(td)
  }
  else{
    let obj={}
    obj.taxPeriodFrom =0.0
     obj.taxPeriodTo =0.0
    obj.demandTax=0.0
    obj.collectionTax=0.0
    obj.demandPenality=0.0
    obj.demandInterest=0.0
    obj.collectionPenality=0.0
    obj.collectionInterest=0.0
    obj.balanceTax= 0.0
    obj.balancePenality= 0.0
    obj.balanceInterest=0.0
    obj.advance=0.0
    arr.push(obj)
    setDemandDetails(arr)
  }
  } catch (error) {
    console.error("Error processing demand data:", error);
    setDemandDetails([]);
  }
},[demandData])
  const [showModal, setshowModal] = useState(false);
  const [billData, setBilldata] = useState([]);
  const [showActionToast, setshowActionToast] = useState(null);
  const checkifPrivacyenabled = Digit.Hooks.ws.useToCheckPrivacyEnablement({privacy : { uuid:(applicationDetails?.applicationData?.applicationNo?.includes("WS") ? applicationDetails?.applicationData?.WaterConnection?.[0]?.connectionHolders?.[0]?.uuid : applicationDetails?.applicationData?.SewerageConnections?.[0]?.connectionHolders?.[0]?.uuid), fieldName: ["connectionHoldersMobileNumber"], model: "WnSConnectionOwner" }}) || false;

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.ws.useWSApplicationActions(serviceType);
  const mobileView = Digit.Utils.browser.isMobile();

  const { isCommonmastersLoading, data: mdmsCommonmastersData } = Digit.Hooks.obps.useMDMS(stateCode, "common-masters", ["uiCommonPay"]);
  const commonPayDetails = mdmsCommonmastersData?.["common-masters"]?.uiCommonPay || [];
  const index =
    commonPayDetails &&
    commonPayDetails.findIndex((item) => {
      return item.code == "WS.ONE_TIME_FEE";
    });
  let commonPayInfo = "";
  if (index > -1) commonPayInfo = commonPayDetails[index];
  else commonPayInfo = commonPayDetails && commonPayDetails.filter((item) => item.code === "DEFAULT");
  const receiptKey = commonPayInfo?.receiptKey || "consolidatedreceipt";

  useEffect(async () => {
    let businessService = serviceType === "WATER" ? "WS" : "SW";
    const res = await Digit.PaymentService.searchAmendment(tenantId, { consumerCode: applicationNumber, businessService });

    setBilldata(res.Amendments);
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear any timers, subscriptions, or async operations
      setShowToast(null);
      setshowActionToast(null);
      setshowModal(false);
    };
  }, []);

  // Issue 16 Fix: Connection details download function
  const downloadConnectionDetails = async () => {
    try {
      const tenantInfo = applicationDetails?.applicationData?.tenantId;
      let result = applicationDetails?.applicationData;
      
      if (!result || !tenantInfo) {
        console.error("Missing application data or tenant information");
        return;
      }
      
      // Ensure we have the required connection data
      const connectionData = {
        ...result,
        applicationNo: result.applicationNo || result.connectionNo,
        connectionNo: result.connectionNo || result.applicationNo,
        // Add any missing required fields
        auditDetails: result.auditDetails || { createdTime: Date.now() },
        additionalDetails: result.additionalDetails || {}
      };
      
      const propertyData = {
        ...applicationDetails?.propertyDetails,
        // Ensure property has required fields
        owners: applicationDetails?.propertyDetails?.owners || []
      };
      
      console.log("Connection data for PDF:", connectionData);
      console.log("Property data for PDF:", propertyData);
      
      const PDFdata = await getConnectionDetailsPDF(connectionData, propertyData, tenantInfo, t);
      
      if (PDFdata) {
        await Digit.Utils.pdf.generate(PDFdata);
      }
    } catch (error) {
      console.error("Error downloading connection details:", error);
      // Show user-friendly error message
      setshowActionToast({
        key: "error",
        label: "PDF_DOWNLOAD_ERROR",
      });
    }
  };

  const downloadApplicationDetails = async () => {
    const res = { ...applicationDetails };
    const tenantInfo = res?.tenantId;
    const PDFdata = getPDFData({ ...res }, { ...res?.property }, tenantInfo, t);
    PDFdata.then((ress) => Digit.Utils.pdf.generate(ress));
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const closeBillToast = () => {
    setshowActionToast(null);
  };
  
  // Fix memory leak: Move setTimeout inside useEffect
  useEffect(() => {
    if (showActionToast) {
      const timer = setTimeout(() => {
        closeBillToast();
      }, 10000);
      
      // Cleanup function to clear timeout if component unmounts
      return () => clearTimeout(timer);
    }
  }, [showActionToast]);

  // Issue 8 Fix: Connection workflow validation
 
  const checkApplicationStatus = applicationDetails?.applicationData?.status === "Active" ? true : false;
  const checkWorkflow = applicationDetails?.isApplicationApproved;

  const getModifyConnectionButton = () => {
    if (!checkApplicationStatus) {
      setshowActionToast({
        key: "error",
        label: "CONN_NOT_ACTIVE",
      });
      return;
    }
    if (applicationDetails?.fetchBillsData !== undefined && applicationDetails?.fetchBillsData?.[0]?.totalAmount > 0) {
      setshowActionToast({
        key: "error",
        label: "WS_DUE_AMOUNT_SHOULD_BE_ZERO",
      });
      return;
    }
    //here check if this connection have any active bills(don't allow to modify in this case)

    let pathname = `/digit-ui/employee/ws/modify-application?applicationNumber=${applicationDetails?.applicationData?.connectionNo}&service=${serviceType}&propertyId=${applicationDetails?.propertyDetails?.propertyId}&from=WS_COMMON_CONNECTION_DETAIL`;

    history.push(`${pathname}`, JSON.stringify({ data: applicationDetails }));
  };

  const getBillAmendmentButton = () => {
    //redirect to documents required screen here instead of this screen

    let isBillAmendNotApplicable = false;
    billData?.map((bill) => {
      if (bill?.status === "INWORKFLOW") {
        isBillAmendNotApplicable = true;
        return;
      }
    });

    if (demandData?.Demands?.length === 0) {
      setshowActionToast({
        key: "error",
        label: "No_Bills_Found",
      });
      return;
    } else if (isBillAmendNotApplicable) {
      setshowActionToast({
        key: "error",
        label: "WORKFLOW_IN_PROGRESS",
      });
      return;
    }

    history.push(
      `/digit-ui/employee/ws/required-documents?connectionNumber=${applicationDetails?.applicationData?.connectionNo}&tenantId=${getTenantId}&service=${serviceType}`,
      JSON.stringify({ data: applicationDetails })
    );
  };

  const closeMenu = () => {
    setShowOptions(false);
  };
  Digit.Hooks.useClickOutside(menuRef, closeMenu, showOptions);

  const closeActionMenu = () => {
    setDisplayMenu(false);
  };
  Digit.Hooks.useClickOutside(actionMenuRef, closeActionMenu, displayMenu);
  const getDisconnectionButton = () => {
    let pathname = `/digit-ui/employee/ws/new-disconnection`;

    if(!checkWorkflow){
      setshowActionToast({
        key: "error",
        label: "WORKFLOW_IN_PROGRESS",
      });
    }
    else{
        if (billData[0]?.status === "ACTIVE" || applicationDetails?.fetchBillsData?.length <=0 || due == "0" || due < 0) {
          Digit.SessionStorage.set("WS_DISCONNECTION", applicationDetails);
          history.push(`${pathname}`);
        } 
       
        else {
          setshowModal(true);
        }
    }
  };
  // Issue 23 Fix: Restoration button for temporary disconnections
  const getRestorationButton = () => {
    let pathname = `/digit-ui/employee/ws/new-restoration`;

    if(!checkWorkflow){
      setshowActionToast({
        key: "error",
        label: "WORKFLOW_IN_PROGRESS",
      });
    }
    else{
        if (billData[0]?.status === "ACTIVE" || applicationDetails?.fetchBillsData?.length <=0 || due === "0") {
          Digit.SessionStorage.set("WS_DISCONNECTION", applicationDetails);
          history.push(`${pathname}`);
        } else {
          setshowModal(true);
        }
    }
  }; 
  function onActionSelect(action) {
    if (action === "MODIFY CONNECTION") {
      getModifyConnectionButton();
    } else if (action === "BILL_AMENDMENT_BUTTON") {
      getBillAmendmentButton();
    } else if (action === "DISCONNECTION_BUTTON") {
      getDisconnectionButton();
    }
    else if(action === "RESTORATION_BUTTON")
    {
      getRestorationButton();
    }
  }

  //all options needs to be shown
  //const showAction = due !== "0" ? actionConfig : actionConfig.filter((item) => item !== "BILL_AMENDMENT_BUTTON");
  const checkApplicationStatusForDisconnection =  applicationDetails?.applicationData?.status === "Active" ? true : false
  const showAction= checkApplicationStatusForDisconnection ? actionConfig : actionConfig.filter((item) => item !== "DISCONNECTION_BUTTON");
const showActionRestoration = ["RESTORATION_BUTTON"]

  // Working bill download function - Issue 16 Fix
  async function getBillSearch() {
    if (applicationDetails?.fetchBillsData?.length > 0) {
      const connectionNo = applicationDetails?.applicationData?.connectionNo;
      const service = (serviceType === "WATER" || serviceType === "WS" || connectionNo?.includes("WS")) ? "WS" : "SW";
      
      try {
        const response = await Digit.ReceiptsService.bill_download(
          service, 
          connectionNo, 
          tenantId, 
          "consolidatedbill"
        );
        
        if (response && response.status >= 200 && response.status < 300) {
          downloadPdf(new Blob([response.data], { type: "application/pdf" }), `BILL-${connectionNo}.pdf`);
        }
      } catch (error) {
        console.error("Error in bill download:", error);
      }
    }
  }

  let dowloadOptions = [];

  const appFeeDownloadReceipt = {
    order: 1,
    label: t("WS_COMMON_DOWNLOAD_BILL"),
    onClick: () => getBillSearch(),
  };

  const connectionDetailsReceipt = {
    order: 2,
    label: t("WS_CONNECTION_DETAILS"),
    onClick: () => downloadConnectionDetails(),
  };

  if (applicationDetails?.fetchBillsData?.length > 0) dowloadOptions = [appFeeDownloadReceipt, connectionDetailsReceipt];
  else dowloadOptions = [connectionDetailsReceipt];
  const Close = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
  const Heading = (props) => {
    return (
      <h1 style={{ marginLeft: "22px" }} className="heading-m BPAheading-m">
        {props.label}
      </h1>
    );
  };

  const CloseBtn = (props) => {
    return (
      <div className="icon-bg-secondary" onClick={props.onClick}>
        <Close />
      </div>
    );
  };
  return (
    <Fragment>
      <div>
        <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
          <Header styles={{ marginLeft: "0px", paddingTop: "10px", fontSize: "32px" }}>{t("WS_CONNECTION_DETAILS")}</Header>
          {dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper employee-mulitlink-main-div"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
              downloadBtnClassName={"employee-download-btn-className"}
              optionsClassName={"employee-options-btn-className"}
              ref={menuRef}
            />
          )}
        </div>
        <ApplicationDetailsTemplate
          applicationDetails={applicationDetails}
          isLoading={isLoading}
          isDataLoading={isLoading}
          applicationData={applicationDetails?.applicationData}
          demandData={demandData?.Demands?.length===0?[]:demandDetails}
          mutate={mutate}
          businessService={applicationDetails?.processInstancesDetails?.[0]?.businessService}
          moduleCode="WS"
          showToast={showToast}
          setShowToast={setShowToast}
          closeToast={closeToast}
          totalDemandTax={totalDemandTax}
          totalBalanceTax={totalBalanceTax}
          isInfoLabel={checkifPrivacyenabled}
          labelComponent={<WSInfoLabel t={t} />}
        />


        {ifUserRoleExists("WS_CEMP") && checkApplicationStatus && !applicationDetails?.isDisconnectionDone ? (
          <ActionBar>
            {displayMenu ? <Menu options={showAction} localeKeyPrefix={"WS"} t={t} onSelect={onActionSelect} /> : null}

            <SubmitBar ref={actionMenuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>
        ) : applicationDetails?.applicationData?.isDisconnectionTemporary && applicationDetails?.applicationData?.status !== "Active"  && applicationDetails?.applicationData?.applicationStatus == "DISCONNECTION_EXECUTED"?
        <ActionBar>
            {displayMenu ? <Menu options={showActionRestoration} localeKeyPrefix={"WS"} t={t} onSelect={onActionSelect} /> : null}

            <SubmitBar ref={actionMenuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>:  <ActionBar>
            {displayMenu ? <Menu options={showAction} localeKeyPrefix={"WS"} t={t} onSelect={onActionSelect} /> : null}

            <SubmitBar ref={actionMenuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>}
       
        {showModal ? (
          <Modal
            open={showModal}
            headerBarMain={<Heading label={t("WS_PENDING_DUES_LABEL")} />}
            headerBarEnd={<CloseBtn onClick={() => setshowModal(false)} />}
            center
            formId="modal-action"
            actionCancelOnSubmit={() => setshowModal(false)}
            actionCancelLabel={t(`${"CS_COMMON_CANCEL"}`)}
            actionSaveLabel={t(`${"WS_COMMON_COLLECT_LABEL"}`)}
            actionSaveOnSubmit={() => {
              history.push(
                `/digit-ui/employee/payment/collect/${serviceType === "WATER" ? "WS" : "SW"}/${encodeURIComponent(
                  applicationNumber
                )}/${getTenantId}?tenantId=${getTenantId}&ISWSCON`
              );
              setshowModal(false);
            }}
            popupStyles={mobileView ? { width: "720px" } : {}}
            style={
              !mobileView
                ? { minHeight: "45px", height: "auto", width: "107px", paddingLeft: "0px", paddingRight: "0px" }
                : { minHeight: "45px", height: "auto", width: "44%" }
            }
            popupModuleMianStyles={mobileView ? { paddingLeft: "5px" } : {}}
          >
            <div className="modal-header-ws">{t("WS_CLEAR_DUES_DISCONNECTION_SUB_HEADER_LABEL")} </div>
            <div className="modal-body-ws">
              <span>
                {t("WS_COMMON_TABLE_COL_AMT_DUE_LABEL")}: ₹{due?due:applicationDetails?.fetchBillsData?.[0]?.totalAmount}
              </span>
            </div>
          </Modal>
        ) : null}
        {showToast && <Toast error={showToast.error} label={t(`${showToast.label}`)} onClose={closeToast} />}
        {showActionToast && <Toast error={showActionToast.key} label={t(`${showActionToast.label}`)} onClose={closeBillToast} />}
      </div>
    </Fragment>
  );
};

export default GetConnectionDetails;
