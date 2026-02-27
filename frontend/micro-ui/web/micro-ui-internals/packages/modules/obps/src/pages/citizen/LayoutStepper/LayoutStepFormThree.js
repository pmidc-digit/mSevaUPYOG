import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_LayoutNewApplication_FORM } from "../../../redux/actions/LayoutNewApplicationActions";
import _ from "lodash";
import { UPDATE_OBPS_FORM } from "../../../redux/actions/OBPSActions";

const LayoutStepFormThree = ({ config, onGoNext, onBackClick, t }) => {
  const dispatch = useDispatch();
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");

  const stateId = Digit.ULBService.getStateId();
  const { isLoading, data } = Digit.Hooks.pt.usePropertyMDMS(stateId,  "BPA", ["LayoutDocuments"]);

  const currentStepData = useSelector((state) =>
    state.obps.LayoutNewApplicationFormReducer.formData &&
    state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      ? state.obps.LayoutNewApplicationFormReducer.formData[config?.key]
      : {},
  )

  const currentStepDataNew = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.formData) || {}

  const [applicationNo, setApplicationNo] = useState("");
    const [isVacant, setIsVacant] = useState(false);
    const [isCluApproved, setIsCluApproved] = useState(false);
    const [isRestrictedArea, setIsRestrictedArea] = useState(false);
    const [isUnderMasterPlan, setIsUnderMasterPlan] = useState(false);
    const [isNationalHighway, setIsNationalHighway] = useState(false);
    const [isInstitution, setIsInstitution] = useState(false);
  
    useEffect(() => {
      if (!currentStepDataNew) return;
  
      // Application No
      setApplicationNo(
        currentStepDataNew?.apiData?.Layout?.applicationNo || ""
      );
  
      // Vacant
      setIsVacant(
        currentStepDataNew?.siteDetails?.buildingStatus?.code === "VACANT"
      );
  
      // CLU Approved
      const cluApprovedValue =
        currentStepDataNew?.siteDetails?.isCluRequired?.code ||
        currentStepDataNew?.siteDetails?.isCluRequired;
  
      setIsCluApproved(
        cluApprovedValue === "YES" || cluApprovedValue === true
      );
  
      // Restricted Area
      setIsRestrictedArea(
        currentStepDataNew?.siteDetails?.specificationRestrictedArea?.code === "YES"
      );
  
      // Under Master Plan
      setIsUnderMasterPlan(
        currentStepDataNew?.siteDetails?.specificationIsSiteUnderMasterPlan?.code === "YES"
      );
  
      // National Highway
      const roadType =
        currentStepDataNew?.siteDetails?.roadType?.name ||
        currentStepDataNew?.siteDetails?.roadType ||
        "";
  
      setIsNationalHighway(
        roadType.toLowerCase().includes("national") ||
        roadType.toLowerCase().includes("nh")
      );
  
      // Institution
      const buildingCategory =
        currentStepDataNew?.siteDetails?.buildingCategory?.code ||
        currentStepDataNew?.siteDetails?.buildingCategory ||
        "";
  
      setIsInstitution(
        buildingCategory === "INSTITUTION" ||
        buildingCategory.toLowerCase().includes("institution")
      );
  
    }, [currentStepDataNew]);

  const { isLoading: isDocLoading, data: docData } = Digit.Hooks.pt.usePropertyMDMS(stateId, "LAYOUT", ["LayoutDocuments"])

  const filteredDocuments = useMemo(() => {
      //console.log("🔄 useMemo CALLED - isCluApproved:", isCluApproved, "isNationalHighway:", isNationalHighway, "isInstitution:", isInstitution)
      let docs = docData?.LAYOUT?.LayoutDocuments || []
      
      //console.log("=== FILTER DEBUG ===")
      //console.log("Initial docs count:", docs.length, docs)
      //console.log("isCluApproved:", isCluApproved)
      //console.log("isNationalHighway:", isNationalHighway)
      //console.log("isInstitution:", isInstitution)
      
      // Filter and process documents
      const processedDocs = docs
        .map((doc) => {
          // Set default required status based on backend config
          let isRequired = doc.required || false
          
          // Override required status based on conditions
          
          // Site photographs are ALWAYS mandatory (regardless of CLU)
          if (doc.code === "OWNER.SITEPHOTOGRAPHONE" || doc.code === "OWNER.SITEPHOTOGRAPHTWO") {
            isRequired = true
          }
          // National Highway NOC is mandatory only when it's a National Highway
          else if (doc.code === "OWNER.NATIONALHIGHWAYNOC") {
            isRequired = isNationalHighway
          }
          // When CLU = YES: Make specific CLU documents mandatory
          // else if (isCluApproved && doc.cluRequired) {
          //   isRequired = true
          // }
          // When CLU = NO: CLU-required docs become NOT mandatory, but regular required docs stay mandatory
          // else if (!isCluApproved && doc.cluRequired) {
          //   isRequired = false
          // }
          
          // Filter out building drawing if vacant
          if (isVacant && doc.code === "OWNER.BUILDINGDRAWING") {
            return null
          }
          
          return { ...doc, required: isRequired }
        }).filter(doc => !(doc?.cluRequired && !isCluApproved))
        .filter(doc => doc !== null)
      
      //console.log("Final docs count:", processedDocs.length)
      //console.log("Mandatory docs:", processedDocs.filter(d => d.required).map(d => ({ code: d.code, required: d.required, cluRequired: d.cluRequired })))
      //console.log("=== END DEBUG ===")
      
      return processedDocs
    }, [isVacant, isCluApproved, isNationalHighway, isInstitution, docData?.LAYOUT?.LayoutDocuments?.length])



  const coordinates = useSelector((state) => state?.obps?.LayoutNewApplicationFormReducer?.coordinates || {})


  //console.log("coordinates from redux", coordinates);

  function goNext(finaldata) {
    console.log("finalData", finaldata)
    const missingFields = validation(finaldata);

    if (missingFields.length > 0) {
      setError(
        `${t("NOC_PLEASE_ATTACH_LABEL")} ${t(
          missingFields[0].replace(".", "_").toUpperCase()
        )}`
      );
      setShowToast(true);
      return;
    }

    if (
      !coordinates?.Latitude1?.trim() ||
      !coordinates?.Latitude2?.trim() ||
      !coordinates?.Longitude1?.trim() ||
      !coordinates?.Longitude2?.trim()
    ) {
      setError(`${t("NOC_PLEASE_ATTACH_GEO_TAGGED_PHOTOS_LABEL")}`);
      setShowToast(true);
      return;
    }

    onFormValueChange(true, finaldata)
    onGoNext();
  }

  const completeData=useSelector((state)=>state?.obps?.LayoutNewApplicationFormReducer?.formData) || {};


  // function validation(documents) {
  //   if (!isLoading) {
  //     const isVacant =
  //       completeData?.siteDetails?.buildingStatus?.code === "VACANT";

  //     const layoutDocumentsType = isVacant
  //       ? data?.Layout?.Documents?.filter(
  //           (doc) => doc.code !== "OWNER.BUILDINGDRAWING"
  //         )
  //       : data?.Layout?.Documents;

  //     const documentsData = documents?.documents?.documents || [];

  //     const requiredDocs = (layoutDocumentsType || [])
  //       .filter((doc) => doc.required)
  //       .map((doc) => doc.code);

  //     const uploadedDocs = documentsData.map((doc) => doc.documentType);

  //     const missingDocs = requiredDocs.filter(
  //       (reqDoc) => !uploadedDocs.includes(reqDoc)
  //     );

  //     return missingDocs;
  //   }
  //   return [];
  // }

  //  function validation(documents) {
  //   if (!isLoading && !isDocLoading) {

  //     console.log("filteredDocuments and Documents", filteredDocuments, documents)

  //     const isVacant = completeData?.siteDetails?.buildingStatus?.code === "VACANT" || false

  //     const layoutDocumentsType = isVacant
  //       ? data?.Layout?.Documents?.filter((doc) => doc.code !== "OWNER.BUILDINGDRAWING")
  //       : data?.Layout?.Documents

  //     const documentsData = documents?.documents?.documents || []

  //     const requiredDocs = (layoutDocumentsType || []).filter((doc) => doc.required).map((doc) => doc.code)

  //     const uploadedDocs = documentsData.map((doc) => doc.documentType)

  //     const missingDocs = requiredDocs.filter((reqDoc) => !uploadedDocs.includes(reqDoc))

  //     return missingDocs
  //   }
  //   return []
  // }

  console.log("currentStepData",currentStepData)

  function validation(documents) {
  if (isLoading || isDocLoading) return [];

  const uploadedDocs = documents?.documents?.documents || [];

  // 1️⃣ Get all REQUIRED document codes
  const requiredDocCodes = (filteredDocuments || [])
    .filter(doc => doc.required)
    .map(doc => doc.code);

  // 2️⃣ Get uploaded document types
  const uploadedDocTypes = uploadedDocs.map(doc => doc.documentType);

  // 3️⃣ Find missing required documents
  const missingDocs = requiredDocCodes.filter(
    code => !uploadedDocTypes.includes(code)
  );

  // console.log("filtered",requiredDocCodes, uploadedDocs, uploadedDocTypes, missingDocs)

  return missingDocs;
}

  function onGoBack(data) {
    onBackClick(config.key, data);
  }

  const onFormValueChange = (setValue = true, data) => {
    console.log("onformchange finalData", data)
    if (!_.isEqual(data, currentStepData)) {
       dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data))
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  return (
    <React.Fragment>
      {!isLoading && config?.currStepConfig ? (
        <FormComposer
          defaultValues={currentStepData}
          config={config.currStepConfig}
          onSubmit={goNext}
          // onFormValueChange={onFormValueChange}
          label={t(`${config.texts.submitBarLabel}`)}
          currentStep={config.currStepNumber}
          onBackClick={onGoBack}
        />
      ) : (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading documents...</p>
        </div>
      )}

      {showToast && (
        <Toast
          isDleteBtn={true}
          error={true}
          label={error}
          onClose={closeToast}
        />
      )}
    </React.Fragment>
  );
};

export default LayoutStepFormThree;
