import React, { useEffect, useState, useRef, Fragment } from "react";
import { useTranslation } from "react-i18next";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";

import { useParams, useLocation, useHistory } from "react-router-dom";
import { ActionBar, Header, Loader, SubmitBar, Card, CardSubHeader, CardSectionHeader, LinkLabel, CardLabel, CardHeader, CardText, CheckBox } from "@mseva/digit-ui-react-components";
import { useQueryClient } from "react-query";
import _, { first, update, values } from "lodash";
import { Modal, Dropdown, Row, StatusTable } from "@mseva/digit-ui-react-components";
import { convertEpochToDate } from "../../../utils/index";


const AssessmentDetails = () => {
  const { t } = useTranslation();


  const [penalty, setPenalty] = useState("")
  const [rebate, setRebate] = useState("")
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { id: applicationNo } = useParams();
  const stateId = Digit.ULBService.getStateId();
  const location = useLocation();
  const AssessmentData = location?.state?.Assessment;
  const submitLabel = location?.state?.submitLabel;
  console.log("location",location?.state)
  const [showToast, setShowToast] = useState(null);
  const queryClient = useQueryClient();
  const history = useHistory();
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const isMobile = window.Digit.Utils.browser.isMobile();

  const [popup, showPopUp] = useState(false);
  const [selectedPenalityReason, setSelectedPenalityReason] = useState(null);
  const [selectedRebateReason, setSelectedRebateReason] = useState(null);
  const [showCalc, setShowCalc] = useState(false)
  const [isCheck,setIsCheck]=useState(false)
  const [unitsCharge, setUnitsCharge] = useState()
  const first_temp = useRef();
  const second_temp = useRef();
  const third_temp = useRef();
  const fourth_temp = useRef();

  const getPropertyTypeLocale = (value) => {
    return `PROPERTYTAX_BILLING_SLAB_${value?.split(".")[0]}`;
  };

  const getPropertySubtypeLocale = (value) => `PROPERTYTAX_BILLING_SLAB_${value}`;

  let { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, AssessmentData?.propertyId);
  const { isLoading: assessmentLoading, mutate: assessmentMutate } = Digit.Hooks.pt.usePropertyAssessment(tenantId);
  const {
    isLoading: ptCalculationEstimateLoading,
    data: ptCalculationEstimateData,
    mutate: ptCalculationEstimateMutate,
  } = Digit.Hooks.pt.usePtCalculationEstimate(tenantId);

  const { data: ChargeSlabsMenu, isLoading: isChargeSlabsLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "ChargeSlabs");
  let { data: rebateImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Rebate");
  let { data: penalityImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Penality");
  let { data: interestImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Interest");
  let [rebateObj, setRebateObj] = useState(null)
  let [penalityObj, setPenalityObj] = useState(null)
  let [interestObj, setInterestObj] = useState(null)
  const getMonth = (date) => {
    return parseInt(date.split("/")[1]);
  };
  const findCorrectDateObj = (financialYear, category) => {
    category.sort((a, b) => {
      let yearOne = a.fromFY && a.fromFY.slice(0, 4);
      let yearTwo = b.fromFY && b.fromFY.slice(0, 4);
      if (yearOne < yearTwo) {
        return 1;
      } else return -1;
    });
    let assessYear = financialYear && financialYear.slice(0, 4);
    let chosenDateObj = {};
    let categoryYear = category.reduce((categoryYear, item) => {
      const year = item.fromFY && item.fromFY.slice(0, 4);
      categoryYear.push(year);
      return categoryYear;
    }, []);
    const index = categoryYear.indexOf(assessYear);
    if (index > -1) {
      chosenDateObj = category[index];
    } else {
      for (let i = 0; i < categoryYear.length; i++) {
        if (assessYear > categoryYear[i]) {
          chosenDateObj = category[i];
          break;
        }
      }
    }
    let month = null;
    if (chosenDateObj.startingDay) {
      month = getMonth(chosenDateObj.startingDay);
      if (month === 1 || month === 2 || month === 3) {
        chosenDateObj.startingDay = chosenDateObj.startingDay + `/${++assessYear}`;
      } else {
        chosenDateObj.startingDay = chosenDateObj.startingDay + `/${assessYear}`;
      }
    } else if (chosenDateObj.endingDay) {
      month = getMonth(chosenDateObj.endingDay);
      if (month === 1 || month === 2 || month === 3) {
        chosenDateObj.endingDay = chosenDateObj.endingDay + `/${++assessYear}`;
      } else {
        chosenDateObj.endingDay = chosenDateObj.endingDay + `/${assessYear}`;
      }
    }
    return chosenDateObj;
  };
  const findCorrectDateObjPenaltyIntrest = (financialYear, category) => {
    category.sort((a, b) => {
      let yearOne = a.fromFY && a.fromFY.slice(0, 4);
      let yearTwo = b.fromFY && b.fromFY.slice(0, 4);
      if (yearOne < yearTwo) {
        return 1;
      } else return -1;
    });
    let assessYear = financialYear && financialYear.slice(0, 4);
    let chosenDateObj = {};
    let categoryYear = category.reduce((categoryYear, item) => {
      const year = item.fromFY && item.fromFY.slice(0, 4);
      categoryYear.push(year);
      return categoryYear;
    }, []);
    const index = categoryYear.indexOf(assessYear);
    if (index > -1) {
      chosenDateObj = category[index];
    } else {
      for (let i = 0; i < categoryYear.length; i++) {
        if (assessYear > categoryYear[i]) {
          chosenDateObj = category[i];
          break;
        }
      }
    }
    let month = null;
    if (chosenDateObj.startingDay) {
      let yearDiff = assessYear - chosenDateObj.fromFY.split("-")[0];
      let date = chosenDateObj.startingDay.split("/");
      let yr = parseInt(date.pop()) + yearDiff;
      let len = date.push(yr.toString());
      chosenDateObj.startingDay = date.join("/");
      month = getMonth(chosenDateObj.startingDay);
    }
    return chosenDateObj;
  };
  console.log("penality", penalityImportantDates, rebateImportantDates)
  useEffect(() => {
    if (penalityImportantDates?.PropertyTax?.Interest?.length > 0 && penalityObj === null) {

      // let rebateDateObj=rebateImportantDates.filter((item)=>item.fromFY===AssessmentData.financialYear)
      let penalityObjj = findCorrectDateObjPenaltyIntrest(AssessmentData.financialYear, penalityImportantDates?.PropertyTax?.Interest)
      setPenalityObj(penalityObjj)
      console.log("penalityObj", penalityObj)

    }
    if (rebateImportantDates?.PropertyTax?.Rebate?.length > 0 && rebateObj === null) {

      let rebateObjj = findCorrectDateObj(AssessmentData.financialYear, rebateImportantDates?.PropertyTax?.Rebate)
      setRebateObj(rebateObjj)
      console.log("rebateObj", rebateObj)

    }
    if (interestImportantDates?.PropertyTax?.Interest?.length > 0 && interestObj === null) {

      // let rebateDateObj=rebateImportantDates.filter((item)=>item.fromFY===AssessmentData.financialYear)
      let interestObjj = findCorrectDateObjPenaltyIntrest(AssessmentData.financialYear, interestImportantDates?.PropertyTax?.Interest)
      setInterestObj(interestObjj)
      console.log("interestObj", interestObj)

    }
  }, [penalityImportantDates?.PropertyTax?.Interest || rebateImportantDates?.PropertyTax?.Interest || interestImportantDates?.PropertyTax?.Interest])
  console.log("imp dates", penalityObj, interestObj, rebateObj)
  const fetchBillParams = { consumerCode: AssessmentData?.propertyId };
  console.log("ChargeableSlabsMenu", ChargeSlabsMenu, ptCalculationEstimateData)

  useEffect(() => {
    try {
      if (ptCalculationEstimateData?.Calculation?.length > 0) {
        let id = ptCalculationEstimateData?.Calculation[0]?.billingSlabIds.map(item => item.split('|')[0]).join(',');
        let filters = {
          id: id
        }
        Digit.PTService.billingSlabSearch(tenantId, filters)
          .then((response) => {
            console.log("res", response)
            setUnitsCharge(response.billingSlab)
          })
      }
    }
    catch {

    }
  }, [ptCalculationEstimateData])
  let ptCalculationEstimateDataCopy;
  if (!ptCalculationEstimateDataCopy)
    ptCalculationEstimateDataCopy = ptCalculationEstimateData?.Calculation[0];

  const paymentDetails = Digit.Hooks.useFetchBillsForBuissnessService(
    { businessService: "PT", ...fetchBillParams, tenantId: tenantId },
    {
      enabled: AssessmentData?.propertyId ? true : false,
    }
  );

  useEffect(() => {
    // estimate calculation
    ptCalculationEstimateMutate({ Assessment: AssessmentData });
  }, []);
  useEffect(() => {
    setPenalty(parseInt(ptCalculationEstimateData?.Calculation[0]?.taxHeadEstimates[6]?.estimateAmount))
    setRebate(parseInt(ptCalculationEstimateData?.Calculation[0]?.taxHeadEstimates[5]?.estimateAmount))
  }, [ptCalculationEstimateLoading])
  useEffect(() => {
    if (applicationDetails) setAppDetailsToShow(_.cloneDeep(applicationDetails));
  }, [applicationDetails]);

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.acknowldgementNumber,
    moduleCode: "PT",
    role: "PT_CEMP",
    // serviceData: applicationDetails,
  });
  const date = new Date();

  appDetailsToShow?.applicationDetails?.shift();
  appDetailsToShow?.applicationDetails?.unshift({
    title: "PT_ESTIMATE_DETAILS_HEADER",
    values: [
      {
        title: "PT_PROPERTY_PTUID",
        value: AssessmentData?.propertyId,
      },
      {
        title: "ES_PT_TITLE_BILLING_PERIOD",
        value: location?.state?.Assessment?.financialYear,
      },
    ],
    additionalDetails: {
      taxHeadEstimatesCalculation: ptCalculationEstimateData?.Calculation[0],
    },
  }
  );

  const closeToast = () => {
    setShowToast(null);
  };
  const handleUpdateAssessment = (assessment) =>{
    try{
      
    Digit.PTService.assessmentUpdate({Assessment:assessment,tenantId:tenantId})
    .then
    (response =>
    {
      if(response?.Assessments?.length>0){
          history.push("/digit-ui/citizen/pt/property/pt-acknowledgement",{message:"PT_PROPERTY_RE_ASSESSMENT_SUCCESS_MSG",response:response?.Assessments[0]?.assessmentNumber,isSuccess:true,labelName:"PT_ASSESSMENT_NUMBER",responseData:response?.Assessments[0],previouspath:location,headerName:t("PT_REASSESS_PROPERTY")})
        console.log("update Assessment success")
      }
    })
    }
    catch(error){
    console.log(error)
    }
  }
  const handleReAssessment = ()=>{
    
     let filters={assessmentNumbers:applicationNo}
    

    try{
    Digit.PTService.assessmentSearch({tenantId:tenantId,filters:filters})
    .then
    (response =>
    {
    if(response?.Assessments?.length>0){
      
       handleUpdateAssessment(response.Assessments[0]) 
    }
    })
    }
    catch(error){
console.log(error)
    }
  }
console.log("isCheck",isCheck)
  const handleAssessment = () => {
    if(isCheck){
      if(location?.state?.reAssess===true){
        handleReAssessment()
 
      }
      else{
    if (!queryClient.getQueryData(["PT_ASSESSMENT", AssessmentData?.propertyId, location?.state?.Assessment?.financialYear])) {
      assessmentMutate(
        { Assessment: AssessmentData },
        {
          onError: (error, variables) => {
            setShowToast({ key: "error", action: error?.response?.data?.Errors[0]?.message || error.message, error: { message: error?.response?.data?.Errors[0]?.code || error.message } });
            setTimeout(closeToast, 5000);
          },
          onSuccess: (data, variables) => {
            sessionStorage.setItem("IsPTAccessDone", data?.Assessments?.[0]?.auditDetails?.lastModifiedTime);
            let user = sessionStorage.getItem("Digit.User")
            let userType = JSON.parse(user)
            setShowToast({ key: "success", action: { action: "ASSESSMENT" } });
            setTimeout(closeToast, 5000);
            console.log("useType.value.info.type", userType, typeof (userType))
            // queryClient.clear();
            // queryClient.setQueryData(["PT_ASSESSMENT", propertyId, location?.state?.Assessment?.financialYear], true);
            if (userType?.value?.info?.type == "CITIZEN") {
                history.push("/digit-ui/citizen/pt/property/pt-acknowledgement",{message:"PT_PROPERTY_RE_ASSESSMENT_SUCCESS_MSG",response:response?.Assessments[0]?.assessmentNumber,isSuccess:true,labelName:"PT_ASSESSMENT_NUMBER",responseData:response?.Assessments[0],previouspath:location,headerName:t("PT_ASSESS_PROPERTY")})
            //  history.push(`/digit-ui/citizen/payment/my-bills/PT/${AssessmentData?.propertyId}`);
            }
            else {
                history.push("/digit-ui/citizen/pt/property/pt-acknowledgement",{message:"PT_PROPERTY_RE_ASSESSMENT_SUCCESS_MSG",response:response?.Assessments[0]?.assessmentNumber,isSuccess:true,labelName:"PT_ASSESSMENT_NUMBER",responseData:response?.Assessments[0],previouspath:location,headerName:t("PT_ASSESS_PROPERTY")})
              //proceeedToPay()
            }

          },
        }
      );
    }
  }
  }
  else{
  alert("Please check the declaration box to proceed futher")
  }
  };

  const proceeedToPay = () => {
    history.push(`/digit-ui/employee/payment/collect/PT/${AssessmentData?.propertyId}`);
  };

  if (ptCalculationEstimateLoading || assessmentLoading || !applicationDetails?.applicationDetails) {
    return <Loader />;
  }


  let address_to_display = applicationDetails?.applicationData?.address;
  if (address_to_display?.doorNo) {
    address_to_display = address_to_display?.doorNo + ',' + address_to_display?.locality?.area + ',' + address_to_display?.city;
  }
  else {
    address_to_display = address_to_display?.locality?.area + ',' + address_to_display?.city;
  }


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
  function change() {
    let total_amount = ptCalculationEstimateData?.Calculation[0]?.totalAmount
    const [first, second] = [parseInt(first_temp.current.value), parseInt(second_temp.current.value)];
    let additionalDetails = {
      "adhocPenalty": 0,
      "adhocExemptionReason": null,
      "adhocPenaltyReason": null,
      "adhocExemption": 0
    }
    AssessmentData.additionalDetails = additionalDetails;
    if ((selectedPenalityReason && first > 0)/* &&(!selectedRebateReason) */) {
      if (selectPenalityReason.value !== 'Others') {
        if (first < total_amount) {
          let additionalPenality = first;
          ptCalculationEstimateData.Calculation[0].taxHeadEstimates[6] = {
            "taxHeadCode": "PT_TIME_PENALTY",
            "estimateAmount": ptCalculationEstimateData.Calculation[0].taxHeadEstimates[6].estimateAmount = first + penalty,
            "category": "TAX"
          }
          // AssessmentData.additionalDetails={
          //   "adhocPenalty":additionalPenality,
          //   "adhocPenaltyReason":selectedPenalityReason.value,
          // }
          AssessmentData.additionalDetails.adhocPenalty = additionalPenality;
          AssessmentData.additionalDetails.adhocPenaltyReason = selectedPenalityReason.value;
          ptCalculationEstimateData.Calculation[0].totalAmount = ptCalculationEstimateData?.Calculation[0]?.taxAmount + first;
          console.log("ptCalculationEstimateData", ptCalculationEstimateData,)
        }
        else {
          alert("Penality cannot exceed total amount");
        }
      }
      else {
        if (first < total_amount) {
          let additionalPenality = first;
          ptCalculationEstimateData.Calculation[0].taxHeadEstimates[6] = {
            "taxHeadCode": "PT_TIME_PENALTY",
            "estimateAmount": ptCalculationEstimateData.Calculation[0].taxHeadEstimates[6]?.estimateAmount + first + penalty,
            "category": "TAX"
          }
          // AssessmentData.additionalDetails={
          //   "adhocPenalty":additionalPenality,
          //   "adhocPenaltyReason":fourth_temp.current.value,
          // }
          AssessmentData.additionalDetails.adhocPenalty = additionalPenality;
          AssessmentData.additionalDetails.adhocPenaltyReason = fourth_temp.current.value;
          ptCalculationEstimateData.Calculation[0].totalAmount = ptCalculationEstimateData?.Calculation[0]?.totalAmount + first;
        }
        else {
          alert("Penality cannot exceed total amount");
        }
      }
    }

    if ((selectedRebateReason && second) /* && (!selectedPenalityReason) */) {
      if (selectedRebateReason.value !== "Others") {
        if (second > 0) {
          if (second < total_amount) {
            ptCalculationEstimateData.Calculation[0].taxHeadEstimates[5] = {
              "taxHeadCode": "PT_TIME_REBATE",
              "estimateAmount": ptCalculationEstimateData.Calculation[0].taxHeadEstimates[5].estimateAmount = second + rebate,
              "category": "TAX"
            }
            // AssessmentData.additionalDetails={
            //   "adhocExemption":second,
            //   "adhocExemptionReason":selectedRebateReason.value,
            // }
            AssessmentData.additionalDetails.adhocExemption = second;
            AssessmentData.additionalDetails.adhocExemptionReason = selectedRebateReason.value;
            ptCalculationEstimateData.Calculation[0].totalAmount = ptCalculationEstimateData?.Calculation[0]?.totalAmount - second;
          }
          else {
            alert("Adhoc Exemption cannot be greater than the estimated tax for the given property");
          }
        }
      }
      else {
        if (second > 0) {
          if (second < total_amount) {
            ptCalculationEstimateData.Calculation[0].taxHeadEstimates[5] = {
              "taxHeadCode": "PT_TIME_REBATE",
              "estimateAmount": ptCalculationEstimateData.Calculation[0].taxHeadEstimates[5]?.estimateAmount - second - rebate,
              "category": "TAX"
            }
            // AssessmentData.additionalDetails={
            //   "adhocExemption":second,
            //   "adhocExemptionReason":third_temp.current.value,
            // }
            AssessmentData.additionalDetails.adhocExemption = second;
            AssessmentData.additionalDetails.adhocExemptionReason = third_temp.current.value;
            ptCalculationEstimateData.Calculation[0].totalAmount = ptCalculationEstimateData?.Calculation[0]?.totalAmount - second;
          }
          else {
            alert("Adhoc Exemption cannot be greater than the estimated tax for the given property");
          }
        }
      }
    }
    setSelectedPenalityReason(null);
    setSelectedRebateReason(null);
    showPopUp(false);
  }

  const Penality_menu = [
    {
      title: "PT_PENDING_DUES_FROM_EARLIER",
      value: "Pending dues from earlier",
    },
    {
      title: "PT_MISCALCULATION_OF_EARLIER_ASSESSMENT",
      value: "Miscalculation of earlier Assessment",
    },
    {
      title: "PT_ONE_TIME_PENALITY",
      value: "One time penality",
    },
    {
      title: "PT_OTHERS",
      value: "Others",
    },
  ]
  const Rebate_menu = [
    {
      title: "PT_ADVANCED_PAID_BY_CITIZEN_EARLIER",
      value: "Advanced Paid By Citizen Earlier",
    },
    {
      title: "PT_REBATE_PROVIDED_BY_COMMISSIONER_EO",
      value: "Rebate provided by commissioner/EO",
    },
    {
      title: "PT_ADDITIONAL_AMOUNT_CHARGED_FROM_THE_CITIZEN",
      value: "Additional amount charged from the citizen",
    },
    {
      title: "PT_OTHERS",
      value: "Others",
    },
  ]
  const selectPenalityReason = (reason) => {
    setSelectedPenalityReason(reason);
  }
  const selectRebateReason = (reason) => {
    setSelectedRebateReason(reason);
  }
  /* const RebatePenalityPoPup=() =>{
    return (
      <Modal
            headerBarMain={<Heading label={t("PT_ADD_REBATE_PENALITY")}/>}
            headerBarEnd={<CloseBtn onClick={()=>showPopUp(false)}/>}
            actionCancelLabel={t("PT_CANCEL")}
            actionCancelOnSubmit={()=>showPopUp(false)}
            actionSaveLabel={t("PT_ADD")}
            actionSaveOnSubmit={()=>(change())}
            hideSubmit={false}
            >
    {
        <div>
          <Card>
          <CardSectionHeader>{t("PT_AD_PENALTY")}</CardSectionHeader>
              <CardLabel>
              {t("PT_TX_HEADS")}
              </CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                  <Dropdown
                   isMandatory
                   option={Penality_menu}
                   optionKey="value"
                   select={selectPenalityReason}
                   selected={selectedPenalityReason}
                   isPropertyAssess={true}
                   t={t}
                   />
                  </div>
                </div>
              </div>  
              {selectedPenalityReason && selectedPenalityReason.value==="Others" && <div className="field">
              <CardLabel>{t("PT_REASON")}</CardLabel>
                <div className="field-container">
                  <div className="text-input field">
                  <input type="type" className="employee-card-input false focus-visible undefined" ref={fourth_temp}/>
                  </div>
                </div>
              </div>}      
              <CardLabel>{t("PT_HEAD_AMT")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                  <input key="firstTemp" type="number" className="employee-card-input false focus-visible undefined" ref={first_temp}/>
                  </div>
                </div>
              </div>                  
          </Card>
          <Card>
          <CardSectionHeader>{t("PT_AD_REBATE")}</CardSectionHeader>
              <CardLabel>{t("PT_TX_HEADS")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                  <Dropdown
                   isMandatory
                   option={Rebate_menu}
                   optionKey="value"
                   select={selectRebateReason}
                   selected={selectedRebateReason}
                   isPropertyAssess={true}
                   t={t}
                   />
                  </div>
                </div>
              </div>    
              {selectedRebateReason && selectedRebateReason.value==="Others" && <div className="field">
              <CardLabel>{t("PT_REASON")}</CardLabel>
                <div className="field-container">
                  <div className="text-input field">
                  <input type="type" className="employee-card-input false focus-visible undefined" ref={third_temp}/>
                  </div>
                </div>
              </div>}  
              <CardLabel>{t("PT_HEAD_AMT")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                  <input type="number" className="employee-card-input false focus-visible undefined" ref={second_temp}/>
                  </div>
                </div>
              </div> 
          </Card>
        </div>
      }
      </Modal>)
  } */
  const checkForNotNull = (value = "") => {
    return value && value != null && value != undefined && value != "" ? true : false;
  };
  const convertDotValues = (value = "") => {
    return (
      (checkForNotNull(value) && ((value.replaceAll && value.replaceAll(".", "_")) || (value.replace && stringReplaceAll(value, ".", "_")))) || "NA"
    );
  };
  const convertToLocale = (value = "", key = "") => {
    let convertedValue = convertDotValues(value);
    if (convertedValue == "NA") {
      return "PT_NA";
    }
    return `${key}_${convertedValue}`;
  };
  console.log("manasa", applicationDetails)
  const getCityLocale = (value = "") => {
    let convertedValue = convertDotValues(value);
    if (convertedValue == "NA" || !checkForNotNull(value)) {
      return "PT_NA";
    }
    convertedValue = convertedValue.toUpperCase();
    return convertToLocale(convertedValue, `TENANT_TENANTS`);
  };
  const getMohallaLocale = (value = "", tenantId = "") => {
    let convertedValue = convertDotValues(tenantId);
    if (convertedValue == "NA" || !checkForNotNull(value)) {
      return "PT_NA";
    }
    convertedValue = convertedValue.toUpperCase();
    return convertToLocale(value, `${convertedValue}_REVENUE`);
  };
  return (
    <div>
       <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <Header>{`Property Re-Assessment (${AssessmentData?.financialYear})`}</Header>
       <h1 style={{fontSize:'18px',border:'1px solid grey',padding:'8px',backgroundColor:'grey',color:'white'}}>Property ID: {AssessmentData?.propertyId}</h1>
      </div>
      <ApplicationDetailsTemplate
        applicationDetails={
          {
            applicationDetails: [

              {
                title: "PT_TAX_ESTIMATION_HEADER",
                additionalDetails: {
                  taxHeadEstimatesCalculation: ptCalculationEstimateData?.Calculation[0],
                },
              },
              {
                // belowComponent:()=><LinkLabel onClick={()=>{showPopUp(true)}} style={isMobile ? {color:"#a82227",marginLeft:"0px"} : {color:"#a82227"}}>{t("PT_ADD_REBATE_PENALITY")}</LinkLabel>
                belowComponent: () => <>
                {ptCalculationEstimateData?.Calculation?.length>0 &&  <LinkLabel onClick={() => { setShowCalc(true); }} style={isMobile ? { color: "#a82227", marginLeft: "0px" } : { color: "#a82227" }}>{t("CALCULATION DETAILS")}</LinkLabel>}
                  <div style={{border:'1px solid lightgrey',padding:'8px'}}>
                    <h3 style={{fontSize:'20px',fontWeight:'bold',color:'#0d43a7',marginBottom:'10px'}}>Important Dates</h3>
                    <StatusTable>
                      <Row
                        labelStyle={{ wordBreak: "break-all", width: '50%' }}
                        textStyle={{ wordBreak: "break-all" }}
                        key={"rebate"}
                        label={`Last Date for Rebate (${rebateObj?.rate}% of PT)`}
                        text={`${rebateObj?.endingDay}`}
                      />
                      <Row
                        labelStyle={{ wordBreak: "break-all", width: '50%' }}
                        textStyle={{ wordBreak: "break-all" }}
                        key={"penality"}
                        label={`Penalty (${penalityObj?.rate}% of PT) applied from`}
                        text={`${penalityObj?.startingDay}`}

                      />
                        <Row
                        labelStyle={{ wordBreak: "break-all", width: '50%' }}
                        textStyle={{ wordBreak: "break-all" }}
                        key={"interest"}
                        label={`Interest (${interestObj?.rate}% p.a. daily) applied from`}
                        text={`${interestObj?.startingDay}`}

                      />
                    </StatusTable>
                
                  </div>
                </>
              },
              {
                title: t("PT_PROPERTY_ADDRESS_SUB_HEADER"),
                values: [

                  { title: t("PT_PROPERTY_ADDRESS_CITY"), value: t(getCityLocale(applicationDetails?.tenantId)) || t("CS_NA") },
                  { title: t("PT_PROPERTY_ADDRESS_HOUSE_NO"), value: applicationDetails?.applicationData?.address?.doorNo || t("CS_NA") },
                  { title: "Building/Company Name", value: applicationDetails?.applicationData?.address?.buildingName || t("CS_NA") },
                  { title: t("PT_PROPERTY_ADDRESS_STREET_NAME"), value: applicationDetails?.applicationData?.address?.street || t("CS_NA") },
                  {
                    title: t("PT_PROPERTY_ADDRESS_MOHALLA"),
                    value: t(`${getMohallaLocale(applicationDetails?.applicationData?.address?.locality?.code, applicationDetails?.tenantId)}`) || t("CS_NA"),
                  },
                  { title: t("PT_PROPERTY_ADDRESS_PINCODE"), value: applicationDetails?.applicationData?.address?.pincode || t("CS_NA") },

                  { title: "Existing Property ID", value: applicationDetails?.applicationData?.oldPropertyId || t("CS_NA") },
                  { title: "Survey Id/UID", value: applicationDetails?.applicationData?.surveyId || t("CS_NA") },
                  { title: "Year of creation of Property", value: applicationDetails?.applicationData?.yearOfCreation || t("CS_NA") },
                ]
              },
              {
                title: "PT_ASSESMENT_INFO_SUB_HEADER",
                values: [
                  { title: "PT_ASSESMENT_INFO_TYPE_OF_BUILDING", value: getPropertyTypeLocale(applicationDetails?.applicationData?.propertyType) },
                  { title: "PT_ASSESMENT_INFO_USAGE_TYPE", value: getPropertySubtypeLocale(applicationDetails?.applicationData?.usageCategory) },
                  { title: "PT_ASSESMENT_INFO_PLOT_SIZE", value: applicationDetails?.applicationData?.landArea },
                  { title: "PT_ASSESMENT_INFO_NO_OF_FLOOR", value: applicationDetails?.applicationData?.noOfFloors },
                  { title: t("PT_ASSESMENT_INFO_VASIKA_NO"), value: t(applicationDetails?.applicationData?.additionalDetails?.vasikaNo) || t("CS_NA") },
                  { title: t("PT_ASSESMENT_INFO_VASIKA_DATE"), value: t(applicationDetails?.applicationData?.additionalDetails?.vasikaDate) || t("CS_NA") },
                  { title: t("PT_ASSESMENT_INFO_ALLOTMENT_NO"), value: t(applicationDetails?.applicationData?.additionalDetails?.allotmentNo) || t("CS_NA") },
                  { title: t("PT_ASSESMENT_INFO_ALLOTMENT_DATE"), value: t(applicationDetails?.applicationData?.additionalDetails?.allotmentDate) || t("CS_NA") },
                  { title: t("PT_ASSESMENT_INFO_REMARKS"), value: t(applicationDetails?.applicationData?.additionalDetails?.remarks) || t("CS_NA") },
                  { title: t("PT_ASSESMENT_INFO_BUSINESS_NAME"), value: t(applicationDetails?.applicationData?.businessName) || t("CS_NA") },
                  { title: t("Do you have any inflammable material stored in your property?"), value: t(applicationDetails?.additionalDetails?.inflammable === false ? "No" : true ? "Yes" : "NA") || t("CS_NA") },
                  { title: t("Height of property more than 36 feet?"), value: t(applicationDetails?.additionalDetails?.heightAbove36Feet === false ? "No" : true ? "Yes" : "NA") || t("CS_NA") },
                ],
                additionalDetails: {
                  floors: applicationDetails?.applicationData?.units
                    ?.filter((e) => e.active)
                    ?.sort?.((a, b) => a.floorNo - b.floorNo)
                    ?.map((unit, index) => {
                      let floorName = `PROPERTYTAX_FLOOR_${unit.floorNo}`;
                      const values = [
                        {
                          title: `${t("ES_APPLICATION_DETAILS_UNIT")} ${index + 1}`,
                          value: "",
                        },
                        {
                          title: "Floor No",
                          value: unit?.floorNo,
                        },
                        {
                          title: "PT_ASSESSMENT_UNIT_USAGE_TYPE",
                          value: `PROPERTYTAX_BILLING_SLAB_${unit?.usageCategory != "RESIDENTIAL" ? unit?.usageCategory?.split(".")[1] : unit?.usageCategory
                            }`,
                        },
                        {
                          title: "PT_ASSESMENT_INFO_OCCUPLANCY",
                          value: unit?.occupancyType,
                        },
                        {
                          title: "PT_FORM2_BUILT_AREA",
                          value: unit?.constructionDetail?.builtUpArea,
                        },
                      ];

                      if (unit.occupancyType === "RENTED") values.push({ title: "PT_FORM2_TOTAL_ANNUAL_RENT", value: unit.arv });

                      return {
                        //title: floorName,
                        title: "",
                        values: [
                          {
                            title: "",
                            values,
                          },
                        ],
                      };
                    }),
                },
              },
              {
                title: "Owner Details",
                values: [
                  { title: t("NAME"), value: applicationDetails?.applicationData?.owners[0]?.name },
                  { title: t("GUARDIAN NAME"), value: applicationDetails?.applicationData?.owners[0]?.fatherOrHusbandName || t("CS_NA") },
                  { title: t("GENDER"), value: applicationDetails?.applicationData?.owners[0]?.gender || t("CS_NA") },
                  { title: t("OWNERSHIP TYPE"), value: applicationDetails?.applicationData?.ownershipCategory.split('.')[1] || t("CS_NA") },
                  { title: t("MOBILE NO"), value: applicationDetails?.applicationData?.owners[0]?.mobileNumber || t("CS_NA") },
                  { title: t("EMAIL ID"), value: applicationDetails?.applicationData?.owners[0]?.emailId || t("CS_NA") },
                  { title: t("OWNERSHIP PERCENTAGE"), value: applicationDetails?.applicationData?.owners[0]?.ownerShipPercentage || t("CS_NA") },
                  { title: t("CATEGORY"), value: applicationDetails?.applicationData?.owners[0]?.ownerType === "NONE" ? "Not Applicable" : applicationDetails?.applicationData?.owners[0]?.ownerType || t("CS_NA") },
                  { title: t("CORRESPONDENCE ADDRESS"), value: applicationDetails?.applicationData?.owners[0]?.permanentAddress || t("CS_NA") },
                ],
                additionalDetails: {
                  owners: applicationDetails?.applicationData?.owners
                },
              },
              {
                title: "Property Documents",
                additionalDetails: {
                  assessmentDocuments: applicationDetails?.applicationData?.documents
                }
              },
              {
                title: "DECLARATION",
                additionalDetails: {
                  declaration: t("PT_FINAL_DECLARATION_MESSAGE")
                }
              }

            ]
          }
        }
        showTimeLine={false}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={appDetailsToShow?.applicationData}
        mutate={null}
        workflowDetails={
          queryClient.getQueryData(["PT_ASSESSMENT", AssessmentData?.propertyId, location?.state?.Assessment?.financialYear])
            ? { ...workflowDetails, data: { ...workflowDetails.data, nextActions: [] } }
            : workflowDetails
        }
        businessService="PT"
        assessmentMutate={assessmentMutate}
        ptCalculationEstimateMutate={ptCalculationEstimateMutate}
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={"ES_PT_COMMON_STATUS_"}
        forcedActionPrefix={"WF_EMPLOYEE_PT.CREATE"}
        setIsCheck={setIsCheck}
        isCheck={isCheck}
      />
      {/* {popup && (<RebatePenalityPoPup/>)} */}
       {/* <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <CheckBox onChange={}/><p>{t("PT_FINAL_DECLARATION_MESSAGE")}</p></div> */}
      {showCalc && <Modal
        headerBarMain={<Heading label={t("PT_CALC_DETAILS")} />}
        headerBarEnd={<CloseBtn onClick={() => { setShowCalc(false) }} />}
        // actionCancelLabel={t("PT_CANCEL")}
        // actionCancelOnSubmit={()=>{ptCalculationEstimateData.Calculation[0] = ptCalculationEstimateDataCopy; setSelectedPenalityReason(null);setSelectedRebateReason(null); showPopUp(false)}}
        actionSaveLabel={t("OK")}
        actionSaveOnSubmit={() => (setShowCalc(false))}
        hideSubmit={false}
      >
        <div style={{ padding: '4px' }}>
          <h2 style={{ color: '#2947a3', fontSize: '18px', fontFamily: 'Noto Sans', marginBottom: '2px' }}>
            Calculation Logic
          </h2>
          <h3 style={{ fontFamily: 'Noto Sans', marginBottom: '3px' }}>
            Property Tax = Built up area on GF*Rates per unit of GF-built up empty land on GF * Rate per unit of GF-empty land 𝝨(built-up on nth floor*Rate per unit of nth floor-built up)
          </h3>
          <h3 style={{ color: 'red', fontFamily: 'Noto Sans', marginBottom: '5px' }}>* 5% increase in Gross Tax is applicable for FY 2021-22</h3>
          <h2 style={{ color: '#2947a3', fontSize: '18px', fontFamily: 'Noto Sans', marginBottom: '2px' }}>Applicable Charge Slabs</h2>
          <StatusTable>
            {applicationDetails?.applicationData?.units
              ?.filter((e) => e.active)
              ?.sort?.((a, b) => a.floorNo - b.floorNo)
              ?.map((unit, index) => (
                <Row label={`${t(`PROPERTYTAX_FLOOR_${unit?.floorNo}`)} ${t(`PT_UNIT`)} - ${index + 1}`} text={unitsCharge[index]?.unitRate} />
              ))}
          </StatusTable>
        </div>
      </Modal>
      }
      {popup && <Modal
        headerBarMain={<Heading label={t("PT_ADD_REBATE_PENALITY")} />}
        headerBarEnd={<CloseBtn onClick={() => { showPopUp(false), ptCalculationEstimateData.Calculation[0] = ptCalculationEstimateDataCopy; setSelectedPenalityReason(null); setSelectedRebateReason(null); }} />}
        actionCancelLabel={t("PT_CANCEL")}
        actionCancelOnSubmit={() => { ptCalculationEstimateData.Calculation[0] = ptCalculationEstimateDataCopy; setSelectedPenalityReason(null); setSelectedRebateReason(null); showPopUp(false) }}
        actionSaveLabel={t("PT_ADD")}
        actionSaveOnSubmit={() => (change())}
        hideSubmit={false}
      >
        {
          <div>
            <Card>
              <CardSectionHeader>{t("PT_AD_PENALTY")}</CardSectionHeader>
              <CardLabel>
                {t("PT_TX_HEADS")}
              </CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                    <Dropdown
                      isMandatory
                      option={Penality_menu}
                      optionKey="value"
                      select={selectPenalityReason}
                      selected={selectedPenalityReason}
                      isPropertyAssess={true}
                      t={t}
                    />
                  </div>
                </div>
              </div>
              {selectedPenalityReason && selectedPenalityReason.value === "Others" && <div className="field">
                <CardLabel>{t("PT_REASON")}</CardLabel>
                <div className="field-container">
                  <div className="text-input field">
                    <input type="type" className="employee-card-input false focus-visible undefined" ref={fourth_temp} />
                  </div>
                </div>
              </div>}
              <CardLabel>{t("PT_HEAD_AMT")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                    <input key="firstTemp" type="number" className="employee-card-input false focus-visible undefined" ref={first_temp} />
                  </div>
                  {/* <TextInput
                t={t}
                type={"text"}
                isMandatory={false}
                optionKey="i18nKey"
                name="first_temp"
                value={first_temp}
                onChange={setFirstTemp}
                />  */}
                </div>
              </div>
            </Card>
            <Card>
              <CardSectionHeader>{t("PT_AD_REBATE")}</CardSectionHeader>
              <CardLabel>{t("PT_TX_HEADS")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                    <Dropdown
                      isMandatory
                      option={Rebate_menu}
                      optionKey="value"
                      select={selectRebateReason}
                      selected={selectedRebateReason}
                      isPropertyAssess={true}
                      t={t}
                    />
                  </div>
                </div>
              </div>
              {selectedRebateReason && selectedRebateReason.value === "Others" && <div className="field">
                <CardLabel>{t("PT_REASON")}</CardLabel>
                <div className="field-container">
                  <div className="text-input field">
                    <input type="type" className="employee-card-input false focus-visible undefined" ref={third_temp} />
                  </div>
                </div>
              </div>}
              <CardLabel>{t("PT_HEAD_AMT")}</CardLabel>
              <div className="field">
                <div className="field-container">
                  <div className="text-input field">
                    <input type="number" className="employee-card-input false focus-visible undefined" ref={second_temp} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        }
      </Modal>}






      {!queryClient.getQueryData(["PT_ASSESSMENT", AssessmentData?.propertyId, location?.state?.Assessment?.financialYear] ) ? (
        <ActionBar>
          <SubmitBar label={submitLabel} onSubmit={handleAssessment} />
        </ActionBar>
      ) : (
        <ActionBar>
          <SubmitBar disabled={paymentDetails?.data?.Bill?.[0]?.totalAmount > 0 ? false : true} label={t("PT_PROCEED_PAYMENT")} onSubmit={proceeedToPay} />
        </ActionBar>
      )}
    </div>
  );
};

export { AssessmentDetails };